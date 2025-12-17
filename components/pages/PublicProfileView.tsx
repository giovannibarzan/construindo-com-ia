import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { backend } from '../../services/backend';
import ProfileView from './ProfileView';

const PublicProfileView: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!username) {
            navigate('/feed');
            return;
        }

        backend.getUserByHandle(username).then(u => {
            setUser(u);
            setLoading(false);
        });
    }, [username, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando perfil...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center py-20 px-4">
                    <span className="material-symbols-outlined text-gray-300 text-8xl mb-4 block">person_off</span>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Usuário não encontrado</h2>
                    <p className="text-gray-500 mb-6">Este perfil não existe ou foi removido.</p>
                    <button 
                        onClick={() => navigate('/feed')}
                        className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
                    >
                        Voltar para o Feed
                    </button>
                </div>
            </div>
        );
    }

    if (!user.isPublicProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center py-20 px-4 max-w-md">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full size-24 flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-gray-400 text-6xl">lock</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Perfil Privado</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Este usuário optou por manter o perfil privado. Apenas informações básicas estão disponíveis.
                    </p>
                    <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
                        <div className="flex items-center gap-4">
                            <img 
                                src={user.avatarUrl} 
                                alt={user.name}
                                className="size-16 rounded-full"
                            />
                            <div className="text-left">
                                <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.handle}</p>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/feed')}
                        className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Voltar para o Feed
                    </button>
                </div>
            </div>
        );
    }

    // Se o perfil é público, usar o ProfileView normal
    return <ProfileView initialUser={user} isPublicView={true} />;
};

export default PublicProfileView;
