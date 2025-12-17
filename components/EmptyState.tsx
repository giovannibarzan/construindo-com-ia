
import React from 'react';

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    ctaText?: string;
    onCtaClick?: () => void;
    gradient?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    ctaText,
    onCtaClick,
    gradient = 'from-blue-500 to-purple-600'
}) => {
    return (
        <div className="flex items-center justify-center min-h-[500px] p-8">
            <div className="text-center max-w-md">
                {/* Ícone com gradiente e animação */}
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${gradient} mb-6 animate-pulse shadow-2xl`}>
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '64px' }}>
                        {icon}
                    </span>
                </div>

                {/* Título */}
                <h2 className="text-3xl font-bold mb-4 dark:text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {title}
                </h2>

                {/* Descrição */}
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    {description}
                </p>

                {/* CTA Button (opcional) */}
                {ctaText && onCtaClick && (
                    <button
                        onClick={onCtaClick}
                        className={`bg-gradient-to-r ${gradient} text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto`}
                    >
                        <span className="material-symbols-outlined">notifications_active</span>
                        {ctaText}
                    </button>
                )}

                {/* Decoração adicional */}
                <div className="mt-12 flex justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
};

export default EmptyState;
