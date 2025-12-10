import { useCallback, useState } from 'react';
import { useToast } from './useToast';
import { getErrorMessage } from '../utils/errorMessages';

interface UseErrorHandlerReturn {
    error: Error | null;
    isError: boolean;
    handleError: (error: unknown, customMessage?: string) => void;
    clearError: () => void;
    wrapAsync: <T>(fn: () => Promise<T>, errorMessage?: string) => Promise<T | undefined>;
}

export function useErrorHandler(): UseErrorHandlerReturn {
    const [error, setError] = useState<Error | null>(null);
    const { error: showErrorToast } = useToast();

    const handleError = useCallback((error: unknown, customMessage?: string) => {
        console.error('[Error Handler]:', error);

        const errorObj = error instanceof Error ? error : new Error(String(error));
        setError(errorObj);

        const message = customMessage || getErrorMessage(error);
        showErrorToast(message);
    }, [showErrorToast]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const wrapAsync = useCallback(async <T,>(
        fn: () => Promise<T>,
        errorMessage?: string
    ): Promise<T | undefined> => {
        try {
            clearError();
            return await fn();
        } catch (err) {
            handleError(err, errorMessage);
            return undefined;
        }
    }, [handleError, clearError]);

    return {
        error,
        isError: error !== null,
        handleError,
        clearError,
        wrapAsync,
    };
}

// Global error boundary hook
export function useGlobalErrorHandler() {
    const { handleError } = useErrorHandler();

    // Setup global error handlers
    useCallback(() => {
        const handleWindowError = (event: ErrorEvent) => {
            event.preventDefault();
            handleError(event.error, 'Error inesperado en la aplicación');
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            event.preventDefault();
            handleError(event.reason, 'Error en operación asíncrona');
        };

        window.addEventListener('error', handleWindowError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleWindowError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, [handleError]);
}
