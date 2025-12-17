

import { supabase } from '../lib/supabase';
import { Post, Notification, CourseCategory, Course, CourseModule, Tool, Giveaway, User, UserPlan, LiveEvent, AdminStats, CourseLesson, AppConfig, PostType, Comment, Project, Suggestion, SuggestionComment } from '../types';

const ADMIN_EMAIL = 'giovannibarzanlovableia@gmail.com';

// --- IMAGE COMPRESSION UTILITY ---
const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file); // Fallback: retorna arquivo original
                    return;
                }

                // Redimensionar mantendo aspect ratio
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1920;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = (height * MAX_WIDTH) / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width = (width * MAX_HEIGHT) / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Converter para Blob com compressão
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve(file); // Fallback
                            return;
                        }

                        // Criar novo File a partir do Blob comprimido
                        const compressedFile = new File(
                            [blob],
                            file.name.replace(/\.[^/.]+$/, '.webp'), // Converter para WebP
                            { type: 'image/webp' }
                        );

                        // Se compressão reduziu o tamanho, usar arquivo comprimido
                        // Caso contrário, usar original
                        resolve(compressedFile.size < file.size ? compressedFile : file);
                    },
                    'image/webp', // Formato WebP (melhor compressão)
                    0.8 // Qualidade 80% (bom balanço entre qualidade e tamanho)
                );
            };
            img.onerror = () => resolve(file); // Fallback em caso de erro
        };
        reader.onerror = () => resolve(file); // Fallback em caso de erro
    });
};

const mapProfileToUser = (profile: any, authEmail?: string): User => {
    if (!profile) {
        return {
            id: 'unknown',
            name: 'Usuário Desconhecido',
            email: authEmail || '',
            avatarUrl: 'https://via.placeholder.com/150',
            plan: UserPlan.FREE,
            isPublicProfile: false
        };
    }
    const email = profile.email || authEmail;
    const isTheAdmin = email === ADMIN_EMAIL;

    return {
        id: profile.id,
        name: profile.name || email?.split('@')[0] || 'User',
        email: email,
        avatarUrl: profile.avatar_url || 'https://via.placeholder.com/150',
        handle: profile.handle,
        bio: profile.bio,
        plan: profile.plan === 'PREMIUM' ? UserPlan.PREMIUM : UserPlan.FREE,
        coverUrl: profile.cover_url,
        followers: profile.followers_count,
        following: profile.following_count,
        isPublicProfile: profile.is_public_profile,
        isAdmin: isTheAdmin
    };
};

const _createNotification = async (targetUserId: string, type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SYSTEM', message: string, link?: string) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        if (targetUserId === user.id && type !== 'SYSTEM') return;
        await supabase.from('notifications').insert({
            user_id: targetUserId,
            actor_id: type === 'SYSTEM' ? null : user.id,
            type: type,
            message: message,
            link: link,
            is_read: false
        });
    } catch (e) { console.error(e); }
};

