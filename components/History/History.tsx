

import React, { useState, useEffect, useRef } from 'react';
import { getRecords, deleteRecord, updateRecord } from '../../services/localStorageService';
import { Record as ScanRecord } from '../../types';
import { Search, Trash2, Pencil, Check, Package, Camera, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const History: React.FC = () => {
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [search, setSearch] = useState('');

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
  const [packingData, setPackingData] = useState({ boxSize: '', packingPhoto: '' });
  const packingFileInputRef = useRef<HTMLInputElement>(null);

  // State for Detail View
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);

  useEffect(() => {
    getRecords().then(setRecords);
  }, []);

  const filteredRecords = records.filter(r =>
    r.reference.toLowerCase().includes(search.toLowerCase()) ||
    r.length.includes(search)
  );

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
      const updatedRecord = {
        ...editRecordData,
        reference: editFormData.reference,
        length: editFormData.length,
        quantity: editFormData.quantity
      };

      await updateRecord(updatedRecord);
      const records = await getRecords();
      setRecords(records);
      setShowEditFormModal(false);
      setEditRecordData(null);
    }
  };

  // Packing Handlers
  const handlePackingRequest = (record: ScanRecord) => {
    setPackingRecordId(record.id);
    setPackingData({
      boxSize: record.boxSize || '',
      packingPhoto: record.packingPhoto || ''
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
          packingPhoto: packingData.packingPhoto
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
      <div className="p-4 bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar referencia..."
            className="w-full bg-slate-900 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="text-center text-slate-500 mt-10">
            <p>No hay registros.</p>
          </div>
        ) : (
          filteredRecords.map(record => (
            <div key={record.id} className="bg-slate-800 rounded-lg p-3 flex items-center gap-3 border border-slate-700/50 shadow-sm">
              <div
                onClick={() => setSelectedRecord(record)}
                className="w-16 h-16 bg-white rounded overflow-hidden flex-shrink-0 flex items-center justify-center relative cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all"
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
              </div>

              <div className="flex-1 min-w-0" onClick={() => setSelectedRecord(record)}>
                <h3 className="text-white font-bold truncate">{record.reference}</h3>
                <p className="text-slate-400 text-xs">L: {record.length} • Qty: {record.quantity}</p>
                {record.boxSize && <p className="text-amber-500 text-[10px] mt-1">Caja: {record.boxSize}</p>}
                <p className="text-slate-600 text-[10px] mt-0.5">{new Date(record.timestamp).toLocaleDateString()}</p>
              </div>

              <div className="flex flex-col gap-2">
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
              </div>
            </div>
          ))
        )}
      </div>

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
              <div className="bg-white rounded-xl overflow-hidden border-4 border-slate-700 shadow-lg cursor-pointer hover:border-amber-500 transition-colors">
                {selectedRecord.croppedImage ? (
                  <img
                    src={selectedRecord.croppedImage}
                    alt="Dibujo Técnico"
                    className="w-full h-auto object-contain max-h-[60vh] bg-white"
                    style={{
                      imageRendering: '-webkit-optimize-contrast' as any,
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                      WebkitBackfaceVisibility: 'hidden',
                      WebkitTransform: 'translateZ(0)'
                    }}
                    onClick={() => window.open(selectedRecord.croppedImage, '_blank')}
                    title="Click para ver en tamaño completo"
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400">Sin imagen</div>
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
                  <div className="text-2xl font-bold text-white">{selectedRecord.length}</div>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Cantidad</label>
                  <div className="text-2xl font-bold text-white">{selectedRecord.quantity}</div>
                </div>
              </div>

              {/* Packing Info if exists */}
              {(selectedRecord.boxSize || selectedRecord.packingPhoto) && (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center">
                    <Package size={16} className="mr-2 text-amber-500" /> Datos de Empaque
                  </h4>

                  {selectedRecord.boxSize && (
                    <div className="mb-3">
                      <label className="text-xs text-slate-500">Caja</label>
                      <div className="text-lg text-slate-200">{selectedRecord.boxSize}</div>
                    </div>
                  )}

                  {selectedRecord.packingPhoto && (
                    <div className="rounded-lg overflow-hidden border border-slate-700">
                      <img src={selectedRecord.packingPhoto} alt="Foto Empaque" className="w-full h-auto" />
                    </div>
                  )}
                </div>
              )}

              <div className="text-center text-slate-500 text-sm pt-4 border-t border-slate-800">
                Escaneado el {new Date(selectedRecord.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
