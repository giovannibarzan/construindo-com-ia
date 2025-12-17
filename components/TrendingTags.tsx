
import React from 'react';

interface TrendingTag {
    value: string;
    type: string;
    count: number;
}

interface TrendingTagsProps {
    tags: TrendingTag[];
    onTagClick: (tag: string) => void;
}

const TrendingTags: React.FC<TrendingTagsProps> = ({ tags, onTagClick }) => {
    if (tags.length === 0) return null;

    const getTagIcon = (type: string) => {
        switch (type) {
            case 'tool': return '🔧';
            case 'topic': return '💡';
            case 'level': return '🎯';
            case 'course': return '📚';
            default: return '🏷️';
        }
    };

    return (
        <div className="w-full bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🔥</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trending Hoje</h3>
            </div>

            <div className="space-y-2">
                {tags.slice(0, 5).map((tag, index) => (
                    <button
                        key={tag.value}
                        onClick={() => onTagClick(tag.value)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all group"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-orange-500 dark:text-orange-400">
                                {index + 1}.
                            </span>
                            <span className="text-sm">{getTagIcon(tag.type)}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                {tag.value}
                            </span>
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {tag.count} {tag.count === 1 ? 'post' : 'posts'}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TrendingTags;
