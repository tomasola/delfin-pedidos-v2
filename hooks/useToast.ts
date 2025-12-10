import { create } from 'zustand';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = `toast_${Date.now()}_${Math.random()}`;
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

        // Auto-remove after duration
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
        }, toast.duration || 3000);
    },
    removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));

export const useToast = () => {
    const { addToast } = useToastStore();

    return {
        success: (message: string, duration?: number) =>
            addToast({ message, type: 'success', duration }),
        error: (message: string, duration?: number) =>
            addToast({ message, type: 'error', duration }),
        info: (message: string, duration?: number) =>
            addToast({ message, type: 'info', duration }),
        warning: (message: string, duration?: number) =>
            addToast({ message, type: 'warning', duration }),
    };
};
