
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Suggestion, SuggestionComment, User } from '../../types';
import { backend } from '../../services/backend';

interface SuggestionDetailViewProps {
    currentUser: User;
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const SuggestionDetailView: React.FC<SuggestionDetailViewProps> = ({ currentUser, onShowToast }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
    const [comments, setComments] = useState<SuggestionComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            loadSuggestion();
            loadComments();
        }
    }, [id]);

    const loadSuggestion = async () => {
        try {
            const data = await backend.getSuggestionById(id!);
            setSuggestion(data);
        } catch (error) {
            console.error('Error loading suggestion:', error);
            if (onShowToast) onShowToast('Erro ao carregar sugestão', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        try {
            const data = await backend.getSuggestionComments(id!);
            setComments(data);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    const handleVote = async (voteType: 'up' | 'down') => {
        if (!suggestion) return;
        try {
            await backend.voteSuggestion(suggestion.id, voteType);
            loadSuggestion(); // Reload to get updated vote count
        } catch (error: any) {
            if (onShowToast) onShowToast(error.message || 'Erro ao votar', 'error');
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !suggestion) return;

        setIsSubmitting(true);
        try {
            await backend.createSuggestionComment(suggestion.id, newComment.trim());
            setNewComment('');
            loadComments();
            loadSuggestion(); // Reload to update comment count
            if (onShowToast) onShowToast('Comentário adicionado!', 'success');
        } catch (error: any) {
            if (onShowToast) onShowToast(error.message || 'Erro ao comentar', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!suggestion) {
        return (
            <div className="text-center py-16">
                <span className="text-6xl mb-4 block">😕</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sugestão não encontrada</h2>
                <button
                    onClick={() => navigate('/suggestions')}
                    className="mt-4 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all"
                >
                    Voltar para Sugestões
                </button>
            </div>
        );
    }

    const categoryConfig = getCategoryConfig(suggestion.category);
    const statusConfig = getStatusConfig(suggestion.status);

    const renderComment = (comment: SuggestionComment, depth: number = 0) => (
        <div key={comment.id} className={depth > 0 ? 'ml-12 mt-4' : 'mt-4'}>
            <div className="flex gap-3">
                <img
                    src={comment.user.avatarUrl}
                    alt={comment.user.name}
                    className="w-10 h-10 rounded-full shrink-0"
                />
                <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {comment.user.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {comment.createdAt}
                        </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                    </p>
                </div>
            </div>
            {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Back Button */}
            <button
                onClick={() => navigate('/suggestions')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                Voltar para Sugestões
            </button>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                {/* Header */}
                <div className="flex gap-6 mb-6">
                    {/* Voting */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                        <button
                            onClick={() => handleVote('up')}
                            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${suggestion.userVote === 'up'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary/10 hover:text-primary'
                                }`}
                        >
                            <span className="material-symbols-outlined !text-2xl">arrow_upward</span>
                        </button>
                        <span className={`text-2xl font-bold ${suggestion.votesCount > 0 ? 'text-primary' : 'text-gray-500'}`}>
                            {suggestion.votesCount}
                        </span>
                        <button
                            onClick={() => handleVote('down')}
                            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${suggestion.userVote === 'down'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-500'
                                }`}
                        >
                            <span className="material-symbols-outlined !text-2xl">arrow_downward</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${categoryConfig.color}`}>
                                <span>{categoryConfig.icon}</span>
                                {categoryConfig.label}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                            {suggestion.isFeatured && (
                                <span className="text-2xl" title="Sugestão em destaque">⭐</span>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {suggestion.title}
                        </h1>

                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">
                            {suggestion.description}
                        </p>

                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <img
                                    src={suggestion.user.avatarUrl}
                                    alt={suggestion.user.name}
                                    className="w-6 h-6 rounded-full"
                                />
                                <span>{suggestion.user.name}</span>
                            </div>
                            <span>•</span>
                            <span>{suggestion.createdAt}</span>
                            <span>•</span>
                            <span>{suggestion.commentsCount} comentários</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    💬 Discussão ({comments.length})
                </h2>

                {/* Add Comment Form */}
                <form onSubmit={handleSubmitComment} className="mb-6">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Compartilhe sua opinião sobre esta sugestão..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    />
                    <div className="flex justify-end mt-3">
                        <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmitting}
                            className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Enviando...' : 'Comentar'}
                        </button>
                    </div>
                </form>

                {/* Comments List */}
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Seja o primeiro a comentar!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.map(comment => renderComment(comment))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestionDetailView;
