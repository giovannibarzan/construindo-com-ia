
import React from 'react';
import { Suggestion } from '../types';

interface SuggestionCardProps {
    suggestion: Suggestion;
    onVote: (suggestionId: string, voteType: 'up' | 'down') => void;
    onClick: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onVote, onClick }) => {
    const getCategoryConfig = (category: string) => {
        switch (category) {
            case 'course':
                return { icon: '📚', label: 'Curso', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' };
            case 'feature':
                return { icon: '✨', label: 'Funcionalidade', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' };
            case 'content':
                return { icon: '📝', label: 'Conteúdo', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' };
            case 'tool':
                return { icon: '🔧', label: 'Ferramenta', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' };
            default:
                return { icon: '💡', label: 'Outro', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' };
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return { label: 'Pendente', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' };
            case 'under_review':
                return { label: 'Em Análise', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' };
            case 'approved':
                return { label: 'Aprovada', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' };
            case 'rejected':
                return { label: 'Rejeitada', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' };
            case 'implemented':
                return { label: '✅ Implementada', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' };
            default:
                return { label: status, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' };
        }
    };

    const categoryConfig = getCategoryConfig(suggestion.category);
    const statusConfig = getStatusConfig(suggestion.status);

    const handleVote = (e: React.MouseEvent, voteType: 'up' | 'down') => {
        e.stopPropagation();
        onVote(suggestion.id, voteType);
    };

    return (
        <div
            onClick={onClick}
            className="group relative flex gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50 transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer"
        >
            {/* Voting Section */}
            <div className="flex flex-row md:flex-col items-center gap-2 md:gap-1 shrink-0">
                <button
                    onClick={(e) => handleVote(e, 'up')}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${suggestion.userVote === 'up'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary/10 hover:text-primary'
                        }`}
                    title="Votar a favor"
                >
                    <span className="material-symbols-outlined !text-lg">arrow_upward</span>
                </button>
                <span className={`text-sm font-bold min-w-[24px] text-center ${suggestion.votesCount > 0 ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                    {suggestion.votesCount}
                </span>
                <button
                    onClick={(e) => handleVote(e, 'down')}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${suggestion.userVote === 'down'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-500'
                        }`}
                    title="Votar contra"
                >
                    <span className="material-symbols-outlined !text-lg">arrow_downward</span>
                </button>
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                        {suggestion.title}
                    </h3>
                    {suggestion.isFeatured && (
                        <span className="shrink-0 text-xl" title="Sugestão em destaque">⭐</span>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {suggestion.description}
                </p>

                {/* Footer */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Category Badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryConfig.color}`}>
                        <span>{categoryConfig.icon}</span>
                        {categoryConfig.label}
                    </span>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                    </span>

                    {/* Comments Count */}
                    {suggestion.commentsCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="material-symbols-outlined !text-sm">chat_bubble</span>
                            {suggestion.commentsCount}
                        </span>
                    )}

                    {/* Author & Date */}
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        por {suggestion.user.name} • {suggestion.createdAt}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SuggestionCard;
