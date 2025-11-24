import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, FileText, Settings } from 'lucide-react';

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-slate-900 text-slate-200 font-sans max-w-md mx-auto shadow-2xl p-6 items-center justify-center gap-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-2">Delfín Suite</h1>
                <p className="text-slate-400">Selecciona una aplicación</p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
                <button
                    onClick={() => navigate('/delfin-14')}
                    className="flex items-center p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-amber-500 hover:bg-slate-750 transition-all group"
                >
                    <div className="p-4 bg-slate-700 rounded-full mr-4 group-hover:bg-amber-500/20 group-hover:text-amber-500 transition-colors">
                        <Scan size={32} />
                    </div>
                    <div className="text-left">
                        <h2 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">Etiquetas</h2>
                        <p className="text-sm text-slate-400">Escáner de Perfiles</p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/analisis-pedidos')}
                    className="flex items-center p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 hover:bg-slate-750 transition-all group"
                >
                    <div className="p-4 bg-slate-700 rounded-full mr-4 group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-colors">
                        <FileText size={32} />
                    </div>
                    <div className="text-left">
                        <h2 className="text-xl font-bold text-white group-hover:text-blue-500 transition-colors">Análisis Pedidos</h2>
                        <p className="text-sm text-slate-400">Gestión de Pedidos</p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-green-500 hover:bg-slate-750 transition-all group"
                >
                    <div className="p-4 bg-slate-700 rounded-full mr-4 group-hover:bg-green-500/20 group-hover:text-green-500 transition-colors">
                        <Settings size={32} />
                    </div>
                    <div className="text-left">
                        <h2 className="text-xl font-bold text-white group-hover:text-green-500 transition-colors">Administración</h2>
                        <p className="text-sm text-slate-400">Gestión de Datos</p>
                    </div>
                </button>
            </div>

            <div className="mt-8 text-xs text-slate-600">
                v2.0.0 - Suite Industrial
            </div>
        </div>
    );
};

export default Home;
