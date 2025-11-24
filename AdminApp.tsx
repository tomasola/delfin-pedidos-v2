import React from 'react';
import { Admin } from './components/Admin/Admin';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminApp: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-slate-900 text-slate-200 font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden">
            {/* Header with Back Button */}
            <header className="bg-slate-800 p-4 flex items-center gap-4 shadow-md z-10">
                <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white">
                    <Home size={24} />
                </button>
                <h1 className="text-lg font-bold text-white">Administración</h1>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                <Admin />
            </main>
        </div>
    );
};

export default AdminApp;
