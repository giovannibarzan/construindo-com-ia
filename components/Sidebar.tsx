
import React, { useState } from 'react';
import { NavItem, User } from '../types';
import { backend } from '../services/backend';
import { useNavigate, useLocation } from 'react-router-dom';

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'notifications', label: 'Notificações', icon: 'notifications' },
  { id: 'courses', label: 'Cursos', icon: 'school' },
  { id: 'tools', label: 'Ferramentas', icon: 'construction' },
  { id: 'suggestions', label: 'Sugestões', icon: 'lightbulb' },
  { id: 'giveaways', label: 'Sorteios', icon: 'card_giftcard' },
];

interface SidebarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentUser: User | null;
  unreadCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isDarkMode, toggleTheme, currentUser, unreadCount = 0 }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await backend.signOut();
      // O App.tsx irá detectar o logout via supabase auth listener
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const isActive = (pathId: string) => {
    // Mapeamento de IDs para rotas reais
    if (pathId === 'home') return location.pathname === '/home' || location.pathname === '/';
    return location.pathname.startsWith(`/${pathId}`);
  };

  const handleNavigation = (id: string) => {
    navigate(`/${id}`);
  };

  return (
    <aside
      className={`sticky top-0 h-screen hidden md:flex flex-col justify-between border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-card-dark transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} p-4 z-10`}
    >
      <div className="flex flex-col gap-8">
        {/* Header / Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-3 gap-3'}`}>
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0 cursor-pointer"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB09iQWdlPxcemLjF7xg8jXmd4ago2G_zAGV0YGS_UJEc3GVUbU-vz5uQRyMdjLkmjG9NN779qNpSByoe0e_7ZcHCHmNlemGQavXZIdg-Ml-8VAaOtDHI_zPxGpdnq8tl0qCBOUgo62cHws-E1RBxIpiQXzy8XP64tAx3S6kn_KGKIgZvcWHjP642ZpWovjuVfsGeXBI2GaIAAwDl4FPa837jS4JlPWvCa9VcUhWGRMKWWIDEWTvkpNjoB-P9gNTFUWUpYI-sMn9J2T")' }}
            onClick={() => navigate('/')}
          ></div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-base font-bold text-gray-900 dark:text-white whitespace-nowrap">Construindo com IA</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Community</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.id);
            // Hide everything except Tools for guests
            if (!currentUser && item.id !== 'tools') return null;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`relative flex items-center gap-3 rounded-lg py-3 transition-colors ${active
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  } ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
                title={isCollapsed ? item.label : ''}
              >
                <div className="relative">
                  <span className={`material-symbols-outlined ${active ? 'fill' : ''}`}>{item.icon}</span>
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900 ${isCollapsed ? 'top-0 right-0' : ''}`}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {!isCollapsed && <p className="text-sm font-semibold">{item.label}</p>}
              </button>
            )
          })}

          {/* Admin Panel Link */}
          {currentUser && currentUser.isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className={`flex items-center gap-3 rounded-lg py-3 transition-colors ${location.pathname === '/admin'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                } ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
              title={isCollapsed ? 'Admin' : ''}
            >
              <span className="material-symbols-outlined">shield_person</span>
              {!isCollapsed && <p className="text-sm font-semibold">Painel Admin</p>}
            </button>
          )}

          {/* Exclusive Live Button (Only for Users) */}
          {currentUser && (
            <button
              onClick={() => navigate('/live')}
              className={`flex items-center gap-3 rounded-lg py-3 transition-all relative overflow-hidden group ${location.pathname === '/live'
                ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                } ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-red-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className={`material-symbols-outlined ${location.pathname === '/live' ? 'fill' : ''} text-red-500 animate-pulse`}>live_tv</span>
              {!isCollapsed && <p className="text-sm font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Live Exclusiva</p>}
            </button>
          )}
        </nav>
      </div>

      <div className="flex flex-col gap-1 border-t border-gray-200 pt-4 dark:border-gray-800">

        {currentUser ? (
          <>
            <button
              onClick={() => navigate('/profile')}
              className={`flex items-center gap-3 rounded-lg py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <span className="material-symbols-outlined">person</span>
              {!isCollapsed && <p className="text-sm font-medium">Perfil</p>}
            </button>

            <button
              onClick={() => navigate('/settings')}
              className={`flex items-center gap-3 rounded-lg py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <span className="material-symbols-outlined">settings</span>
              {!isCollapsed && <p className="text-sm font-medium">Configurações</p>}
            </button>

            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 rounded-lg py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <span className="material-symbols-outlined">logout</span>
              {!isCollapsed && <p className="text-sm font-medium">Sair</p>}
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className={`mb-2 flex items-center justify-center gap-2 rounded-full bg-gray-900 dark:bg-white py-3 text-white dark:text-black transition-transform hover:opacity-90 active:scale-95 ${isCollapsed ? 'px-0' : 'px-4'}`}
          >
            <span className="material-symbols-outlined">login</span>
            {!isCollapsed && <span className="text-sm font-bold">Entrar</span>}
          </button>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-4 flex w-full items-center justify-center rounded-lg py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <span className="material-symbols-outlined">
            {isCollapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
