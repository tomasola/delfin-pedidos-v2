import { LucideIcon } from 'lucide-react';

interface AppCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    onClick: () => void;
    color: 'amber' | 'blue' | 'green';
    delay?: number;
}

const colorClasses = {
    amber: {
        border: 'hover:border-amber-500',
        bg: 'group-hover:bg-amber-500/20',
        text: 'group-hover:text-amber-500',
        gradient: 'from-amber-500/20 via-amber-500/10 to-transparent'
    },
    blue: {
        border: 'hover:border-blue-500',
        bg: 'group-hover:bg-blue-500/20',
        text: 'group-hover:text-blue-500',
        gradient: 'from-blue-500/20 via-blue-500/10 to-transparent'
    },
    green: {
        border: 'hover:border-green-500',
        bg: 'group-hover:bg-green-500/20',
        text: 'group-hover:text-green-500',
        gradient: 'from-green-500/20 via-green-500/10 to-transparent'
    }
};

export const AppCard: React.FC<AppCardProps> = ({
    title,
    description,
    icon: Icon,
    onClick,
    color,
    delay = 0
}) => {
    const colors = colorClasses[color];

    return (
        <button
            onClick={onClick}
            className={`
                app-card
                flex items-center p-6 
                bg-slate-800/50 backdrop-blur-sm
                rounded-xl border border-slate-700 
                ${colors.border}
                transition-all duration-300
                group relative overflow-hidden
                hover:scale-[1.02] hover:shadow-2xl
                animate-fade-in-up
            `}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Animated gradient background */}
            <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 
                bg-gradient-to-br ${colors.gradient}
                transition-opacity duration-500
            `} />

            {/* Content */}
            <div className={`
                p-4 bg-slate-700/50 rounded-full mr-4 
                ${colors.bg} ${colors.text}
                transition-all duration-300
                relative z-10
            `}>
                <Icon size={32} />
            </div>
            <div className="text-left relative z-10">
                <h2 className={`
                    text-xl font-bold text-white 
                    ${colors.text}
                    transition-colors duration-300
                `}>
                    {title}
                </h2>
                <p className="text-sm text-slate-400">{description}</p>
            </div>
        </button>
    );
};