export const backend = {
    // --- FILE UPLOAD WITH COMPRESSION ---
    uploadImage: async (file: File, folder: string = 'general'): Promise<string> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Você precisa estar logado para fazer upload de imagens");

            console.log('Iniciando upload:', file.name, file.size, 'bytes');

            // Comprimir imagem antes do upload
            const compressedFile = await compressImage(file);
            console.log('Imagem comprimida:', compressedFile.name, compressedFile.size, 'bytes');

            // Validar tamanho após compressão (5MB)
            if (compressedFile.size > 5 * 1024 * 1024) {
                throw new Error("Mesmo após compressão, a imagem ainda está muito grande. Tente uma imagem menor.");
            }

            const fileExt = compressedFile.name.split('.').pop();
            const fileName = `${user.id}/${folder}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

            console.log('Fazendo upload para:', fileName);

            // Upload para o bucket 'app-uploads'
            const { error: uploadError } = await supabase.storage
                .from('app-uploads')
                .upload(fileName, compressedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Erro no upload:', uploadError);
                if (uploadError.message.includes("Bucket not found")) {
                    throw new Error("Configuração incorreta: Bucket 'app-uploads' não encontrado. Entre em contato com o suporte.");
                }
                if (uploadError.message.includes("not allowed")) {
                    throw new Error("Você não tem permissão para fazer upload. Verifique se está logado.");
                }
                throw new Error(uploadError.message);
            }

            // Obter URL pública
            const { data } = supabase.storage
                .from('app-uploads')
                .getPublicUrl(fileName);

            console.log('Upload concluído:', data.publicUrl);
            return data.publicUrl;
        } catch (error: any) {
            console.error('Erro completo no upload:', error);
            throw error;
        }
    },

    deleteImage: async (imageUrl: string): Promise<void> => {
        try {
            if (!imageUrl) return;

            // Extrair o path do arquivo da URL
            // URL format: https://[project].supabase.co/storage/v1/object/public/app-uploads/[path]
            const urlParts = imageUrl.split('/app-uploads/');
            if (urlParts.length < 2) {
                console.warn('URL inválida para deletar:', imageUrl);
                return;
            }

            const filePath = urlParts[1];
            console.log('Deletando imagem:', filePath);

            const { error } = await supabase.storage
                .from('app-uploads')
                .remove([filePath]);

            if (error) {
                console.error('Erro ao deletar imagem:', error);
                // Não lançar erro para não bloquear a remoção no frontend
            } else {
                console.log('Imagem deletada com sucesso:', filePath);
            }
        } catch (error) {
            console.error('Erro ao deletar imagem:', error);
            // Não lançar erro para não bloquear a remoção no frontend
        }
    },

    // --- AUTH & USER ---
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            const isHardcodedAdmin = user.email === ADMIN_EMAIL;
            if (isHardcodedAdmin) {
                return {
                    id: user.id, name: 'Super Admin', email: user.email,
                    avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
                    handle: '@admin', plan: UserPlan.PREMIUM, isPublicProfile: false, isAdmin: true
                };
            }
            const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (profile && !error) return mapProfileToUser(profile, user.email);
            return {
                id: user.id, name: user.user_metadata.full_name || user.email?.split('@')[0] || 'Novo Usuário',
                email: user.email, avatarUrl: user.user_metadata.avatar_url || 'https://via.placeholder.com/150',
                handle: user.user_metadata.handle || '@user', plan: UserPlan.FREE, isPublicProfile: true, isAdmin: false
            };
        } catch (error) { return null; }
    },

    updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
        console.log('updateProfile chamado com:', { userId, updates });

        const dbUpdates = {
            name: updates.name,
            handle: updates.handle,
            bio: updates.bio,
            avatar_url: updates.avatarUrl,
            cover_url: updates.coverUrl
        };

        console.log('Atualizando banco com:', dbUpdates);

        const { data, error } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar perfil no banco:', error);
            throw new Error(error.message);
        }

        console.log('Perfil atualizado no banco:', data);

        // Get email from auth context since profiles might not have it sync'd perfectly in all setups
        const { data: { user } } = await supabase.auth.getUser();
        const mappedUser = mapProfileToUser(data, user?.email);

        console.log('Usuário mapeado:', mappedUser);

        return mappedUser;
    },

    getUserByHandle: async (handle: string): Promise<User | null> => {
        try {
            // Limpar handle (remover @ se tiver)
            const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;

            console.log('Buscando usuário por handle:', cleanHandle);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('handle', cleanHandle)
                .single();

            if (error || !data) {
                console.error('Usuário não encontrado:', error);
                return null;
            }

            // Verificar se o perfil é público
            if (!data.is_public_profile) {
                // Retornar dados mínimos para perfil privado
                return {
                    id: data.id,
                    name: 'Perfil Privado',
                    handle: data.handle,
                    email: '',
                    avatarUrl: 'https://ui-avatars.com/api/?name=Private&background=gray&color=fff',
                    plan: UserPlan.FREE,
                    isPublicProfile: false,
                    isAdmin: false
                };
            }

            // Retornar perfil completo se for público
            return mapProfileToUser(data, data.email || '');
        } catch (error: any) {
            console.error('Erro ao buscar usuário:', error);
            return null;
        }
    },

    signIn: async (email: string, password: string) => await supabase.auth.signInWithPassword({ email, password }),
    signUp: async (email: string, password: string, options: any) => await supabase.auth.signUp({ email, password, options }),
    signOut: async () => await supabase.auth.signOut(),
    resetPassword: async (email: string) => await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }),
    updateUserPrivacy: async (isPublic: boolean) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from('profiles').update({ is_public_profile: isPublic }).eq('id', user.id);
    },
    deleteMyAccount: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error: rpcError } = await supabase.rpc('delete_own_account');
        if (rpcError) await supabase.from('profiles').delete().eq('id', user.id);
        await supabase.auth.signOut();
    },

    // --- POSTS ---
    getPosts: async (): Promise<Post[]> => {
        const { data } = await supabase.from('posts').select('*, user:profiles(*)').order('created_at', { ascending: false });
        if (!data) return [];

        // Fetch all tags for all posts in one query
        const postIds = data.map((p: any) => p.id);
        const { data: tagsData } = await supabase
            .from('post_tags')
            .select('*')
            .in('post_id', postIds);

        // Group tags by post_id
        const tagsByPost = new Map<string, any[]>();
        if (tagsData) {
            tagsData.forEach((tag: any) => {
                if (!tagsByPost.has(tag.post_id)) {
                    tagsByPost.set(tag.post_id, []);
                }
                tagsByPost.get(tag.post_id)!.push({
                    type: tag.tag_type,
                    value: tag.tag_value
                });
            });
        }

        return data.map((p: any) => ({
            id: p.id,
            user: p.user ? mapProfileToUser(p.user) : { id: 'unknown', name: 'Unknown', avatarUrl: '' },
            content: p.content,
            createdAt: new Date(p.created_at).toLocaleDateString(),
            type: p.type,
            likes: p.likes_count,
            comments: p.comments_count,
            imageUrl: p.image_url,
            codeSnippet: p.code_snippet,
            tags: tagsByPost.get(p.id) || [],
            isResolved: p.is_resolved || false,
            acceptedAnswerId: p.accepted_answer_id
        }));
    },

    getPopularTags: async (): Promise<Array<{ value: string; type: string; count: number }>> => {
        // Calcular data de 24 horas atrás
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        const isoDate = twentyFourHoursAgo.toISOString();

        // Buscar tags de posts das últimas 24 horas
        const { data } = await supabase
            .from('post_tags')
            .select('tag_value, tag_type, posts!inner(created_at)')
            .gte('posts.created_at', isoDate);

        if (!data) return [];

        // Count occurrences
        const tagCounts = new Map<string, { type: string; count: number }>();
        data.forEach((tag: any) => {
            const key = tag.tag_value;
            if (tagCounts.has(key)) {
                tagCounts.get(key)!.count++;
            } else {
                tagCounts.set(key, { type: tag.tag_type, count: 1 });
            }
        });

        // Convert to array and sort by count
        return Array.from(tagCounts.entries())
            .map(([value, { type, count }]) => ({ value, type, count }))
            .sort((a, b) => b.count - a.count);
    },

    getPostById: async (postId: string): Promise<Post | null> => {
        let { data, error } = await supabase.from('posts').select('*, user:profiles(*)').eq('id', postId).single();
        if (error && error.code === 'PGRST200') {
            const { data: rawPost, error: rawError } = await supabase.from('posts').select('*').eq('id', postId).single();
            if (rawError || !rawPost) return null;
            const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', rawPost.user_id).single();
            data = { ...rawPost, user: userProfile };
            error = null;
        }
        if (!data) return null;

        // Buscar tags do post
        const { data: tagsData } = await supabase
            .from('post_tags')
            .select('*')
            .eq('post_id', postId);

        const tags = tagsData ? tagsData.map((tag: any) => ({
            type: tag.tag_type,
            value: tag.tag_value
        })) : [];

        return {
            id: data.id,
            user: data.user ? mapProfileToUser(data.user) : { id: 'unknown', name: 'Unknown', avatarUrl: '' },
            content: data.content,
            createdAt: new Date(data.created_at).toLocaleDateString(),
            type: data.type,
            likes: data.likes_count,
            comments: data.comments_count,
            imageUrl: data.image_url,
            codeSnippet: data.code_snippet,
            tags: tags,
            isResolved: data.is_resolved || false,
            acceptedAnswerId: data.accepted_answer_id
        };
    },
    createPost: async (postData: Partial<Post>): Promise<Post> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase.from('posts').insert({
            user_id: user.id,
            content: postData.content,
            type: postData.type,
            image_url: postData.imageUrl,
            code_snippet: postData.codeSnippet,
            likes_count: 0,
            comments_count: 0
        }).select('*, user:profiles(*)').single();

        if (error) throw new Error(error.message);

        // Save tags if provided
        if (postData.tags && postData.tags.length > 0) {
            const tagInserts = postData.tags.map(tag => ({
                post_id: data.id,
                tag_type: tag.type,
                tag_value: tag.value
            }));

            const { error: tagError } = await supabase
                .from('post_tags')
                .insert(tagInserts);

            if (tagError) console.error('Error saving tags:', tagError);
        }

        return {
            id: data.id,
            user: mapProfileToUser(data.user),
            content: data.content,
            createdAt: 'Agora',
            type: data.type,
            likes: 0,
            comments: 0,
            imageUrl: data.image_url,
            codeSnippet: data.code_snippet,
            tags: postData.tags || []
        };
    },
    deletePost: async (postId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        const isAdmin = user?.email === ADMIN_EMAIL;
        const { error, count } = await supabase.from('posts').delete({ count: 'exact' }).eq('id', postId);
        if (error) { if (error.code === '23503') throw new Error("Não é possível excluir: existem comentários associados."); throw new Error(error.message); }
        if (count === 0) {
            if (isAdmin) { const { error: rpcError } = await supabase.rpc('delete_any_post', { post_id: postId }); if (!rpcError) return; }
            const { count: existsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('id', postId);
            if (existsCount !== null && existsCount > 0) throw new Error("Permissão negada (RLS).");
        }
    },
    toggleLike: async (postId: string, currentLikes: number) => {
        const { data, error } = await supabase.from('posts').update({ likes_count: currentLikes }).eq('id', postId).select().single();
        if (error) throw new Error(error.message);
        try {
            const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single();
            if (post) await _createNotification(post.user_id, 'LIKE', 'curtiu seu post.', postId);
        } catch (e) { }
        return data.likes_count;
    },

    // --- COMMENTS ---
    getComments: async (postId: string): Promise<Comment[]> => {
        const { data: commentsData } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
        if (!commentsData) return [];
        const userIds = [...new Set(commentsData.map((c: any) => c.user_id))];
        const { data: profilesData } = await supabase.from('profiles').select('*').in('id', userIds);
        const profilesMap = new Map();
        if (profilesData) profilesData.forEach((p: any) => profilesMap.set(p.id, mapProfileToUser(p)));

        // Mapear comentários com parentId
        const allComments = commentsData.map((c: any) => ({
            id: c.id,
            postId: c.post_id,
            parentId: c.parent_id || undefined,
            content: c.content,
            createdAt: new Date(c.created_at).toLocaleDateString(),
            user: profilesMap.get(c.user_id) || { id: 'unknown', name: 'Unknown', avatarUrl: '' },
            replies: []
        }));

        // Organizar em árvore
        const commentMap = new Map<string, Comment>();
        const rootComments: Comment[] = [];

        // Primeiro, criar mapa de todos os comentários
        allComments.forEach(comment => {
            commentMap.set(comment.id, comment);
        });

        // Depois, organizar em árvore
        allComments.forEach(comment => {
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId);
                if (parent) {
                    if (!parent.replies) parent.replies = [];
                    parent.replies.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });

        return rootComments;
    },
    createComment: async (postId: string, content: string, parentId?: string): Promise<Comment> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Auth required");
        const { data, error } = await supabase.from('comments').insert({
            post_id: postId,
            user_id: user.id,
            content,
            parent_id: parentId || null
        }).select().single();
        if (error) throw new Error(error.message);
        const { error: rpcError } = await supabase.rpc('increment_comments_count', { row_id: postId });
        if (rpcError) {
            const { data: post } = await supabase.from('posts').select('comments_count').eq('id', postId).single();
            if (post) await supabase.from('posts').update({ comments_count: post.comments_count + 1 }).eq('id', postId);
        }
        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        try {
            const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single();
            if (post) await _createNotification(post.user_id, 'COMMENT', 'comentou no seu post.', postId);
        } catch (e) { }
        return {
            id: data.id,
            postId: data.post_id,
            parentId: data.parent_id || undefined,
            content: data.content,
            createdAt: 'Agora',
            user: mapProfileToUser(userProfile || {}, user.email)
        };
    },
    deleteComment: async (commentId: string): Promise<void> => {
        const { error } = await supabase.from('comments').delete().eq('id', commentId);
        if (error) throw new Error(error.message);
    },

    // --- PROJECTS (PORTFOLIO) ---
    getUserProjects: async (userId: string): Promise<Project[]> => {
        const { data, error } = await supabase.from('user_projects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (error && error.code !== '42P01') { // Ignore "table not found" for newly initialized backends
            console.error("Error fetching projects", error);
        }
        if (!data) return [];

        return data.map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            title: p.title,
            description: p.description,
            imageUrl: p.image_url,
            demoUrl: p.demo_url,
            repoUrl: p.repo_url,
            tags: p.tags || [],
            createdAt: new Date(p.created_at).toLocaleDateString()
        }));
    },

    createProject: async (projectData: Partial<Project>): Promise<Project> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase.from('user_projects').insert({
            user_id: user.id,
            title: projectData.title,
            description: projectData.description,
            image_url: projectData.imageUrl,
            demo_url: projectData.demoUrl,
            repo_url: projectData.repoUrl,
            tags: projectData.tags
        }).select().single();

        if (error) throw new Error(error.message);

        return {
            id: data.id,
            userId: data.user_id,
            title: data.title,
            description: data.description,
            imageUrl: data.image_url,
            demoUrl: data.demo_url,
            repoUrl: data.repo_url,
            tags: data.tags || [],
            createdAt: 'Agora'
        };
    },

    deleteProject: async (projectId: string): Promise<void> => {
        const { error } = await supabase.from('user_projects').delete().eq('id', projectId);
        if (error) throw new Error(error.message);
    },

    // --- COURSE SYSTEM REFACTOR ---
    getCategories: async (): Promise<CourseCategory[]> => {
        const { data } = await supabase.from('course_categories').select('*').order('created_at', { ascending: false });
        if (!data) return [];
        return data.map((c: any) => ({
            id: c.id, title: c.title, description: c.description, thumbnailUrl: c.thumbnail_url, isPremium: c.is_premium, tags: c.tags || []
        }));
    },

    getCoursesByCategory: async (categoryId: string): Promise<Course[]> => {
        const { data } = await supabase.from('courses').select('*, modules:course_modules(count)').eq('category_id', categoryId).order('created_at', { ascending: true });
        if (!data) return [];
        return data.map((c: any) => ({
            id: c.id, categoryId: c.category_id, title: c.title, description: c.description,
            thumbnailUrl: c.thumbnail_url, authorName: c.author_name, duration: c.duration, level: c.level,
            modulesCount: c.modules ? c.modules[0]?.count : 0
        }));
    },

    getCourseModules: async (courseId: string): Promise<CourseModule[]> => {
        const { data } = await supabase.from('course_modules').select('*').eq('course_id', courseId).order('created_at', { ascending: true });
        if (!data) return [];
        const modules: CourseModule[] = [];
        for (const m of data) {
            const { data: lessonsData } = await supabase.from('course_lessons').select('*').eq('module_id', m.id).order('created_at', { ascending: true });
            modules.push({
                id: m.id, courseId: m.course_id, title: m.title, description: m.description,
                lessons: lessonsData ? lessonsData.map((l: any) => ({
                    id: l.id, title: l.title, duration: l.duration, videoUrl: l.video_url, content: l.content, completed: false
                })) : []
            });
        }
        return modules;
    },

    // Mantendo compatibilidade com código antigo se necessário, mas o ideal é usar getCoursesByCategory
    getCourses: async (): Promise<CourseCategory[]> => {
        return await backend.getCategories();
    },

    getCourseLessons: async (moduleId: string): Promise<CourseLesson[]> => {
        const { data } = await supabase.from('course_lessons').select('*').eq('module_id', moduleId).order('created_at', { ascending: true });
        if (!data) return [];
        return data.map((l: any) => ({
            id: l.id, title: l.title, duration: l.duration, videoUrl: l.video_url, content: l.content, completed: false
        }));
    },

    // --- OTHERS ---
    getNotifications: async (): Promise<Notification[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        const { data } = await supabase.from('notifications').select('*, actor:profiles(*)').eq('user_id', user.id).order('created_at', { ascending: false });
        if (!data) return [];
        return data.map((n: any) => ({
            id: n.id, type: n.type, user: n.actor ? mapProfileToUser(n.actor) : undefined,
            message: n.message, link: n.link, createdAt: new Date(n.created_at).toLocaleDateString(), read: n.is_read
        }));
    },
    markAllNotificationsAsRead: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    },
    sendBroadcastNotification: async (message: string, link?: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const { error } = await supabase.rpc('send_global_notification', { admin_user_id: user.id, message_text: message, link_url: link });
        if (error) throw new Error(error.message);
    },
    getTools: async (): Promise<Tool[]> => {
        const { data } = await supabase.from('tools').select('*').order('created_at', { ascending: false });
        if (!data) return [];
        return data.map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            fullDescription: t.full_description,
            logoUrl: t.logo_url,
            category: t.category,
            rating: t.rating,
            websiteUrl: t.website_url,
            isPremium: t.is_premium,
            features: t.features || [],
            relatedVideoUrl: t.related_video_url,

            // New expanded fields
            whatIs: t.what_is,
            howToUse: t.how_to_use,
            useCases: t.use_cases || [],
            faq: t.faq || [],
            reviews: t.reviews || [],
            pricing: t.pricing || [],
            relatedToolIds: t.related_tool_ids || []
        }));
    },
    getGiveaways: async (): Promise<Giveaway[]> => {
        const { data } = await supabase.from('giveaways').select('*').order('created_at', { ascending: false });
        if (!data) return [];
        return data.map((g: any) => ({
            id: g.id, title: g.title, description: g.description, imageUrl: g.image_url,
            endDate: new Date(g.end_date).toLocaleDateString(), participants: g.participants_count,
            requiredPlan: g.required_plan === 'PREMIUM' ? UserPlan.PREMIUM : UserPlan.FREE, status: g.status
        }));
    },
    getLiveEvents: async (): Promise<LiveEvent[]> => {
        const { data } = await supabase.from('live_events').select('*').order('start_time', { ascending: true });
        if (!data) return [];
        return data.map((l: any) => ({
            id: l.id, title: l.title, description: l.description, startTime: new Date(l.start_time).toLocaleString(),
            thumbnailUrl: l.thumbnail_url, streamUrl: l.stream_url, isLiveNow: l.is_live_now,
            requiredPlan: l.required_plan === 'PREMIUM' ? UserPlan.PREMIUM : UserPlan.FREE
        }));
    },
    getAdminStats: async (): Promise<AdminStats> => {
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
        const { count: premiumCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'PREMIUM');
        return { totalUsers: usersCount || 0, totalPosts: postsCount || 0, activeSubs: premiumCount || 0 };
    },
    getAllUsers: async (): Promise<User[]> => {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (!data) return [];
        return data.map(p => mapProfileToUser(p));
    },
    deleteUser: async (userId: string) => {
        const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: userId });
        if (error) throw new Error(error.message);
    },
    createResource: async (table: string, data: any) => {
        const { error } = await supabase.from(table).insert(data);
        if (error) throw new Error(error.message);
    },
    updateResource: async (table: string, id: string, data: any) => {
        const { error } = await supabase.from(table).update(data).eq('id', id);
        if (error) throw new Error(error.message);
    },
    deleteResource: async (table: string, id: string) => {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) { if (error.code === '23503') throw new Error("Dependências detectadas."); throw new Error(error.message); }
    },
    getAppConfig: async (): Promise<AppConfig> => {
        const { data } = await supabase.from('app_config').select('*');
        const config: AppConfig = { registrationOpen: true, maxUsers: 150 };
        if (data) {
            data.forEach((row: any) => {
                if (row.key === 'registration_open') config.registrationOpen = row.value === 'true';
                if (row.key === 'max_users') config.maxUsers = parseInt(row.value);
            });
        }
        return config;
    },
    updateAppConfig: async (config: AppConfig) => {
        await supabase.from('app_config').upsert({ key: 'registration_open', value: String(config.registrationOpen) });
        await supabase.from('app_config').upsert({ key: 'max_users', value: String(config.maxUsers) });
    },
    addToWaitlist: async (email: string) => {
        const { error } = await supabase.from('waitlist').insert({ email });
        if (error) throw error;
    },
    canRegister: async (): Promise<{ allowed: boolean; message?: string }> => {
        try {
            const { count, error } = await supabase.from('app_config').select('*', { count: 'exact', head: true });
            if (error) return { allowed: true };
            if (count === null) return { allowed: true };
            const config = await backend.getAppConfig();
            if (!config.registrationOpen) return { allowed: false, message: 'Fechado.' };
            const stats = await backend.getAdminStats();
            if (stats.totalUsers >= config.maxUsers) return { allowed: false, message: 'Cheio.' };
            return { allowed: true };
        } catch (e) { return { allowed: true }; }
    },

    // --- SUGGESTIONS SYSTEM ---
    getSuggestions: async (filters?: { category?: string; status?: string; sort?: 'votes' | 'recent' }): Promise<Suggestion[]> => {
        const { data: { user } } = await supabase.auth.getUser();

        let query = supabase
            .from('suggestions')
            .select('*, user:profiles(*)');

        // Aplicar filtros
        if (filters?.category && filters.category !== 'all') {
            query = query.eq('category', filters.category);
        }
        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        // Ordenação
        if (filters?.sort === 'votes') {
            query = query.order('votes_count', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        if (error || !data) return [];

        // Buscar votos do usuário atual
        const suggestionIds = data.map((s: any) => s.id);
        let userVotes = new Map<string, 'up' | 'down'>();

        if (user && suggestionIds.length > 0) {
            const { data: votesData } = await supabase
                .from('suggestion_votes')
                .select('suggestion_id, vote_type')
                .eq('user_id', user.id)
                .in('suggestion_id', suggestionIds);

            if (votesData) {
                votesData.forEach((vote: any) => {
                    userVotes.set(vote.suggestion_id, vote.vote_type);
                });
            }
        }

        return data.map((s: any) => ({
            id: s.id,
            user: mapProfileToUser(s.user),
            title: s.title,
            description: s.description,
            category: s.category,
            status: s.status,
            votesCount: s.votes_count || 0,
            commentsCount: s.comments_count || 0,
            isFeatured: s.is_featured || false,
            createdAt: new Date(s.created_at).toLocaleDateString(),
            updatedAt: new Date(s.updated_at).toLocaleDateString(),
            userVote: userVotes.get(s.id) || null
        }));
    },

    getSuggestionById: async (id: string): Promise<Suggestion | null> => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('suggestions')
            .select('*, user:profiles(*)')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        // Buscar voto do usuário
        let userVote: 'up' | 'down' | null = null;
        if (user) {
            const { data: voteData } = await supabase
                .from('suggestion_votes')
                .select('vote_type')
                .eq('suggestion_id', id)
                .eq('user_id', user.id)
                .single();

            if (voteData) userVote = voteData.vote_type;
        }

        return {
            id: data.id,
            user: mapProfileToUser(data.user),
            title: data.title,
            description: data.description,
            category: data.category,
            status: data.status,
            votesCount: data.votes_count || 0,
            commentsCount: data.comments_count || 0,
            isFeatured: data.is_featured || false,
            createdAt: new Date(data.created_at).toLocaleDateString(),
            updatedAt: new Date(data.updated_at).toLocaleDateString(),
            userVote
        };
    },

    createSuggestion: async (suggestionData: { title: string; description: string; category: string }): Promise<Suggestion> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('suggestions')
            .insert({
                user_id: user.id,
                title: suggestionData.title,
                description: suggestionData.description,
                category: suggestionData.category,
                status: 'pending',
                votes_count: 0,
                comments_count: 0
            })
            .select('*, user:profiles(*)')
            .single();

        if (error) throw new Error(error.message);

        return {
            id: data.id,
            user: mapProfileToUser(data.user),
            title: data.title,
            description: data.description,
            category: data.category,
            status: data.status,
            votesCount: 0,
            commentsCount: 0,
            isFeatured: false,
            createdAt: 'Agora',
            updatedAt: 'Agora',
            userVote: null
        };
    },

    voteSuggestion: async (suggestionId: string, voteType: 'up' | 'down'): Promise<void> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Verificar se já votou
        const { data: existingVote } = await supabase
            .from('suggestion_votes')
            .select('*')
            .eq('suggestion_id', suggestionId)
            .eq('user_id', user.id)
            .single();

        if (existingVote) {
            // Se votou igual, remover voto
            if (existingVote.vote_type === voteType) {
                const { error } = await supabase
                    .from('suggestion_votes')
                    .delete()
                    .eq('id', existingVote.id);
                if (error) throw new Error(error.message);
            } else {
                // Mudar voto
                const { error } = await supabase
                    .from('suggestion_votes')
                    .update({ vote_type: voteType })
                    .eq('id', existingVote.id);
                if (error) throw new Error(error.message);
            }
        } else {
            // Criar novo voto
            const { error } = await supabase
                .from('suggestion_votes')
                .insert({
                    suggestion_id: suggestionId,
                    user_id: user.id,
                    vote_type: voteType
                });
            if (error) throw new Error(error.message);
        }
    },

    getSuggestionComments: async (suggestionId: string): Promise<SuggestionComment[]> => {
        const { data: commentsData } = await supabase
            .from('suggestion_comments')
            .select('*')
            .eq('suggestion_id', suggestionId)
            .order('created_at', { ascending: true });

        if (!commentsData) return [];

        const userIds = [...new Set(commentsData.map((c: any) => c.user_id))];
        const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);

        const profilesMap = new Map();
        if (profilesData) {
            profilesData.forEach((p: any) => profilesMap.set(p.id, mapProfileToUser(p)));
        }

        // Mapear comentários
        const allComments = commentsData.map((c: any) => ({
            id: c.id,
            suggestionId: c.suggestion_id,
            parentId: c.parent_id || undefined,
            content: c.content,
            createdAt: new Date(c.created_at).toLocaleDateString(),
            user: profilesMap.get(c.user_id) || { id: 'unknown', name: 'Unknown', avatarUrl: '' },
            replies: []
        }));

        // Organizar em árvore
        const commentMap = new Map<string, SuggestionComment>();
        const rootComments: SuggestionComment[] = [];

        allComments.forEach(comment => {
            commentMap.set(comment.id, comment);
        });

        allComments.forEach(comment => {
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId);
                if (parent) {
                    if (!parent.replies) parent.replies = [];
                    parent.replies.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });

        return rootComments;
    },

    createSuggestionComment: async (suggestionId: string, content: string, parentId?: string): Promise<SuggestionComment> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('suggestion_comments')
            .insert({
                suggestion_id: suggestionId,
                user_id: user.id,
                content,
                parent_id: parentId || null
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return {
            id: data.id,
            suggestionId: data.suggestion_id,
            parentId: data.parent_id || undefined,
            content: data.content,
            createdAt: 'Agora',
            user: mapProfileToUser(userProfile || {}, user.email)
        };
    },

    updateSuggestionStatus: async (suggestionId: string, status: string, isFeatured?: boolean): Promise<void> => {
        const updates: any = { status };
        if (isFeatured !== undefined) {
            updates.is_featured = isFeatured;
        }

        const { error } = await supabase
            .from('suggestions')
            .update(updates)
            .eq('id', suggestionId);

        if (error) throw new Error(error.message);
    },

    // Send contact message
    sendContactMessage: async (data: { name: string; email: string; subject: string; message: string }) => {
        const { error } = await supabase
            .from('contact_messages')
            .insert([{
                name: data.name,
                email: data.email,
                subject: data.subject,
                message: data.message,
                status: 'unread'
            }]);

        if (error) throw new Error(error.message);
    },

    // ========== COURSE PROGRESS ==========

    // Mark lesson as complete
    markLessonComplete: async (userId: string, courseId: string, lessonId: string) => {
        const { error } = await supabase
            .from('course_progress')
            .upsert({
                user_id: userId,
                course_id: courseId,
                lesson_id: lessonId,
                completed: true,
                completed_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,lesson_id'
            });

        if (error) throw new Error(error.message);
    },

    // Get course progress
    getCourseProgress: async (userId: string, courseId: string) => {
        // Get all lessons for this course
        const { data: modules } = await supabase
            .from('course_modules')
            .select('id')
            .eq('course_id', courseId);

        if (!modules) return { completed: 0, total: 0, percentage: 0 };

        const moduleIds = modules.map(m => m.id);

        const { data: allLessons } = await supabase
            .from('course_lessons')
            .select('id')
            .in('module_id', moduleIds);

        const total = allLessons?.length || 0;

        // Get completed lessons
        const { data: completedLessons } = await supabase
            .from('course_progress')
            .select('lesson_id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .eq('completed', true);

        const completed = completedLessons?.length || 0;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    },

    // Get completed lesson IDs
    getCompletedLessons: async (userId: string, courseId: string) => {
        const { data, error } = await supabase
            .from('course_progress')
            .select('lesson_id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .eq('completed', true);

        if (error) throw new Error(error.message);
        return data?.map(d => d.lesson_id) || [];
    },

    // ========== COURSE REVIEWS ==========

    // Submit course review
    submitCourseReview: async (userId: string, courseId: string, rating: number, comment?: string) => {
        const { error } = await supabase
            .from('course_reviews')
            .upsert({
                user_id: userId,
                course_id: courseId,
                rating,
                comment: comment || null
            }, {
                onConflict: 'user_id,course_id'
            });

        if (error) throw new Error(error.message);
    },

    // Get course reviews
    getCourseReviews: async (courseId: string) => {
        const { data, error } = await supabase
            .from('course_reviews')
            .select(`
                *,
                profiles:user_id (
                    name,
                    avatar_url
                )
            `)
            .eq('course_id', courseId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    },

    // Get user's review for a course
    getUserCourseReview: async (userId: string, courseId: string) => {
        const { data, error } = await supabase
            .from('course_reviews')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        return data;
    },

    // ========== TOOL REVIEWS ==========

    // Submit tool review
    submitToolReview: async (toolId: string, userId: string, rating: number, comment: string) => {
        const { error } = await supabase
            .from('tool_reviews')
            .upsert({
                tool_id: toolId,
                user_id: userId,
                rating,
                comment,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,tool_id'
            });

        if (error) throw new Error(error.message);
    },

    // Get tool reviews
    getToolReviews: async (toolId: string) => {
        const { data, error } = await supabase
            .from('tool_reviews')
            .select(`
                *,
                profiles:user_id (
                    name,
                    avatar_url,
                    handle
                )
            `)
            .eq('tool_id', toolId)
            .order('helpful_count', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    },

    // Vote review as helpful
    voteReviewHelpful: async (reviewId: string, userId: string) => {
        // Check if already voted
        const { data: existingVote } = await supabase
            .from('tool_review_votes')
            .select('id')
            .eq('review_id', reviewId)
            .eq('user_id', userId)
            .single();

        if (existingVote) {
            // Remove vote
            const { error } = await supabase
                .from('tool_review_votes')
                .delete()
                .eq('review_id', reviewId)
                .eq('user_id', userId);

            if (error) throw new Error(error.message);
            return false; // Vote removed
        } else {
            // Add vote
            const { error } = await supabase
                .from('tool_review_votes')
                .insert({
                    review_id: reviewId,
                    user_id: userId
                });

            if (error) throw new Error(error.message);
            return true; // Vote added
        }
    },

    // Get user's vote status for reviews
    getUserReviewVotes: async (userId: string, reviewIds: string[]) => {
        const { data, error } = await supabase
            .from('tool_review_votes')
            .select('review_id')
            .eq('user_id', userId)
            .in('review_id', reviewIds);

        if (error) throw new Error(error.message);
        return data?.map(v => v.review_id) || [];
    },

    // Calculate tool rating
    calculateToolRating: async (toolId: string) => {
        const { data, error } = await supabase
            .rpc('calculate_tool_rating', { tool_uuid: toolId });

        if (error) throw new Error(error.message);
        return data || 0;
    },

    // Delete tool review
    deleteToolReview: async (reviewId: string, userId: string) => {
        const { error } = await supabase
            .from('tool_reviews')
            .delete()
            .eq('id', reviewId)
            .eq('user_id', userId);

        if (error) throw new Error(error.message);
    }
};
