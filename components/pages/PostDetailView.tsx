
import React, { useEffect, useState, useRef } from 'react';
import { backend } from '../../services/backend';
import { Post, User, Comment } from '../../types';
import PostCard from '../PostCard';
import Breadcrumb from '../Breadcrumb';
import { useParams, useNavigate } from 'react-router-dom';

interface PostDetailViewProps {
    currentUser: User;
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

// Componente recursivo para renderizar comentários aninhados
interface CommentThreadProps {
    comment: Comment;
    currentUser: User;
    replyingTo: string | null;
    replyText: string;
    submitting: boolean;
    onReply: (commentId: string) => void;
    onSubmitReply: (comment: Comment) => void;
    onCancelReply: () => void;
    onSetReplyText: (text: string) => void;
    onDelete: (commentId: string) => void;
    depth: number;
}

const CommentThread: React.FC<CommentThreadProps> = ({
    comment, currentUser, replyingTo, replyText, submitting,
    onReply, onSubmitReply, onCancelReply, onSetReplyText, onDelete, depth
}) => {
    const isAuthor = currentUser.id === comment.user.id;
    const marginLeft = depth > 0 ? `${depth * 3}rem` : '0';

    return (
        <div style={{ marginLeft }}>
            <div className="bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                <div className="flex gap-3">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 shrink-0"
                        style={{ backgroundImage: `url("${comment.user.avatarUrl}")` }}
                    ></div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-sm text-gray-900 dark:text-white">{comment.user.name}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{comment.createdAt}</span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-3">
                            {comment.content}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onReply(comment.id)}
                                className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined !text-sm">reply</span>
                                Responder
                            </button>
                            {isAuthor && (
                                <button
                                    onClick={() => onDelete(comment.id)}
                                    className="text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined !text-sm">delete</span>
                                    Excluir
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reply Field Inline */}
            {replyingTo === comment.id && (
                <div className="ml-12 mt-3 bg-gray-50 dark:bg-gray-900/50 border-l-2 border-primary pl-4 pr-4 py-3 rounded-r-xl">
                    <div className="flex gap-3">
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 shrink-0"
                            style={{ backgroundImage: `url("${currentUser.avatarUrl}")` }}
                        ></div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                                <span className="material-symbols-outlined !text-xs">reply</span>
                                Respondendo a <strong className="text-gray-900 dark:text-white">{comment.user.name}</strong>
                            </div>
                            <textarea
                                value={replyText}
                                onChange={(e) => onSetReplyText(e.target.value)}
                                placeholder="Escreva sua resposta..."
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm p-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 min-h-[80px]"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={onCancelReply}
                                    className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => onSubmitReply(comment)}
                                    disabled={!replyText.trim() || submitting}
                                    className="bg-primary hover:bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                                >
                                    {submitting ? 'Enviando...' : 'Responder'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Render nested replies recursively */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-4">
                    {comment.replies.map((reply) => (
                        <CommentThread
                            key={reply.id}
                            comment={reply}
                            currentUser={currentUser}
                            replyingTo={replyingTo}
                            replyText={replyText}
                            submitting={submitting}
                            onReply={onReply}
                            onSubmitReply={onSubmitReply}
                            onCancelReply={onCancelReply}
                            onSetReplyText={onSetReplyText}
                            onDelete={onDelete}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


const PostDetailView: React.FC<PostDetailViewProps> = ({ currentUser, onShowToast }) => {
    const { id: postId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const commentInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (postId) {
            loadData(postId);
        }
    }, [postId]);

    const loadData = async (id: string) => {
        setLoading(true);
        try {
            const [p, c] = await Promise.all([
                backend.getPostById(id),
                backend.getComments(id)
            ]);
            setPost(p);
            setComments(c);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => navigate(-1);
    const handleDelete = () => handleBack();
    const handleFocusComment = () => commentInputRef.current?.focus();

    const handleSubmitComment = async () => {
        if (!newComment.trim() || !post) return;
        setSubmitting(true);
        try {
            const createdComment = await backend.createComment(post.id, newComment);
            setComments(prev => [...prev, createdComment]);
            setNewComment('');
            setPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : null);
            if (onShowToast) onShowToast("Comentário enviado!", "success");
        } catch (e: any) {
            console.error(e);
            if (onShowToast) onShowToast("Erro ao comentar.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = (commentId: string) => {
        setReplyingTo(commentId);
        setReplyText('');
    };

    const handleSubmitReply = async (parentComment: Comment) => {
        if (!replyText.trim() || !post) return;
        setSubmitting(true);
        try {
            const replyContent = `@${parentComment.user.name} ${replyText}`;
            const createdComment = await backend.createComment(post.id, replyContent, parentComment.id);

            // Recarregar todos os comentários para atualizar a árvore
            const updatedComments = await backend.getComments(post.id);
            setComments(updatedComments);

            setReplyText('');
            setReplyingTo(null);
            setPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : null);
            if (onShowToast) onShowToast("Resposta enviada!", "success");
        } catch (e: any) {
            console.error(e);
            if (onShowToast) onShowToast("Erro ao responder.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm("Tem certeza que deseja excluir este comentário?")) return;
        try {
            await backend.deleteComment(commentId);

            // Recarregar comentários
            const updatedComments = await backend.getComments(post!.id);
            setComments(updatedComments);

            setPost(prev => prev ? { ...prev, comments: prev.comments - 1 } : null);
            if (onShowToast) onShowToast("Comentário excluído!", "success");
        } catch (e: any) {
            console.error(e);
            if (onShowToast) onShowToast("Erro ao excluir comentário.", "error");
        }
    };


    if (loading) {
        return (
            <div className="w-full max-w-[1440px] mx-auto px-4">
                <div className="flex justify-center">
                    <div className="w-full max-w-[680px] space-y-4 animate-pulse">
                        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">sentiment_dissatisfied</span>
                <p className="text-gray-500">Post não encontrado.</p>
                <button onClick={() => navigate('/home')} className="mt-4 text-primary font-bold hover:underline">Voltar para o Feed</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1440px] mx-auto px-4">
            <div className="flex justify-center">
                <div className="w-full max-w-[680px] flex flex-col gap-4">
                    {/* Breadcrumb + Back */}
                    <div className="flex items-center justify-between">
                        <Breadcrumb
                            items={[
                                { label: 'Feed', icon: 'home', onClick: () => navigate('/home') },
                                { label: post.user.name, icon: 'person' }
                            ]}
                        />
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-symbols-outlined !text-base">arrow_back</span>
                            Voltar
                        </button>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-3">
                            <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">🏷️ Tags</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {post.tags.map((tag, i) => (
                                    <span key={i} className="px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                                        #{tag.value}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Post */}
                    <PostCard
                        post={post}
                        currentUser={currentUser}
                        onDelete={handleDelete}
                        onShowToast={onShowToast}
                        variant="detail"
                        onCommentClick={handleFocusComment}
                    />

                    {/* Discussion Separator */}
                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white dark:bg-gray-900 px-3 text-xs font-bold text-gray-400 uppercase">
                                {comments.length} {comments.length === 1 ? 'Comentário' : 'Comentários'}
                            </span>
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className="flex flex-col gap-6">
                        {comments.length === 0 ? (
                            <div className="text-center py-12 rounded-xl bg-gray-50 dark:bg-gray-900/30 border border-dashed border-gray-300 dark:border-gray-800">
                                <span className="material-symbols-outlined text-gray-300 text-5xl mb-3">forum</span>
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Nenhum comentário ainda. Seja o primeiro!</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <CommentThread
                                    key={comment.id}
                                    comment={comment}
                                    currentUser={currentUser}
                                    replyingTo={replyingTo}
                                    replyText={replyText}
                                    submitting={submitting}
                                    onReply={handleReply}
                                    onSubmitReply={handleSubmitReply}
                                    onCancelReply={() => { setReplyingTo(null); setReplyText(''); }}
                                    onSetReplyText={setReplyText}
                                    onDelete={handleDeleteComment}
                                    depth={0}
                                />
                            ))
                        )}
                    </div>

                    {/* New Comment */}
                    <div className="bg-white dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                        <div className="flex gap-3">
                            <div
                                className="hidden sm:block bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 shrink-0"
                                style={{ backgroundImage: `url("${currentUser.avatarUrl}")` }}
                            ></div>
                            <div className="flex-1">
                                <textarea
                                    ref={commentInputRef}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Escreva um comentário..."
                                    className="w-full bg-transparent border-0 resize-none focus:ring-0 text-sm p-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 min-h-[60px]"
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={handleSubmitComment}
                                        disabled={!newComment.trim() || submitting}
                                        className="bg-primary hover:bg-blue-600 text-white px-5 py-2 rounded-full text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                                    >
                                        {submitting ? 'Enviando...' : 'Comentar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetailView;
