
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Suggestion, User } from '../../types';
import { backend } from '../../services/backend';
import SuggestionCard from '../SuggestionCard';
import CreateSuggestionModal from '../CreateSuggestionModal';

interface SuggestionsViewProps {
    currentUser: User;
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const SuggestionsView: React.FC<SuggestionsViewProps> = ({ currentUser, onShowToast }) => {
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');

    const categories = [
        { value: 'all', label: 'Todas', icon: '🌟' },
        { value: 'course', label: 'Cursos', icon: '📚' },
        { value: 'feature', label: 'Funcionalidades', icon: '✨' },
        { value: 'content', label: 'Conteúdo', icon: '📝' },
        { value: 'tool', label: 'Ferramentas', icon: '🔧' },
        { value: 'other', label: 'Outros', icon: '💡' }
    ];

    const statuses = [
        { value: 'all', label: 'Todos Status' },
        { value: 'pending', label: 'Pendentes' },
        { value: 'under_review', label: 'Em Análise' },
        { value: 'approved', label: 'Aprovadas' },
        { value: 'implemented', label: 'Implementadas' }
    ];

    useEffect(() => {
        loadSuggestions();
    }, [selectedCategory, selectedStatus, sortBy]);

    const loadSuggestions = async () => {
        setLoading(true);
        try {
            const data = await backend.getSuggestions({
                category: selectedCategory,
                status: selectedStatus,
                sort: sortBy
            });
            setSuggestions(data);
        } catch (error) {
            console.error('Error loading suggestions:', error);
            if (onShowToast) onShowToast('Erro ao carregar sugestões', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSuggestion = async (data: { title: string; description: string; category: string }) => {
        try {
            await backend.createSuggestion(data);
            if (onShowToast) onShowToast('Sugestão criada com sucesso!', 'success');
            loadSuggestions();
        } catch (error: any) {
            console.error('Error creating suggestion:', error);
            if (onShowToast) onShowToast(error.message || 'Erro ao criar sugestão', 'error');
        }
    };

    const handleVote = async (suggestionId: string, voteType: 'up' | 'down') => {
        try {
            await backend.voteSuggestion(suggestionId, voteType);
            // Atualizar localmente
            loadSuggestions();
        } catch (error: any) {
            console.error('Error voting:', error);
            if (onShowToast) onShowToast(error.message || 'Erro ao votar', 'error');
        }
    };

    const handleSuggestionClick = (suggestionId: string) => {
        navigate(`/suggestions/${suggestionId}`);
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        💡 Sugestões da Comunidade
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Vote e discuta ideias para melhorar a plataforma
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nova Sugestão
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-4">
                {/* Category Filters */}
                <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">CATEGORIA</p>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat.value
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <span>{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status & Sort */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">STATUS:</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary"
                        >
                            {statuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2 ml-auto">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">ORDENAR:</label>
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setSortBy('votes')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${sortBy === 'votes'
                                        ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                🔥 Mais Votadas
                            </button>
                            <button
                                onClick={() => setSortBy('recent')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${sortBy === 'recent'
                                        ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                🆕 Mais Recentes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Clear Filters */}
                {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
                    <button
                        onClick={() => {
                            setSelectedCategory('all');
                            setSelectedStatus('all');
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        ✕ Limpar filtros
                    </button>
                )}
            </div>

            {/* Suggestions List */}
            <div className="space-y-4">
                {loading ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-40 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 animate-pulse"
                        />
                    ))
                ) : suggestions.length === 0 ? (
                    // Empty state
                    <div className="text-center py-16 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl">
                        <span className="text-6xl mb-4 block">🔍</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Nenhuma sugestão encontrada
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Seja o primeiro a sugerir algo incrível!
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all"
                        >
                            Criar Primeira Sugestão
                        </button>
                    </div>
                ) : (
                    // Suggestions
                    suggestions.map((suggestion) => (
                        <SuggestionCard
                            key={suggestion.id}
                            suggestion={suggestion}
                            onVote={handleVote}
                            onClick={() => handleSuggestionClick(suggestion.id)}
                        />
                    ))
                )}
            </div>

            {/* Create Modal */}
            <CreateSuggestionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateSuggestion}
            />
        </div>
    );
};

export default SuggestionsView;
