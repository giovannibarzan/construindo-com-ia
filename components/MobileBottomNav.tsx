
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';
import { NAV_ITEMS } from './Sidebar';

interface MobileBottomNavProps {
    currentUser: User | null;
    unreadCount?: number;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentUser, unreadCount = 0 }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    if (!currentUser) return null;

    const isActive = (pathId: string) => {
        if (pathId === 'home') return location.pathname === '/home' || location.pathname === '/';
        return location.pathname.startsWith(`/${pathId}`);
    };

    const handleNavigation = (id: string) => {
        navigate(`/${id}`);
    };

    // Show only main 4 nav items + profile
    const mainNavItems = NAV_ITEMS.filter(item =>
        ['home', 'notifications', 'courses', 'tools', 'suggestions'].includes(item.id)
    );

    return (
        <>
            {/* Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-card-dark border-t border-gray-200 dark:border-gray-800 z-50 safe-area-inset-bottom">
                <div className="flex items-center justify-around px-2 py-2">
                    {mainNavItems.map((item) => {
                        const active = isActive(item.id);
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigation(item.id)}
                                className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] ${active
                                    ? 'text-primary'
                                    : 'text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                <div className="relative">
                                    <span className={`material-symbols-outlined !text-2xl ${active ? 'fill' : ''}`}>
                                        {item.icon}
                                    </span>
                                    {item.id === 'notifications' && unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}

                    {/* Profile Button */}
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] text-gray-600 dark:text-gray-400"
                    >
                        <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.name}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-[10px] font-medium">Perfil</span>
                    </button>
                </div>
            </nav>

            {/* Profile Menu Overlay */}
            {showProfileMenu && (
                <>
                    <div
                        className="md:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                        onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-card-dark rounded-t-2xl z-50 animate-in slide-in-from-bottom duration-300 safe-area-inset-bottom">
                        <div className="p-6 space-y-4">
                            {/* User Info */}
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
                                <img
                                    src={currentUser.avatarUrl}
                                    alt={currentUser.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-white truncate">
                                        {currentUser.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {currentUser.handle}
                                    </p>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        navigate('/profile');
                                        setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                                >
                                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">person</span>
                                    <span className="font-medium text-gray-900 dark:text-white">Meu Perfil</span>
                                </button>

                                <button
                                    onClick={() => {
                                        navigate('/settings');
                                        setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                                >
                                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">settings</span>
                                    <span className="font-medium text-gray-900 dark:text-white">Configurações</span>
                                </button>

                                {currentUser.isAdmin && (
                                    <button
                                        onClick={() => {
                                            navigate('/admin');
                                            setShowProfileMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left"
                                    >
                                        <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">shield_person</span>
                                        <span className="font-medium text-indigo-600 dark:text-indigo-400">Painel Admin</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        navigate('/live');
                                        setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                                >
                                    <span className="material-symbols-outlined text-red-600 dark:text-red-400">live_tv</span>
                                    <span className="font-medium text-red-600 dark:text-red-400">Live Exclusiva</span>
                                </button>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowProfileMenu(false)}
                                className="w-full py-3 text-center text-gray-500 dark:text-gray-400 font-medium"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default MobileBottomNav;
