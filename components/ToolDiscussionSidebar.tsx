
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { backend } from '../services/backend';

interface ToolDiscussionSidebarProps {
    toolId: string;
    toolName: string;
    currentUser: User | null;
    isOpen: boolean;
    onClose: () => void;
}

interface Discussion {
    id: string;
    tool_id: string;
    user_id: string;
    message: string;
    parent_id: string | null;
    created_at: string;
    profiles: {
        name: string;
        avatar_url: string;
        handle: string;
    };
}

const ToolDiscussionSidebar: React.FC<ToolDiscussionSidebarProps> = ({
    toolId,
    toolName,
    currentUser,
    isOpen,
    onClose
}) => {
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (isOpen && toolId) {
            loadDiscussions();
        }
    }, [isOpen, toolId]);

    const loadDiscussions = async () => {
        setLoading(true);
        try {
            const data = await backend.getToolDiscussions(toolId);
            setDiscussions(data);
        } catch (error) {
            console.error('Error loading discussions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUser) return;

        setSending(true);
        try {
            await backend.sendToolDiscussion(toolId, currentUser.id, newMessage.trim());
            setNewMessage('');
            await loadDiscussions();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (discussionId: string) => {
        if (!currentUser) return;

        try {
            await backend.deleteToolDiscussion(discussionId, currentUser.id);
            await loadDiscussions();
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'agora';
        if (diffMins < 60) return `${diffMins}m atrás`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h atrás`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d atrás`;
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-900 z-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">Discussão</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <p className="text-sm opacity-90">{toolName}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                <p className="text-sm text-gray-500">Carregando...</p>
                            </div>
                        </div>
                    ) : discussions.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-center">
                            <div>
                                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-2 block">forum</span>
                                <p className="text-gray-500 dark:text-gray-400">Nenhuma mensagem ainda</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Seja o primeiro a comentar!</p>
                            </div>
                        </div>
                    ) : (
                        discussions.map((discussion) => (
                            <div key={discussion.id} className="flex gap-3">
                                <img
                                    src={discussion.profiles.avatar_url || `https://ui-avatars.com/api/?name=${discussion.profiles.name}`}
                                    alt={discussion.profiles.name}
                                    className="w-10 h-10 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                                                {discussion.profiles.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatTime(discussion.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                                            {discussion.message}
                                        </p>
                                    </div>
                                    {currentUser && discussion.user_id === currentUser.id && (
                                        <button
                                            onClick={() => handleDelete(discussion.id)}
                                            className="text-xs text-red-500 hover:text-red-600 mt-1 flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined !text-sm">delete</span>
                                            Excluir
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input */}
                {currentUser ? (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex gap-2">
                            <img
                                src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.name}`}
                                alt={currentUser.name}
                                className="w-10 h-10 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1 flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Digite sua mensagem..."
                                    className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                    disabled={sending}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-full font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    {sending ? (
                                        <span className="material-symbols-outlined animate-spin">refresh</span>
                                    ) : (
                                        <span className="material-symbols-outlined">send</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-amber-50 dark:bg-amber-900/20 text-center">
                        <p className="text-sm text-amber-800 dark:text-amber-400 mb-2">
                            Faça login para participar da discussão
                        </p>
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full text-sm transition-colors"
                        >
                            Entrar
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default ToolDiscussionSidebar;
