import { FixedSizeList } from 'react-window';
import { Record as RecordType } from '../../types';
import { Trash2, Edit } from 'lucide-react';

interface VirtualizedRecordListProps {
    records: RecordType[];
    onDelete: (id: string) => void;
    onEdit: (record: RecordType) => void;
}

export const VirtualizedRecordList: React.FC<VirtualizedRecordListProps> = ({ records, onDelete, onEdit }) => {
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const record = records[index];

        return (
            <div
                style={style}
                className="flex items-center gap-3 px-4 py-2 border-b border-slate-700 hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{record.reference || 'Sin referencia'}</span>
                        <span className="text-slate-400 text-sm">
                            L: {record.length} | Q: {record.quantity}
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                        {new Date(record.timestamp).toLocaleString()}
                    </div>
                </div>

                {record.croppedImage && (
                    <img
                        src={record.croppedImage}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded border border-slate-600"
                    />
                )}

                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(record)}
                        className="p-2 hover:bg-slate-700 rounded transition-colors"
                        title="Editar"
                    >
                        <Edit size={16} className="text-blue-400" />
                    </button>
                    <button
                        onClick={() => onDelete(record.id)}
                        className="p-2 hover:bg-slate-700 rounded transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 size={16} className="text-red-400" />
                    </button>
                </div>
            </div>
        );
    };

    if (records.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-slate-500">
                No hay registros para mostrar
            </div>
        );
    }

    return (
        <FixedSizeList
            height={600}
            itemCount={records.length}
            itemSize={80}
            width="100%"
            className="scrollbar-thin"
        >
            {Row}
        </FixedSizeList>
    );
};
