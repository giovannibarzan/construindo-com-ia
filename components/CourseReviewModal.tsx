
import React, { useState } from 'react';

interface CourseReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseTitle: string;
    onSubmit: (rating: number, comment: string) => Promise<void>;
}

const CourseReviewModal: React.FC<CourseReviewModalProps> = ({
    isOpen,
    onClose,
    courseId,
    courseTitle,
    onSubmit
}) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(rating, comment);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setRating(5);
                setComment('');
            }, 2000);
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="p-6">
                        {success ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">check_circle</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">Avaliação Enviada!</h3>
                                <p className="text-gray-600 dark:text-gray-400">Obrigado pelo seu feedback.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Avaliar Curso</h2>
                                        <p className="text-sm text-gray-500 mt-1">{courseTitle}</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Star Rating */}
                                    <div>
                                        <label className="block text-sm font-bold mb-3">Sua Avaliação</label>
                                        <div className="flex gap-2 justify-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    onMouseEnter={() => setHoveredRating(star)}
                                                    onMouseLeave={() => setHoveredRating(0)}
                                                    className="transition-transform hover:scale-110"
                                                >
                                                    <span
                                                        className={`material-symbols-outlined text-4xl ${star <= (hoveredRating || rating)
                                                                ? 'text-amber-500 fill'
                                                                : 'text-gray-300 dark:text-gray-600'
                                                            }`}
                                                    >
                                                        star
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-center text-sm text-gray-500 mt-2">
                                            {rating === 1 && 'Muito Ruim'}
                                            {rating === 2 && 'Ruim'}
                                            {rating === 3 && 'Regular'}
                                            {rating === 4 && 'Bom'}
                                            {rating === 5 && 'Excelente'}
                                        </p>
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <label className="block text-sm font-bold mb-2">
                                            Comentário (Opcional)
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                            placeholder="Compartilhe sua experiência com este curso..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Enviando...' : 'Enviar Avaliação'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CourseReviewModal;
