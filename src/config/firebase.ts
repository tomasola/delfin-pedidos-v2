import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};
// Debug: log config (remove in prod if needed)
console.log('Firebase config loaded:', firebaseConfig);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Ensure user is signed in anonymously before Firebase operations
export const ensureSignedIn = async (): Promise<void> => {
    if (!auth.currentUser) {
        try {
            await signInAnonymously(auth);
            console.log('✅ Signed in anonymously to Firebase');
        } catch (error: any) {
            console.error('❌ Error signing in anonymously:', error);
            throw new Error(`Firebase authentication failed: ${error.message}`);
        }
    }
};
