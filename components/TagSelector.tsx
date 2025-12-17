
import React, { useState } from 'react';
import { PostTag } from '../types';

interface TagSelectorProps {
    selectedTags: PostTag[];
    onTagsChange: (tags: PostTag[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, onTagsChange }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    // Predefined popular tags
    const popularTags = {
        tools: ['ChatGPT', 'Lovable', 'Bolt', 'v0', 'Cursor', 'Midjourney', 'Claude', 'Gemini', 'Copilot', 'Perplexity', 'Windsurf', 'Replit'],
        topics: ['Prompts', 'API', 'Automação', 'Design', 'Código', 'Imagens', 'No-Code', 'Full-Stack', 'Frontend', 'Backend'],
        levels: ['Iniciante', 'Intermediário', 'Avançado']
    };

    const addTag = (type: 'tool' | 'course' | 'topic' | 'level', value: string) => {
        // Check if tag already exists
        if (selectedTags.some(t => t.type === type && t.value === value)) {
            return;
        }

        // Max 5 tags
        if (selectedTags.length >= 5) {
            return;
        }

        onTagsChange([...selectedTags, { type, value }]);
        setShowDropdown(false);
    };

    const removeTag = (index: number) => {
        onTagsChange(selectedTags.filter((_, i) => i !== index));
    };

    return (
        <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
                {selectedTags.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                        {tag.type === 'tool' && '🔧'}
                        {tag.type === 'course' && '📚'}
                        {tag.type === 'topic' && '💡'}
                        {tag.type === 'level' && '🎯'}
                        {tag.value}
                        <button
                            onClick={() => removeTag(index)}
                            className="ml-1 hover:text-red-500 transition-colors"
                        >
                            <span className="material-symbols-outlined !text-sm">close</span>
                        </button>
                    </span>
                ))}

                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    disabled={selectedTags.length >= 5}
                >
                    <span className="material-symbols-outlined !text-sm">add</span>
                    Adicionar tag
                </button>
            </div>

            {showDropdown && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-10 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-3">
                        {/* Tools */}
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                <span>🔧</span> Ferramentas
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {popularTags.tools.map(tool => (
                                    <button
                                        key={tool}
                                        onClick={() => addTag('tool', tool)}
                                        className="px-2 py-1 text-xs rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        {tool}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Topics */}
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                <span>💡</span> Tópicos
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {popularTags.topics.map(topic => (
                                    <button
                                        key={topic}
                                        onClick={() => addTag('topic', topic)}
                                        className="px-2 py-1 text-xs rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                    >
                                        {topic}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Levels */}
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                <span>🎯</span> Nível
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {popularTags.levels.map(level => (
                                    <button
                                        key={level}
                                        onClick={() => addTag('level', level)}
                                        className="px-2 py-1 text-xs rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowDropdown(false)}
                        className="mt-3 w-full text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            )}
        </div>
    );
};

export default TagSelector;
