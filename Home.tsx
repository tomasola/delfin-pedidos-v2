import { useNavigate } from 'react-router-dom';
import { Scan, FileText, Settings } from 'lucide-react';
import { AppCard } from './components/AppCard';

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 font-sans max-w-md mx-auto shadow-2xl p-6 items-center justify-center gap-8 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>

            {/* Content */}
            <div className="text-center relative z-10 animate-fade-in">
                <h1 className="text-4xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-white">
                    Delfín Suite
                </h1>
                <p className="text-slate-400">Selecciona una aplicación</p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs relative z-10">
                <AppCard
                    title="Etiquetas"
                    description="Escáner de Perfiles"
                    icon={Scan}
                    onClick={() => navigate('/delfin-14')}
                    color="amber"
                    delay={100}
                />

                <AppCard
                    title="Análisis Pedidos"
                    description="Gestión de Pedidos"
                    icon={FileText}
                    onClick={() => navigate('/analisis-pedidos')}
                    color="blue"
                    delay={200}
                />

                <AppCard
                    title="Administración"
                    description="Gestión de Datos"
                    icon={Settings}
                    onClick={() => navigate('/admin')}
                    color="green"
                    delay={300}
                />
            </div>

            <div className="mt-8 text-xs text-slate-600 relative z-10 animate-fade-in animation-delay-500">
                v2.0.0 - Suite Industrial
            </div>
        </div>
    );
};

export default Home;
