import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, FolderOpen } from 'lucide-react';
import { Button } from '../ui/Button';
import { ReferenceImage } from '../../types';
import {
    getAllReferenceImages,
    deleteReferenceImage,
    importFromFolder,
} from '../../services/referenceLibraryService';

export const ReferenceLibraryManager: React.FC = () => {
    const [references, setReferences] = useState<ReferenceImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');

    const loadReferences = async () => {
        setIsLoading(true);
        const data = await getAllReferenceImages();
        setReferences(data.sort((a, b) => b.uploadedAt - a.uploadedAt));
        setIsLoading(false);
    };

    useEffect(() => {
        loadReferences();
    }, []);

    const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsLoading(true);
        setUploadStatus('Subiendo imágenes...');

        const result = await importFromFolder(files);

        if (result.errors.length > 0) {
            setUploadStatus(`✅ ${result.success} subidas. ❌ ${result.errors.length} errores.`);
        } else {
            setUploadStatus(`✅ ${result.success} imágenes subidas correctamente.`);
        }

        await loadReferences();
        setTimeout(() => setUploadStatus(''), 5000);
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta imagen de referencia?')) return;
        await deleteReferenceImage(id);
        await loadReferences();
    };

    const totalSize = references.reduce((sum, ref) => sum + ref.imageData.length, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Biblioteca de Referencias</h2>
                <p className="text-slate-400 text-sm mb-4">
                    Sube imágenes PNG de alta calidad de cada referencia. El nombre del archivo debe ser el código de referencia (ej: <code className="bg-slate-800 px-1 rounded">10008.png</code>).
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                            <ImageIcon size={18} className="text-blue-400" />
                            <span className="text-slate-400 text-sm">Total Referencias</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{references.length}</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                            <FolderOpen size={18} className="text-green-400" />
                            <span className="text-slate-400 text-sm">Almacenamiento</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{totalSizeMB} MB</p>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
                    <label className="block cursor-pointer">
                        <input
                            type="file"
                            multiple
                            accept=".png,.jpg,.jpeg"
                            onChange={handleFolderUpload}
                            className="hidden"
                            disabled={isLoading}
                        />
                        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-500 transition">
                            <Upload className="text-blue-400 mb-3" size={48} />
                            <p className="text-white font-semibold mb-1">Seleccionar Imágenes</p>
                            <p className="text-slate-400 text-sm">PNG, JPG o JPEG (múltiples archivos)</p>
                        </div>
                    </label>
                    {uploadStatus && (
                        <p className="mt-3 text-center text-sm font-medium text-green-400">{uploadStatus}</p>
                    )}
                </div>
            </div>

            {/* Library Grid */}
            {isLoading && references.length === 0 ? (
                <div className="text-center py-12 text-slate-400">Cargando...</div>
            ) : references.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
                    <p>No hay imágenes de referencia. Sube algunas para comenzar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {references.map((ref) => (
                        <div
                            key={ref.id}
                            className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-blue-500 transition"
                        >
                            <div className="aspect-square bg-slate-900 flex items-center justify-center p-2">
                                <img
                                    src={ref.imageData}
                                    alt={ref.reference}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <div className="p-3">
                                <p className="text-white font-bold text-lg mb-1">{ref.reference}</p>
                                <p className="text-slate-400 text-xs mb-2 truncate">{ref.fileName}</p>
                                <p className="text-slate-500 text-xs mb-3">
                                    {new Date(ref.uploadedAt).toLocaleDateString()}
                                </p>
                                <Button
                                    variant="secondary"
                                    onClick={() => handleDelete(ref.id)}
                                    className="w-full text-red-400 hover:text-red-300"
                                >
                                    <Trash2 size={16} className="mr-1" /> Eliminar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
