import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../../services/authService';
import { LogIn, UserPlus, Loader2, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (isRegister) {
                await register(email, password);
                setSuccess('¡Cuenta creada exitosamente!');
                setTimeout(() => navigate('/'), 1500);
            } else {
                await login(email, password);
                setSuccess('¡Inicio de sesión exitoso!');
                setTimeout(() => navigate('/'), 1500);
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Back button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Volver al inicio</span>
                </button>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700 animate-fade-in-up">
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
                                className="w-full px-4 py-3 bg-slate-900/50 text-white rounded-lg border border-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
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
                                className="w-full px-4 py-3 bg-slate-900/50 text-white rounded-lg border border-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg text-sm animate-fade-in">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
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
                                setSuccess('');
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
