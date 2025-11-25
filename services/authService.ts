import { auth } from '../src/config/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User
} from 'firebase/auth';

export const login = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const register = async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
    return await signOut(auth);
};

export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};
