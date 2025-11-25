import React, { useState } from 'react';
import { login, register } from '../../services/authService';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                await register(email, password);
            } else {
                await login(email, password);
            }
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                setError('Usuario no encontrado');
            } else if (err.code === 'auth/wrong-password') {
                setError('Contraseña incorrecta');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('El email ya está registrado');
            } else if (err.code === 'auth/weak-password') {
                setError('La contraseña debe tener al menos 6 caracteres');
            } else if (err.code === 'auth/invalid-email') {
                setError('Email inválido');
            } else if (err.code === 'auth/invalid-credential') {
                setError('Credenciales inválidas');
            } else {
                setError('Error: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="w-full max-w-md">
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Delfín Pedidos
                        </h1>
                        <p className="text-slate-400">
                            {isRegister ? 'Crear nueva cuenta' : 'Iniciar sesión'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg border border-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg border border-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Cargando...
                                </>
                            ) : (
                                <>
                                    {isRegister ? <UserPlus size={20} /> : <LogIn size={20} />}
                                    {isRegister ? 'Registrarse' : 'Entrar'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle */}
                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                            }}
                            className="text-slate-400 hover:text-white transition text-sm"
                        >
                            {isRegister
                                ? '¿Ya tienes cuenta? Inicia sesión'
                                : '¿No tienes cuenta? Regístrate'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
