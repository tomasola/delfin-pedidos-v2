import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/Auth/Login';
import { ToastContainer } from './components/ui/ToastContainer';
import { Loader2 } from 'lucide-react';
import Home from './Home';

// Lazy load heavy modules
const Delfin14App = lazy(() => import('./Delfin14App'));
const AnalisisPedidosApp = lazy(() => import('./AnalisisPedidosApp'));
const AdminApp = lazy(() => import('./AdminApp'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
        <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
);

function App() {
    const { user, loading } = useAuth();
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // Reduced splash screen timer from 3s to 1.5s
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    if (loading || showSplash) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-fade-out">
                <div className="animate-pulse flex flex-col items-center px-4">
                    <img
                        src="/icon.png"
                        alt="Delfín Suite"
                        className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 object-contain mb-8 drop-shadow-2xl animate-float"
                    />
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-widest uppercase">Delfín Suite</h1>
                    <p className="text-slate-400 mt-2 text-sm sm:text-base">v2.0.0</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer />
            <Router>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/delfin-14" replace />} />
                        <Route path="/menu" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/delfin-14" element={<Delfin14App />} />
                        <Route path="/analisis-pedidos" element={<AnalisisPedidosApp />} />
                        <Route
                            path="/admin"
                            element={<AdminApp />}
                        />
                    </Routes>
                </Suspense>
            </Router>
        </>
    );
}

export default App;
