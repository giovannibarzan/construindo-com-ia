
import React, { useState, useEffect } from 'react';
import { backend } from '../../services/backend';
import { User } from '../../types';

const SettingsView: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isPublic, setIsPublic] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    
    // Delete Account State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        backend.getCurrentUser().then(u => {
            setUser(u);
            if (u) setIsPublic(u.isPublicProfile ?? true);
        });
        
        // Carregar tema salvo
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }, []);

    const handleTogglePrivacy = async () => {
        const newValue = !isPublic;
        setIsPublic(newValue);
        await backend.updateUserPrivacy(newValue);
    };

    const handleToggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const handleDeleteAccount = async () => {
        if (confirmText !== 'DELETAR') return;
        
        setIsDeleting(true);
        try {
            await backend.deleteMyAccount();
            // A navegação ocorrerá automaticamente através do listener de auth no App.tsx
        } catch (e: any) {
            console.error(e);
            alert("Erro ao excluir conta: " + (e.message || "Tente novamente."));
            setIsDeleting(false);
        }
    };

    if (!user) return <div>Carregando...</div>;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h2>
             
             <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                 <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Aparência</h3>
                 
                 <div className="flex items-center justify-between">
                     <div>
                         <p className="font-medium text-gray-900 dark:text-white">Tema Escuro</p>
                         <p className="text-sm text-gray-500">Alternar entre tema claro e escuro.</p>
                     </div>
                     <button 
                        onClick={handleToggleTheme}
                        className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                     >
                         <div className={`absolute top-1 left-1 bg-white size-4 rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </button>
                 </div>
             </div>

             <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                 <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Privacidade</h3>
                 
                 <div className="flex items-center justify-between">
                     <div>
                         <p className="font-medium text-gray-900 dark:text-white">Perfil Público</p>
                         <p className="text-sm text-gray-500">Permitir que visitantes vejam seu perfil.</p>
                     </div>
                     <button 
                        onClick={handleTogglePrivacy}
                        className={`w-12 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                     >
                         <div className={`absolute top-1 left-1 bg-white size-4 rounded-full transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </button>
                 </div>
             </div>

             <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                 <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Conta</h3>
                 <p className="text-gray-500 mb-4">Gerencie sua assinatura e dados pessoais.</p>
                 <button 
                    onClick={() => {
                        setConfirmText('');
                        setShowDeleteModal(true);
                    }}
                    className="text-red-500 border border-red-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                 >
                     Excluir Conta
                 </button>
             </div>

             {/* DELETE MODAL */}
             {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-red-200 dark:border-red-900 animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                                <span className="material-symbols-outlined text-3xl text-red-600">warning</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Zona de Perigo</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                                Tem certeza absoluta? Essa ação é <strong>irreversível</strong>. Todos os seus posts, comentários e progresso nos cursos serão apagados permanentemente.
                            </p>
                            
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Digite "DELETAR" para confirmar</label>
                                <input 
                                    type="text" 
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                    placeholder="DELETAR"
                                    className="w-full text-center tracking-widest font-bold border-2 border-red-100 dark:border-red-900/50 rounded-lg py-2 focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
                                />
                            </div>

                            <div className="flex gap-3 justify-center">
                                <button 
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-5 py-2.5 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 font-bold transition-colors w-full"
                                    disabled={isDeleting}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleDeleteAccount}
                                    disabled={confirmText !== 'DELETAR' || isDeleting}
                                    className="px-5 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold shadow-lg shadow-red-500/30 transition-transform active:scale-95 w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                                >
                                    {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

export default SettingsView;
