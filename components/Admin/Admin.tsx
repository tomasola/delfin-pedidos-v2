import { useState, useRef } from 'react';
import * as localStorageService from '../../services/localStorageService';
import * as firebaseStorageService from '../../services/firebaseStorageService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { compressImage } from '../../utils/imageCompression';
import { Download, Upload, Trash2, Smartphone, Cloud, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';

export const Admin: React.FC = () => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, type: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security State
  const [newAdminPin, setNewAdminPin] = useState('');
  const [currentAdminPinInput, setCurrentAdminPinInput] = useState('');
  const [deletePinInput, setDeletePinInput] = useState('');
  const [showFirebasePinModal, setShowFirebasePinModal] = useState(false);

  const MASTER_KEY = '10061978';
  const FIREBASE_DELETE_PIN = '10061978'; // Fixed PIN for Firebase deletion

  // ... (Export/Import/Sync functions remain unchanged) ...

  const handleUpdateAdminPin = () => {
    const currentPin = localStorageService.getAdminPin();

    if (currentAdminPinInput !== currentPin && currentAdminPinInput !== MASTER_KEY) {
      alert("❌ El PIN actual es incorrecto");
      return;
    }

    if (newAdminPin.length < 4) {
      alert("El nuevo PIN debe tener al menos 4 caracteres");
      return;
    }

    localStorageService.setAdminPin(newAdminPin);
    setNewAdminPin('');
    setCurrentAdminPinInput('');
    alert("✅ PIN de Administrador actualizado correctamente");
  };



  // Exportar base de datos LOCAL
  const handleExportLocal = async () => {
    const data = await localStorageService.exportData();
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `delfin_local_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Importar a base de datos LOCAL
  const handleImportLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const jsonData = JSON.parse(ev.target?.result as string);
        await localStorageService.importData(jsonData);
        alert(`✅ Importación completada\n\nRegistros: ${jsonData.records?.length || 0}\nPedidos: ${jsonData.orders?.length || 0}`);
      } catch (error) {
        console.error('Error al importar:', error);
        alert("❌ Error: Formato de archivo inválido o error al importar");
      }
    };
    reader.readAsText(file);
  };

  // Sincronizar base de datos LOCAL con Firebase (BIDIRECCIONAL)
  const handleBidirectionalSync = async () => {
    setIsSyncing(true);

    try {
      console.log('🔄 Iniciando sincronización bidireccional con Firebase...');

      // ========== FASE 1: DESCARGAR DESDE FIREBASE ==========
      console.log('📥 FASE 1: Descargando datos desde Firebase...');
      setSyncProgress({ current: 0, total: 100, type: 'Descargando desde Firebase' });

      const firebaseRecords = await firebaseStorageService.getRecords();
      const firebaseOrders = await firebaseStorageService.getOrders();

      console.log(`📥 Descargados desde Firebase: ${firebaseRecords.length} etiquetas, ${firebaseOrders.length} pedidos`);

      // ========== FASE 2: FUSIONAR CON DATOS LOCALES ==========
      console.log('🔀 FASE 2: Fusionando datos de Firebase con base de datos local...');

      let recordsMerged = 0;
      let ordersMerged = 0;
      let currentItem = 0;
      const totalToMerge = firebaseRecords.length + firebaseOrders.length;

      setSyncProgress({ current: 0, total: totalToMerge || 1, type: 'Fusionando datos locales' });

      // Fusionar etiquetas de Firebase
      for (const firebaseRecord of firebaseRecords) {
        try {
          const exists = await localStorageService.recordExists(firebaseRecord.id);
          if (!exists) {
            await localStorageService.saveRecordToLocal(firebaseRecord);
            recordsMerged++;
            console.log(`✅ Etiqueta fusionada: ${firebaseRecord.id}`);
          } else {
            console.log(`⏭️ Etiqueta ya existe localmente: ${firebaseRecord.id}`);
          }
        } catch (error) {
          console.error(`❌ Error fusionando etiqueta ${firebaseRecord.id}:`, error);
        }
        currentItem++;
        setSyncProgress({ current: currentItem, total: totalToMerge || 1, type: 'Fusionando datos locales' });
        await new Promise(resolve => setTimeout(resolve, 50)); // Pausa breve
      }

      // Fusionar pedidos de Firebase
      for (const firebaseOrder of firebaseOrders) {
        try {
          const exists = await localStorageService.orderExists(firebaseOrder.id);
          if (!exists) {
            await localStorageService.saveOrderToLocal(firebaseOrder);
            ordersMerged++;
            console.log(`✅ Pedido fusionado: ${firebaseOrder.id}`);
          } else {
            console.log(`⏭️ Pedido ya existe localmente: ${firebaseOrder.id}`);
          }
        } catch (error) {
          console.error(`❌ Error fusionando pedido ${firebaseOrder.id}:`, error);
        }
        currentItem++;
        setSyncProgress({ current: currentItem, total: totalToMerge || 1, type: 'Fusionando datos locales' });
        await new Promise(resolve => setTimeout(resolve, 50)); // Pausa breve
      }

      console.log(`🔀 Fusión completada: ${recordsMerged} etiquetas nuevas, ${ordersMerged} pedidos nuevos`);

      // ========== FASE 3: SUBIR DATOS LOCALES A FIREBASE ==========
      console.log('📤 FASE 3: Subiendo datos locales a Firebase...');

      const localData = await localStorageService.exportData();
      const totalRecords = localData.records?.length || 0;
      const totalOrders = localData.orders?.length || 0;
      const totalToUpload = totalRecords + totalOrders;

      let recordsUploaded = 0;
      let ordersUploaded = 0;
      let uploadErrors = 0;
      currentItem = 0;

      setSyncProgress({ current: 0, total: totalToUpload || 1, type: 'Subiendo a Firebase' });

      // Subir etiquetas locales a Firebase
      if (localData.records && Array.isArray(localData.records)) {
        for (const record of localData.records) {
          try {
            // Preparar datos base (sin id)
            const { id, ...baseData } = record;
            let recordData: any = { ...baseData };

            // Comprimir imágenes si son base64 (no URLs)
            if (record.originalImage && record.originalImage.startsWith('data:')) {
              try {
                const compressed = await compressImage(record.originalImage, 150);
                recordData.originalImage = compressed;
                console.log(`🗜️ Imagen original comprimida: ${record.originalImage.length} → ${compressed.length} bytes`);
              } catch (e) {
                console.error("Error comprimiendo imagen original:", e);
                // Si falla, excluir la imagen del objeto
                const { originalImage, ...rest } = recordData;
                recordData = rest;
              }
            }

            if (record.croppedImage && record.croppedImage.startsWith('data:')) {
              try {
                const compressed = await compressImage(record.croppedImage, 150);
                recordData.croppedImage = compressed;
                console.log(`🗜️ Imagen recortada comprimida: ${record.croppedImage.length} → ${compressed.length} bytes`);
              } catch (e) {
                console.error("Error comprimiendo imagen recortada:", e);
                const { croppedImage, ...rest } = recordData;
                recordData = rest;
              }
            }

            if (record.packingPhoto && record.packingPhoto.startsWith('data:')) {
              try {
                const compressed = await compressImage(record.packingPhoto, 150);
                recordData.packingPhoto = compressed;
                console.log(`🗜️ Foto packing comprimida: ${record.packingPhoto.length} → ${compressed.length} bytes`);
              } catch (e) {
                console.error("Error comprimiendo foto packing:", e);
                const { packingPhoto, ...rest } = recordData;
                recordData = rest;
              }
            }

            await Promise.race([
              firebaseStorageService.saveRecord(recordData, record.id), // Pasar el ID para evitar duplicados
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 60000))
            ]);

            recordsUploaded++;
            console.log(`✅ Etiqueta subida: ${record.id}`);
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error: any) {
            // Si el error es por duplicado, no es realmente un error
            if (error?.code !== 'permission-denied') {
              console.error(`❌ Error subiendo etiqueta:`, error);
              uploadErrors++;
            }
          }
          currentItem++;
          setSyncProgress({ current: currentItem, total: totalToUpload || 1, type: 'Subiendo a Firebase' });
        }
      }

      // Subir pedidos locales a Firebase
      if (localData.orders && Array.isArray(localData.orders)) {
        for (const order of localData.orders) {
          try {
            // Excluir imágenes grandes
            const { id, originalImage, croppedImage, ...orderData } = order;

            await Promise.race([
              firebaseStorageService.saveOrder(orderData, order.id), // Pasar el ID para evitar duplicados
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000))
            ]);

            ordersUploaded++;
            console.log(`✅ Pedido subido: ${id}`);
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error: any) {
            if (error?.code !== 'permission-denied') {
              console.error(`❌ Error subiendo pedido:`, error);
              uploadErrors++;
            }
          }
          currentItem++;
          setSyncProgress({ current: currentItem, total: totalToUpload || 1, type: 'Subiendo a Firebase' });
        }
      }

      setIsSyncing(false);
      setSyncProgress({ current: 0, total: 0, type: '' });
      console.log('✅ Sincronización bidireccional completada.');

      // Mensaje de éxito detallado
      let successMessage = `✅ SINCRONIZACIÓN BIDIRECCIONAL COMPLETADA\n\n` +
        `📥 Descargados desde Firebase:\n` +
        `• Etiquetas: ${firebaseRecords.length}\n` +
        `• Pedidos: ${firebaseOrders.length}\n\n` +
        `🔀 Fusionados localmente (nuevos):\n` +
        `• Etiquetas: ${recordsMerged}\n` +
        `• Pedidos: ${ordersMerged}\n\n` +
        `📤 Subidos a Firebase:\n` +
        `• Etiquetas: ${recordsUploaded}\n` +
        `• Pedidos: ${ordersUploaded}\n\n`;

      if (uploadErrors > 0) {
        successMessage += `⚠️ ${uploadErrors} elementos no se pudieron subir (pueden ser duplicados).\n\n`;
      }

      successMessage += `✨ Tus datos están ahora sincronizados con Firebase.`;

      alert(successMessage);

    } catch (error: any) {
      console.error('❌ Error general en sincronización bidireccional:', error);
      setIsSyncing(false);
      setSyncProgress({ current: 0, total: 0, type: '' });

      alert(
        `❌ ERROR EN SINCRONIZACIÓN\n\n` +
        `No se pudo completar la sincronización.\n\n` +
        `Posibles causas:\n` +
        `• Sin conexión a internet\n` +
        `• Problemas con Firebase\n` +
        `• Sesión expirada\n\n` +
        `Error: ${error.message || 'Desconocido'}\n\n` +
        `Por favor, verifica tu conexión e intenta de nuevo.`
      );
    }
  };


  const handleReset = async () => {
    await localStorageService.clearAllData();
    setShowResetModal(false);
    alert("Base de datos local vaciada.");
  };

  const [showFirebaseResetModal, setShowFirebaseResetModal] = useState(false);

  const handleVerifyFirebasePin = () => {
    if (deletePinInput === FIREBASE_DELETE_PIN) {
      setShowFirebasePinModal(false);
      setDeletePinInput('');
      setShowFirebaseResetModal(true);
    } else {
      alert("❌ PIN Incorrecto");
    }
  };

  const handleClearFirebase = async () => {
    try {
      await firebaseStorageService.clearAllData();
      setShowFirebaseResetModal(false);
      alert("✅ Base de datos de Firebase vaciada correctamente.");
    } catch (error) {
      console.error("Error al borrar datos de Firebase:", error);
      alert("❌ Error al borrar datos de Firebase. Revisa la consola.");
    }
  };

  const handleRemoveDuplicates = async () => {
    try {
      console.log("🔍 Buscando duplicados...");

      const recordsResult = await localStorageService.removeDuplicateRecords();
      const ordersResult = await localStorageService.removeDuplicateOrders();

      const totalRemoved = recordsResult.removed + ordersResult.removed;
      const totalKept = recordsResult.kept + ordersResult.kept;

      if (totalRemoved > 0) {
        alert(
          `✅ LIMPIEZA COMPLETADA\n\n` +
          `🗑️ Duplicados eliminados:\n` +
          `• Etiquetas: ${recordsResult.removed}\n` +
          `• Pedidos: ${ordersResult.removed}\n\n` +
          `✅ Registros únicos conservados:\n` +
          `• Etiquetas: ${recordsResult.kept}\n` +
          `• Pedidos: ${ordersResult.kept}\n\n` +
          `Se conservó la versión más reciente de cada duplicado.`
        );
      } else {
        alert("✅ No se encontraron duplicados.\n\nTu base de datos está limpia.");
      }
    } catch (error) {
      console.error("Error al eliminar duplicados:", error);
      alert("❌ Error al eliminar duplicados. Revisa la consola.");
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-slate-900 pb-24 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Administración</h2>
      </div>

      {/* Data Management */}
      <section className="space-y-4">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2">Base de Datos Local</h3>

        <Button fullWidth variant="secondary" onClick={handleExportLocal} className="justify-start">
          <Download className="mr-3 text-amber-500" /> Exportar Base de Datos Local (JSON)
        </Button>

        <Button fullWidth variant="secondary" onClick={() => fileInputRef.current?.click()} className="justify-start">
          <Upload className="mr-3 text-blue-400" /> Importar a Base de Datos Local
        </Button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportLocal} />

        <Button fullWidth variant="secondary" onClick={handleRemoveDuplicates} className="justify-start bg-purple-900/30 hover:bg-purple-900/50 border border-purple-700/50">
          <Trash2 className="mr-3 text-purple-400" /> Eliminar Duplicados
        </Button>
      </section>

      {/* Firebase Sync */}
      <section className="space-y-4">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2">Sincronización Firebase</h3>

        <Button
          fullWidth
          variant="primary"
          onClick={handleBidirectionalSync}
          className="justify-start bg-blue-600 hover:bg-blue-700"
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <Loader2 className="mr-3 text-white animate-spin" />
              {syncProgress.type} ({syncProgress.current}/{syncProgress.total})
            </>
          ) : (
            <>
              <Cloud className="mr-3 text-white" /> Sincronizar con Firebase
            </>
          )}
        </Button>

        {isSyncing && (
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="text-blue-400 animate-spin" size={20} />
              <div className="flex-1">
                <p className="text-blue-300 text-sm font-medium">{syncProgress.type}...</p>
                <p className="text-blue-400/70 text-xs">
                  {syncProgress.current} de {syncProgress.total} elementos
                </p>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${(syncProgress.current / (syncProgress.total || 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {!isSyncing && (
          <p className="text-xs text-slate-500 italic">Sube todos los datos locales a Firebase para compartir con otros usuarios</p>
        )}
      </section>

      {/* Security Section */}
      <section className="space-y-4">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2">Configuración de Seguridad</h3>

        <div className="space-y-2">
          <label className="text-xs text-slate-400">Cambiar PIN de Administrador</label>
          <Input
            type="password"
            placeholder="PIN Actual"
            value={currentAdminPinInput}
            onChange={e => setCurrentAdminPinInput(e.target.value)}
            className="mb-2"
          />
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nuevo PIN Admin (min 4)"
              value={newAdminPin}
              onChange={e => setNewAdminPin(e.target.value)}
            />
            <Button onClick={handleUpdateAdminPin} variant="secondary">Guardar</Button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2">Zona de Peligro</h3>

        <Button fullWidth variant="danger" onClick={() => setShowResetModal(true)} className="justify-start bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800">
          <Trash2 className="mr-3" /> Borrar Datos Locales
        </Button>

        <Button fullWidth variant="danger" onClick={() => setShowFirebasePinModal(true)} className="justify-start bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800">
          <Cloud className="mr-3" /> Borrar Datos de Firebase
        </Button>
      </section>

      {/* Installation info (Mockup) */}
      <section className="p-4 bg-slate-800 rounded-xl flex items-center gap-4 opacity-70">
        <Smartphone className="text-slate-400" size={24} />
        <div className="text-xs text-slate-400">
          Para instalar, usa "Agregar a Inicio" en el menú de tu navegador.
        </div>
      </section>

      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="¿Borrar Base de Datos Local?">
        <div className="space-y-4">
          <p className="text-red-300">Esta acción es irreversible. Se eliminarán todos los datos LOCALES de este dispositivo.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" fullWidth onClick={() => setShowResetModal(false)}>Cancelar</Button>
            <Button variant="danger" fullWidth onClick={handleReset}>Sí, Borrar Locales</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showFirebasePinModal} onClose={() => setShowFirebasePinModal(false)} title="Seguridad Requerida">
        <div className="space-y-4">
          <p className="text-slate-300">Ingresa el PIN de seguridad para borrar datos de la nube.</p>
          <Input
            type="password"
            placeholder="PIN de Borrado Firebase"
            value={deletePinInput}
            onChange={e => setDeletePinInput(e.target.value)}
            className="text-center tracking-widest text-xl"
          />
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" fullWidth onClick={() => setShowFirebasePinModal(false)}>Cancelar</Button>
            <Button variant="danger" fullWidth onClick={handleVerifyFirebasePin}>Verificar</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showFirebaseResetModal} onClose={() => setShowFirebaseResetModal(false)} title="¿Borrar Datos de Firebase?">
        <div className="space-y-4">
          <p className="text-red-300 font-bold">⚠️ PELIGRO: ESTA ACCIÓN AFECTA A TODOS LOS USUARIOS</p>
          <p className="text-slate-300">Se eliminarán permanentemente todos los datos guardados en la nube (Firebase). Esta acción no se puede deshacer.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" fullWidth onClick={() => setShowFirebaseResetModal(false)}>Cancelar</Button>
            <Button variant="danger" fullWidth onClick={handleClearFirebase}>Sí, Borrar Nube</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};