export const errorMessages = {
    network: {
        offline: 'Sin conexión a internet. Verifica tu conexión y vuelve a intentarlo.',
        timeout: 'La operación tardó demasiado. Intenta de nuevo en un momento.',
        serverError: 'Problema con el servidor. Intenta más tarde.',
    },
    firebase: {
        syncFailed: 'No se pudo sincronizar con Firebase. Verifica tu conexión.',
        authFailed: 'Error de autenticación. Recarga la aplicación.',
        permissionDenied: 'No tienes permisos para esta operación.',
        loadFailed: 'Error al cargar datos desde Firebase.',
    },
    validation: {
        invalidPin: 'El PIN debe tener al menos 4 caracteres.',
        emptyField: 'Este campo no puede estar vacío.',
        invalidFormat: 'El formato de los datos no es válido.',
    },
    general: {
        unknown: 'Ocurrió un error inesperado. Intenta de nuevo.',
        saveFailed: 'No se pudo guardar. Intenta de nuevo.',
    },
};

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        // Mapear errores conocidos
        if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
            return errorMessages.network.offline;
        }
        if (error.message.includes('timeout')) {
            return errorMessages.network.timeout;
        }
        if (error.message.includes('permission')) {
            return errorMessages.firebase.permissionDenied;
        }
        if (error.message.includes('auth')) {
            return errorMessages.firebase.authFailed;
        }

        return error.message;
    }

    return errorMessages.general.unknown;
}
