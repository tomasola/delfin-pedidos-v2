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

    useEffect(() => {
        // Ensure anonymous sign-in happens before checking auth state
        ensureSignedIn().catch(err => {
            console.error('Failed to sign in anonymously on startup:', err);
        });

        const unsubscribe = auth.onAuthStateChanged((user: any) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-white text-xl">Cargando...</div>
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
