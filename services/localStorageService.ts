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

// Check if a record exists locally
export const recordExists = async (id: string): Promise<boolean> => {
    try {
        const db = await initDB();
        const record = await db.get('records', id);
        return !!record;
    } catch (e) {
        console.error("Error checking record existence", e);
        return false;
    }
};

// Save a record from Firebase to local storage (with existing ID)
export const saveRecordToLocal = async (record: Record): Promise<void> => {
    try {
        const db = await initDB();
        await db.put('records', record);
    } catch (e) {
        console.error("Error saving Firebase record to local DB", e);
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

// Check if an order exists locally
export const orderExists = async (id: string): Promise<boolean> => {
    try {
        const db = await initDB();
        const order = await db.get('orders', id);
        return !!order;
    } catch (e) {
        console.error("Error checking order existence", e);
        return false;
    }
};

// Save an order from Firebase to local storage (with existing ID)
export const saveOrderToLocal = async (order: OrderRecord): Promise<void> => {
    try {
        const db = await initDB();
        await db.put('orders', order);
    } catch (e) {
        console.error("Error saving Firebase order to local DB", e);
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
// ============ SECURITY ============

export const getAdminPin = (): string => {
    return localStorage.getItem('delfin_admin_pin') || '1234';
};

export const setAdminPin = (pin: string): void => {
    localStorage.setItem('delfin_admin_pin', pin);
};

export const getFirebaseDeletePin = (): string => {
    return localStorage.getItem('delfin_firebase_pin') || '123456';
};

export const setFirebaseDeletePin = (pin: string): void => {
    localStorage.setItem('delfin_firebase_pin', pin);
};

// ============ DEDUPLICATION ============

export const removeDuplicateRecords = async (): Promise<{ removed: number; kept: number }> => {
    try {
        const db = await initDB();
        const allRecords = await db.getAllFromIndex('records', 'by-date');

        // Group by reference (assuming records with same reference are duplicates)
        const recordMap = new Map<string, Record[]>();

        for (const record of allRecords) {
            const key = record.reference || 'unknown';
            if (!recordMap.has(key)) {
                recordMap.set(key, []);
            }
            recordMap.get(key)!.push(record);
        }

        let removed = 0;
        let kept = 0;

        // For each group, keep only the most recent one
        for (const [reference, records] of recordMap.entries()) {
            if (records.length > 1) {
                // Sort by timestamp descending (most recent first)
                records.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

                // Keep the first (most recent), delete the rest
                for (let i = 1; i < records.length; i++) {
                    await db.delete('records', records[i].id);
                    removed++;
                    console.log(`🗑️ Eliminado duplicado: ${records[i].reference} (${records[i].id})`);
                }
                kept++;
            } else {
                kept++;
            }
        }

        return { removed, kept };
    } catch (e) {
        console.error("Error removing duplicate records", e);
        throw e;
    }
};

export const removeDuplicateOrders = async (): Promise<{ removed: number; kept: number }> => {
    try {
        const db = await initDB();
        const allOrders = await db.getAllFromIndex('orders', 'by-date');

        // Group by orderNumber (assuming orders with same number are duplicates)
        const orderMap = new Map<string, OrderRecord[]>();

        for (const order of allOrders) {
            const key = order.orderNumber || 'unknown';
            if (!orderMap.has(key)) {
                orderMap.set(key, []);
            }
            orderMap.get(key)!.push(order);
        }

        let removed = 0;
        let kept = 0;

        // For each group, keep only the most recent one
        for (const [orderNumber, orders] of orderMap.entries()) {
            if (orders.length > 1) {
                // Sort by timestamp descending (most recent first)
                orders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

                // Keep the first (most recent), delete the rest
                for (let i = 1; i < orders.length; i++) {
                    await db.delete('orders', orders[i].id);
                    removed++;
                    console.log(`🗑️ Eliminado pedido duplicado: ${orders[i].orderNumber} (${orders[i].id})`);
                }
                kept++;
            } else {
                kept++;
            }
        }

        return { removed, kept };
    } catch (e) {
        console.error("Error removing duplicate orders", e);
        throw e;
    }
};
