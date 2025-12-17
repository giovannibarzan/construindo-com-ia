

import React, { useState, useRef } from 'react';
import { User, PostType, PostTag } from '../types';
import { backend } from '../services/backend';
import TagSelector from './TagSelector';

interface CreatePostProps {
    currentUser: User;
    onPost: (text: string, type: PostType, imageUrl?: string, tags?: PostTag[]) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPost }) => {
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [postType, setPostType] = useState<PostType>(PostType.THOUGHT);
    const [tags, setTags] = useState<PostTag[]>([]);

    // Image Upload State
    const [imageUrl, setImageUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        if (text.trim() || imageUrl) {
            onPost(text, postType, imageUrl, tags);
            setText('');
            setImageUrl('');
            setTags([]);
            setPostType(PostType.THOUGHT);
            setIsFocused(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert("Por favor, selecione uma imagem válida (JPG, PNG, GIF ou WebP)");
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Validar tamanho (10MB antes da compressão)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert("A imagem deve ter no máximo 10MB");
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploading(true);
        setImageUrl(''); // Limpar preview anterior

        try {
            const url = await backend.uploadImage(file, 'posts');
            setImageUrl(url);
            console.log('Upload bem-sucedido:', url);
        } catch (err: any) {
            console.error('Erro no upload:', err);
            const errorMessage = err?.message || 'Erro desconhecido ao enviar imagem';
            alert(`Erro ao enviar imagem: ${errorMessage}`);
            setImageUrl('');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900/50 transition-shadow duration-200 ${isFocused ? 'ring-2 ring-primary/20 border-primary' : ''}`}>
            <div className="flex items-start gap-3">
                <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0"
                    style={{ backgroundImage: `url("${currentUser.avatarUrl}")` }}
                ></div>
                <div className="flex-1 flex flex-col gap-2">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(text.length > 0 || !!imageUrl)}
                        className="w-full resize-none bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-0 focus:ring-0 dark:text-white dark:placeholder:text-gray-400 border-0"
                        placeholder={postType === PostType.QUESTION ? "Qual sua dúvida?" : "O que você está construindo?"}
                        rows={isFocused || text.length > 0 ? 3 : 1}
                    />

                    {/* Image Preview Area inside text box flow */}
                    {(uploading || imageUrl) && (
                        <div className="relative mt-2 w-fit">
                            {uploading ? (
                                <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center animate-pulse">
                                    <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <>
                                    <img src={imageUrl} alt="Preview" className="h-32 w-auto rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                                    <button
                                        onClick={() => setImageUrl('')}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined !text-sm block">close</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Tag Selector */}
            {(isFocused || tags.length > 0) && (
                <div className="pl-0 sm:pl-14 -mt-2">
                    <TagSelector selectedTags={tags} onTagsChange={setTags} />
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pl-0 sm:pl-14 gap-3">
                <div className="flex items-center gap-2">
                    {/* Type Selector */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setPostType(PostType.THOUGHT)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${postType === PostType.THOUGHT ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                        >
                            <span className="material-symbols-outlined !text-sm">psychology</span>
                            Post
                        </button>
                        <button
                            onClick={() => setPostType(PostType.QUESTION)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${postType === PostType.QUESTION ? 'bg-white dark:bg-gray-700 text-amber-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                        >
                            <span className="material-symbols-outlined !text-sm">help</span>
                            Dúvida
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex items-center justify-center rounded-full p-2 transition-colors ${imageUrl ? 'text-green-500 bg-green-50' : 'text-primary hover:bg-primary/10'}`}
                        title="Add Image"
                        disabled={uploading}
                    >
                        <span className="material-symbols-outlined">image</span>
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={(!text.trim() && !imageUrl) || uploading}
                        className="cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-400"
                    >
                        Postar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
