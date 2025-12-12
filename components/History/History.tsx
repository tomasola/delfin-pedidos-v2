


import React, { useState, useEffect, useRef } from 'react';
import { getRecords, deleteRecord, updateRecord, saveRecord } from '../../services/localStorageService';
import { getAllReferenceImages } from '../../services/referenceLibraryService';
import { Record as ScanRecord } from '../../types';
import { Search, Trash2, Pencil, Check, Package, Camera, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { VisualSearchModal } from './VisualSearchModal';

export const History: React.FC = () => {
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [search, setSearch] = useState('');
  const [libraryMatches, setLibraryMatches] = useState<ScanRecord[]>([]);
  const [uploadedMatches, setUploadedMatches] = useState<ScanRecord[]>([]);

  // State for Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pin, setPin] = useState('');

  // State for Edit
  const [editRecordData, setEditRecordData] = useState<ScanRecord | null>(null);
  const [showEditPinModal, setShowEditPinModal] = useState(false);
  const [showEditFormModal, setShowEditFormModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ reference: '', length: '', quantity: '' });

  // State for Packing (Box Size + Photo)
  const [showPackingModal, setShowPackingModal] = useState(false);
  const [packingRecordId, setPackingRecordId] = useState<string | null>(null);
  const [packingData, setPackingData] = useState({ boxSize: '', packingPhoto: '', notes: '' });
  const packingFileInputRef = useRef<HTMLInputElement>(null);

  // State for Detail View
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);
  const [showPackingDetails, setShowPackingDetails] = useState(false);
  const [showOriginalImage, setShowOriginalImage] = useState(false);

  // State for Visual Search
  const [showVisualSearch, setShowVisualSearch] = useState(false);

  useEffect(() => {
    getRecords().then(setRecords);
  }, []);

  // Effect for searching Reference Library
  useEffect(() => {
    const searchLibrary = async () => {
      if (!search || search.length < 3) {
        setLibraryMatches([]);
        return;
      }

      const allRefs = await getAllReferenceImages();
      const matches = allRefs.filter(r =>
        r.reference.toLowerCase().includes(search.toLowerCase())
      );

      // Convert matches to ScanRecord format (Virtual Records)
      const virtualRecords: ScanRecord[] = matches.map(m => ({
        id: `lib_${m.id}`,
        reference: m.reference,
        length: 'CATÁLOGO', // Indicator
        quantity: '-',
        originalImage: m.imageData,
        croppedImage: m.imageData,
        timestamp: m.uploadedAt,
        notes: 'Referencia de Catálogo Original'
      }));

      setLibraryMatches(virtualRecords);
    };

    const timeoutId = setTimeout(searchLibrary, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleImageSelected = (imageData: string) => {
    const tempId = `temp_${Date.now()}`;
    const newRecord: ScanRecord = {
      id: tempId,
      reference: 'NUEVA',
      length: 'CUSTOM', // Indicator
      quantity: '-',
      originalImage: imageData,
      croppedImage: imageData,
      timestamp: Date.now(),
      notes: 'Imagen subida manualmente'
    };
    setUploadedMatches(prev => [newRecord, ...prev]);
    setShowVisualSearch(false);
  };

  const filteredRecords = [
    ...uploadedMatches,
    ...libraryMatches,
    ...records.filter(r =>
      r.reference.toLowerCase().includes(search.toLowerCase()) ||
      r.length.includes(search)
    )
  ];

  // Delete Handlers
  const handleDeleteRequest = (id: string) => {
    setDeleteId(id);
    setPin('');
  };

  const confirmDelete = async () => {
    if (pin === '1234' && deleteId) {
      await deleteRecord(deleteId);
      // Recargar datos después de eliminar
      const updated = await getRecords();
      setRecords(updated);
      setDeleteId(null);
    } else {
      alert("PIN Incorrecto");
    }
  };

  // Edit Handlers
  const handleEditRequest = (record: ScanRecord) => {
    setEditRecordData(record);
    setEditFormData({
      reference: record.reference,
      length: record.length,
      quantity: record.quantity
    });
    setPin('');
    setShowEditPinModal(true);
  };

  const confirmEditPin = () => {
    if (pin === '1234') {
      setShowEditPinModal(false);
      setShowEditFormModal(true);
    } else {
      alert("PIN Incorrecto");
    }
  };

  const saveEditedData = async () => {
    if (editRecordData) {
      if (editRecordData.id.startsWith('lib_') || editRecordData.id.startsWith('temp_')) {
        // Converting library reference or temp upload to real record
        const newRecord = {
          reference: editFormData.reference,
          length: editFormData.length,
          quantity: editFormData.quantity,
          originalImage: editRecordData.originalImage,
          croppedImage: editRecordData.croppedImage,
          timestamp: Date.now(),
          notes: editRecordData.notes
        };
        await saveRecord(newRecord);

        // If it was a temp record, remove it from the temp list
        if (editRecordData.id.startsWith('temp_')) {
          setUploadedMatches(prev => prev.filter(r => r.id !== editRecordData.id));
        }
      } else {
        // Updating existing record
        const updatedRecord = {
          ...editRecordData,
          reference: editFormData.reference,
          length: editFormData.length,
          quantity: editFormData.quantity
        };
        await updateRecord(updatedRecord);
      }

      const records = await getRecords();
      setRecords(records);
      setShowEditFormModal(false);
      setEditRecordData(null);
      setSearch(''); // Clear search to show the new record
    }
  };

  // Packing Handlers
  const handlePackingRequest = (record: ScanRecord) => {
    setPackingRecordId(record.id);
    setPackingData({
      boxSize: record.boxSize || '',
      packingPhoto: record.packingPhoto || '',
      notes: record.notes || ''
    });
    setShowPackingModal(true);
  };

  const handlePackingPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPackingData(prev => ({ ...prev, packingPhoto: ev.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const savePackingData = async () => {
    if (packingRecordId) {
      const recordToUpdate = records.find(r => r.id === packingRecordId);
      if (recordToUpdate) {
        const updatedRecord = {
          ...recordToUpdate,
          boxSize: packingData.boxSize,
          packingPhoto: packingData.packingPhoto,
          notes: packingData.notes
        };
        await updateRecord(updatedRecord);
        const refreshed = await getRecords();
        setRecords(refreshed);
        setShowPackingModal(false);
        setPackingRecordId(null);
      }
    }
  };

  const removePackingPhoto = () => {
    setPackingData(prev => ({ ...prev, packingPhoto: '' }));
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="p-4 bg-slate-800 border-b border-slate-700 sticky top-0 z-10 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar referencia..."
            className="w-full bg-slate-900 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowVisualSearch(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-900/20 active:scale-95 font-medium whitespace-nowrap"
          title="Buscar en Catálogo de Referencias"
        >
          <Search size={18} />
          <span className="hidden sm:inline">Buscar Referencia</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="text-center text-slate-500 mt-10">
            <p>No hay registros ni coincidencias en catálogo.</p>
          </div>
        ) : (
          filteredRecords.map(record => {
            const isLibraryRecord = record.id.startsWith('lib_');
            return (
              <div key={record.id} className={`rounded-lg p-3 flex items-center gap-3 border shadow-sm ${isLibraryRecord ? 'bg-indigo-900/40 border-indigo-500/50' : 'bg-slate-800 border-slate-700/50'}`}>
                <div
                  onClick={() => {
                    setSelectedRecord(record);
                    setShowPackingDetails(false);
                    setShowOriginalImage(isLibraryRecord);
                  }}
                  className={`w-16 h-16 rounded overflow-hidden flex-shrink-0 flex items-center justify-center relative cursor-pointer hover:ring-2 transition-all ${isLibraryRecord ? 'bg-indigo-950 hover:ring-indigo-400' : 'bg-white hover:ring-amber-500'}`}
                >
                  {record.croppedImage ? (
                    <img src={record.croppedImage} alt="crop" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-300">No img</span>
                  )}
                  {/* Indicator if packing info exists */}
                  {(record.boxSize || record.packingPhoto) && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-bl-md"></div>
                  )}
                  {isLibraryRecord && (
                    <div className="absolute bottom-0 w-full bg-indigo-600 text-[8px] text-white text-center">CATÁLOGO</div>
                  )}
                </div>

                <div className="flex-1 min-w-0" onClick={() => {
                  setSelectedRecord(record);
                  setShowPackingDetails(false);
                  setShowOriginalImage(isLibraryRecord);
                }}>
                  <h3 className={`font-bold truncate ${isLibraryRecord ? 'text-indigo-200' : 'text-white'}`}>{record.reference}</h3>
                  <p className="text-slate-400 text-xs">
                    {isLibraryRecord ?
                      <span className="text-indigo-400 font-semibold">IMAGEN DE REFERENCIA OFICIAL</span> :
                      record.id.startsWith('temp_') ?
                        <span className="text-amber-400 font-semibold">NUEVA IMAGEN SIN GUARDAR</span> :
                        `L: ${record.length} • Qty: ${record.quantity}`
                    }
                  </p>
                  {record.boxSize && <p className="text-amber-500 text-[10px] mt-1">Caja: {record.boxSize}</p>}
                  {!isLibraryRecord && <p className="text-slate-600 text-[10px] mt-0.5">{new Date(record.timestamp).toLocaleDateString()}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  {!isLibraryRecord && !record.id.startsWith('temp_') ? (
                    <>
                      <button
                        onClick={() => handlePackingRequest(record)}
                        className={`p-2 rounded hover:bg-slate-600 ${record.boxSize ? 'bg-amber-900/30 text-amber-500 border border-amber-500/30' : 'bg-slate-700 text-slate-300'}`}
                        title="Empaque y Fotos"
                      >
                        <Package size={18} />
                      </button>
                      <button
                        onClick={() => handleEditRequest(record)}
                        className="p-2 bg-slate-700 text-blue-400 rounded hover:bg-slate-600"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(record.id)}
                        className="p-2 bg-slate-700 text-red-400 rounded hover:bg-slate-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {/* Allow DELETE for temp records */}
                      {record.id.startsWith('temp_') && (
                        <button
                          onClick={() => setUploadedMatches(prev => prev.filter(r => r.id !== record.id))}
                          className="p-2 bg-slate-700 text-red-400 rounded hover:bg-slate-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}

                      <button
                        onClick={() => handleEditRequest(record)}
                        className="p-2 bg-slate-700 text-blue-400 rounded hover:bg-slate-600 animate-pulse"
                        title="Completar datos para guardar"
                      >
                        <Pencil size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Visual Search Modal */}
      <VisualSearchModal
        isOpen={showVisualSearch}
        onClose={() => setShowVisualSearch(false)}
        onImageSelected={handleImageSelected}
        onMatchFound={(reference) => {
          setSearch(reference);
          setShowVisualSearch(false);
        }}
      />

      {/* Modal for Delete Confirmation */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Borrar Registro"
      >
        <div className="space-y-4">
          <p className="text-slate-300">Introduce el PIN de seguridad para eliminar este registro.</p>
          <Input
            type="password"
            placeholder="PIN (1234)"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
          />
          <Button variant="danger" fullWidth onClick={confirmDelete}>Confirmar Borrado</Button>
        </div>
      </Modal>

      {/* Modal for Edit PIN */}
      <Modal
        isOpen={showEditPinModal}
        onClose={() => setShowEditPinModal(false)}
        title="Modificar Registro"
      >
        <div className="space-y-4">
          <p className="text-slate-300">Introduce el PIN de seguridad para editar los datos.</p>
          <Input
            type="password"
            placeholder="PIN (1234)"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
          />
          <Button variant="primary" fullWidth onClick={confirmEditPin}>Verificar</Button>
        </div>
      </Modal>

      {/* Modal for Editing Data */}
      <Modal
        isOpen={showEditFormModal}
        onClose={() => setShowEditFormModal(false)}
        title="Editar Datos"
      >
        <div className="space-y-2">
          <Input
            label="Referencia"
            value={editFormData.reference}
            onChange={(e) => setEditFormData({ ...editFormData, reference: e.target.value })}
          />
          <Input
            label="Longitud"
            value={editFormData.length}
            onChange={(e) => setEditFormData({ ...editFormData, length: e.target.value })}
          />
          <Input
            label="Cantidad"
            value={editFormData.quantity}
            onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
          />
          <div className="mt-4">
            <Button variant="primary" fullWidth onClick={saveEditedData}>
              <Check className="mr-2" size={18} /> Guardar Cambios
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal for Packing Info */}
      <Modal
        isOpen={showPackingModal}
        onClose={() => setShowPackingModal(false)}
        title="Datos de Empaque"
      >
        <div className="space-y-4">
          <Input
            label="Tamaño de la Caja"
            placeholder="Ej. 30x40x20 cm"
            value={packingData.boxSize}
            onChange={(e) => setPackingData({ ...packingData, boxSize: e.target.value })}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-400">Notas</label>
            <textarea
              className="w-full bg-slate-900 text-white rounded-lg border border-slate-700 p-3 focus:ring-2 focus:ring-amber-500 outline-none text-sm resize-none"
              rows={3}
              placeholder="Notas adicionales..."
              value={packingData.notes}
              onChange={(e) => setPackingData({ ...packingData, notes: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Foto del Empaque</label>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={packingFileInputRef}
              onChange={handlePackingPhotoSelect}
            />

            {packingData.packingPhoto ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-video">
                <img src={packingData.packingPhoto} alt="Empaque" className="w-full h-full object-contain" />
                <button
                  onClick={removePackingPhoto}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => packingFileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center text-slate-500 hover:border-amber-500 hover:text-amber-500 transition-colors bg-slate-800/50"
              >
                <Camera size={32} className="mb-2" />
                <span>Tomar Foto de Caja</span>
              </button>
            )}
          </div>

          <div className="pt-2">
            <Button variant="primary" fullWidth onClick={savePackingData}>
              <Check className="mr-2" size={18} /> Guardar Empaque
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detailed Record Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-slate-900 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Detalle del Registro</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Main Image */}
              <div className="relative">
                <div className="bg-white rounded-xl overflow-hidden border-4 border-slate-700 shadow-lg">
                  {selectedRecord.croppedImage || selectedRecord.originalImage ? (
                    <img
                      src={showOriginalImage && selectedRecord.originalImage ? selectedRecord.originalImage : selectedRecord.croppedImage}
                      alt="Dibujo Técnico"
                      className="w-full h-auto object-contain max-h-[60vh] bg-white"
                      style={{
                        imageRendering: '-webkit-optimize-contrast' as any,
                        backfaceVisibility: 'hidden',
                        transform: 'translateZ(0)',
                        WebkitBackfaceVisibility: 'hidden',
                        WebkitTransform: 'translateZ(0)'
                      }}
                    />
                  ) : (
                    <div className="h-40 flex items-center justify-center text-slate-400">Sin imagen</div>
                  )}
                </div>

                {/* Toggle Original/Crop Button */}
                {selectedRecord.originalImage && (
                  <button
                    onClick={() => setShowOriginalImage(!showOriginalImage)}
                    className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-bold border border-slate-600 shadow-lg hover:bg-amber-500 hover:border-amber-400 transition-all flex items-center gap-2"
                  >
                    {showOriginalImage ? (
                      <>Ver Recorte</>
                    ) : (
                      <>Ver Original (Foto)</>
                    )}
                  </button>
                )}
              </div>

              {/* Data Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Referencia</label>
                  <div className="text-3xl font-bold text-amber-500 break-all">{selectedRecord.reference}</div>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Longitud</label>
                  {selectedRecord.id.startsWith('lib_') ? (
                    <div className="text-lg font-bold text-indigo-400">CATÁLOGO</div>
                  ) : (
                    <div className="text-2xl font-bold text-white">{selectedRecord.length}</div>
                  )}
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Cantidad</label>
                  {selectedRecord.id.startsWith('lib_') ? (
                    <div className="text-lg font-bold text-indigo-400">-</div>
                  ) : (
                    <div className="text-2xl font-bold text-white">{selectedRecord.quantity}</div>
                  )}
                </div>
              </div>

              {/* Packing Info if exists */}
              {(selectedRecord.boxSize || selectedRecord.packingPhoto || selectedRecord.notes) && (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                  <button
                    onClick={() => setShowPackingDetails(!showPackingDetails)}
                    className="w-full p-4 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition-colors"
                  >
                    <span className="text-sm font-bold text-slate-300 flex items-center">
                      <Package size={16} className="mr-2 text-amber-500" /> Datos de Empaque
                    </span>
                    <span className={`text-slate-400 transition-transform ${showPackingDetails ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {showPackingDetails && (
                    <div className="p-4 border-t border-slate-700/50 animate-in slide-in-from-top-2">
                      {selectedRecord.boxSize && (
                        <div className="mb-3">
                          <label className="text-xs text-slate-500">Caja</label>
                          <div className="text-lg text-slate-200">{selectedRecord.boxSize}</div>
                        </div>
                      )}

                      {selectedRecord.notes && (
                        <div className="mb-3">
                          <label className="text-xs text-slate-500">Notas</label>
                          <div className="text-sm text-slate-300 italic whitespace-pre-wrap">{selectedRecord.notes}</div>
                        </div>
                      )}

                      {selectedRecord.packingPhoto && (
                        <div className="rounded-lg overflow-hidden border border-slate-700">
                          <img src={selectedRecord.packingPhoto} alt="Foto Empaque" className="w-full h-auto" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="text-center text-slate-500 text-sm pt-4 border-t border-slate-800">
                {selectedRecord.id.startsWith('lib_') ? 'Imagen importada de Biblioteca de Referencias' : `Escaneado el ${new Date(selectedRecord.timestamp).toLocaleString()}`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
