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

export const importFromFolder = async (files: File[]): Promise<{ success: number; errors: string[]; skipped: number }> => {
    const errors: string[] = [];
    let success = 0;
    let skipped = 0;

    // Filter only JPG/JPEG files
    const jpgFiles = files.filter(file => {
        const extension = file.name.toLowerCase().match(/\.(jpg|jpeg)$/);
        if (!extension) {
            skipped++;
            console.log(`⏭️ Saltado (no es JPG): ${file.name}`);
            return false;
        }
        return true;
    });

    for (const file of jpgFiles) {
        try {
            // Extract reference from filename (e.g., "10008.jpg" -> "10008")
            const reference = file.name.replace(/\.(jpg|jpeg)$/i, '');

            // Convert file to base64
            const reader = new FileReader();
            const imageData = await new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            await addReferenceImage(reference, imageData, file.name);
            success++;
            console.log(`✅ Importada referencia: ${reference} (${file.name})`);
        } catch (error) {
            errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    return { success, errors, skipped };
};

export const importReferenceImages = async (
    images: ReferenceImage[]
): Promise<{ success: number; errors: number }> => {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    let success = 0;
    let errors = 0;

    for (const img of images) {
        try {
            // Ensure data validity
            if (!img.id || !img.reference || !img.imageData) {
                console.warn('Skipping invalid image record:', img);
                errors++;
                continue;
            }
            await store.put(img);
            success++;
        } catch (e) {
            console.error(`Error importing ${img.reference}:`, e);
            errors++;
        }
    }

    await tx.done;
    return { success, errors };
};
