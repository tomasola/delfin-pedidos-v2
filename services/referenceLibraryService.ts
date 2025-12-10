import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { ReferenceImage } from '../types';

interface ReferenceLibraryDB extends DBSchema {
    referenceLibrary: {
        key: string;
        value: ReferenceImage;
        indexes: { 'by-reference': string };
    };
}

const DB_NAME = 'ReferenceLibraryDB';
const STORE_NAME = 'referenceLibrary';

let dbPromise: Promise<IDBPDatabase<ReferenceLibraryDB>> | null = null;

const getDB = async (): Promise<IDBPDatabase<ReferenceLibraryDB>> => {
    if (!dbPromise) {
        dbPromise = openDB<ReferenceLibraryDB>(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('by-reference', 'reference', { unique: false });
                }
            },
        });
    }
    return dbPromise;
};

export const addReferenceImage = async (
    reference: string,
    imageData: string,
    fileName: string,
    notes?: string
): Promise<void> => {
    const db = await getDB();
    const referenceImage: ReferenceImage = {
        id: uuidv4(),
        reference,
        imageData,
        fileName,
        uploadedAt: Date.now(),
        notes,
    };
    await db.add(STORE_NAME, referenceImage);
};

export const getReferenceImage = async (reference: string): Promise<ReferenceImage | null> => {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.store.index('by-reference');
    const result = await index.get(reference);
    return result || null;
};

export const getAllReferenceImages = async (): Promise<ReferenceImage[]> => {
    const db = await getDB();
    return await db.getAll(STORE_NAME);
};

export const deleteReferenceImage = async (id: string): Promise<void> => {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
};

export const importFromFolder = async (files: File[]): Promise<{ success: number; errors: string[] }> => {
    const errors: string[] = [];
    let success = 0;

    for (const file of files) {
        try {
            // Extract reference from filename (e.g., "10008.png" -> "10008")
            const reference = file.name.replace(/\.(png|jpg|jpeg)$/i, '');

            // Convert file to base64
            const reader = new FileReader();
            const imageData = await new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            await addReferenceImage(reference, imageData, file.name);
            success++;
        } catch (error) {
            errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    return { success, errors };
};
