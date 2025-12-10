import { Cloud, CloudOff, Loader2, Check } from 'lucide-react';

interface SyncStatusProps {
    status: 'synced' | 'syncing' | 'offline' | 'error';
    lastSync?: Date;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ status, lastSync }) => {
    const config = {
        synced: {
            icon: Cloud,
            color: 'text-green-500',
            label: 'Sincronizado',
            badge: Check
        },
        syncing: {
            icon: Loader2,
            color: 'text-blue-500',
            label: 'Sincronizando...',
            animate: true
        },
        offline: {
            icon: CloudOff,
            color: 'text-gray-500',
            label: 'Sin conexión'
        },
        error: {
            icon: Cloud,
            color: 'text-red-500',
            label: 'Error de sincronización'
        },
    };

    const { icon: Icon, color, label, animate, badge: Badge } = config[status];

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
            <Icon className={`${color} ${animate ? 'animate-spin' : ''}`} size={14} />
            <span className="text-xs text-slate-300">{label}</span>
            {Badge && <Badge className="text-green-500" size={12} />}
            {lastSync && status === 'synced' && (
                <span className="text-[10px] text-slate-500">
                    {formatRelativeTime(lastSync)}
                </span>
            )}
        </div>
    );
};

function formatRelativeTime(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'ahora';
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
    return `hace ${Math.floor(seconds / 3600)}h`;
}
