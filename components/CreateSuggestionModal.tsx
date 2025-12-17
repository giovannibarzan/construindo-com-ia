
import React, { useState } from 'react';
import { SuggestionCategory } from '../types';

interface CreateSuggestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; category: SuggestionCategory }) => void;
}

const CreateSuggestionModal: React.FC<CreateSuggestionModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<SuggestionCategory>('feature');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        { value: 'course' as SuggestionCategory, label: 'Curso', icon: '📚', description: 'Sugerir um novo curso' },
        { value: 'feature' as SuggestionCategory, label: 'Funcionalidade', icon: '✨', description: 'Melhorias na plataforma' },
        { value: 'content' as SuggestionCategory, label: 'Conteúdo', icon: '📝', description: 'Artigos, tutoriais, etc' },
        { value: 'tool' as SuggestionCategory, label: 'Ferramenta', icon: '🔧', description: 'Adicionar nova ferramenta' },
        { value: 'other' as SuggestionCategory, label: 'Outro', icon: '💡', description: 'Outras sugestões' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit({ title: title.trim(), description: description.trim(), category });
            // Reset form
            setTitle('');
            setDescription('');
            setCategory('feature');
            onClose();
        } catch (error) {
            console.error('Error submitting suggestion:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nova Sugestão</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Compartilhe suas ideias para melhorar a comunidade
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                            Categoria
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setCategory(cat.value)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${category === cat.value
                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <span className="text-3xl">{cat.icon}</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {cat.label}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                        {cat.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Título da Sugestão
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Curso de Next.js 14 com App Router"
                            maxLength={100}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {title.length}/100 caracteres
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Descrição Detalhada
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva sua sugestão em detalhes. Por que seria útil? Como funcionaria?"
                            rows={6}
                            maxLength={1000}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {description.length}/1000 caracteres
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 rounded-xl text-white bg-primary hover:opacity-90 font-bold shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || !title.trim() || !description.trim()}
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Sugestão'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSuggestionModal;
