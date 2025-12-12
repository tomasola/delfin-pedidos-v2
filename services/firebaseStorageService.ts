
import { db, auth, storage, ensureSignedIn } from '../src/config/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll, getBytes } from 'firebase/storage';
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    setDoc,
    query,
    orderBy
} from 'firebase/firestore';
import { Record, OrderRecord } from '../types';

// ============ ETIQUETAS ============

export const saveRecord = async (record: Partial<Omit<Record, 'id'>>, recordId?: string): Promise<string> => {
    // Ensure user is signed in before attempting to save
    await ensureSignedIn();

    // Si no hay usuario autenticado, usamos un email genérico de admin
    const createdBy = auth.currentUser?.email ?? 'admin@local';

    const dataToSave = {
        ...record,
        timestamp: record.timestamp || Date.now(),
        createdBy,
    };

    if (recordId) {
        // Si tenemos un ID, usar setDoc para actualizar/crear con ese ID específico
        const docRef = doc(db, 'records', recordId);
        await setDoc(docRef, dataToSave, { merge: true });
        return recordId;
    } else {
        // Si no hay ID, crear uno nuevo
        const docRef = await addDoc(collection(db, 'records'), dataToSave);
        return docRef.id;
    }
};

export const getRecords = async (): Promise<Record[]> => {
    const q = query(collection(db, 'records'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Record));
};

export const deleteRecord = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'records', id));
};

export const updateRecord = async (record: Record): Promise<void> => {
    const { id, ...data } = record;
    await updateDoc(doc(db, 'records', id), data);
};

// ============ PEDIDOS ============

export const saveOrder = async (order: Partial<Omit<OrderRecord, 'id'>>, orderId?: string): Promise<string> => {
    // Ensure user is signed in before attempting to save
    await ensureSignedIn();

    // Si no hay usuario autenticado, usamos un email genérico de admin
    const createdBy = auth.currentUser?.email ?? 'admin@local';

    const dataToSave = {
        ...order,
        timestamp: order.timestamp || Date.now(),
        createdBy,
    };

    if (orderId) {
        // Si tenemos un ID, usar setDoc para actualizar/crear con ese ID específico
        const docRef = doc(db, 'orders', orderId);
        await setDoc(docRef, dataToSave, { merge: true });
        return orderId;
    } else {
        // Si no hay ID, crear uno nuevo
        const docRef = await addDoc(collection(db, 'orders'), dataToSave);
        return docRef.id;
    }
};

export const getOrders = async (): Promise<OrderRecord[]> => {
    const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as OrderRecord));
};

export const updateOrder = async (id: string, order: Partial<OrderRecord>): Promise<void> => {
    await updateDoc(doc(db, 'orders', id), order);
};

export const deleteOrder = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'orders', id));
};

// ============ ADMIN ============

export const clearAllData = async (): Promise<void> => {
    // Eliminar todas las etiquetas
    const recordsSnapshot = await getDocs(collection(db, 'records'));
    const deleteRecordsPromises = recordsSnapshot.docs.map(doc => deleteDoc(doc.ref));

    // Eliminar todos los pedidos
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    const deleteOrdersPromises = ordersSnapshot.docs.map(doc => deleteDoc(doc.ref));

    await Promise.all([...deleteRecordsPromises, ...deleteOrdersPromises]);
};

export const exportData = async () => {
    const records = await getRecords();
    const orders = await getOrders();

    return {
        records,
        orders,
        exportDate: new Date().toISOString()
    };
};

// ============ STORAGE ============

export const uploadImage = async (base64String: string, path: string): Promise<string> => {
    try {
        await ensureSignedIn();

        // Convert base64 to blob
        const response = await fetch(base64String);
        const blob = await response.blob();

        // Create reference
        const storageRef = ref(storage, path);

        // Upload
        await uploadBytes(storageRef, blob);

        // Get URL
        const url = await getDownloadURL(storageRef);
        return url;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};

// ============ BACKUPS ============

export const uploadBackup = async (content: string, filename: string): Promise<string> => {
    try {
        await ensureSignedIn();

        const blob = new Blob([content], { type: 'application/json' });
        const storageRef = ref(storage, 'backups/' + filename);
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        return url;
    } catch (error) {
        console.error("Error uploading backup:", error);
        throw error;
    }
};

export const downloadBackupJSON = async (filename: string): Promise<any> => {
    try {
        await ensureSignedIn();
        const storageRef = ref(storage, 'backups/' + filename);
        console.log('Attempting to download via SDK: backups/' + filename);

        // Download directly into memory (max ~100MB usually fine for this app, 
        // if larger we might need another approach or CORS config for fetch)
        const arrayBuffer = await getBytes(storageRef);

        const decoder = new TextDecoder();
        const jsonString = decoder.decode(arrayBuffer);
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error downloading backup JSON:", error);
        throw error;
    }
};
