import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, Save, RefreshCw, Edit3, Loader2, AlertTriangle, X, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { analyzeImage } from '../../services/geminiService';
import { compressImage } from '../../services/imageService';
import { saveRecord, getRecords } from '../../services/localStorageService';
import { generatePDF } from '../../services/pdfService';
import { CropEditor } from './CropEditor';
import { BoundingBox } from '../../types';

export const Scanner: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const [status, setStatus] = useState<'idle' | 'camera' | 'analyzing' | 'review' | 'cropping'>('idle');
  const [originalImage, setOriginalImage] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [formData, setFormData] = useState({ reference: '', length: '', quantity: '' });
  const [aiBoundingBox, setAiBoundingBox] = useState<BoundingBox | undefined>(undefined);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Efecto para verificar duplicados en tiempo real cuando cambia la referencia o entramos en modo revisión
  useEffect(() => {
    if (status === 'review' && formData.reference) {
      getRecords().then(records => {
        const isDup = records.some(r => r.reference.trim().toLowerCase() === formData.reference.trim().toLowerCase());
        setIsDuplicate(isDup);
      });
    } else {
      setIsDuplicate(false);
    }
  }, [formData.reference, status]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const compressed = await compressImage(ev.target.result as string);
          setOriginalImage(compressed);
          processImage(compressed);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const capture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const compressed = await compressImage(imageSrc);
        setOriginalImage(compressed);
        processImage(compressed);
      }
    }
  }, []);

  const processImage = async (base64: string) => {
    setStatus('analyzing');
    try {
      const result = await analyzeImage(base64);

      // Process Reference based on specific rules
      let cleanReference = result.reference || '';

      // Rule 1: Remove everything after '/'
      if (cleanReference.includes('/')) {
        cleanReference = cleanReference.split('/')[0];
      }

      // Rule 2: Keep only numeric characters
      cleanReference = cleanReference.replace(/\D/g, '');

      setFormData({
        reference: cleanReference,
        length: result.length || '',
        quantity: result.quantity || ''
      });

      setAiBoundingBox(result.boundingBox);

      // Attempt automatic crop if bounding box exists
      if (result.boundingBox) {
        await performAutoCrop(base64, result.boundingBox);
      } else {
        // Fallback: use whole image if no box found
        setCroppedImage(base64);
      }

      setStatus('review');
    } catch (error: any) {
      console.error(error);
      let msg = "Error analizando imagen.";
      if (error.message && error.message.includes('API Key')) {
        msg = "Falta configuración: API Key no encontrada.";
      }
      alert(msg);
      setStatus('idle');
    }
  };

  const performAutoCrop = (base64: string, box: BoundingBox) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(); return; }

        // Gemini coordinates are 0-1000
        const x = (box.xmin / 1000) * img.width;
        const y = (box.ymin / 1000) * img.height;
        const w = ((box.xmax - box.xmin) / 1000) * img.width;
        const h = ((box.ymax - box.ymin) / 1000) * img.height;

        // Add some padding (10%)
        const padX = w * 0.1;
        const padY = h * 0.1;
        const finalX = Math.max(0, x - padX);
        const finalY = Math.max(0, y - padY);
        const finalW = Math.min(img.width - finalX, w + (padX * 2));
        const finalH = Math.min(img.height - finalY, h + (padY * 2));

        canvas.width = finalW;
        canvas.height = finalH;
        ctx.drawImage(img, finalX, finalY, finalW, finalH, 0, 0, finalW, finalH);

        setCroppedImage(canvas.toDataURL('image/jpeg', 0.8));
        resolve();
      };
      img.src = base64;
    });
  };

  const handleCrop = (croppedBase64: string) => {
    setCroppedImage(croppedBase64);
    setStatus('review');
  };

  const handleRetake = () => {
    setStatus('idle');
    setOriginalImage('');
    setCroppedImage('');
    setFormData({ reference: '', length: '', quantity: '' });
    setAiBoundingBox(undefined);
  };

  const handleReanalyze = () => {
    if (originalImage) {
      processImage(originalImage);
    }
  };

  const handleCropMode = () => {
    setStatus('cropping');
  };

  const preloadImage = (base64: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve();
      };
      img.src = base64;
    });
  };

  const handleSave = async () => {
    // Prevenir doble guardado
    if (isSaving) {
      return;
    }

    if (!formData.reference) {
      alert("Por favor ingrese una Referencia.");
      return;
    }

    // Bloquear duplicados completamente
    if (isDuplicate) {
      alert(`❌ ETIQUETA REPETIDA\n\nLa referencia "${formData.reference}" ya existe en el historial.\n\nNo se puede guardar una referencia duplicada.`);
      return;
    }

    // Activar estado de guardando
    setIsSaving(true);

    // NO incluir 'id' al crear el registro - Firebase lo genera automáticamente
    const newRecord = {
      ...formData,
      originalImage,
      croppedImage,
      timestamp: Date.now()
    };

    try {
      const recordId = await saveRecord(newRecord);
      // PDF necesita un id, usamos el generado por Firebase
      generatePDF({ id: recordId, ...newRecord });

      // Reset
      setStatus('idle');
      setOriginalImage('');
      setCroppedImage('');
      setFormData({ reference: '', length: '', quantity: '' });
      setIsSaving(false);
      alert("✅ Registro guardado correctamente.");
    } catch (error) {
      console.error('Error al guardar:', error);
      setIsSaving(false);
      alert("❌ Error al guardar el registro. Por favor, intenta de nuevo.");
    }
  };

  const loadExample = async () => {
    try {
      const response = await fetch('/sample.jpg');
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const compressed = await compressImage(ev.target.result as string);
          setOriginalImage(compressed);
          processImage(compressed);
        }
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      alert("No se pudo cargar la imagen de ejemplo.");
    }
  };

  const getInitialCropForEditor = () => {
    if (!aiBoundingBox || !originalImage) return undefined;
    return undefined;
  };

  if (status === 'cropping') {
    return (
      <CropEditor
        imageSrc={originalImage}
        initialCrop={getInitialCropForEditor()}
        onConfirm={(newCrop) => {
          setCroppedImage(newCrop);
          setStatus('review');
        }}
        onCancel={() => setStatus('review')}
      />
    );
  }

  if (status === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4">
        <Loader2 className="animate-spin text-amber-500" size={48} />
        <p className="text-lg font-medium animate-pulse">Analizando Etiqueta...</p>
        <p className="text-sm text-slate-500">Extrayendo texto y dibujo técnico</p>
      </div>
    );
  }

  if (status === 'camera') {
    return (
      <div className="flex flex-col h-full bg-black relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "environment" }}
          className="h-full w-full object-cover"
        />

        {/* Camera Overlay */}
        <div className="absolute inset-0 pointer-events-none border-[50px] border-black/50 flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-amber-500/50 rounded-lg relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500"></div>
          </div>
        </div>

        {/* Camera Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-t from-black/90 to-transparent">
          <button
            onClick={() => setStatus('idle')}
            className="p-3 rounded-full bg-slate-800/80 text-white hover:bg-slate-700"
          >
            <X size={24} />
          </button>

          <button
            onClick={capture}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-transparent hover:bg-white/20 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-white"></div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-full bg-slate-800/80 text-white hover:bg-slate-700"
          >
            <Upload size={24} />
          </button>
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
          onClick={(e) => (e.currentTarget.value = '')}
        />
      </div>
    );
  }

  if (status === 'review') {
    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 pb-24">
        <h2 className="text-xl font-bold text-white mb-4">Verificar Datos</h2>

        {/* Technical Drawing Card */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6 shadow-lg border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Dibujo Técnico</h3>
            <button onClick={() => setStatus('cropping')} className="text-amber-500 text-sm flex items-center gap-1 hover:text-amber-400 font-medium">
              <Edit3 size={16} /> Ajustar Recorte
            </button>
          </div>
          <div className="bg-white rounded-lg p-2 flex justify-center min-h-[150px]">
            {croppedImage && <img src={croppedImage} alt="Crop" className="max-h-48 object-contain" />}
          </div>
        </div>

        {/* Data Form */}
        <div className="space-y-2">
          {isDuplicate && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-2 flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-red-400 font-bold text-sm leading-tight">Referencia Duplicada</h4>
                <p className="text-red-300/70 text-xs mt-1">El código "{formData.reference}" ya existe en la base de datos.</p>
              </div>
            </div>
          )}

          <Input
            label="Referencia / ID"
            value={formData.reference}
            onChange={e => setFormData({ ...formData, reference: e.target.value })}
            className={isDuplicate ? "border-red-500 focus:ring-red-500" : ""}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Longitud"
              value={formData.length}
              onChange={e => setFormData({ ...formData, length: e.target.value })}
            />
            <Input
              label="Cantidad"
              type="text"
              inputMode="text"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-[70px] left-0 right-0 p-4 bg-slate-900/90 backdrop-blur border-t border-slate-800 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setStatus('idle')}>
            <RefreshCw className="mr-2" size={18} /> Retomar
          </Button>
          <Button
            className="flex-[2]"
            onClick={handleSave}
            variant={isDuplicate ? 'secondary' : 'primary'}
            disabled={isSaving || isDuplicate}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18} /> Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2" size={18} /> Guardar
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="mb-8 bg-slate-800 p-6 rounded-full shadow-2xl shadow-black/50 border border-slate-700">
        <Camera size={64} className="text-slate-500" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Escanear Etiqueta</h1>
      <p className="text-slate-400 mb-8 max-w-xs">
        Toma una foto clara de la etiqueta para extraer datos y diagramas automáticamente.
      </p>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
        onClick={(e) => (e.currentTarget.value = '')}
      />

      <Button
        onClick={() => setStatus('camera')}
        className="w-full max-w-xs text-lg py-4 shadow-lg shadow-amber-500/20"
      >
        <Camera className="mr-2" /> Activar Cámara
      </Button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="mt-6 text-slate-500 flex items-center text-sm hover:text-white transition-colors"
      >
        <Upload className="mr-2" size={16} /> Subir desde galería
      </button>

      <button
        onClick={loadExample}
        className="mt-4 text-amber-500/50 flex items-center text-xs hover:text-amber-500 transition-colors"
      >
        <Zap className="mr-1" size={14} /> Probar Ejemplo
      </button>
    </div>
  );
};