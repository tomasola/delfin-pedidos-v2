import React from 'react';
import { AlertTriangle, FileText, Tag, X } from 'lucide-react';

export type DocumentType = 'LABEL' | 'ORDER' | 'UNKNOWN';

interface DocumentTypeWarningProps {
    detectedType: DocumentType;
    expectedType: 'LABEL' | 'ORDER';
    onContinue: () => void;
    onCancel: () => void;
}

export const DocumentTypeWarning: React.FC<DocumentTypeWarningProps> = ({
    detectedType,
    expectedType,
    onContinue,
    onCancel
}) => {
    const isWrongType = detectedType !== expectedType && detectedType !== 'UNKNOWN';

    const getIcon = () => {
        if (detectedType === 'ORDER') return <FileText size={48} className="text-blue-500" />;
        if (detectedType === 'LABEL') return <Tag size={48} className="text-amber-500" />;
        return <AlertTriangle size={48} className="text-orange-500" />;
    };

    const getTitle = () => {
        if (!isWrongType) return null;

        if (expectedType === 'LABEL' && detectedType === 'ORDER') {
            return '⚠️ Esto parece un PEDIDO';
        }
        if (expectedType === 'ORDER' && detectedType === 'LABEL') {
            return '⚠️ Esto parece una ETIQUETA';
        }
        return '⚠️ Tipo de documento incorrecto';
    };

    const getMessage = () => {
        if (!isWrongType) return null;

        if (expectedType === 'LABEL' && detectedType === 'ORDER') {
            return (
                <>
                    <p className="text-slate-300 mb-2">
                        Has escaneado un <strong className="text-blue-400">pedido de venta</strong>.
                    </p>
                    <p className="text-slate-400 text-sm mb-3">
                        Estás en el módulo de <strong>Etiquetas</strong>. Los pedidos deben escanearse en <strong className="text-blue-400">Análisis de Pedidos</strong>.
                    </p>
                    <div className="bg-blue-900/30 border border-blue-700 rounded p-3 mb-3">
                        <p className="text-xs text-blue-300">
                            💡 <strong>Sugerencia:</strong> Ve al menú principal → Análisis de Pedidos para escanear este documento correctamente.
                        </p>
                    </div>
                </>
            );
        }

        if (expectedType === 'ORDER' && detectedType === 'LABEL') {
            return (
                <>
                    <p className="text-slate-300 mb-2">
                        Has escaneado una <strong className="text-amber-400">etiqueta industrial</strong>.
                    </p>
                    <p className="text-slate-400 text-sm mb-3">
                        Estás en el módulo de <strong>Análisis de Pedidos</strong>. Las etiquetas deben escanearse en <strong className="text-amber-400">Escáner de Etiquetas</strong>.
                    </p>
                    <div className="bg-amber-900/30 border border-amber-700 rounded p-3 mb-3">
                        <p className="text-xs text-amber-300">
                            💡 <strong>Sugerencia:</strong> Ve al menú principal → Etiquetas para escanear este documento correctamente.
                        </p>
                    </div>
                </>
            );
        }

        return null;
    };

    if (!isWrongType) {
        return null; // No mostrar modal si el tipo es correcto
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border-2 border-red-500/50 rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    {getIcon()}
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-center mb-4 text-red-400">
                    {getTitle()}
                </h2>

                {/* Message */}
                <div className="mb-6">
                    {getMessage()}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onContinue}
                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Continuar de todos modos
                    </button>
                </div>

                {/* Warning Footer */}
                <p className="text-xs text-center text-slate-500 mt-4">
                    ⚠️ Guardar datos incorrectos puede causar problemas en el análisis
                </p>
            </div>
        </div>
    );
};
