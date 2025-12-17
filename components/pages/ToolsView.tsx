

import React, { useState, useEffect } from 'react';
import { Tool, User } from '../../types';
import { backend } from '../../services/backend';
import ToolCard from '../ToolCard';

interface ToolsViewProps {
    currentUser?: User | null;
}

const ToolsView: React.FC<ToolsViewProps> = ({ currentUser }) => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const [loading, setLoading] = useState(true);

    // Review states
    const [reviews, setReviews] = useState<any[]>([]);
    const [userVotes, setUserVotes] = useState<string[]>([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    // FAQ accordion state
    const [openFaqId, setOpenFaqId] = useState<string | null>(null);

    // Load tools
    useEffect(() => {
        backend.getTools().then(data => {
            setTools(data);
            setLoading(false);
        });
    }, []);

    // Load reviews when tool is selected
    useEffect(() => {
        if (selectedTool) {
            loadReviews();
        }
    }, [selectedTool]);

    const loadReviews = async () => {
        if (!selectedTool) return;
        try {
            const data = await backend.getToolReviews(selectedTool.id);
            setReviews(data);

            if (currentUser) {
                const reviewIds = data.map((r: any) => r.id);
                const votes = await backend.getUserReviewVotes(currentUser.id, reviewIds);
                setUserVotes(votes);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    };

    const handleSubmitReview = async () => {
        if (!currentUser || !selectedTool || !newReview.comment.trim()) return;

        setSubmittingReview(true);
        try {
            await backend.submitToolReview(
                selectedTool.id,
                currentUser.id,
                newReview.rating,
                newReview.comment
            );
            setNewReview({ rating: 5, comment: '' });
            setShowReviewForm(false);
            await loadReviews();
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleVoteHelpful = async (reviewId: string) => {
        if (!currentUser) return;

        try {
            await backend.voteReviewHelpful(reviewId, currentUser.id);
            await loadReviews();
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    // Handle URL-based tool selection (SEO-friendly URLs)
    useEffect(() => {
        const path = window.location.pathname;
        const toolSlugMatch = path.match(/\/tools\/([^\/]+)/);

        if (toolSlugMatch && tools.length > 0) {
            const slug = toolSlugMatch[1];
            const tool = tools.find(t =>
                t.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
            );
            if (tool && tool.id !== selectedTool?.id) {
                setSelectedTool(tool);
            }
        } else if (!toolSlugMatch && selectedTool) {
            setSelectedTool(null);
        }
    }, [tools, window.location.pathname]);

    // Update URL when tool is selected
    const handleSelectTool = (tool: Tool) => {
        const slug = tool.name.toLowerCase().replace(/\s+/g, '-');
        window.history.pushState({}, '', `/tools/${slug}`);
        setSelectedTool(tool);
    };

    // Clear selection and reset URL
    const handleBackToList = () => {
        window.history.pushState({}, '', '/tools');
        setSelectedTool(null);
    };

    const categories = ['Todas', ...Array.from(new Set(tools.map(t => t.category)))];

    const filteredTools = tools.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || tool.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const featuredTool = tools.length > 0 ? tools.reduce((prev, current) => (prev.rating > current.rating) ? prev : current) : null;
    const listTools = filteredTools.filter(t => t.id !== featuredTool?.id);

    // -- DETAIL VIEW --
    if (selectedTool) {
        const videoId = selectedTool.relatedVideoUrl?.split('embed/')[1] || selectedTool.relatedVideoUrl?.split('v=')[1];
        const safeVideoUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

        return (
            <div className="flex flex-col animate-in fade-in slide-in-from-right-8 duration-300 pb-20">
                {/* Navigation */}
                <button
                    onClick={handleBackToList}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary mb-6 w-fit group"
                >
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined !text-lg">arrow_back</span>
                    </div>
                    Voltar para o diretório
                </button>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header Card */}
                        <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row gap-6 items-start">
                            <img
                                src={selectedTool.logoUrl}
                                alt={selectedTool.name}
                                className="w-24 h-24 rounded-2xl shadow-md bg-white object-contain p-1"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">{selectedTool.name}</h1>
                                    <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-lg">
                                        <span className="material-symbols-outlined text-amber-500 !text-sm fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="font-bold text-amber-700 dark:text-amber-400">{selectedTool.rating}</span>
                                    </div>
                                </div>
                                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{selectedTool.fullDescription || selectedTool.description}</p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase">{selectedTool.category}</span>
                                    {selectedTool.isPremium ?
                                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold uppercase">Pago</span> :
                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold uppercase">Grátis</span>
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Video / Media */}
                        {safeVideoUrl ? (
                            <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-black aspect-video">
                                <iframe
                                    className="w-full h-full"
                                    src={safeVideoUrl}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <div className="rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-12 text-center flex items-center justify-center aspect-video border border-gray-200 dark:border-gray-700">
                                <span className="text-gray-400 font-medium">Sem vídeo demonstrativo</span>
                            </div>
                        )}

                        {/* Features */}
                        {selectedTool.features && selectedTool.features.length > 0 && (
                            <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-3xl p-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">bolt</span>
                                    Principais Funcionalidades
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedTool.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                            <span className="material-symbols-outlined text-green-500 !text-lg">check_circle</span>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* What Is Section */}
                        {selectedTool.whatIs && (
                            <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-3xl p-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500">info</span>
                                    O que é {selectedTool.name}?
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedTool.whatIs}</p>
                            </div>
                        )}

                        {/* How To Use Section */}
                        {selectedTool.howToUse && (
                            <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-3xl p-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-500">play_circle</span>
                                    Como usar {selectedTool.name}?
                                </h2>
                                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                    {selectedTool.howToUse}
                                </div>
                            </div>
                        )}

                        {/* Use Cases Section */}
                        {selectedTool.useCases && selectedTool.useCases.length > 0 && (
                            <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-3xl p-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                                    Casos de Uso
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedTool.useCases.map((useCase, idx) => (
                                        <div key={useCase.id} className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-900/10 dark:to-violet-900/10 border border-blue-100 dark:border-blue-900/30">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="bg-primary-500 text-white rounded-full size-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                {useCase.icon && (
                                                    <span className="material-symbols-outlined text-primary-600 dark:text-primary-400">
                                                        {useCase.icon}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">{useCase.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{useCase.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* FAQ Section */}
                        {selectedTool.faq && selectedTool.faq.length > 0 && (
                            <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-3xl p-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-500">help</span>
                                    Perguntas Frequentes
                                </h2>
                                <div className="space-y-3">
                                    {selectedTool.faq.map((item) => (
                                        <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => setOpenFaqId(openFaqId === item.id ? null : item.id)}
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                            >
                                                <span className="font-bold text-gray-900 dark:text-white">{item.question}</span>
                                                <span className={`material-symbols-outlined text-gray-400 transition-transform ${openFaqId === item.id ? 'rotate-180' : ''}`}>
                                                    expand_more
                                                </span>
                                            </button>
                                            {openFaqId === item.id && (
                                                <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                                                    {item.answer}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews Section - Members Only */}
                        {selectedTool.reviews && selectedTool.reviews.length > 0 && (
                            <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-3xl p-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-pink-500">reviews</span>
                                    Avaliações da Comunidade
                                    {!currentUser && (
                                        <span className="ml-2 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full">
                                            Exclusivo Membros
                                        </span>
                                    )}
                                </h2>

                                {currentUser ? (
                                    <div className="space-y-4">
                                        {selectedTool.reviews.map((review) => (
                                            <div key={review.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                                <div className="flex items-start gap-4">
                                                    <img src={review.userAvatar} alt={review.userName} className="w-12 h-12 rounded-full" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-bold text-gray-900 dark:text-white">{review.userName}</span>
                                                            <div className="flex items-center gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span key={i} className={`material-symbols-outlined !text-sm ${i < review.rating ? 'text-amber-500' : 'text-gray-300'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{review.comment}</p>
                                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                                            <span>{review.createdAt}</span>
                                                            <button className="flex items-center gap-1 hover:text-primary">
                                                                <span className="material-symbols-outlined !text-sm">thumb_up</span>
                                                                <span>Útil ({review.helpful})</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {/* Blurred preview */}
                                        <div className="space-y-4 blur-sm opacity-50 select-none" aria-hidden="true">
                                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                        <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* CTA overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white/90 dark:from-card-dark/90 via-white/50 dark:via-card-dark/50 to-transparent">
                                            <div className="text-center p-6">
                                                <span className="material-symbols-outlined text-4xl text-primary mb-2">lock</span>
                                                <p className="font-bold text-gray-900 dark:text-white mb-2">Avaliações exclusivas para membros</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Entre na comunidade para ver o que os membros estão falando!</p>
                                                <button
                                                    onClick={() => window.location.href = '/login'}
                                                    className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-full transition-colors shadow-lg"
                                                >
                                                    Entrar na Comunidade
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pricing Section */}
                        {selectedTool.pricing && selectedTool.pricing.length > 0 && (
                            <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-3xl p-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500">payments</span>
                                    Preços e Planos
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {selectedTool.pricing.map((plan) => (
                                        <div
                                            key={plan.id}
                                            className={`p-6 rounded-2xl border-2 relative ${plan.isPopular
                                                ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-violet-50 dark:from-primary-900/20 dark:to-violet-900/20'
                                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                                                }`}
                                        >
                                            {plan.isPopular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                    Mais Popular
                                                </div>
                                            )}
                                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{plan.name}</h4>
                                            <div className="mb-4">
                                                <span className="text-3xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                                                {plan.period && <span className="text-gray-500">/{plan.period}</span>}
                                            </div>
                                            <ul className="space-y-2 mb-6">
                                                {plan.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="material-symbols-outlined text-green-500 !text-sm">check</span>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                            <button className={`w-full py-2 rounded-lg font-bold text-sm ${plan.isPopular
                                                ? 'bg-primary-500 text-white hover:bg-primary-600'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                } transition-colors`}>
                                                Escolher Plano
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Related Tools Section */}
                        {selectedTool.relatedToolIds && selectedTool.relatedToolIds.length > 0 && (
                            <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-3xl p-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-500">apps</span>
                                    Ferramentas Relacionadas
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {selectedTool.relatedToolIds.map(toolId => {
                                        const relatedTool = tools.find(t => t.id === toolId);
                                        if (!relatedTool) return null;
                                        return (
                                            <button
                                                key={toolId}
                                                onClick={() => handleSelectTool(relatedTool)}
                                                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 bg-gray-50 dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-left group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <img src={relatedTool.logoUrl} alt={relatedTool.name} className="w-10 h-10 rounded-lg object-contain bg-white" />
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white group-hover:text-primary">{relatedTool.name}</div>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <span className="material-symbols-outlined !text-xs text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                            {relatedTool.rating}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Community Reviews Section */}
                        <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-3xl p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500">reviews</span>
                                    Avaliações da Comunidade
                                </h2>
                                {currentUser && !showReviewForm && (
                                    <button
                                        onClick={() => setShowReviewForm(true)}
                                        className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                                    >
                                        Avaliar Ferramenta
                                    </button>
                                )}
                            </div>

                            {/* Review Form */}
                            {showReviewForm && currentUser && (
                                <div className="mb-6 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                    <h3 className="font-bold mb-4">Sua Avaliação</h3>

                                    {/* Star Rating */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold mb-2">Nota</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                                    className="transition-transform hover:scale-110"
                                                >
                                                    <span
                                                        className={`material-symbols-outlined text-3xl ${star <= newReview.rating
                                                                ? 'text-amber-500 fill'
                                                                : 'text-gray-300 dark:text-gray-600'
                                                            }`}
                                                    >
                                                        star
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold mb-2">Comentário</label>
                                        <textarea
                                            rows={4}
                                            value={newReview.comment}
                                            onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                            placeholder="Compartilhe sua experiência com esta ferramenta..."
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSubmitReview}
                                            disabled={submittingReview || !newReview.comment.trim()}
                                            className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submittingReview ? 'Enviando...' : 'Publicar Avaliação'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowReviewForm(false);
                                                setNewReview({ rating: 5, comment: '' });
                                            }}
                                            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold py-2 px-6 rounded-lg transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Reviews List */}
                            {currentUser ? (
                                reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.map((review: any) => (
                                            <div key={review.id} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                                <div className="flex items-start gap-4">
                                                    <img
                                                        src={review.profiles.avatar_url || `https://ui-avatars.com/api/?name=${review.profiles.name}`}
                                                        alt={review.profiles.name}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div>
                                                                <span className="font-bold text-gray-900 dark:text-white">{review.profiles.name}</span>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className={`material-symbols-outlined !text-sm ${i < review.rating ? 'text-amber-500 fill' : 'text-gray-300'}`}
                                                                        >
                                                                            star
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(review.created_at).toLocaleDateString('pt-BR')}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{review.comment}</p>
                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                onClick={() => handleVoteHelpful(review.id)}
                                                                className={`flex items-center gap-1 text-xs transition-colors ${userVotes.includes(review.id)
                                                                        ? 'text-primary font-bold'
                                                                        : 'text-gray-500 hover:text-primary'
                                                                    }`}
                                                            >
                                                                <span className="material-symbols-outlined !text-sm">thumb_up</span>
                                                                <span>Útil ({review.helpful_count})</span>
                                                            </button>
                                                            {currentUser.id === review.user_id && (
                                                                <button
                                                                    onClick={async () => {
                                                                        await backend.deleteToolReview(review.id, currentUser.id);
                                                                        await loadReviews();
                                                                    }}
                                                                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                                                                >
                                                                    <span className="material-symbols-outlined !text-sm">delete</span>
                                                                    Excluir
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-2 block">rate_review</span>
                                        <p className="text-gray-500">Nenhuma avaliação ainda</p>
                                        <p className="text-sm text-gray-400 mt-1">Seja o primeiro a avaliar!</p>
                                    </div>
                                )
                            ) : (
                                <div className="relative">
                                    {/* Blurred preview */}
                                    <div className="space-y-4 blur-sm opacity-50 select-none" aria-hidden="true">
                                        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                    <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* CTA overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white/90 dark:from-card-dark/90 via-white/50 dark:via-card-dark/50 to-transparent">
                                        <div className="text-center p-6">
                                            <span className="material-symbols-outlined text-4xl text-primary mb-2">lock</span>
                                            <p className="font-bold text-gray-900 dark:text-white mb-2">Avaliações exclusivas para membros</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Entre na comunidade para ver o que os membros estão falando!</p>
                                            <button
                                                onClick={() => window.location.href = '/login'}
                                                className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-full transition-colors shadow-lg"
                                            >
                                                Entrar na Comunidade
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-6">
                        {/* CTA Card */}
                        <div className="bg-gradient-to-br from-primary-500 to-violet-600 rounded-3xl p-6 text-white shadow-lg">
                            <h3 className="text-xl font-bold mb-2">Visitar Site Oficial</h3>
                            <p className="text-sm opacity-90 mb-6">Você será redirecionado para o site da ferramenta.</p>
                            <a
                                href={selectedTool.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center bg-white text-primary-600 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Acessar <span className="material-symbols-outlined !text-lg">open_in_new</span>
                                </span>
                            </a>
                        </div>

                        {/* Community Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 size-40 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined">forum</span>
                                    <h3 className="text-lg font-bold">Comunidade</h3>
                                </div>
                                {currentUser ? (
                                    <div>
                                        <p className="text-sm opacity-90 mb-4">Veja o que os experts estão falando sobre esta ferramenta!</p>
                                        <div className="flex items-center gap-3 mb-3 p-3 bg-white/10 rounded-xl">
                                            <img src="https://ui-avatars.com/api/?name=Carlos+Silva" alt="" className="w-8 h-8 rounded-full" />
                                            <div>
                                                <div className="text-xs font-bold">Carlos S.</div>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className="material-symbols-outlined !text-xs text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs opacity-90">"Essa ferramenta salvou meu projeto. A integração é perfeita."</p>
                                        <p className="text-xs font-bold mt-4">{reviews.length} avaliações da comunidade</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm opacity-90 mb-4">Veja o que os experts estão falando sobre esta ferramenta, prompts recomendados e casos de uso.</p>
                                        <div className="space-y-3 opacity-50 blur-[2px] select-none mb-4" aria-hidden="true">
                                            <div className="bg-white/10 rounded-xl p-3 h-16"></div>
                                            <div className="bg-white/10 rounded-xl p-3 h-16"></div>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-sm mb-2">Conteúdo Exclusivo</p>
                                            <button className="bg-white text-indigo-900 font-bold py-2 px-6 rounded-full text-sm hover:bg-indigo-50 transition-colors shadow-lg">
                                                Entrar na Comunidade
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // -- LIST VIEW --
    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300 pb-20">

            {/* HERO HEADER */}
            <div className="relative rounded-3xl overflow-hidden px-6 py-8 sm:px-12 sm:py-12 text-center">
                <div className="absolute inset-0 bg-gray-900 mesh-background"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h1 className="text-3xl sm:text-5xl font-black text-white mb-3 tracking-tight">
                        As Melhores Ferramentas de IA
                    </h1>
                    <p className="text-base sm:text-lg text-gray-300 mb-6">
                        <span className="gradient-text font-bold">Curadoria da Comunidade</span> • {tools.length} ferramentas
                    </p>
                    <div className="relative max-w-2xl mx-auto mb-4">
                        <input
                            type="text"
                            placeholder="Buscar ferramenta (ex: criar imagens, código...)"
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-2xl text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                        {searchQuery && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-primary-300 text-sm font-bold">
                                {filteredTools.length} resultados
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-primary !text-base">auto_awesome</span>
                    <span><strong className="text-gray-900 dark:text-white">{tools.length}</strong> Ferramentas</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-green-500 !text-base">verified</span>
                    <span><strong className="text-gray-900 dark:text-white">{tools.filter(t => t.rating >= 4.5).length}</strong> Top Avaliadas</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-amber-500 !text-base">workspace_premium</span>
                    <span><strong className="text-gray-900 dark:text-white">{tools.filter(t => !t.isPremium).length}</strong> Grátis</span>
                </div>
            </div>

            {/* CATEGORY FILTERS */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 ${selectedCategory === cat
                            ? 'bg-primary-500 border-primary-500 text-white shadow-glow'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary-300'
                            }`}
                    >
                        {cat}
                        {cat !== 'Todas' && (
                            <span className="ml-2 text-xs opacity-70">
                                ({tools.filter(t => t.category === cat).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* FEATURED TOOL */}
            {!searchQuery && selectedCategory === 'Todas' && featuredTool && (
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
                        <span className="material-symbols-outlined text-amber-500 text-2xl">verified</span>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Destaque da Semana</h2>
                    </div>
                    <ToolCard tool={featuredTool} onClick={handleSelectTool} featured={true} />
                </div>
            )}

            {/* GRID */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {searchQuery || selectedCategory !== 'Todas'
                            ? `Resultados (${filteredTools.length})`
                            : 'Todas as Ferramentas'}
                    </h2>
                    {!loading && filteredTools.length > 0 && (
                        <select
                            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
                            onChange={(e) => {
                                const sorted = [...filteredTools];
                                if (e.target.value === 'rating') sorted.sort((a, b) => b.rating - a.rating);
                                if (e.target.value === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
                                setTools(sorted);
                            }}
                        >
                            <option value="">Ordenar por</option>
                            <option value="rating">⭐ Melhor Avaliação</option>
                            <option value="name">🔤 Nome A-Z</option>
                        </select>
                    )}
                </div>

                {filteredTools.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">search_off</span>
                        <p className="text-gray-500 text-lg font-medium">Nenhuma ferramenta encontrada.</p>
                        <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros ou buscar por outro termo</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {(searchQuery || selectedCategory !== 'Todas' ? filteredTools : listTools).map(tool => (
                            <ToolCard key={tool.id} tool={tool} onClick={handleSelectTool} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolsView;
