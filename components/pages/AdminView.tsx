
import React, { useState, useEffect } from 'react';
import { backend } from '../../services/backend';
import { AdminStats, User, CourseCategory, Course, Tool, Giveaway, LiveEvent, CourseModule, CourseLesson, AppConfig, Post, Comment, Project, PostType, UserPlan, Suggestion } from '../../types';
import CourseCard from '../CourseCard';
import ToolCard from '../ToolCard';
import GiveawayCard from '../GiveawayCard';

interface AdminViewProps {
    onNavigateToSite?: () => void;
}

type AdminTab = 'DASHBOARD' | 'USERS' | 'COURSES' | 'TOOLS' | 'LIVE' | 'GIVEAWAYS' | 'POSTS' | 'PROJECTS' | 'COMMENTS' | 'SUGGESTIONS' | 'NOTIFICATIONS' | 'LAUNCH';
type ViewMode = 'GRID' | 'LIST';

const AdminView: React.FC<AdminViewProps> = ({ onNavigateToSite }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
    const [viewMode, setViewMode] = useState<ViewMode>('GRID');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

    // Data States
    const [users, setUsers] = useState<User[]>([]);
    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [tools, setTools] = useState<Tool[]>([]);
    const [lives, setLives] = useState<LiveEvent[]>([]);
    const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [allComments, setAllComments] = useState<Comment[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    // User Details Modal
    const [userDetailsModal, setUserDetailsModal] = useState<User | null>(null);

    // Hierarchical Data for Courses
    const [selectedCategory, setSelectedCategory] = useState<CourseCategory | null>(null);
    const [categoryCourses, setCategoryCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
    const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
    const [moduleLessons, setModuleLessons] = useState<CourseLesson[]>([]);

    // Notification State
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastLink, setBroadcastLink] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [modalType, setModalType] = useState<string>('');

    // DELETE MODAL STATE
    const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null); // Track which field is uploading

    useEffect(() => {
        loadData();
    }, [activeTab]);

    useEffect(() => {
        if (selectedCategory) {
            loadCourses(selectedCategory.id);
            setSelectedCourse(null);
            setSelectedModule(null);
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (selectedCourse) {
            loadModules(selectedCourse.id);
            setSelectedModule(null);
        }
    }, [selectedCourse]);

    useEffect(() => {
        if (selectedModule) {
            loadLessons(selectedModule.id);
        }
    }, [selectedModule]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'DASHBOARD') {
                const statsData = await backend.getAdminStats();
                setStats(statsData);
                const usersData = await backend.getAllUsers();
                setUsers(usersData);
            }
            if (activeTab === 'USERS') {
                const usersData = await backend.getAllUsers();
                setUsers(usersData);
            }
            if (activeTab === 'COURSES') {
                const c = await backend.getCategories();
                setCategories(c);
            }
            if (activeTab === 'TOOLS') {
                const t = await backend.getTools();
                setTools(t);
            }
            if (activeTab === 'LIVE') {
                const l = await backend.getLiveEvents();
                setLives(l);
            }
            if (activeTab === 'GIVEAWAYS') {
                const g = await backend.getGiveaways();
                setGiveaways(g);
            }
            if (activeTab === 'POSTS') {
                const p = await backend.getPosts();
                setPosts(p);
            }
            if (activeTab === 'PROJECTS') {
                const users = await backend.getAllUsers();
                const projectsPromises = users.map(u => backend.getUserProjects(u.id));
                const projectsArrays = await Promise.all(projectsPromises);
                const projects = projectsArrays.flat();
                setAllProjects(projects);
            }
            if (activeTab === 'COMMENTS') {
                const p = await backend.getPosts();
                const commentsPromises = p.map(post => backend.getComments(post.id));
                const commentsArrays = await Promise.all(commentsPromises);
                const comments = commentsArrays.flat();
                setAllComments(comments);
            }
            if (activeTab === 'SUGGESTIONS') {
                const s = await backend.getSuggestions();
                setSuggestions(s);
            }
            if (activeTab === 'LAUNCH') {
                const conf = await backend.getAppConfig();
                setAppConfig(conf);
                const s = await backend.getAdminStats();
                setStats(s);
            }
        } catch (error) {
            console.error("Erro ao carregar admin", error);
        } finally {
            setLoading(false);
        }
    };

    const loadCourses = async (catId: string) => {
        setLoading(true);
        try {
            const c = await backend.getCoursesByCategory(catId);
            setCategoryCourses(c);
        } finally { setLoading(false); }
    };

    const loadModules = async (courseId: string) => {
        setLoading(true);
        try {
            const m = await backend.getCourseModules(courseId);
            setCourseModules(m);
        } finally { setLoading(false); }
    };

    const loadLessons = async (moduleId: string) => {
        setLoading(true);
        try {
            const l = await backend.getCourseLessons(moduleId);
            setModuleLessons(l);
        } finally { setLoading(false); }
    };

    // --- ACTIONS ---

    const handleOpenCreate = (type: string) => {
        setEditingItem(null);
        setFormData({});
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: any, type: string) => {
        setEditingItem(item);
        setModalType(type);
        let prefill = { ...item };
        if (activeTab === 'LIVE' && item.startTime) prefill.startTime = '';
        if (activeTab === 'GIVEAWAYS' && item.endDate) prefill.endDate = '';
        setFormData(prefill);
        setIsModalOpen(true);
    };

    const requestDelete = (type: string, id: string, name: string) => {
        setDeleteTarget({ type, id, name: name || 'Item sem nome' });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const { type, id } = deleteTarget;
            if (type === 'USER') {
                await backend.deleteUser(id);
                loadData();
            } else if (type === 'POST') {
                await backend.deletePost(id);
                loadData();
            } else if (type === 'PROJECT') {
                await backend.deleteProject(id);
                loadData();
            } else if (type === 'COMMENT') {
                await backend.deleteComment(id);
                loadData();
            } else if (type === 'SUGGESTION') {
                await backend.deleteResource('suggestions', id);
                loadData();
            } else {
                let table = '';
                switch (type) {
                    case 'CATEGORY': table = 'course_categories'; break;
                    case 'COURSE': table = 'courses'; break;
                    case 'MODULE': table = 'course_modules'; break;
                    case 'LESSON': table = 'course_lessons'; break;
                    case 'TOOL': table = 'tools'; break;
                    case 'LIVE': table = 'live_events'; break;
                    case 'GIVEAWAY': table = 'giveaways'; break;
                }
                await backend.deleteResource(table, id);

                if (type === 'CATEGORY') loadData();
                if (type === 'COURSE' && selectedCategory) loadCourses(selectedCategory.id);
                if (type === 'MODULE' && selectedCourse) loadModules(selectedCourse.id);
                if (type === 'LESSON' && selectedModule) loadLessons(selectedModule.id);
                if (type === 'TOOL' || type === 'LIVE' || type === 'GIVEAWAY') loadData();
            }
            setDeleteTarget(null);
        } catch (error: any) {
            alert("Erro ao excluir: " + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Handle USER separately with dedicated functions
        if (modalType === 'USER') {
            if (editingItem) {
                return handleEditUser(e);
            } else {
                return handleCreateUser(e);
            }
        }

        setSaving(true);
        try {
            let table = '';
            let payload: any = {};
            const type = modalType || (activeTab === 'COURSES' ? 'CATEGORY' : activeTab === 'TOOLS' ? 'TOOL' : activeTab === 'LIVE' ? 'LIVE' : activeTab === 'GIVEAWAYS' ? 'GIVEAWAY' : '');

            if (type === 'CATEGORY') {
                table = 'course_categories';
                payload = {
                    title: formData.title, description: formData.description, thumbnail_url: formData.thumbnailUrl,
                    is_premium: Boolean(formData.isPremium), tags: Array.isArray(formData.tags) ? formData.tags : (formData.tags ? String(formData.tags).split(',').map(t => t.trim()).filter(Boolean) : [])
                };
            } else if (type === 'COURSE') {
                table = 'courses';
                payload = {
                    category_id: selectedCategory?.id, title: formData.title, description: formData.description,
                    thumbnail_url: formData.thumbnailUrl, author_name: formData.authorName, duration: formData.duration, level: formData.level
                };
            } else if (type === 'MODULE') {
                table = 'course_modules';
                payload = {
                    course_id: selectedCourse?.id, title: formData.title, description: formData.description
                };
            } else if (type === 'LESSON') {
                table = 'course_lessons';
                payload = {
                    module_id: selectedModule?.id, title: formData.title, duration: formData.duration,
                    video_url: formData.videoUrl, content: formData.content
                };
            } else if (type === 'TOOL') {
                table = 'tools';

                // Helper function to parse JSON safely
                const parseJSON = (value: any, fallback: any = []) => {
                    if (!value) return fallback;
                    if (typeof value === 'string') {
                        try {
                            return JSON.parse(value);
                        } catch {
                            return fallback;
                        }
                    }
                    return value;
                };

                payload = {
                    name: formData.name,
                    description: formData.description,
                    full_description: formData.fullDescription,
                    logo_url: formData.logoUrl,
                    category: formData.category,
                    rating: parseFloat(formData.rating || '0'),
                    website_url: formData.websiteUrl,
                    is_premium: Boolean(formData.isPremium),
                    related_video_url: formData.relatedVideoUrl,
                    features: Array.isArray(formData.features) ? formData.features : (formData.features ? String(formData.features).split(',').map(t => t.trim()).filter(Boolean) : []),

                    // New expanded fields
                    what_is: formData.whatIs || null,
                    how_to_use: formData.howToUse || null,
                    use_cases: parseJSON(formData.useCases, []),
                    faq: parseJSON(formData.faq, []),
                    reviews: parseJSON(formData.reviews, []),
                    pricing: parseJSON(formData.pricing, []),
                    related_tool_ids: Array.isArray(formData.relatedToolIds) ? formData.relatedToolIds : (formData.relatedToolIds ? String(formData.relatedToolIds).split(',').map(t => t.trim()).filter(Boolean) : [])
                };
            } else if (type === 'LIVE') {
                table = 'live_events';
                payload = {
                    title: formData.title, description: formData.description,
                    start_time: formData.startTime ? new Date(formData.startTime).toISOString() : new Date().toISOString(),
                    thumbnail_url: formData.thumbnailUrl, stream_url: formData.streamUrl,
                    is_live_now: Boolean(formData.isLiveNow), required_plan: formData.requiredPlan || 'FREE'
                };
            } else if (type === 'GIVEAWAY') {
                table = 'giveaways';
                payload = {
                    title: formData.title, description: formData.description, image_url: formData.imageUrl,
                    end_date: formData.endDate ? new Date(formData.endDate).toISOString() : new Date().toISOString(),
                    required_plan: formData.requiredPlan || 'FREE', status: formData.status || 'OPEN'
                };
            }

            if (editingItem && editingItem.id) { await backend.updateResource(table, editingItem.id, payload); }
            else { await backend.createResource(table, payload); }

            setIsModalOpen(false);
            if (type === 'CATEGORY') loadData();
            if (type === 'COURSE' && selectedCategory) loadCourses(selectedCategory.id);
            if (type === 'MODULE' && selectedCourse) loadModules(selectedCourse.id);
            if (type === 'LESSON' && selectedModule) loadLessons(selectedModule.id);
            if (type === 'TOOL' || type === 'LIVE' || type === 'GIVEAWAY') loadData();
        } catch (error: any) {
            alert("Erro ao salvar: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSendBroadcast = async () => {
        if (!broadcastMsg.trim() || !window.confirm("Confirmar envio global?")) return;
        setSaving(true);
        try { await backend.sendBroadcastNotification(broadcastMsg, broadcastLink); alert("Sucesso!"); setBroadcastMsg(''); setBroadcastLink(''); }
        catch (e: any) { alert("Erro: " + e.message); } finally { setSaving(false); }
    };

    const handleSaveConfig = async () => {
        if (!appConfig) return;
        setSaving(true);
        try { await backend.updateAppConfig(appConfig); alert("Salvo!"); }
        catch (e) { alert("Erro"); } finally { setSaving(false); }
    };

    // --- USER MANAGEMENT FUNCTIONS ---
    const toggleUserPlan = async (userId: string, currentPlan: UserPlan) => {
        if (!window.confirm("Alterar plano do usuário?")) return;
        setSaving(true);
        try {
            const newPlan = currentPlan === UserPlan.PREMIUM ? 'FREE' : 'PREMIUM';
            await backend.updateResource('profiles', userId, { plan: newPlan });
            alert("Plano atualizado!");
            loadData();
        } catch (error: any) {
            alert("Erro: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data, error } = await backend.signUp(
                formData.email,
                formData.password,
                {
                    data: {
                        full_name: formData.name,
                        handle: formData.handle || `@${formData.email.split('@')[0]}`
                    }
                }
            );
            if (error) throw new Error(error.message);

            // Atualizar plano se for premium
            if (formData.plan === 'PREMIUM' && data.user) {
                await backend.updateResource('profiles', data.user.id, { plan: 'PREMIUM' });
            }

            alert("Usuário criado com sucesso!");
            setIsModalOpen(false);
            loadData();
        } catch (error: any) {
            alert("Erro ao criar usuário: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        setSaving(true);
        try {
            await backend.updateProfile(editingItem.id, {
                name: formData.name,
                handle: formData.handle,
                bio: formData.bio,
                avatarUrl: formData.avatarUrl,
                coverUrl: formData.coverUrl
            });

            // Atualizar plano separadamente
            await backend.updateResource('profiles', editingItem.id, {
                plan: formData.plan,
                is_public_profile: formData.isPublicProfile
            });

            alert("Usuário atualizado!");
            setIsModalOpen(false);
            loadData();
        } catch (error: any) {
            alert("Erro: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSuggestionStatus = async (suggestionId: string, status: string, isFeatured?: boolean) => {
        setSaving(true);
        try {
            await backend.updateSuggestionStatus(suggestionId, status, isFeatured);
            loadData(); // Reload suggestions
        } catch (error: any) {
            alert("Erro ao atualizar sugestão: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogoff = async () => {
        await backend.signOut();
        if (onNavigateToSite) {
            onNavigateToSite();
        } else {
            window.location.reload();
        }
    };

    // --- RENDER HELPERS ---
    const AdminActionOverlay = ({ onEdit, onDelete, onManage }: { onEdit: () => void, onDelete: () => void, onManage?: () => void }) => (
        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-xl z-50 backdrop-blur-sm pointer-events-auto">
            {onManage && <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onManage(); }} className="bg-emerald-500 text-white p-3 rounded-full hover:scale-110 shadow-lg" title="Gerenciar"><span className="material-symbols-outlined">subdirectory_arrow_right</span></button>}
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }} className="bg-white text-gray-900 p-3 rounded-full hover:scale-110 shadow-lg" title="Editar"><span className="material-symbols-outlined">edit</span></button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} className="bg-red-500 text-white p-3 rounded-full hover:scale-110 shadow-lg" title="Deletar"><span className="material-symbols-outlined">delete</span></button>
        </div>
    );

    const renderFormFields = () => {
        const type = modalType || (activeTab === 'COURSES' ? 'CATEGORY' : activeTab === 'TOOLS' ? 'TOOL' : activeTab === 'LIVE' ? 'LIVE' : activeTab === 'GIVEAWAYS' ? 'GIVEAWAY' : '');
        const commonInput = (lbl: string, val: string, key: string, req = true) => (
            <div className="col-span-2"><label className="block text-sm font-bold mb-1">{lbl}</label><input required={req} className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2" value={val || ''} onChange={e => setFormData({ ...formData, [key]: e.target.value })} /></div>
        );
        const commonText = (lbl: string, val: string, key: string) => (
            <div className="col-span-2"><label className="block text-sm font-bold mb-1">{lbl}</label><textarea className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2" rows={3} value={val || ''} onChange={e => setFormData({ ...formData, [key]: e.target.value })} /></div>
        );

        // Image Upload Component
        const imageUpload = (lbl: string, val: string, key: string, folder: string) => (
            <div className="col-span-2">
                <label className="block text-sm font-bold mb-1">{lbl}</label>
                <div className="flex gap-3 items-start">
                    {/* Preview */}
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                        {val ? (
                            <img src={val} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-gray-400 text-3xl">image</span>
                        )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-2">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`upload-${key}`}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                setUploading(key);
                                try {
                                    const url = await backend.uploadImage(file, folder);
                                    setFormData({ ...formData, [key]: url });
                                } catch (err) {
                                    console.error('Upload failed:', err);
                                    alert('Erro ao fazer upload da imagem');
                                } finally {
                                    setUploading(null);
                                }
                            }}
                        />
                        <label
                            htmlFor={`upload-${key}`}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm cursor-pointer transition-colors ${uploading === key
                                ? 'bg-gray-200 text-gray-500 cursor-wait'
                                : 'bg-primary-500 hover:bg-primary-600 text-white'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">
                                {uploading === key ? 'sync' : 'upload'}
                            </span>
                            {uploading === key ? 'Enviando...' : 'Fazer Upload'}
                        </label>

                        {val && (
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, [key]: '' })}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                Remover imagem
                            </button>
                        )}

                        <p className="text-xs text-gray-500">Formatos: JPG, PNG, GIF. Máx: 5MB</p>
                    </div>
                </div>
            </div>
        );

        if (type === 'CATEGORY') return <>{commonInput('Título', formData.title, 'title')}{commonText('Descrição', formData.description, 'description')}{imageUpload('Thumbnail', formData.thumbnailUrl, 'thumbnailUrl', 'categories')}{commonInput('Tags (CSV)', Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags, 'tags', false)}<div className="col-span-2"><label className="flex gap-2"><input type="checkbox" checked={formData.isPremium} onChange={e => setFormData({ ...formData, isPremium: e.target.checked })} /> Premium</label></div></>;
        if (type === 'COURSE') return <>{commonInput('Título', formData.title, 'title')}{commonText('Descrição', formData.description, 'description')}{imageUpload('Thumbnail', formData.thumbnailUrl, 'thumbnailUrl', 'courses')}{commonInput('Autor', formData.authorName, 'authorName')}{commonInput('Duração', formData.duration, 'duration')}{commonInput('Nível', formData.level, 'level')}</>;
        if (type === 'MODULE') return <>{commonInput('Título', formData.title, 'title')}{commonText('Descrição', formData.description, 'description')}</>;
        if (type === 'LESSON') return <>{commonInput('Título', formData.title, 'title')}{commonInput('Video URL', formData.videoUrl, 'videoUrl')}{commonInput('Duração', formData.duration, 'duration')}{commonText('Conteúdo', formData.content, 'content')}</>;

        // USER FORM
        if (type === 'USER') return (
            <>
                {commonInput('Nome', formData.name, 'name')}
                {!editingItem && commonInput('Email', formData.email, 'email')}
                {editingItem && <div className="col-span-2"><label className="block text-sm font-bold mb-1">Email</label><input disabled className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2 opacity-50" value={formData.email || ''} /></div>}
                {!editingItem && <div className="col-span-2"><label className="block text-sm font-bold mb-1">Senha</label><input required type="password" className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2" value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} /></div>}
                {commonInput('Handle (@username)', formData.handle, 'handle', false)}
                {commonText('Bio', formData.bio, 'bio')}
                {imageUpload('Avatar', formData.avatarUrl, 'avatarUrl', 'users')}
                {imageUpload('Capa', formData.coverUrl, 'coverUrl', 'users')}
                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">Plano</label>
                    <select
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2"
                        value={formData.plan || 'FREE'}
                        onChange={e => setFormData({ ...formData, plan: e.target.value })}
                    >
                        <option value="FREE">FREE</option>
                        <option value="PREMIUM">PREMIUM</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="flex gap-2 items-center">
                        <input
                            type="checkbox"
                            checked={formData.isPublicProfile !== false}
                            onChange={e => setFormData({ ...formData, isPublicProfile: e.target.checked })}
                        />
                        <span className="font-bold">Perfil Público</span>
                    </label>
                </div>
            </>
        );

        // TOOL FORM
        if (type === 'TOOL') return (
            <>
                <div className="col-span-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">📋 Informações Básicas</h4>
                </div>
                {commonInput('Nome', formData.name, 'name')}
                {commonText('Descrição Curta', formData.description, 'description')}
                {commonText('Descrição Completa', formData.fullDescription, 'fullDescription')}
                {imageUpload('Logo', formData.logoUrl, 'logoUrl', 'tools')}
                {commonInput('Categoria', formData.category, 'category')}
                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">Avaliação (0-5)</label>
                    <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2"
                        value={formData.rating || ''}
                        onChange={e => setFormData({ ...formData, rating: e.target.value })}
                    />
                </div>
                {commonInput('Website URL', formData.websiteUrl, 'websiteUrl')}
                {commonInput('Vídeo Relacionado URL', formData.relatedVideoUrl, 'relatedVideoUrl', false)}
                {commonInput('Features (separadas por vírgula)', Array.isArray(formData.features) ? formData.features.join(',') : formData.features, 'features', false)}
                <div className="col-span-2">
                    <label className="flex gap-2 items-center">
                        <input
                            type="checkbox"
                            checked={formData.isPremium || false}
                            onChange={e => setFormData({ ...formData, isPremium: e.target.checked })}
                        />
                        <span className="font-bold">Premium</span>
                    </label>
                </div>

                <div className="col-span-2 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800 mt-4">
                    <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-1">✨ Seções Expandidas</h4>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">O que é? (Descrição expandida)</label>
                    <textarea
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2"
                        rows={4}
                        value={formData.whatIs || ''}
                        onChange={e => setFormData({ ...formData, whatIs: e.target.value })}
                        placeholder="Descrição detalhada sobre o que é a ferramenta..."
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">Como usar? (Passo a passo)</label>
                    <textarea
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2"
                        rows={5}
                        value={formData.howToUse || ''}
                        onChange={e => setFormData({ ...formData, howToUse: e.target.value })}
                        placeholder="1. Primeiro passo&#10;2. Segundo passo&#10;3. Terceiro passo..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Use quebras de linha para separar os passos</p>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">IDs de Ferramentas Relacionadas (separados por vírgula)</label>
                    <input
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2"
                        value={Array.isArray(formData.relatedToolIds) ? formData.relatedToolIds.join(',') : formData.relatedToolIds || ''}
                        onChange={e => setFormData({ ...formData, relatedToolIds: e.target.value })}
                        placeholder="t2,t3,t4"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ex: t2,t3 (IDs das ferramentas relacionadas)</p>
                </div>

                <div className="col-span-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800 mt-4">
                    <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1">📊 Dados JSON (Avançado)</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300">Cole JSON válido ou deixe vazio</p>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">Casos de Uso (JSON)</label>
                    <textarea
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2 font-mono text-xs"
                        rows={6}
                        value={typeof formData.useCases === 'string' ? formData.useCases : JSON.stringify(formData.useCases || [], null, 2)}
                        onChange={e => setFormData({ ...formData, useCases: e.target.value })}
                        placeholder='[{"id":"uc1","title":"Título","description":"Descrição","icon":"rocket_launch"}]'
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">FAQ (JSON)</label>
                    <textarea
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2 font-mono text-xs"
                        rows={6}
                        value={typeof formData.faq === 'string' ? formData.faq : JSON.stringify(formData.faq || [], null, 2)}
                        onChange={e => setFormData({ ...formData, faq: e.target.value })}
                        placeholder='[{"id":"faq1","question":"Pergunta?","answer":"Resposta"}]'
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">Reviews (JSON)</label>
                    <textarea
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2 font-mono text-xs"
                        rows={6}
                        value={typeof formData.reviews === 'string' ? formData.reviews : JSON.stringify(formData.reviews || [], null, 2)}
                        onChange={e => setFormData({ ...formData, reviews: e.target.value })}
                        placeholder='[{"id":"r1","userId":"u1","userName":"Nome","userAvatar":"url","rating":5,"comment":"Comentário","createdAt":"01/01/2024","helpful":10}]'
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">Pricing (JSON)</label>
                    <textarea
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2 font-mono text-xs"
                        rows={6}
                        value={typeof formData.pricing === 'string' ? formData.pricing : JSON.stringify(formData.pricing || [], null, 2)}
                        onChange={e => setFormData({ ...formData, pricing: e.target.value })}
                        placeholder='[{"id":"free","name":"Free","price":"R$ 0","period":"month","features":["Feature 1"],"isPopular":false}]'
                    />
                </div>
            </>
        );

        // LIVE EVENT FORM
        if (type === 'LIVE') return (
            <>
                {commonInput('Título', formData.title, 'title')}
                {commonText('Descrição', formData.description, 'description')}
                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">Data/Hora de Início</label>
                    <input
                        type="datetime-local"
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2"
                        value={formData.startTime || ''}
                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    />
                </div>
                {commonInput('Thumbnail URL', formData.thumbnailUrl, 'thumbnailUrl')}
                {commonInput('Stream URL', formData.streamUrl, 'streamUrl')}
                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">Plano Requerido</label>
                    <select
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2"
                        value={formData.requiredPlan || 'FREE'}
                        onChange={e => setFormData({ ...formData, requiredPlan: e.target.value })}
                    >
                        <option value="FREE">FREE</option>
                        <option value="PREMIUM">PREMIUM</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="flex gap-2 items-center">
                        <input
                            type="checkbox"
                            checked={formData.isLiveNow || false}
                            onChange={e => setFormData({ ...formData, isLiveNow: e.target.checked })}
                        />
                        <span className="font-bold">Ao Vivo Agora</span>
                    </label>
                </div>
            </>
        );

        // GIVEAWAY FORM
        if (type === 'GIVEAWAY') return (
            <>
                {commonInput('Título', formData.title, 'title')}
                {commonText('Descrição', formData.description, 'description')}
                {imageUpload('Imagem', formData.imageUrl, 'imageUrl', 'giveaways')}
                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">Data de Término</label>
                    <input
                        type="datetime-local"
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2"
                        value={formData.endDate || ''}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">Plano Requerido</label>
                    <select
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2"
                        value={formData.requiredPlan || 'FREE'}
                        onChange={e => setFormData({ ...formData, requiredPlan: e.target.value })}
                    >
                        <option value="FREE">FREE</option>
                        <option value="PREMIUM">PREMIUM</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">Status</label>
                    <select
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 px-3 py-2"
                        value={formData.status || 'OPEN'}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="OPEN">Aberto</option>
                        <option value="CLOSED">Fechado</option>
                        <option value="FUTURE">Futuro</option>
                    </select>
                </div>
            </>
        );

        return <p className="col-span-2">Tipo de formulário não reconhecido.</p>;

    };

    const renderContent = (type: string, data: any[]) => {
        if (data.length === 0) return <div className="text-center p-10 text-gray-400 border-2 border-dashed rounded-xl">Nenhum item.</div>;
        if (viewMode === 'GRID') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {data.map(item => (
                        <div key={item.id} className="relative group h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            {(type === 'CATEGORY' || type === 'COURSE') && <div className="h-40 bg-gray-200"><img src={item.thumbnailUrl} className="w-full h-full object-cover" /></div>}
                            <div className="p-4">
                                <h3 className="font-bold text-lg dark:text-white truncate">{item.title || item.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{item.description || item.content}</p>
                            </div>
                            <AdminActionOverlay
                                onEdit={() => handleOpenEdit(item, type)}
                                onDelete={() => requestDelete(type, item.id, item.title || item.name)}
                                onManage={(type === 'CATEGORY' || type === 'COURSE' || type === 'MODULE') ? () => {
                                    if (type === 'CATEGORY') setSelectedCategory(item);
                                    if (type === 'COURSE') setSelectedCourse(item);
                                    if (type === 'MODULE') setSelectedModule(item);
                                } : undefined}
                            />
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <div className="bg-white dark:bg-card-dark border rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {data.map(item => (
                            <tr key={item.id}>
                                <td className="p-4 font-bold dark:text-white">{item.title || item.name}</td>
                                <td className="p-4 text-right flex justify-end gap-3">
                                    {(type === 'CATEGORY' || type === 'COURSE' || type === 'MODULE') && <button onClick={() => { if (type === 'CATEGORY') setSelectedCategory(item); if (type === 'COURSE') setSelectedCourse(item); if (type === 'MODULE') setSelectedModule(item); }} className="text-emerald-500 font-bold">Gerenciar</button>}
                                    <button onClick={() => handleOpenEdit(item, type)} className="text-blue-500 font-bold">Editar</button>
                                    <button onClick={() => requestDelete(type, item.id, item.title || item.name)} className="text-red-500 font-bold">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Breadcrumbs Navigation
    const Breadcrumbs = () => {
        if (activeTab !== 'COURSES') return null;
        return (
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
                <button onClick={() => { setSelectedCategory(null); setSelectedCourse(null); setSelectedModule(null); }} className={`hover:text-primary ${!selectedCategory ? 'font-bold text-primary' : ''}`}>Categorias</button>
                {selectedCategory && (
                    <>
                        <span>/</span>
                        <button onClick={() => { setSelectedCourse(null); setSelectedModule(null); }} className={`hover:text-primary ${!selectedCourse ? 'font-bold text-primary' : ''}`}>{selectedCategory.title}</button>
                    </>
                )}
                {selectedCourse && (
                    <>
                        <span>/</span>
                        <button onClick={() => { setSelectedModule(null); }} className={`hover:text-primary ${!selectedModule ? 'font-bold text-primary' : ''}`}>{selectedCourse.title}</button>
                    </>
                )}
                {selectedModule && (
                    <>
                        <span>/</span>
                        <span className="font-bold text-primary">{selectedModule.title}</span>
                    </>
                )}
            </div>
        );
    };

    const renderToolbar = (title: string, onCreate: () => void, onBack?: () => void) => (
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                {onBack && (
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                )}
                <h2 className="text-2xl font-bold dark:text-white">{title}</h2>
            </div>
            <button onClick={onCreate} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30">
                <span className="material-symbols-outlined">add</span>
                <span className="hidden sm:inline">Novo</span>
            </button>
        </div>
    );

    const renderDashboard = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-blue-100 font-medium mb-1">Total de Usuários</p>
                        <h3 className="text-4xl font-bold">{stats?.totalUsers || 0}</h3>
                    </div>
                    <span className="bg-white/20 p-3 rounded-xl"><span className="material-symbols-outlined text-2xl">group</span></span>
                </div>
            </div>
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-violet-100 font-medium mb-1">Assinantes Premium</p>
                        <h3 className="text-4xl font-bold">{stats?.activeSubs || 0}</h3>
                    </div>
                    <span className="bg-white/20 p-3 rounded-xl"><span className="material-symbols-outlined text-2xl">workspace_premium</span></span>
                </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-emerald-100 font-medium mb-1">Total de Posts</p>
                        <h3 className="text-4xl font-bold">{stats?.totalPosts || 0}</h3>
                    </div>
                    <span className="bg-white/20 p-3 rounded-xl"><span className="material-symbols-outlined text-2xl">post_add</span></span>
                </div>
            </div>
        </div>
    );

    const renderLaunchConfig = () => (
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-800 p-6 max-w-2xl">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Configuração de Lançamento</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                        <p className="font-bold dark:text-white">Inscrições Abertas</p>
                        <p className="text-sm text-gray-500">Permitir novos cadastros na landing page.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={appConfig?.registrationOpen || false} onChange={e => setAppConfig(prev => prev ? { ...prev, registrationOpen: e.target.checked } : null)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2 dark:text-white">Limite Máximo de Usuários</label>
                    <input type="number" className="w-full rounded-lg border-gray-300 dark:bg-gray-700 p-2" value={appConfig?.maxUsers || 0} onChange={e => setAppConfig(prev => prev ? { ...prev, maxUsers: parseInt(e.target.value) } : null)} />
                </div>
                <button onClick={handleSaveConfig} className="bg-primary text-white px-4 py-2 rounded-lg font-bold w-full" disabled={saving}>{saving ? 'Salvando...' : 'Atualizar Configurações'}</button>
            </div>
        </div>
    );

    const renderNotificationsPanel = () => (
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-800 p-6 max-w-2xl">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Enviar Notificação Global</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold mb-2 dark:text-white">Mensagem</label>
                    <textarea className="w-full rounded-lg border-gray-300 dark:bg-gray-700 p-2" rows={3} value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} placeholder="Ex: Nova aula disponível no módulo de IA!" />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2 dark:text-white">Link (Opcional)</label>
                    <input className="w-full rounded-lg border-gray-300 dark:bg-gray-700 p-2" value={broadcastLink} onChange={e => setBroadcastLink(e.target.value)} placeholder="/courses" />
                </div>
                <button onClick={handleSendBroadcast} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-bold w-full" disabled={saving}>{saving ? 'Enviando...' : 'Enviar para Todos'}</button>
            </div>
        </div>
    );

    const renderContentArea = () => {
        if (activeTab === 'LAUNCH') return renderLaunchConfig();
        if (activeTab === 'NOTIFICATIONS') return renderNotificationsPanel();
        if (activeTab === 'COURSES') {
            return (
                <div>
                    <Breadcrumbs />
                    {!selectedCategory && <div>{renderToolbar('Categorias', () => handleOpenCreate('CATEGORY'))}{renderContent('CATEGORY', categories)}</div>}
                    {selectedCategory && !selectedCourse && <div>{renderToolbar(`Cursos em ${selectedCategory.title}`, () => handleOpenCreate('COURSE'), () => setSelectedCategory(null))}{renderContent('COURSE', categoryCourses)}</div>}
                    {selectedCourse && !selectedModule && <div>{renderToolbar(`Módulos de ${selectedCourse.title}`, () => handleOpenCreate('MODULE'), () => setSelectedCourse(null))}{renderContent('MODULE', courseModules)}</div>}
                    {selectedModule && <div>{renderToolbar(`Aulas em ${selectedModule.title}`, () => handleOpenCreate('LESSON'), () => setSelectedModule(null))}{renderContent('LESSON', moduleLessons)}</div>}
                </div>
            );
        }
        if (activeTab === 'TOOLS') return <div>{renderToolbar('Ferramentas', () => handleOpenCreate('TOOL'))}{renderContent('TOOL', tools)}</div>
        if (activeTab === 'LIVE') return <div>{renderToolbar('Lives', () => handleOpenCreate('LIVE'))}{renderContent('LIVE', lives)}</div>
        if (activeTab === 'GIVEAWAYS') return <div>{renderToolbar('Sorteios', () => handleOpenCreate('GIVEAWAY'))}{renderContent('GIVEAWAY', giveaways)}</div>

        // POSTS SECTION
        if (activeTab === 'POSTS') return (
            <div>
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Posts da Comunidade</h2>
                <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="p-3">Autor</th>
                                <th className="p-3">Conteúdo</th>
                                <th className="p-3">Tipo</th>
                                <th className="p-3">Likes</th>
                                <th className="p-3">Comentários</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map(p => (
                                <tr key={p.id} className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="p-3 dark:text-white font-medium">{p.user.name}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400 max-w-md truncate">{p.content}</td>
                                    <td className="p-3">
                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${p.type === 'QUESTION' ? 'bg-blue-100 text-blue-800' : p.type === 'SHOWCASE' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {p.type}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-500">{p.likes}</td>
                                    <td className="p-3 text-gray-500">{p.comments}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => requestDelete('POST', p.id, p.content.substring(0, 30) + '...')} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );

        // PROJECTS SECTION
        if (activeTab === 'PROJECTS') return (
            <div>
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Projetos do Portfólio</h2>
                <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="p-3">Título</th>
                                <th className="p-3">Descrição</th>
                                <th className="p-3">Tags</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allProjects.map(proj => (
                                <tr key={proj.id} className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="p-3 dark:text-white font-medium">{proj.title}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400 max-w-md truncate">{proj.description}</td>
                                    <td className="p-3">
                                        <div className="flex gap-1 flex-wrap">
                                            {proj.tags.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs">{tag}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => requestDelete('PROJECT', proj.id, proj.title)} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );

        // COMMENTS SECTION
        if (activeTab === 'COMMENTS') return (
            <div>
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Comentários</h2>
                <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="p-3">Autor</th>
                                <th className="p-3">Conteúdo</th>
                                <th className="p-3">Data</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allComments.map(comment => (
                                <tr key={comment.id} className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="p-3 dark:text-white font-medium">{comment.user.name}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400 max-w-md truncate">{comment.content}</td>
                                    <td className="p-3 text-gray-500">{comment.createdAt}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => requestDelete('COMMENT', comment.id, comment.content.substring(0, 30) + '...')} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );

        // SUGGESTIONS SECTION
        if (activeTab === 'SUGGESTIONS') return (
            <div>
                <h2 className="text-2xl font-bold mb-6 dark:text-white">💡 Sugestões da Comunidade</h2>
                <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="p-3">Título</th>
                                <th className="p-3">Categoria</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Votos</th>
                                <th className="p-3">Comentários</th>
                                <th className="p-3">Autor</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suggestions.map(suggestion => {
                                const getCategoryBadge = (cat: string) => {
                                    const configs: Record<string, { icon: string; color: string }> = {
                                        course: { icon: '📚', color: 'bg-blue-100 text-blue-700' },
                                        feature: { icon: '✨', color: 'bg-purple-100 text-purple-700' },
                                        content: { icon: '📝', color: 'bg-green-100 text-green-700' },
                                        tool: { icon: '🔧', color: 'bg-orange-100 text-orange-700' },
                                        other: { icon: '💡', color: 'bg-gray-100 text-gray-700' }
                                    };
                                    const config = configs[cat] || configs.other;
                                    return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${config.color}`}>{config.icon} {cat}</span>;
                                };

                                const getStatusBadge = (status: string) => {
                                    const configs: Record<string, { label: string; color: string }> = {
                                        pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
                                        under_review: { label: 'Em Análise', color: 'bg-blue-100 text-blue-700' },
                                        approved: { label: 'Aprovada', color: 'bg-green-100 text-green-700' },
                                        rejected: { label: 'Rejeitada', color: 'bg-red-100 text-red-700' },
                                        implemented: { label: '✅ Implementada', color: 'bg-emerald-100 text-emerald-700' }
                                    };
                                    const config = configs[status] || configs.pending;
                                    return <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${config.color}`}>{config.label}</span>;
                                };

                                return (
                                    <tr key={suggestion.id} className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="p-3 dark:text-white font-medium max-w-xs">
                                            <div className="flex items-center gap-2">
                                                {suggestion.isFeatured && <span title="Destaque">⭐</span>}
                                                <span className="truncate">{suggestion.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-3">{getCategoryBadge(suggestion.category)}</td>
                                        <td className="p-3">{getStatusBadge(suggestion.status)}</td>
                                        <td className="p-3 text-gray-600 dark:text-gray-400">
                                            <span className="font-bold text-primary">{suggestion.votesCount}</span>
                                        </td>
                                        <td className="p-3 text-gray-600 dark:text-gray-400">{suggestion.commentsCount}</td>
                                        <td className="p-3 text-gray-500 text-xs">{suggestion.user.name}</td>
                                        <td className="p-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Status Dropdown */}
                                                <select
                                                    value={suggestion.status}
                                                    onChange={(e) => handleUpdateSuggestionStatus(suggestion.id, e.target.value)}
                                                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-medium"
                                                    disabled={saving}
                                                >
                                                    <option value="pending">Pendente</option>
                                                    <option value="under_review">Em Análise</option>
                                                    <option value="approved">Aprovada</option>
                                                    <option value="rejected">Rejeitada</option>
                                                    <option value="implemented">Implementada</option>
                                                </select>

                                                {/* Featured Toggle */}
                                                <button
                                                    onClick={() => handleUpdateSuggestionStatus(suggestion.id, suggestion.status, !suggestion.isFeatured)}
                                                    className={`px-2 py-1 rounded text-xs font-bold transition-colors ${suggestion.isFeatured
                                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                    title={suggestion.isFeatured ? 'Remover destaque' : 'Destacar'}
                                                    disabled={saving}
                                                >
                                                    ⭐
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => requestDelete('SUGGESTION', suggestion.id, suggestion.title)}
                                                    className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50"
                                                    disabled={saving}
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {suggestions.length === 0 && (
                        <div className="text-center p-10 text-gray-400">
                            Nenhuma sugestão encontrada
                        </div>
                    )}
                </div>
            </div>
        );

        return null;
    }

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark font-display">
            <aside className="w-20 md:w-64 bg-white dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 flex flex-col z-20">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-center md:justify-start gap-3">
                    <span className="material-symbols-outlined text-3xl">shield_person</span>
                    <span className="hidden md:block font-bold text-xl dark:text-white">Admin</span>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                    {['DASHBOARD', 'USERS', 'COURSES', 'TOOLS', 'LIVE', 'GIVEAWAYS', 'POSTS', 'PROJECTS', 'COMMENTS', 'SUGGESTIONS', 'NOTIFICATIONS', 'LAUNCH'].map(t => (
                        <button key={t} onClick={() => { setActiveTab(t as AdminTab); setSelectedCategory(null); setSelectedCourse(null); setSelectedModule(null); }} className={`w-full text-left px-3 py-3 rounded-lg font-medium flex gap-3 ${activeTab === t ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100'}`}>
                            <span className="material-symbols-outlined">{{ DASHBOARD: 'dashboard', USERS: 'group', COURSES: 'school', TOOLS: 'construction', LIVE: 'live_tv', GIVEAWAYS: 'card_giftcard', POSTS: 'forum', PROJECTS: 'folder', COMMENTS: 'comment', SUGGESTIONS: 'lightbulb', NOTIFICATIONS: 'campaign', LAUNCH: 'rocket_launch' }[t]}</span>
                            <span className="hidden md:block capitalize">{t.toLowerCase()}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t dark:border-gray-800"><button onClick={handleLogoff} className="w-full bg-red-50 text-red-600 p-2 rounded-lg font-bold flex justify-center gap-2"><span className="material-symbols-outlined">logout</span> <span className="hidden md:inline">Sair</span></button></div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto pb-20">
                    {activeTab === 'DASHBOARD' && renderDashboard()}
                    {activeTab === 'USERS' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold dark:text-white">Usuários</h2>
                                <button onClick={() => { setModalType('USER'); setEditingItem(null); setFormData({}); setIsModalOpen(true); }} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30">
                                    <span className="material-symbols-outlined">add</span>
                                    <span className="hidden sm:inline">Novo Usuário</span>
                                </button>
                            </div>
                            <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="p-3">Nome</th>
                                            <th className="p-3">Email</th>
                                            <th className="p-3">Plano</th>
                                            <th className="p-3 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="p-3 dark:text-white font-medium">{u.name}</td>
                                                <td className="p-3 text-gray-500">{u.email}</td>
                                                <td className="p-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${u.plan === UserPlan.PREMIUM ? 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                        {u.plan === UserPlan.PREMIUM && <span className="material-symbols-outlined text-xs mr-1">workspace_premium</span>}
                                                        {u.plan || 'FREE'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right flex justify-end gap-2">
                                                    <button onClick={() => toggleUserPlan(u.id, u.plan || UserPlan.FREE)} className="text-violet-600 hover:text-violet-800 font-bold px-2 py-1 rounded hover:bg-violet-50" title="Alterar plano">
                                                        <span className="material-symbols-outlined text-sm">swap_horiz</span>
                                                    </button>
                                                    <button onClick={() => { setModalType('USER'); setEditingItem(u); setFormData({ ...u, plan: u.plan || 'FREE' }); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 font-bold px-2 py-1 rounded hover:bg-blue-50">Editar</button>
                                                    <button onClick={() => requestDelete('USER', u.id, u.name)} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50">Excluir</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {renderContentArea()}
                </div>
            </main>

            {/* MODALS */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card-dark w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b dark:border-gray-800 flex justify-between"><h2 className="text-xl font-bold dark:text-white">{editingItem ? 'Editar' : 'Novo'}</h2><button onClick={() => setIsModalOpen(false)}>✕</button></div>
                        <div className="p-6 overflow-y-auto flex-1"><form id="adminForm" onSubmit={handleSave} className="grid grid-cols-2 gap-4 text-gray-900 dark:text-white">{renderFormFields()}</form></div>
                        <div className="p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-600 font-bold hover:bg-gray-200">Cancelar</button>
                            <button type="submit" form="adminForm" className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-blue-600" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
                        </div>
                    </div>
                </div>
            )}
            {deleteTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl p-6 text-center">
                        <span className="material-symbols-outlined text-4xl text-red-600 mb-2">warning</span>
                        <h3 className="text-xl font-bold dark:text-white mb-2">Excluir {deleteTarget.name}?</h3>
                        <div className="flex gap-3 justify-center mt-6">
                            <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 rounded-xl bg-gray-100 font-bold" disabled={isDeleting}>Cancelar</button>
                            <button onClick={confirmDelete} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold" disabled={isDeleting}>{isDeleting ? '...' : 'Excluir'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminView;
