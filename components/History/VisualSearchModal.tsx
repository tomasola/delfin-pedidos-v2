import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { X, Camera, Upload, Search, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { compressImage } from '../../utils/imageCompression';
import { getAllReferenceImages } from '../../services/referenceLibraryService';
import { testModelAvailability, identifyProductWithFallback } from '../../services/geminiService';

interface VisualSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMatchFound: (reference: string) => void;
    onImageSelected?: (imageData: string) => void;
}

export const VisualSearchModal: React.FC<VisualSearchModalProps> = ({ isOpen, onClose, onMatchFound, onImageSelected }) => {
    const [step, setStep] = useState<'mode-select' | 'camera' | 'preview' | 'searching' | 'result'>('mode-select');
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<{ reference: string, imageData: string }[]>([]);
    const [isSearchingText, setIsSearchingText] = useState(false);
    const [image, setImage] = useState<string>('');
    const [matchResult, setMatchResult] = useState<string | null>(null);
    const [candidatesCount, setCandidatesCount] = useState(0);
    const [checkedCandidates, setCheckedCandidates] = useState<string[]>([]);
    const [searchReasoning, setSearchReasoning] = useState<string | null>(null);
    const [showDebugImages, setShowDebugImages] = useState(false);
    const [debugImages, setDebugImages] = useState<{ reference: string, image: string }[]>([]);

    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const capture = useCallback(async () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                const compressed = await compressImage(imageSrc, 800);
                setImage(compressed);
                setStep('preview');
            }
        }
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                if (ev.target?.result) {
                    const compressed = await compressImage(ev.target.result as string, 800);
                    setImage(compressed);
                    setStep('preview');
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const [connectionStatus, setConnectionStatus] = useState<string>('');



    // REVISING STRATEGY: 
    // I will add a `testModelAccess` function to `geminiService.ts` first, then call it here.

    const runDiagnostics = async () => {
        setConnectionStatus('Probando conexión con Google Gemini... espere...');
        try {
            const report = await testModelAvailability();
            setConnectionStatus(report);
        } catch (e: any) {
            setConnectionStatus('Error ejecutando diagnóstico: ' + e.message);
        }
    };

    const handleTextSearch = async (term: string) => {
        setSearchText(term);
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearchingText(true);
        try {
            const allRefs = await getAllReferenceImages();
            // Simple client-side filter
            const matches = allRefs.filter(r =>
                r.reference.toLowerCase().includes(term.toLowerCase())
            ).map(r => ({ reference: r.reference, imageData: r.imageData }));

            setSearchResults(matches);
        } catch (error) {
            console.error("Text search error", error);
        } finally {
            setIsSearchingText(false);
        }
    };

    const handleSearch = async () => {
        setStep('searching');
        setConnectionStatus(''); // Clear status
        try {
            // 1. Get Reference Library images (Source of truth)
            const allReferences = await getAllReferenceImages();

            // 2. Sort by newest first (to match "últimas añadidas" request)
            const sortedReferences = allReferences.sort((a, b) => b.uploadedAt - a.uploadedAt);

            // 3. Limit to X most recent candidates to avoid token limits/latency
            // Using top 20 for now.
            const candidates = sortedReferences.slice(0, 20).map(r => ({
                reference: r.reference,
                image: r.imageData
            }));

            setCandidatesCount(candidates.length);
            setCheckedCandidates(candidates.map(c => c.reference));

            if (candidates.length === 0) {
                alert("No hay suficientes registros en el historial para comparar.");
                setStep('camera');
                return;
            }

            // 3. Resize candidates to thumbnails for AI (high quality for drawings)
            const preparedCandidates = await Promise.all(candidates.map(async (c) => {
                const thumb = await compressImage(c.image, 600); // 600KB/px limit for clear lines
                return { reference: c.reference, image: thumb };
            }));

            setDebugImages(preparedCandidates);

            // 4. Send to Gemini (using new fallback function)
            const result = await identifyProductWithFallback(image, preparedCandidates);
            setMatchResult(result.matchedReference);
            setSearchReasoning(result.reasoning || null);
            setStep('result');

        } catch (error) {
            console.error(error);
            alert("Error en la búsqueda visual. Inténtalo de nuevo.");
            setStep('preview');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden border border-slate-700 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Search className="text-amber-500" size={20} />
                        Buscador de Referencias
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-[400px]">

                    {step === 'mode-select' && (
                        <div className="w-full flex-1 flex flex-col gap-6">
                            {/* Text Search Section */}
                            <div className="w-full">
                                <label className="text-sm font-medium text-slate-400 mb-2 block">Buscar por Referencia o Nombre</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                                        placeholder="Ej: 10008, 9200..."
                                        value={searchText}
                                        onChange={(e) => handleTextSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Search Results Grid */}
                            {searchText.length > 0 && (
                                <div className="flex-1 min-h-[200px] bg-slate-800/30 rounded-lg p-2 overflow-y-auto">
                                    {isSearchingText ? (
                                        <div className="text-center pt-8 text-slate-500">Buscando...</div>
                                    ) : searchResults.length === 0 ? (
                                        <div className="text-center pt-8 text-slate-500">No se encontraron referencias</div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {searchResults.map((res) => (
                                                <div
                                                    key={res.reference}
                                                    onClick={() => onMatchFound(res.reference)}
                                                    className="bg-slate-800 border border-slate-700 rounded-lg p-2 cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all flex flex-col items-center"
                                                >
                                                    <div className="w-full aspect-square bg-white rounded overflow-hidden mb-2 items-center justify-center flex">
                                                        <img src={res.imageData} alt={res.reference} className="max-w-full max-h-full object-contain" />
                                                    </div>
                                                    <p className="text-white font-bold text-sm truncate w-full text-center">{res.reference}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Visual Search Option */}
                            <div className="mt-auto pt-6 border-t border-slate-800">
                                <p className="text-center text-slate-500 text-sm mb-4">¿No sabes la referencia?</p>
                                <Button onClick={() => setStep('camera')} variant="primary" fullWidth className="py-4 bg-indigo-600 hover:bg-indigo-700">
                                    <Camera className="mr-2" size={20} /> Usar Búsqueda Visual (Cámara)
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'camera' && (
                        <div className="w-full h-full flex flex-col items-center">
                            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4 border-2 border-slate-700">
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{ facingMode: "environment" }}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
                                    <Upload className="mr-2" size={18} /> Galería
                                </Button>
                                <Button onClick={capture} variant="primary">
                                    <Camera className="mr-2" size={18} /> Capturar
                                </Button>
                            </div>
                            <Button onClick={() => setStep('mode-select')} variant="secondary" fullWidth className="mt-4">
                                <X className="mr-2" size={18} /> Cancelar Cámara
                            </Button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="w-full flex flex-col items-center">
                            <img src={image} alt="Preview" className="max-h-64 rounded-lg border border-slate-700 mb-6" />
                            <p className="text-slate-400 text-sm mb-6 text-center">
                                Se comparará esta imagen con tus últimas referencias guardadas.
                            </p>
                            <div className="grid grid-cols-2 gap-4 w-full">
                                <Button onClick={() => setStep('camera')} variant="secondary">
                                    <RefreshCw className="mr-2" size={18} /> Repetir
                                </Button>
                                <Button onClick={handleSearch} variant="primary" className="bg-amber-600 hover:bg-amber-700">
                                    <Search className="mr-2" size={18} /> Buscar
                                </Button>
                            </div>

                            {onImageSelected && (
                                <div className="w-full mt-4 pt-4 border-t border-slate-800">
                                    <Button
                                        onClick={() => onImageSelected(image)}
                                        variant="secondary"
                                        fullWidth
                                        className="bg-indigo-900/50 hover:bg-indigo-900 text-indigo-200 border-indigo-500/30"
                                    >
                                        <CheckCircle className="mr-2" size={18} /> Usar esta imagen para etiqueta
                                    </Button>
                                    <p className="text-xs text-slate-500 text-center mt-2">Crea una etiqueta nueva con esta foto sin buscar referencia.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'searching' && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                            <h4 className="text-xl font-bold text-white mb-2">Analizando...</h4>
                            <p className="text-slate-400 text-sm">
                                Comparando con {candidatesCount} referencias de tu historial...
                            </p>
                        </div>
                    )}

                    {step === 'result' && (
                        <div className="w-full flex flex-col items-center py-4">
                            {matchResult ? (
                                <div className="text-center w-full">
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="text-green-500" size={40} />
                                    </div>
                                    <h4 className="text-slate-400 text-sm uppercase tracking-wider mb-1">Referencia Encontrada</h4>
                                    <div className="text-4xl font-mono font-bold text-white mb-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
                                        {matchResult}
                                    </div>
                                    <Button onClick={() => onMatchFound(matchResult)} variant="primary" fullWidth className="bg-green-600 hover:bg-green-700">
                                        Filtrar por esta Referencia
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center w-full">
                                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle className="text-amber-500" size={40} />
                                    </div>
                                    <h4 className="text-white font-bold text-lg mb-2">No se encontró coincidencia</h4>
                                    <p className="text-slate-400 text-sm mb-4">
                                        La imagen no se parece lo suficiente a ninguna de las referencias recientes.
                                    </p>

                                    {/* Reasoning Debug Info */}
                                    {searchReasoning && (
                                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 mb-4 text-xs text-left text-slate-300">
                                            <p className="font-bold text-amber-500 mb-1">Análisis de la IA:</p>
                                            {searchReasoning}
                                        </div>
                                    )}

                                    {/* Candidate List Debug Info */}
                                    <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50 mb-4 text-[10px] text-slate-500 text-left overflow-hidden">
                                        <p className="font-bold mb-1">Referencias comparadas ({candidatesCount}):</p>
                                        <p className="break-all leading-tight">{checkedCandidates.join(', ')}</p>
                                    </div>

                                    <button
                                        onClick={() => setShowDebugImages(!showDebugImages)}
                                        className="text-xs text-blue-400 hover:text-blue-300 underline mb-4"
                                    >
                                        {showDebugImages ? 'Ocultar imágenes' : 'Ver imágenes que ve la IA'}
                                    </button>



                                    {showDebugImages && (
                                        <div className="grid grid-cols-3 gap-2 mb-4 w-full">
                                            {debugImages.map((img, idx) => (
                                                <div key={idx} className="bg-white p-1 rounded">
                                                    <img src={img.image} alt={img.reference} className="w-full h-auto" />
                                                    <p className="text-[10px] text-black font-bold text-center">{img.reference}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mb-4 pt-4 border-t border-slate-700 w-full">
                                        <button
                                            onClick={runDiagnostics}
                                            className="text-xs text-amber-500 hover:text-amber-400 underline w-full text-center"
                                        >
                                            Diagnosticar Conexión (Test de Modelos)
                                        </button>
                                        {connectionStatus && (
                                            <pre className="mt-2 text-[10px] text-slate-300 bg-black p-2 rounded whitespace-pre-wrap text-left">
                                                {connectionStatus}
                                            </pre>
                                        )}
                                    </div>

                                    <Button onClick={() => setStep('camera')} variant="secondary" fullWidth>
                                        Intentar de nuevo
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
