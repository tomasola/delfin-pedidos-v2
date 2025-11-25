import React, { useState, useRef } from 'react';
import * as localStorageService from '../../services/localStorageService';
import * as firebaseStorageService from '../../services/firebaseStorageService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Download, Upload, Trash2, Lock, Unlock, Smartphone, Cloud, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';

export const Admin: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, type: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    if (pin === '1234') {
      setIsUnlocked(true);
      setPin('');
    } else {
      alert("PIN Incorrecto");
    }
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

  // Sincronizar base de datos LOCAL con Firebase
  const handleSyncToFirebase = async () => {
    setIsSyncing(true);
    // La barra de progreso se inicializa después de calcular totalItems
    // (evitamos establecer total = 0 que bloquea la UI)


    try {
      console.log('Iniciando sincronización con Firebase...');
      const localData = await localStorageService.exportData();
      console.log('Datos locales exportados:', localData);

      const totalRecords = localData.records?.length || 0;
      const totalOrders = localData.orders?.length || 0;
      const totalItems = totalRecords + totalOrders;
      // Inicializamos el progreso con el total correcto
      setSyncProgress({ current: 0, total: totalItems, type: '' });

      if (totalItems === 0) {
        alert('⚠️ No hay datos locales para sincronizar');
        setIsSyncing(false);
        console.log('No hay datos locales para sincronizar. Sincronización terminada.');
        return;
      }

      let recordsUploaded = 0;
      let ordersUploaded = 0;
      let currentItem = 0;
      let errorsEncountered = 0;

      // Subir records a Firebase
      if (localData.records && Array.isArray(localData.records)) {
        console.log(`Iniciando subida de ${totalRecords} etiquetas a Firebase.`);
        setSyncProgress({ current: 0, total: totalItems, type: 'Subiendo etiquetas' });
        for (const record of localData.records) {
          try {
            console.log('Subiendo etiqueta:', record);
            // Excluir imágenes grandes para evitar límite de 1MB de Firestore
            const { id, originalImage, croppedImage, packingPhoto, ...recordData } = record;
            console.log('📦 Datos a subir (sin imágenes):', recordData);
            // Timeout de 30 segundos por elemento (aumentado para conexiones lentas)
            await Promise.race([
              firebaseStorageService.saveRecord(recordData),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera agotado al contactar Firebase. Verifica tu conexión o reglas de seguridad.')), 30000))
            ]);
            recordsUploaded++;
            console.log(`✅ Etiqueta subida. Total etiquetas subidas: ${recordsUploaded}`);
            // Pequeña pausa entre uploads para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error: any) {
            console.error(`❌ Error al subir etiqueta con ID ${record.id}:`, error);
            console.error(`Código de error Firebase:`, error?.code);
            console.error(`Mensaje de error:`, error?.message);
            errorsEncountered++;
            // Continuar con el siguiente elemento incluso si este falló
          }
          currentItem++;
          setSyncProgress({ current: currentItem, total: totalItems, type: 'Subiendo etiquetas' });
        }
      }

      // Subir orders a Firebase
      if (localData.orders && Array.isArray(localData.orders)) {
        console.log(`Iniciando subida de ${totalOrders} pedidos a Firebase.`);
        setSyncProgress({ current: currentItem, total: totalItems, type: 'Subiendo pedidos' });
        for (const order of localData.orders) {
          try {
            console.log('Subiendo pedido:', order);
            // Excluir imágenes grandes para evitar límite de 1MB de Firestore
            const { id, originalImage, croppedImage, ...orderData } = order;
            console.log('📦 Datos a subir (sin imágenes):', orderData);
            // Timeout de 30 segundos por elemento (aumentado para conexiones lentas)
            await Promise.race([
              firebaseStorageService.saveOrder(orderData),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera agotado al contactar Firebase. Verifica tu conexión o reglas de seguridad.')), 30000))
            ]);
            ordersUploaded++;
            console.log(`✅ Pedido subido. Total pedidos subidos: ${ordersUploaded}`);
            // Pequeña pausa entre uploads para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error: any) {
            console.error(`❌ Error al subir pedido con ID ${order.id}:`, error);
            console.error(`Código de error Firebase:`, error?.code);
            console.error(`Mensaje de error:`, error?.message);
            errorsEncountered++;
            // Continuar con el siguiente elemento incluso si este falló
          }
          currentItem++;
          setSyncProgress({ current: currentItem, total: totalItems, type: 'Subiendo pedidos' });
        }
      }

      setIsSyncing(false);
      setSyncProgress({ current: 0, total: 0, type: '' });
      console.log('Sincronización con Firebase completada.');

      // Notificación de éxito detallada
      let successMessage = `✅ SINCRONIZACIÓN COMPLETADA\n\n` +
        `📊 Datos subidos a Firebase:\n` +
        `• Etiquetas: ${recordsUploaded}\n` +
        `• Pedidos: ${ordersUploaded}\n` +
        `• Total: ${recordsUploaded + ordersUploaded}\n\n`;

      if (errorsEncountered > 0) {
        successMessage += `⚠️ Se encontraron ${errorsEncountered} errores durante la sincronización. Algunos elementos no pudieron subirse.\n\n`;
      } else {
        successMessage += `Los datos ya están disponibles en Firebase para otros usuarios.\n\n`;
      }
      alert(successMessage);

    } catch (error: any) {
      console.error('Error general al sincronizar:', error);
      setIsSyncing(false);
      setSyncProgress({ current: 0, total: 0, type: '' });

      // Notificación de error detallada
      alert(
        `❌ ERROR AL SINCRONIZAR\n\n` +
        `No se pudieron subir los datos a Firebase.\n\n` +
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

  if (!isUnlocked) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 gap-6 bg-slate-900">
        <div className="bg-slate-800 p-6 rounded-full">
          <Lock size={48} className="text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Acceso Restringido</h2>
        <div className="w-full max-w-xs">
          <Input
            type="password"
            placeholder="PIN (1234)"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="text-center tracking-widest text-xl"
          />
          <Button fullWidth onClick={handleLogin} className="mt-4">Desbloquear</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-slate-900 pb-24 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Administración</h2>
        <Button variant="ghost" onClick={() => setIsUnlocked(false)}><Unlock size={20} /></Button>
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
      </section>

      {/* Firebase Sync */}
      <section className="space-y-4">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2">Sincronización Firebase</h3>

        <Button
          fullWidth
          variant="primary"
          onClick={handleSyncToFirebase}
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

      {/* Danger Zone */}
      <section className="space-y-4">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2">Zona de Peligro</h3>

        <Button fullWidth variant="danger" onClick={() => setShowResetModal(true)} className="justify-start bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800">
          <Trash2 className="mr-3" /> Borrar Todo
        </Button>
      </section>

      {/* Installation info (Mockup) */}
      <section className="p-4 bg-slate-800 rounded-xl flex items-center gap-4 opacity-70">
        <Smartphone className="text-slate-400" size={24} />
        <div className="text-xs text-slate-400">
          Para instalar, usa "Agregar a Inicio" en el menú de tu navegador.
        </div>
      </section>

      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="¿Borrar Base de Datos?">
        <div className="space-y-4">
          <p className="text-red-300">Esta acción es irreversible. Se eliminarán todos los historiales y fotos guardadas.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" fullWidth onClick={() => setShowResetModal(false)}>Cancelar</Button>
            <Button variant="danger" fullWidth onClick={handleReset}>Sí, Borrar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};