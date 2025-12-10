import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';

interface SearchFiltersProps {
    onSearch: (query: string) => void;
    onFilterChange: (filters: FilterOptions) => void;
    filterOptions?: {
        showDateFilter?: boolean;
        showStatusFilter?: boolean;
        showTypeFilter?: boolean;
    };
}

export interface FilterOptions {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    type?: string;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
    onSearch,
    onFilterChange,
    filterOptions = {}
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({});

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        onSearch(value);
    };

    const handleFilterChange = (key: keyof FilterOptions, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        setFilters({});
        onFilterChange({});
    };

    const activeFilterCount = Object.values(filters).filter(v => v).length;

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                <Button
                    variant={showFilters ? 'primary' : 'secondary'}
                    onClick={() => setShowFilters(!showFilters)}
                    className="relative"
                >
                    <Filter size={18} />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </div>

            {showFilters && (
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3 animate-fade-in-up border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-slate-300">Filtros Avanzados</h4>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-blue-400 hover:text-blue-300"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filterOptions.showDateFilter && (
                            <>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Fecha desde</label>
                                    <Input
                                        type="date"
                                        value={filters.dateFrom || ''}
                                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Fecha hasta</label>
                                    <Input
                                        type="date"
                                        value={filters.dateTo || ''}
                                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {filterOptions.showStatusFilter && (
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Estado</label>
                                <select
                                    value={filters.status || ''}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                                >
                                    <option value="">Todos</option>
                                    <option value="pending">Pendiente</option>
                                    <option value="completed">Completado</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </div>
                        )}

                        {filterOptions.showTypeFilter && (
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Tipo</label>
                                <select
                                    value={filters.type || ''}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                                >
                                    <option value="">Todos</option>
                                    <option value="standard">Estándar</option>
                                    <option value="urgent">Urgente</option>
                                    <option value="custom">Personalizado</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
