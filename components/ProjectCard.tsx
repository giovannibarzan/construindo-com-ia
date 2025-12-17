
import React, { useState } from 'react';
import { Project } from '../types';
import { backend } from '../services/backend';
import ConfirmModal from './ConfirmModal';

interface ProjectCardProps {
    project: Project;
    isOwner: boolean;
    onDelete: (id: string) => void;
    onEdit?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isOwner, onDelete, onEdit }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleDelete = async () => {
        console.log('🗑️ handleDelete chamado para projeto:', project.id, project.title);
        console.log('✅ Usuário confirmou, iniciando exclusão...');

        setIsDeleting(true);
        setShowConfirmModal(false);

        try {
            console.log('📡 Chamando backend.deleteProject...');
            await backend.deleteProject(project.id);
            console.log('✅ Projeto deletado do banco com sucesso!');

            console.log('📢 Chamando onDelete callback...');
            onDelete(project.id);
            console.log('✅ Callback onDelete executado!');
        } catch (error: any) {
            console.error('❌ ERRO ao excluir projeto:', error);
            console.error('Detalhes do erro:', error.message, error.stack);
            alert("Erro ao excluir: " + (error.message || 'Erro desconhecido'));
        } finally {
            setIsDeleting(false);
            console.log('🏁 handleDelete finalizado');
        }
    };

    return (
        <div className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            {/* Project Thumbnail */}
            <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                {project.imageUrl ? (
                    <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                        <span className="material-symbols-outlined text-6xl">image</span>
                    </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform" title="Ver Demo">
                            <span className="material-symbols-outlined block">visibility</span>
                        </a>
                    )}
                    {project.repoUrl && (
                        <a href={project.repoUrl} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform" title="Ver Código">
                            <span className="material-symbols-outlined block">code</span>
                        </a>
                    )}
                </div>

                {isOwner && (
                    <div className="absolute top-2 right-2 flex gap-2">
                        {onEdit && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(project); }}
                                className="p-1.5 bg-blue-500/90 hover:bg-blue-600 text-white rounded-md transition-all"
                                title="Editar Projeto"
                            >
                                <span className="material-symbols-outlined !text-sm block">edit</span>
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); console.log('Botão excluir clicado!', project.id); setShowConfirmModal(true); }}
                            disabled={isDeleting}
                            className="p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-md transition-all disabled:opacity-50"
                            title="Excluir Projeto"
                        >
                            <span className="material-symbols-outlined !text-sm block">delete</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 truncate">{project.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                    {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                title="Excluir Projeto?"
                message={`Tem certeza que deseja excluir "${project.title}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setShowConfirmModal(false)}
            />
        </div>
    );
};

export default ProjectCard;
