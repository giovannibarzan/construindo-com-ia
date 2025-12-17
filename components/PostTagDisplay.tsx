
import React from 'react';
import { PostTag } from '../types';

interface PostTagDisplayProps {
    tag: PostTag;
    onClick?: () => void;
}

const PostTagDisplay: React.FC<PostTagDisplayProps> = ({ tag, onClick }) => {
    const getTagStyle = (type: string) => {
        switch (type) {
            case 'tool':
                return {
                    bg: 'bg-blue-100 dark:bg-blue-900/30',
                    text: 'text-blue-700 dark:text-blue-300',
                    icon: '🔧'
                };
            case 'course':
                return {
                    bg: 'bg-purple-100 dark:bg-purple-900/30',
                    text: 'text-purple-700 dark:text-purple-300',
                    icon: '📚'
                };
            case 'topic':
                return {
                    bg: 'bg-green-100 dark:bg-green-900/30',
                    text: 'text-green-700 dark:text-green-300',
                    icon: '💡'
                };
            case 'level':
                return {
                    bg: 'bg-amber-100 dark:bg-amber-900/30',
                    text: 'text-amber-700 dark:text-amber-300',
                    icon: '🎯'
                };
            default:
                return {
                    bg: 'bg-gray-100 dark:bg-gray-800',
                    text: 'text-gray-700 dark:text-gray-300',
                    icon: '🏷️'
                };
        }
    };

    const style = getTagStyle(tag.type);

    return (
        <span
            onClick={onClick}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        >
            <span>{tag.icon || style.icon}</span>
            #{tag.value}
        </span>
    );
};

export default PostTagDisplay;
