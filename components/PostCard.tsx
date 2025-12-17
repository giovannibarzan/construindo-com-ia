

import React, { useState } from 'react';
import { Post, PostType, User } from '../types';
import { backend } from '../services/backend';
import PostTagDisplay from './PostTagDisplay';

interface PostCardProps {
    post: Post;
    currentUser?: User | null;
    onDelete?: (postId: string) => void;
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
    variant?: 'feed' | 'detail';
    onClick?: () => void;
    onCommentClick?: () => void; // Novo callback para focar no input externo
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onDelete, onShowToast, variant = 'feed', onClick, onCommentClick }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes);
    // Removemos states de comentário internos

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = currentUser && (currentUser.id === post.user.id || currentUser.isAdmin);
    const isFeedMode = variant === 'feed';

    const getTagStyle = (type: PostType) => {
        switch (type) {
            case PostType.QUESTION:
                return {
                    bg: 'bg-amber-100 dark:bg-amber-900/50',
                    text: 'text-amber-700 dark:text-amber-300',
                    icon: 'help',
                    iconColor: 'text-amber-600 dark:text-amber-300',
                    label: 'Dúvida'
                };
            case PostType.THOUGHT:
            default:
                return {
                    bg: 'bg-blue-100 dark:bg-blue-900/50',
                    text: 'text-blue-700 dark:text-blue-300',
                    icon: 'psychology',
                    iconColor: 'text-blue-600 dark:text-blue-300',
                    label: 'Post'
                };
        }
    };

    const tagStyle = getTagStyle(post.type);

    const handleLike = async (e: React.MouseEvent) => {
        if (isFeedMode) {
            if (onClick) onClick();
            return;
        }
        e.stopPropagation();

        const newStatus = !isLiked;
        setIsLiked(newStatus);
        const newCount = newStatus ? likesCount + 1 : likesCount - 1;
        setLikesCount(newCount);

        try {
            await backend.toggleLike(post.id, newCount);
        } catch (e: any) {
            console.error("Erro ao curtir:", e);
            setIsLiked(!newStatus);
            setLikesCount(likesCount);
            if (onShowToast) onShowToast("Erro ao curtir: " + e.message, "error");
        }
    };

    const handleCommentButton = (e: React.MouseEvent) => {
        if (isFeedMode) {
            if (onClick) onClick();
            return;
        }
        e.stopPropagation();
        // Em modo detalhe, avisa o pai para focar no input
        if (onCommentClick) onCommentClick();
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const shareData = {
            title: `Post de ${post.user.name}`,
            text: post.content,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
                if (onShowToast) {
                    onShowToast("Link copiado para a área de transferência!", "info");
                } else {
                    alert("Link copiado!");
                }
            }
        } catch (e) {
            console.error("Erro ao compartilhar", e);
        }
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await backend.deletePost(post.id);
            if (onShowToast) onShowToast("Publicação excluída com sucesso!", "success");
            if (onDelete) onDelete(post.id);
        } catch (e: any) {
            if (onShowToast) {
                onShowToast("Erro ao excluir: " + e.message, "error");
            } else {
                alert("Erro ao excluir: " + e.message);
            }
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <>
            <div
                onClick={isFeedMode ? onClick : undefined}
                className={`flex w-full flex-col rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/50 transition-all duration-200 hover:shadow-sm group/card relative ${isFeedMode ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30' : ''}`}
            >
                <div className="flex w-full flex-row items-start justify-start gap-3 p-4">
                    <div className="aspect-square w-10 shrink-0 rounded-full border border-gray-100 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                            src={post.user.avatarUrl}
                            alt={post.user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                console.error('Erro ao carregar avatar:', post.user.avatarUrl);
                                e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.user.name) + '&background=0D8ABC&color=fff';
                            }}
                        />
                    </div>

                    <div className="flex h-full flex-1 flex-col items-start justify-start">
                        <div className="flex w-full flex-row items-center gap-x-2">
                            <p className="text-sm font-bold text-gray-900 dark:text-white hover:underline">
                                {post.user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {post.createdAt}
                            </p>

                            <div className="ml-auto flex items-center gap-2">
                                <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 ${tagStyle.bg}`}>
                                    <span
                                        className={`material-symbols-outlined !text-sm ${tagStyle.iconColor}`}
                                        style={{ fontVariationSettings: "'wght' 300, 'opsz' 20" }}
                                    >
                                        {tagStyle.icon}
                                    </span>
                                    <p className={`text-xs font-medium ${tagStyle.text}`}>
                                        {tagStyle.label}
                                    </p>
                                </div>

                                {isOwner && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
                                        className="opacity-0 group-hover/card:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                        title="Excluir Post"
                                    >
                                        <span className="material-symbols-outlined !text-base block">delete</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {post.tags.map((tag, index) => (
                                    <PostTagDisplay key={index} tag={tag} />
                                ))}
                            </div>
                        )}

                        <p className="text-sm font-normal text-gray-800 dark:text-gray-300 mt-1 whitespace-pre-wrap leading-relaxed">
                            {post.content}
                        </p>


                        {post.imageUrl && (
                            <div
                                className="mt-3 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer group relative max-h-[400px]"
                                onClick={isFeedMode ? handleCommentButton : () => window.open(post.imageUrl, '_blank')}
                            >
                                <img
                                    src={post.imageUrl}
                                    alt="Post attachment"
                                    className="w-full h-auto max-h-[400px] object-cover transition-transform group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-3 rounded-full">
                                        {isFeedMode ? 'visibility' : 'open_in_full'}
                                    </span>
                                </div>
                            </div>
                        )}


                        {post.codeSnippet && (
                            <div className="mt-3 w-full overflow-hidden rounded-lg bg-gray-100 p-3 font-mono text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                <pre className="overflow-x-auto">
                                    <code>{post.codeSnippet}</code>
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-2 px-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLike}
                            className={`group flex items-center gap-1 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                        >
                            <span className={`material-symbols-outlined !text-xl group-hover:scale-110 transition-transform ${isLiked ? 'fill' : ''}`} style={isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
                            {likesCount > 0 && <span className="text-xs font-medium">{likesCount}</span>}
                        </button>

                        <button
                            onClick={handleCommentButton}
                            className="group flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        >
                            <span className="material-symbols-outlined !text-xl group-hover:scale-110 transition-transform">chat_bubble</span>
                            {post.comments > 0 && <span className="text-xs font-medium">{post.comments}</span>}
                        </button>

                        <button
                            onClick={handleShare}
                            className="group flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        >
                            <span className="material-symbols-outlined !text-xl group-hover:scale-110 transition-transform">share</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                                <span className="material-symbols-outlined text-3xl text-red-600">delete</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Excluir publicação?</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                                Você tem certeza que deseja apagar este post? Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 font-bold transition-colors text-sm"
                                    disabled={isDeleting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold shadow-lg shadow-red-500/30 transition-transform active:scale-95 text-sm"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PostCard;
