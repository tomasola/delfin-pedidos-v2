import { Record, OrderRecord } from '../types';
import { initDB } from './db';

// ============ ETIQUETAS (RECORDS) ============

export const getRecords = async (): Promise<Record[]> => {
    try {
        const db = await initDB();
        const records = await db.getAllFromIndex('records', 'by-date');
        return records.reverse(); // Newest first
    } catch (e) {
        console.error("Error reading from DB", e);
        return [];
    }
};

export const saveRecord = async (record: Omit<Record, 'id'>): Promise<string> => {
    try {
        const db = await initDB();
        // Generate ID if not present
        const id = `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fullRecord = { ...record, id };
        await db.put('records', fullRecord);
        return id;
    } catch (e) {
        console.error("Error saving to DB", e);
        throw new Error("Error guardando el registro en la base de datos.");
    }
};

export const updateRecord = async (updatedRecord: Record): Promise<void> => {
    try {
        const db = await initDB();
        await db.put('records', updatedRecord);
    } catch (e) {
        console.error("Error updating record", e);
        throw e;
    }
};

export const deleteRecord = async (id: string): Promise<void> => {
    try {
        const db = await initDB();
        await db.delete('records', id);
    } catch (e) {
        console.error("Error deleting record", e);
        throw e;
    }
};

// ============ PEDIDOS (ORDERS) ============

export const getOrders = async (): Promise<OrderRecord[]> => {
    try {
        const db = await initDB();
        const orders = await db.getAllFromIndex('orders', 'by-date');
        return orders.reverse();
    } catch (e) {
        console.error("Error reading orders from DB", e);
        return [];
    }
};

export const saveOrder = async (order: Omit<OrderRecord, 'id'>): Promise<string> => {
    try {
        const db = await initDB();
        // Generate ID if not present
        const id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fullOrder = { ...order, id };
        await db.put('orders', fullOrder);
        return id;
    } catch (e) {
        console.error("Error saving order to DB", e);
        throw new Error("Error guardando el pedido.");
    }
};

export const updateOrder = async (id: string, order: Partial<OrderRecord>): Promise<void> => {
    try {
        const db = await initDB();
        const existing = await db.get('orders', id);
        if (existing) {
            await db.put('orders', { ...existing, ...order });
        }
    } catch (e) {
        console.error("Error updating order", e);
        throw e;
    }
};

export const deleteOrder = async (id: string): Promise<void> => {
    try {
        const db = await initDB();
        await db.delete('orders', id);
    } catch (e) {
        console.error("Error deleting order", e);
        throw e;
    }
};

// ============ ADMIN ============

export const clearAllData = async (): Promise<void> => {
    const db = await initDB();
    await db.clear('records');
    await db.clear('orders');
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

export const importData = async (jsonData: any): Promise<void> => {
    try {
        const db = await initDB();

        // Import records
        if (jsonData.records && Array.isArray(jsonData.records)) {
            for (const record of jsonData.records) {
                await db.put('records', record);
            }
        }

        // Import orders
        if (jsonData.orders && Array.isArray(jsonData.orders)) {
            for (const order of jsonData.orders) {
                await db.put('orders', order);
            }
        }
    } catch (e) {
        console.error("Import error", e);
        throw new Error("Error importando datos");
    }
};
