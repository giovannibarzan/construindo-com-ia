
import React from 'react';
import { PostType } from '../types';

interface FeedFiltersProps {
    selectedType: 'all' | PostType | 'questions';
    selectedTag: string | null;
    selectedStatus: 'all' | 'unanswered' | 'resolved';
    onTypeChange: (type: 'all' | PostType | 'questions') => void;
    onTagChange: (tag: string | null) => void;
    onStatusChange: (status: 'all' | 'unanswered' | 'resolved') => void;
    popularTags: Array<{ value: string; count: number }>;
}

const FeedFilters: React.FC<FeedFiltersProps> = ({
    selectedType,
    selectedTag,
    selectedStatus,
    onTypeChange,
    onTagChange,
    onStatusChange,
    popularTags
}) => {
    return (
        <div className="w-full bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-3 mb-4">
            {/* Navigation + Type Filters Combined */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => onTypeChange('all')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedType === 'all'
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    <span className="material-symbols-outlined !text-sm">home</span>
                    Feed
                </button>
                <button
                    onClick={() => onTypeChange('questions')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedType === 'questions'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    <span className="material-symbols-outlined !text-sm">help</span>
                    Dúvidas
                </button>
                <button
                    onClick={() => onTypeChange(PostType.THOUGHT)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedType === PostType.THOUGHT
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    <span className="material-symbols-outlined !text-sm">psychology</span>
                    Posts
                </button>
            </div>

            {/* Clear Filters */}
            {(selectedType !== 'all' || selectedTag || selectedStatus !== 'all') && (
                <button
                    onClick={() => {
                        onTypeChange('all');
                        onTagChange(null);
                        onStatusChange('all');
                    }}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                    ✕ Limpar filtros
                </button>
            )}
        </div>
    );
};

export default FeedFilters;
