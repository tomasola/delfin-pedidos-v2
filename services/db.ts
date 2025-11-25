import { openDB, DBSchema } from 'idb';
import { Record, OrderRecord } from '../types';

interface ScannerDB extends DBSchema {
    records: {
        key: string;
        value: Record;
        indexes: { 'by-date': number };
    };
    orders: {
        key: string;
        value: OrderRecord;
        indexes: { 'by-date': number; 'by-orderNumber': string };
    };
}

const DB_NAME = 'industrial-scanner-db';
const DB_VERSION = 2;

export const initDB = async () => {
    return openDB<ScannerDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
            if (!db.objectStoreNames.contains('records')) {
                const store = db.createObjectStore('records', { keyPath: 'id' });
                store.createIndex('by-date', 'timestamp');
            }
            if (!db.objectStoreNames.contains('orders')) {
                const store = db.createObjectStore('orders', { keyPath: 'id' });
                store.createIndex('by-date', 'timestamp');
                store.createIndex('by-orderNumber', 'orderNumber');
            }
        },
    });
};
