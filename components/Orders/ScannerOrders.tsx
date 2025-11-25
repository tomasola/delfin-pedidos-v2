import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, Save, RefreshCw, Loader2, AlertTriangle, Plus, Trash2, Pencil } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { analyzeOrderImage } from '../../services/geminiServiceOrders';
import { compressImage } from '../../services/imageService';
import { saveOrder, getOrders } from '../../services/localStorageService';
import { v4 as uuidv4 } from 'uuid';
import { ProductLine } from '../../types';

export const ScannerOrders: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const webcamRef = useRef<Webcam>(null);
    const [status, setStatus] = useState<'idle' | 'camera' | 'analyzing' | 'review'>('idle');
    const [originalImage, setOriginalImage] = useState<string>('');

    // Form Data for Orders
    const [formData, setFormData] = useState({
        clientName: '',
        clientNumber: '',
        orderNumber: '',
        date: '',
        notes: ''
    });

    const [products, setProducts] = useState<ProductLine[]>([]);
    const [isDuplicate, setIsDuplicate] = useState(false);

    // Check for duplicates based on Order Number
    useEffect(() => {
        if (status === 'review' && formData.orderNumber) {
            getOrders().then(orders => {
                const isDup = orders.some(r => r.orderNumber.trim().toLowerCase() === formData.orderNumber.trim().toLowerCase());
                setIsDuplicate(isDup);
            });
        } else {
            setIsDuplicate(false);
        }
    }, [formData.orderNumber, status]);

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
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            const compressed = await compressImage(imageSrc);
            setOriginalImage(compressed);
            processImage(compressed);
        }
    }, [webcamRef]);

    const processImage = async (base64: string) => {
        setStatus('analyzing');
        try {
            const result = await analyzeOrderImage(base64);

            setFormData({
                clientName: result.clientName || '',
                clientNumber: result.clientNumber || '',
                orderNumber: result.orderNumber || '',
                date: result.date || new Date().toISOString().split('T')[0],
                notes: result.notes || ''
            });

            // Set products from AI result
            setProducts(result.products || []);

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

    const handleSave = async () => {
        if (!formData.orderNumber) {
            alert("Por favor ingrese un Número de Pedido.");
            return;
        }

        if (products.length === 0) {
            alert("Por favor agregue al menos un producto.");
            return;
        }

        if (isDuplicate) {
            alert(`❌ PEDIDO REPETIDO\\n\\nEl pedido \"${formData.orderNumber}\" ya existe.\\n\\nNo se puede guardar un pedido duplicado.`);
            return;
        }


        const newRecord = {
            id: uuidv4(),
            ...formData,
            products,
            originalImage,
            timestamp: Date.now(),
            status: 'pendiente' as const
        };

        await saveOrder(newRecord);
        alert("✅ Pedido guardado correctamente.");
        reset();
    };

    const reset = () => {
        setStatus('idle');
        setOriginalImage('');
        setFormData({
            clientName: '',
            clientNumber: '',
            orderNumber: '',
            date: '',
            notes: ''
        });
        setProducts([]);
        setIsDuplicate(false);
    };

    const addProduct = () => {
        setProducts([...products, {
            reference: '',
            denomination: '',
            totalMeters: 0,
            metersPerUnit: 0
        }]);
    };

    const updateProduct = (index: number, field: keyof ProductLine, value: string | number) => {
        const updated = [...products];
        updated[index] = { ...updated[index], [field]: value };
        setProducts(updated);
    };

    const deleteProduct = (index: number) => {
        setProducts(products.filter((_, i) => i !== index));
    };

    return (
        <div className="h-full flex flex-col bg-slate-900 overflow-hidden">
            {status === 'idle' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Escanear Pedido</h2>
                    <Button
                        onClick={() => setStatus('camera')}
                        variant="primary"
                        className="w-full max-w-xs"
                    >
                        <Camera size={20} className="mr-2" />
                        Activar Cámara
                    </Button>
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="secondary"
                        className="w-full max-w-xs"
                    >
                        <Upload size={20} className="mr-2" />
                        Subir desde galería
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                </div>
            )}

            {status === 'camera' && (
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 relative bg-black">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: 'environment' }}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="p-4 bg-slate-800 flex gap-2">
                        <Button onClick={capture} variant="primary" className="flex-1">
                            <Camera size={20} className="mr-2" />
                            Capturar
                        </Button>
                        <Button onClick={() => setStatus('idle')} variant="secondary">
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {status === 'analyzing' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <Loader2 size={48} className="text-amber-500 animate-spin mb-4" />
                    <p className="text-white text-lg">Analizando Pedido...</p>
                </div>
            )}

            {status === 'review' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Client Info */}
                        <div className="bg-slate-800 rounded-lg p-4 space-y-3">
                            <h3 className="text-white font-semibold text-lg mb-2">Datos del Cliente</h3>
                            <Input
                                label="Cliente"
                                value={formData.clientName}
                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                            />
                            <Input
                                label="Número de Cliente"
                                value={formData.clientNumber}
                                onChange={(e) => setFormData({ ...formData, clientNumber: e.target.value })}
                            />
                            <Input
                                label="Número de Pedido"
                                value={formData.orderNumber}
                                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                            />
                            <Input
                                label="Fecha"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Notas</label>
                                <textarea
                                    className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                                    rows={2}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Products Table */}
                        <div className="bg-slate-800 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-white font-semibold text-lg">Productos ({products.length})</h3>
                                <Button onClick={addProduct} variant="primary" className="text-sm">
                                    <Plus size={16} className="mr-1" />
                                    Agregar
                                </Button>
                            </div>

                            {products.length === 0 ? (
                                <p className="text-slate-400 text-center py-4">No hay productos. Haz clic en "Agregar" para añadir uno.</p>
                            ) : (
                                <div className="space-y-3">
                                    {products.map((product, index) => (
                                        <div key={index} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-amber-500 font-semibold">Producto {index + 1}</span>
                                                <button
                                                    onClick={() => deleteProduct(index)}
                                                    className="text-red-500 hover:text-red-400"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    label="Referencia"
                                                    value={product.reference}
                                                    onChange={(e) => updateProduct(index, 'reference', e.target.value)}
                                                />
                                                <Input
                                                    label="Metros Totales"
                                                    type="number"
                                                    value={product.totalMeters.toString()}
                                                    onChange={(e) => updateProduct(index, 'totalMeters', parseFloat(e.target.value) || 0)}
                                                />
                                                <Input
                                                    label="Denominación"
                                                    value={product.denomination}
                                                    onChange={(e) => updateProduct(index, 'denomination', e.target.value)}
                                                    className="col-span-2"
                                                />
                                                <Input
                                                    label="Metros/Unidad"
                                                    type="number"
                                                    value={product.metersPerUnit?.toString() || ''}
                                                    onChange={(e) => updateProduct(index, 'metersPerUnit', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {isDuplicate && (
                            <div className="bg-amber-900/30 border border-amber-500 rounded-lg p-3 flex items-start gap-2">
                                <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-200">
                                    <strong>Pedido duplicado:</strong> Ya existe un pedido con este número.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
                        <Button onClick={handleSave} variant="primary" className="flex-1">
                            <Save size={18} className="mr-2" />
                            Guardar
                        </Button>
                        <Button onClick={reset} variant="secondary">
                            <RefreshCw size={18} className="mr-2" />
                            Nuevo
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
