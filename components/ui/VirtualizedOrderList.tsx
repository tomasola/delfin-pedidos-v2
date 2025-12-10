import { FixedSizeList } from 'react-window';
import { OrderRecord } from '../../types';
import { Trash2, Eye } from 'lucide-react';

interface VirtualizedOrderListProps {
    orders: OrderRecord[];
    onDelete: (id: string) => void;
    onView: (order: OrderRecord) => void;
}

export const VirtualizedOrderList: React.FC<VirtualizedOrderListProps> = ({ orders, onDelete, onView }) => {
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const order = orders[index];

        return (
            <div
                style={style}
                className="flex items-center gap-3 px-4 py-2 border-b border-slate-700 hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{order.orderNumber || 'Sin número'}</span>
                        <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">
                            {order.items?.length || 0} items
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                        {new Date(order.timestamp).toLocaleString()}
                    </div>
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={() => onView(order)}
                        className="p-2 hover:bg-slate-700 rounded transition-colors"
                        title="Ver detalles"
                    >
                        <Eye size={16} className="text-blue-400" />
                    </button>
                    <button
                        onClick={() => onDelete(order.id)}
                        className="p-2 hover:bg-slate-700 rounded transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 size={16} className="text-red-400" />
                    </button>
                </div>
            </div>
        );
    };

    if (orders.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-slate-500">
                No hay pedidos para mostrar
            </div>
        );
    }

    return (
        <FixedSizeList
            height={600}
            itemCount={orders.length}
            itemSize={70}
            width="100%"
            className="scrollbar-thin"
        >
            {Row}
        </FixedSizeList>
    );
};
