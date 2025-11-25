import { db, auth, ensureSignedIn } from '../src/config/firebase';
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from 'firebase/firestore';
import { Record, OrderRecord } from '../types';

// ============ ETIQUETAS ============

export const saveRecord = async (record: Partial<Omit<Record, 'id'>>): Promise<string> => {
    // Ensure user is signed in before attempting to save
    await ensureSignedIn();

    // Si no hay usuario autenticado, usamos un email genérico de admin
    const createdBy = auth.currentUser?.email ?? 'admin@local';
    const docRef = await addDoc(collection(db, 'records'), {
        ...record,
        timestamp: Date.now(),
        createdBy,
    });
    return docRef.id;
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

export const saveOrder = async (order: Partial<Omit<OrderRecord, 'id'>>): Promise<string> => {
    // Ensure user is signed in before attempting to save
    await ensureSignedIn();

    // Si no hay usuario autenticado, usamos un email genérico de admin
    const createdBy = auth.currentUser?.email ?? 'admin@local';
    const docRef = await addDoc(collection(db, 'orders'), {
        ...order,
        timestamp: Date.now(),
        createdBy,
    });
    return docRef.id;
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
