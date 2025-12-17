
import React from 'react';

interface FeedSidebarProps {
    popularTags: Array<{ value: string; count: number }>;
    onTagClick: (tag: string) => void;
    onNavigate: (view: string) => void;
}

const FeedSidebar: React.FC<FeedSidebarProps> = ({ popularTags, onTagClick, onNavigate }) => {
    return (
        <div className="w-full space-y-3 sticky top-4">
            {/* Navigation */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-3">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">Navegação</h3>
                <div className="space-y-0.5">
                    <button
                        onClick={() => onNavigate('feed')}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined !text-base">home</span>
                        Feed
                    </button>
                    <button
                        onClick={() => onNavigate('questions')}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined !text-base">help</span>
                        Dúvidas
                    </button>
                    <button
                        onClick={() => onNavigate('trending')}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined !text-base">local_fire_department</span>
                        Trending
                    </button>
                </div>
            </div>

            {/* Popular Tags */}
            {popularTags.length > 0 && (
                <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-3">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">🏷️ Tags</h3>
                    <div className="space-y-0.5">
                        {popularTags.slice(0, 8).map((tag) => (
                            <button
                                key={tag.value}
                                onClick={() => onTagClick(tag.value)}
                                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                            >
                                <span className="truncate">{tag.value}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                                    {tag.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedSidebar;
