import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastProps {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
    const config = {
        success: { icon: CheckCircle, bg: 'bg-green-600', border: 'border-green-500' },
        error: { icon: AlertCircle, bg: 'bg-red-600', border: 'border-red-500' },
        info: { icon: Info, bg: 'bg-blue-600', border: 'border-blue-500' },
        warning: { icon: AlertTriangle, bg: 'bg-amber-600', border: 'border-amber-500' },
    };

    const { icon: Icon, bg, border } = config[type];

    return (
        <div className={`${bg} ${border} border-l-4 rounded-lg shadow-xl p-4 flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in-right`}>
            <Icon className="text-white flex-shrink-0" size={20} />
            <p className="text-white flex-1 text-sm">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="text-white/80 hover:text-white flex-shrink-0 transition-colors"
            >
                <X size={18} />
            </button>
        </div>
    );
};
