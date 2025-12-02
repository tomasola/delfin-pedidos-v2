import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth, ensureSignedIn } from './src/config/firebase';
import { Login } from './components/Auth/Login';
import Home from './Home';
import Delfin14App from './Delfin14App';
import AnalisisPedidosApp from './AnalisisPedidosApp';
import AdminApp from './AdminApp';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // Ensure anonymous sign-in happens before checking auth state
        ensureSignedIn().catch(err => {
            console.error('Failed to sign in anonymously on startup:', err);
        });

        const unsubscribe = auth.onAuthStateChanged((user: any) => {
            setUser(user);
            setLoading(false);
        });

        // Splash screen timer
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 3000);

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    if (loading || showSplash) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-700">
                <div className="animate-pulse flex flex-col items-center">
                    <img
                        src="/icon.png"
                        alt="Delfín Suite"
                        className="w-48 h-48 object-contain mb-8 drop-shadow-2xl"
                    />
                    <h1 className="text-3xl font-bold text-white tracking-widest uppercase">Delfín Suite</h1>
                    <p className="text-slate-400 mt-2 text-sm">v2.0.0</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/delfin-14" element={<Delfin14App />} />
                <Route path="/analisis-pedidos" element={<AnalisisPedidosApp />} />
                <Route path="/admin" element={<AdminApp />} />
            </Routes>
        </Router>
    );
}

export default App;
