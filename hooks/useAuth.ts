import { useState, useEffect } from 'react';
import { auth, ensureSignedIn } from '../src/config/firebase';
import type { User } from 'firebase/auth';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAnonymous, setIsAnonymous] = useState(false);

    useEffect(() => {
        // Ensure anonymous sign-in happens before checking auth state
        ensureSignedIn().catch(err => {
            console.error('Failed to sign in anonymously on startup:', err);
        });

        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setIsAnonymous(user?.isAnonymous ?? false);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, loading, isAnonymous };
};
