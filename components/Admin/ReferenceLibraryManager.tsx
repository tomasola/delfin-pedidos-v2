
import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, FolderOpen, Search, Database } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ReferenceImage } from '../../types';
import {
    getAllReferenceImages,
    deleteReferenceImage,
    importFromFolder,
    importReferenceImages,
} from '../../services/referenceLibraryService';
import { uploadBackup, downloadBackupJSON } from '../../services/firebaseStorageService';

export const ReferenceLibraryManager: React.FC = () => {
    const [references, setReferences] = useState<ReferenceImage[]>([]);
    const [filteredReferences, setFilteredReferences] = useState<ReferenceImage[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
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

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredReferences(references);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = references.filter(ref =>
                ref.reference.toLowerCase().includes(lowerTerm) ||
                ref.fileName.toLowerCase().includes(lowerTerm)
            );
            setFilteredReferences(filtered);
        }
    }, [searchTerm, references]);

    const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsLoading(true);
        setUploadStatus('Procesando archivos JPG...');

        const result = await importFromFolder(files);

        let statusMessage = '';
        if (result.success > 0) {
            statusMessage = result.success + ' JPG importados correctamente';
        }
        if (result.skipped > 0) {
            statusMessage += ' | ' + result.skipped + ' archivos no - JPG omitidos';
        }
        if (result.errors.length > 0) {
            statusMessage += ' | ' + result.errors.length + ' errores';
        }
        if (statusMessage === '') {
            statusMessage = 'No se procesaron archivos';
        }

        setUploadStatus(statusMessage);
        await loadReferences();
        setTimeout(() => setUploadStatus(''), 8000);
        setIsLoading(false);
    };

    const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async (ev) => {
                if (ev.target?.result) {
                    try {
                        const json = JSON.parse(ev.target.result as string);
                        if (Array.isArray(json)) {
                            // @ts-ignore
                            const result = await importReferenceImages(json);
                            // @ts-ignore
                            alert(`Importación completada.\nCorrectos: ${result.success} \nErrores: ${result.errors} `);
                            if (result.errors > 0) {
                                console.error("Hubo errores en la importación");
                            }
                            loadReferences();
                        } else {
                            alert("El archivo JSON no tiene el formato correcto (debe ser un array).");
                        }
                    } catch (err) {
                        console.error(err);
                        alert("Error al procesar el archivo JSON.");
                    }
                }
            };
            reader.readAsText(file);
        }
    };

    const handleRemoveDuplicates = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar duplicados? Se mantendrá solo la imagen más reciente de cada referencia.")) return;

        try {
            const allRefs = await getAllReferenceImages();
            const uniqueRefs = new Map<string, ReferenceImage>();
            const duplicatesToDelete: string[] = [];

            // Group by reference code, keep newest
            allRefs.forEach(ref => {
                const existing = uniqueRefs.get(ref.reference);
                if (!existing) {
                    uniqueRefs.set(ref.reference, ref);
                } else {
                    if (ref.uploadedAt > existing.uploadedAt) {
                        duplicatesToDelete.push(existing.id); // Delete old one
                        uniqueRefs.set(ref.reference, ref); // Keep new one
                    } else {
                        duplicatesToDelete.push(ref.id); // Delete current one (it's older)
                    }
                }
            });

            if (duplicatesToDelete.length === 0) {
                alert("No se encontraron duplicados.");
                return;
            }

            // Delete in batch
            for (const id of duplicatesToDelete) {
                await deleteReferenceImage(id);
            }

            alert("Se eliminaron " + duplicatesToDelete.length + " imágenes duplicadas.");
            loadReferences();

        } catch (error) {
            console.error("Error eliminando duplicados", error);
            alert("Hubo un error al intentar eliminar duplicados.");
        }
    };

    const handleCloudUpload = async () => {
        console.log("☁️ handleCloudUpload clicked");
        if (!confirm("Esto subirá tu catálogo actual a la nube, sobrescribiendo el backup anterior. ¿Continuar?")) return;
        setUploadStatus("Generando y subiendo backup...");
        try {
            console.log("Starting upload process...");
            const allRefs = await getAllReferenceImages();
            console.log(`Found ${allRefs.length} references to back up`);
            const jsonString = JSON.stringify(allRefs);
            const url = await uploadBackup(jsonString, 'reference_library.json');
            console.log("Upload successful, url:", url);
            setUploadStatus("Backup subido correctamente a la nube.");
            alert("Backup subido con éxito.");
        } catch (error) {
            console.error("Upload failed:", error);
            setUploadStatus("Error al subir backup.");
            alert("Error al subir el backup a la nube.");
        }
    };

    const handleCloudDownload = async () => {
        console.log("☁️ handleCloudDownload clicked");
        if (!confirm("Esto descargará el backup de la nube e IMPORTARÁ las referencias. Puede tardar unos minutos. ¿Continuar?")) return;
        setUploadStatus("Descargando backup de la nube...");
        try {
            console.log("Getting backup JSON directly...");
            const json = await downloadBackupJSON('reference_library.json');
            console.log("JSON obtained");

            setUploadStatus("Importando referencias...");
            // @ts-ignore
            const result = await importReferenceImages(json);

            setUploadStatus("Restauración completada. Correctos: " + result.success);
            alert("Restauración completada.\nCorrectos: " + result.success + "\nErrores: " + result.errors);
            loadReferences();
        } catch (error) {
            console.error("Download failed:", error);
            setUploadStatus("Error al descargar/importar backup.");
            alert("Error al descargar o importar el backup. Asegúrate de que existe un backup en la nube.");
        }
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
                    Sube imágenes JPG de referencias. El nombre del archivo debe ser el número de referencia (ej: <code className="bg-slate-800 px-1 rounded">10008.jpg</code>). Solo se procesarán archivos JPG/JPEG.
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
                            accept=".jpg,.jpeg"
                            onChange={handleFolderUpload}
                            className="hidden"
                            disabled={isLoading}
                        />
                        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-500 transition">
                            <Upload className="text-blue-400 mb-3" size={48} />
                            <p className="text-white font-semibold mb-1">Seleccionar Carpetas con JPGs</p>
                            <p className="text-slate-400 text-sm">Solo archivos JPG/JPEG - otros archivos serán omitidos</p>
                        </div>
                    </label>

                    <div className="mt-4 border-t border-slate-700 pt-4">
                        <p className="text-xs text-slate-500 mb-2 uppercase font-bold">O importar backup completo</p>
                        <div className="flex flex-wrap gap-3">
                            {/* <Button onClick={() => setShowImportModal(true)} variant="secondary">
                                <Database className="mr-2" size={18} /> Importar Imágenes
                            </Button> */}
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleJsonUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    title="Seleccionar backup JSON"
                                />
                                <Button variant="secondary">
                                    <Upload className="mr-2" size={18} /> Restaurar JSON
                                </Button>
                            </div>
                            <Button onClick={handleRemoveDuplicates} variant="danger" className="bg-red-900/40 text-red-300 hover:bg-red-900/60 border-red-500/30">
                                <Trash2 className="mr-2" size={18} /> Eliminar Duplicados
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-4 border-t border-slate-700 pt-4">
                            <Button onClick={handleCloudUpload} variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
                                <Database className="mr-2" size={18} /> Subir Backup a Nube
                            </Button>
                            <Button onClick={handleCloudDownload} variant="secondary" className="bg-slate-700 hover:bg-slate-600">
                                <Upload className="mr-2" size={18} /> Descargar de Nube
                            </Button>
                        </div>
                        {uploadStatus && (
                            <p className="mt-3 text-center text-sm font-medium text-green-400">{uploadStatus}</p>
                        )}
                    </div>
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
                <>
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Buscar referencia (ej: 10008)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredReferences.map((ref) => (
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
                </>
            )
            }
        </div >
    );
};
