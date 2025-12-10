import { TrendingUp, TrendingDown, Package, FileText, Calendar, Activity } from 'lucide-react';
import { Record, OrderRecord } from '../../types';

interface DashboardStatsProps {
    records: Record[];
    orders: OrderRecord[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ records, orders }) => {
    // Calcular estadísticas
    const totalRecords = records.length;
    const totalOrders = orders.length;

    // Registros últimos 7 días
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recordsLast7Days = records.filter(r => new Date(r.timestamp) > last7Days).length;
    const ordersLast7Days = orders.filter(o => new Date(o.timestamp) > last7Days).length;

    // Calcular tendencia (comparar con 7 días anteriores)
    const previous7Days = new Date();
    previous7Days.setDate(previous7Days.getDate() - 14);
    const recordsPrevious7Days = records.filter(r => {
        const date = new Date(r.timestamp);
        return date > previous7Days && date <= last7Days;
    }).length;

    const recordsTrend = recordsPrevious7Days > 0
        ? ((recordsLast7Days - recordsPrevious7Days) / recordsPrevious7Days) * 100
        : 0;

    // Registros por día (últimos 7 días)
    const recordsByDay: { [key: string]: number } = {};
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        recordsByDay[dateStr] = records.filter(r =>
            r.timestamp.toString().startsWith(dateStr)
        ).length;
    }

    const avgRecordsPerDay = recordsLast7Days / 7;

    const stats = [
        {
            icon: Package,
            label: 'Total Etiquetas',
            value: totalRecords,
            subtext: `${recordsLast7Days} últimos 7 días`,
            trend: recordsTrend,
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
        },
        {
            icon: FileText,
            label: 'Total Pedidos',
            value: totalOrders,
            subtext: `${ordersLast7Days} últimos 7 días`,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            icon: Calendar,
            label: 'Promedio Diario',
            value: avgRecordsPerDay.toFixed(1),
            subtext: 'Etiquetas por día',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            icon: Activity,
            label: 'Actividad Hoy',
            value: recordsByDay[new Date().toISOString().split('T')[0]] || 0,
            subtext: 'Registros creados',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                    <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={stat.color} size={20} />
                        </div>
                        {stat.trend !== undefined && (
                            <div className={`flex items-center gap-1 text-xs ${stat.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {Math.abs(stat.trend).toFixed(0)}%
                            </div>
                        )}
                    </div>

                    <div className="mt-3">
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
                        {stat.subtext && (
                            <div className="text-xs text-slate-500 mt-1">{stat.subtext}</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
