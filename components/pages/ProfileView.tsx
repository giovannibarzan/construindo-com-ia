
import React, { useState, useEffect } from 'react';
import { User, Post, Project } from '../../types';
import PostCard from '../PostCard';
import ProjectCard from '../ProjectCard';
import ImageUpload from '../ImageUpload';
import ImageUploadWithCrop from '../ImageUploadWithCrop';
import { backend } from '../../services/backend';

interface ProfileViewProps {
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
    onUserUpdated?: (updatedUser: User) => void; // Nova prop callback
}

type TabType = 'POSTS' | 'PORTFOLIO' | 'COURSES';

const ProfileView: React.FC<ProfileViewProps> = ({ onShowToast, onUserUpdated }) => {
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('POSTS');

    // Create Project State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [newProject, setNewProject] = useState({ title: '', description: '', imageUrl: '', demoUrl: '', repoUrl: '', tags: '' });
    const [isSavingProject, setIsSavingProject] = useState(false);

    // Edit Profile State
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({ name: '', handle: '', bio: '', avatarUrl: '', coverUrl: '' });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const u = await backend.getCurrentUser();
        setUser(u);
        if (u) {
            const [p, proj] = await Promise.all([
                backend.getPosts(),
                backend.getUserProjects(u.id)
            ]);
            setPosts(p.filter(post => post.user.id === u.id));
            setProjects(proj);
        }
    };

    const handleOpenEditProfile = () => {
        if (!user) return;
        setEditFormData({
            name: user.name,
            handle: user.handle || '',
            bio: user.bio || '',
            avatarUrl: user.avatarUrl,
            coverUrl: user.coverUrl || ''
        });
        setIsEditProfileOpen(true);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        console.log('Atualizando perfil com dados:', editFormData);

        setIsUpdatingProfile(true);
        try {
            const updatedUser = await backend.updateProfile(user.id, editFormData);
            console.log('Perfil atualizado:', updatedUser);

            setUser(updatedUser);

            // CRITICAL: Atualiza o estado global no App.tsx
            if (onUserUpdated) onUserUpdated(updatedUser);

            setIsEditProfileOpen(false);
            if (onShowToast) onShowToast("Perfil atualizado com sucesso!", "success");

            // Recarregar dados do perfil para garantir que está atualizado
            await loadData();
        } catch (error: any) {
            console.error('Erro ao atualizar perfil:', error);
            if (onShowToast) onShowToast("Erro ao atualizar perfil: " + error.message, "error");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleDeletePost = (postId: string) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
    };


    const handleDeleteProject = async (projectId: string) => {
        // ProjectCard já faz a confirmação e deleta do banco
        // Aqui só precisamos atualizar o estado local e deletar a imagem
        try {
            const projectToDelete = projects.find(p => p.id === projectId);

            // Deletar imagem do storage se existir
            if (projectToDelete?.imageUrl) {
                console.log('Deletando imagem do projeto:', projectToDelete.imageUrl);
                try {
                    await backend.deleteImage(projectToDelete.imageUrl);
                } catch (imgError) {
                    console.error('Erro ao deletar imagem:', imgError);
                }
            }

            // Remover do estado local
            setProjects(prev => prev.filter(p => p.id !== projectId));

            if (onShowToast) onShowToast("Projeto removido com sucesso!", "success");
        } catch (error: any) {
            console.error('Erro ao processar exclusão:', error);
        }
    };

    const handleSaveProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProject.title.trim()) return;

        console.log('Salvando projeto com dados:', newProject);

        setIsSavingProject(true);
        try {
            const tagsArray = newProject.tags.split(',').map(t => t.trim()).filter(Boolean);

            if (editingProject) {
                // Editar projeto existente
                // TODO: Implementar backend.updateProject quando disponível
                console.log('Editando projeto:', editingProject.id, newProject);
                if (onShowToast) onShowToast("Funcionalidade de edição em desenvolvimento", "info");
            } else {
                // Criar novo projeto
                console.log('Criando projeto com imageUrl:', newProject.imageUrl);
                const created = await backend.createProject({
                    ...newProject,
                    tags: tagsArray
                });
                console.log('Projeto criado:', created);

                // Recarregar projetos do backend para garantir sincronização
                if (user) {
                    const updatedProjects = await backend.getUserProjects(user.id);
                    setProjects(updatedProjects);
                }

                if (onShowToast) onShowToast("Projeto adicionado ao portfólio!", "success");
            }

            setIsModalOpen(false);
            setEditingProject(null);
            setNewProject({ title: '', description: '', imageUrl: '', demoUrl: '', repoUrl: '', tags: '' });
        } catch (error: any) {
            console.error('Erro ao salvar projeto:', error);
            if (onShowToast) onShowToast("Erro ao salvar projeto: " + error.message, "error");
        } finally {
            setIsSavingProject(false);
        }
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setNewProject({
            title: project.title,
            description: project.description || '',
            imageUrl: project.imageUrl || '',
            demoUrl: project.demoUrl || '',
            repoUrl: project.repoUrl || '',
            tags: project.tags.join(', ')
        });
        setIsModalOpen(true);
    };

    if (!user) return <div className="p-10 text-center animate-pulse">Carregando perfil...</div>;

    return (
        <div className="flex flex-col animate-in fade-in duration-300 gap-6 pb-20">

            {/* Profile Header */}
            <div className="bg-white dark:bg-card-dark rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                {/* Cover Image */}
                <div className="h-48 w-full relative bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    {user.coverUrl ? (
                        <img
                            src={user.coverUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                console.error('Erro ao carregar capa:', user.coverUrl);
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : null}
                    <button
                        onClick={handleOpenEditProfile}
                        className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/60 transition-colors z-10"
                    >
                        <span className="material-symbols-outlined block">edit</span>
                    </button>
                </div>

                {/* User Info */}
                <div className="px-8 pb-8 pt-0 relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-6">
                        <div className="size-32 rounded-3xl border-4 border-white dark:border-card-dark bg-gray-100 shadow-md overflow-hidden relative">
                            <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    console.error('Erro ao carregar avatar:', user.avatarUrl);
                                    e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=0D8ABC&color=fff';
                                }}
                            />
                        </div>
                        <div className="flex gap-3 mt-4 sm:mt-0">
                            <button
                                onClick={handleOpenEditProfile}
                                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                            >
                                Editar Perfil
                            </button>
                            <button className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 text-sm">
                                Compartilhar
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{user.name}</h1>
                            {user.plan === 'PREMIUM' && (
                                <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                                    <span className="material-symbols-outlined !text-xs">verified</span> Premium
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 font-medium">{user.handle}</p>

                        <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl leading-relaxed">
                            {user.bio}
                        </p>

                        <div className="flex gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 dark:text-white text-lg">{user.following || 0}</span>
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Seguindo</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 dark:text-white text-lg">{user.followers || 0}</span>
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Seguidores</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 dark:text-white text-lg">{projects.length}</span>
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Projetos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div>
                <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('POSTS')}
                        className={`px-6 py-4 text-sm font-bold text-center relative hover:text-primary transition-colors whitespace-nowrap ${activeTab === 'POSTS' ? 'text-primary' : 'text-gray-500'}`}
                    >
                        Publicações
                        {activeTab === 'POSTS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('PORTFOLIO')}
                        className={`px-6 py-4 text-sm font-bold text-center relative hover:text-primary transition-colors whitespace-nowrap ${activeTab === 'PORTFOLIO' ? 'text-primary' : 'text-gray-500'}`}
                    >
                        Portfólio
                        {activeTab === 'PORTFOLIO' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('COURSES')}
                        className={`px-6 py-4 text-sm font-bold text-center relative hover:text-primary transition-colors whitespace-nowrap ${activeTab === 'COURSES' ? 'text-primary' : 'text-gray-500'}`}
                    >
                        Cursos & Certificados
                        {activeTab === 'COURSES' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
                    </button>
                </div>

                {/* TAB: POSTS */}
                {activeTab === 'POSTS' && (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {posts.length > 0 ? posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                currentUser={user}
                                onDelete={handleDeletePost}
                                onShowToast={onShowToast}
                            />
                        )) : (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                <span className="material-symbols-outlined text-gray-300 text-5xl mb-2">article</span>
                                <p className="text-gray-500">Nenhuma publicação ainda.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: PORTFOLIO */}
                {activeTab === 'PORTFOLIO' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white">Meus Projetos ({projects.length})</h3>
                            <button
                                onClick={() => {
                                    setEditingProject(null);
                                    setNewProject({ title: '', description: '', imageUrl: '', demoUrl: '', repoUrl: '', tags: '' });
                                    setIsModalOpen(true);
                                }}
                                className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined !text-lg">add</span> Novo Projeto
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {projects.length > 0 ? projects.map(proj => (
                                <ProjectCard
                                    key={proj.id}
                                    project={proj}
                                    isOwner={true}
                                    onDelete={handleDeleteProject}
                                    onEdit={handleEditProject}
                                />
                            )) : (
                                <div className="col-span-full text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                    <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">rocket_launch</span>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">Seu portfólio está vazio</h4>
                                    <p className="text-gray-500 mb-6">Comece a adicionar os projetos que você desenvolveu para mostrar para a comunidade.</p>
                                    <button
                                        onClick={() => {
                                            setEditingProject(null);
                                            setNewProject({ title: '', description: '', imageUrl: '', demoUrl: '', repoUrl: '', tags: '' });
                                            setIsModalOpen(true);
                                        }}
                                        className="text-primary font-bold hover:underline"
                                    >
                                        Adicionar primeiro projeto
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: COURSES */}
                {activeTab === 'COURSES' && (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">school</span>
                        <p className="text-gray-500 font-medium">Você ainda não completou nenhum curso.</p>
                        <p className="text-sm text-gray-400 mt-2">Vá para a aba Cursos para começar a aprender.</p>
                    </div>
                )}
            </div>

            {/* EDIT PROFILE MODAL */}
            {isEditProfileOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar Perfil</h2>
                            <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="editProfileForm" onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nome Completo *</label>
                                    <input
                                        required
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                        value={editFormData.name}
                                        onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Handle (Usuário) *</label>
                                    <input
                                        required
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                        value={editFormData.handle}
                                        onChange={e => setEditFormData({ ...editFormData, handle: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                                    <textarea
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:ring-primary focus:border-primary resize-none"
                                        rows={3}
                                        value={editFormData.bio}
                                        onChange={e => setEditFormData({ ...editFormData, bio: e.target.value })}
                                    />
                                </div>

                                {/* IMAGENS UPLOAD COM CROP */}
                                <ImageUploadWithCrop
                                    label="Foto de Perfil"
                                    currentImageUrl={editFormData.avatarUrl}
                                    folder="avatars"
                                    aspectRatio={1}
                                    onImageUploaded={(url) => setEditFormData({ ...editFormData, avatarUrl: url })}
                                />

                                <ImageUploadWithCrop
                                    label="Imagem de Capa"
                                    currentImageUrl={editFormData.coverUrl}
                                    folder="covers"
                                    aspectRatio={16 / 9}
                                    onImageUploaded={(url) => setEditFormData({ ...editFormData, coverUrl: url })}
                                />
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setIsEditProfileOpen(false)}
                                className="px-4 py-2 rounded-lg text-gray-600 font-bold hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="editProfileForm"
                                disabled={isUpdatingProfile}
                                className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/30 disabled:opacity-70"
                            >
                                {isUpdatingProfile ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW PROJECT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingProject ? 'Editar Projeto' : 'Adicionar Projeto'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="projectForm" onSubmit={handleSaveProject} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nome do Projeto *</label>
                                    <input
                                        required
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                        placeholder="Ex: Clone do Netflix"
                                        value={newProject.title}
                                        onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                                    <textarea
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:ring-primary focus:border-primary resize-none"
                                        rows={3}
                                        placeholder="O que o projeto faz? Quais tecnologias usou?"
                                        value={newProject.description}
                                        onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                    />
                                </div>

                                {/* PROJECT IMAGE UPLOAD WITH CROP */}
                                <ImageUploadWithCrop
                                    label="Imagem de Capa (Screenshot)"
                                    currentImageUrl={newProject.imageUrl}
                                    folder="projects"
                                    aspectRatio={16 / 9}
                                    onImageUploaded={(url) => setNewProject({ ...newProject, imageUrl: url })}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Demo URL</label>
                                        <input
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                            placeholder="https://app.vercel..."
                                            value={newProject.demoUrl}
                                            onChange={e => setNewProject({ ...newProject, demoUrl: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">GitHub URL</label>
                                        <input
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                            placeholder="https://github.com/..."
                                            value={newProject.repoUrl}
                                            onChange={e => setNewProject({ ...newProject, repoUrl: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tags (separadas por vírgula)</label>
                                    <input
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                        placeholder="React, Tailwind, AI"
                                        value={newProject.tags}
                                        onChange={e => setNewProject({ ...newProject, tags: e.target.value })}
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-gray-600 font-bold hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="projectForm"
                                disabled={isSavingProject}
                                className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/30 disabled:opacity-70"
                            >
                                {isSavingProject ? 'Salvando...' : 'Salvar Projeto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileView;
