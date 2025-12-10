import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 border border-slate-700 transition-colors"
            title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
        >
            {theme === 'dark' ? (
                <Sun className="text-amber-500" size={20} />
            ) : (
                <Moon className="text-blue-500" size={20} />
            )}
        </button>
    );
};
