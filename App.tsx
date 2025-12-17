
import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import { supabase } from './lib/supabase';
import { backend } from './services/backend';
import { User } from './types';

// --- LAZY IMPORTS ---
const FeedView = React.lazy(() => import('./components/pages/FeedView'));
const NotificationsView = React.lazy(() => import('./components/pages/NotificationsView'));
const CoursesView = React.lazy(() => import('./components/pages/CoursesView'));
const ToolsView = React.lazy(() => import('./components/pages/ToolsView'));
const GiveawaysView = React.lazy(() => import('./components/pages/GiveawaysView'));
const ProfileView = React.lazy(() => import('./components/pages/ProfileView'));
const LoginView = React.lazy(() => import('./components/pages/LoginView'));
const SettingsView = React.lazy(() => import('./components/pages/SettingsView'));
const LiveView = React.lazy(() => import('./components/pages/LiveView'));
const AdminView = React.lazy(() => import('./components/pages/AdminView'));
const LandingPage = React.lazy(() => import('./components/LandingPage'));
const PostDetailView = React.lazy(() => import('./components/pages/PostDetailView'));
const SuggestionsView = React.lazy(() => import('./components/pages/SuggestionsView'));
const SuggestionDetailView = React.lazy(() => import('./components/pages/SuggestionDetailView'));

// Componente de Loading simples para o Suspense
const PageLoader = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] animate-in fade-in">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
);

// --- COMPONENTES AUXILIARES DE ROTA ---

// Rota Protegida (Requer Login)
interface ProtectedRouteProps {
    children: React.ReactNode;
    currentUser: User | null;
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, currentUser }) => {
    if (!currentUser) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

// Rota de Admin (Requer Admin)
interface AdminRouteProps {
    children: React.ReactNode;
    currentUser: User | null;
}
const AdminRoute: React.FC<AdminRouteProps> = ({ children, currentUser }) => {
    if (!currentUser?.isAdmin) return <Navigate to="/home" replace />;
    return <>{children}</>;
};

// Layout Principal Logado (Sidebar + Main)
interface MainLayoutProps {
    children: React.ReactNode;
    isDarkMode: boolean;
    toggleTheme: () => void;
    currentUser: User | null;
    unreadCount: number;
}
const MainLayout: React.FC<MainLayoutProps> = ({ children, isDarkMode, toggleTheme, currentUser, unreadCount }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <div className="flex h-full grow flex-row">
                <Sidebar
                    isDarkMode={isDarkMode}
                    toggleTheme={toggleTheme}
                    currentUser={currentUser}
                    unreadCount={unreadCount}
                />
                <main className="flex-1 w-full max-w-6xl mx-auto py-6 px-6 pb-20 md:pb-6 overflow-y-auto">
                    <Suspense fallback={<PageLoader />}>
                        {children}
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Navigation Hooks
    const navigate = useNavigate();
    const location = useLocation();

    // Toast State
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    // Notification Badge State
    const [unreadCount, setUnreadCount] = useState(0);

    // Helper para mostrar Toast
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
    };

    // Helper para navegar para um post (chamado pelo FeedView)
    const handlePostClick = (postId: string) => {
        navigate(`/post/${postId}`);
    };

    // Helper para atualizar o usuário globalmente (chamado pelo ProfileView)
    const handleUserUpdated = (updatedUser: User) => {
        setCurrentUser(updatedUser);
    };

    // Theme Init - Removed automatic dark mode detection
    // App now defaults to light mode, users can toggle manually

    useEffect(() => {
        if (isDarkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDarkMode]);

    // --- AUTH INITIALIZATION ---
    useEffect(() => {
        let isMounted = true;

        const resolveUser = async () => {
            try {
                const user = await backend.getCurrentUser();

                if (isMounted) {
                    setCurrentUser(user);

                    // --- ROTEAMENTO DETERMINÍSTICO INICIAL ---
                    // Se o usuário acessou "/" (root), decidimos para onde ele vai
                    if (location.pathname === '/') {
                        if (user) {
                            if (user.isAdmin) {
                                navigate('/admin');
                            } else {
                                navigate('/home');
                            }
                        }
                        // Se não tiver user, fica no "/" (Landing)
                    }

                    // Proteção básica para /admin
                    if (location.pathname.startsWith('/admin') && !location.pathname.includes('login') && user && !user.isAdmin) {
                        navigate('/home');
                    }

                    if (user) {
                        backend.getNotifications().then(notifs => {
                            if (isMounted) setUnreadCount(notifs.filter(n => !n.read).length);
                        });
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) setLoadingAuth(false);
            }
        };

        resolveUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
            if (!isMounted) return;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                resolveUser();
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                setLoadingAuth(false);
                setUnreadCount(0);
                navigate('/'); // Volta para Landing Page ao sair
            }
        });

        return () => {
            isMounted = false;
            authListener.subscription.unsubscribe();
        };
    }, []);

    // --- REALTIME NOTIFICATIONS SUBSCRIPTION ---
    useEffect(() => {
        if (!currentUser) return;

        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${currentUser.id}`
                },
                (payload) => {
                    setUnreadCount(prev => prev + 1);
                    showToast("Nova notificação recebida!", "info");
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser?.id]);

    useEffect(() => {
        if (location.pathname === '/notifications') {
            setUnreadCount(0);
        }
    }, [location.pathname]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    // --- RENDER ---

    if (loadingAuth) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-background-dark text-primary gap-4">
                <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-lg animate-pulse">Iniciando...</p>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* PUBLIC ROUTES */}
                    <Route path="/" element={!currentUser ? <LandingPage /> : <Navigate to={currentUser.isAdmin ? "/admin" : "/home"} />} />
                    <Route path="/login" element={
                        <div className="relative min-h-screen bg-white dark:bg-gray-900">
                            <button onClick={() => navigate('/')} className="absolute top-4 left-4 z-50 flex items-center gap-2 text-gray-500 hover:text-primary"><span className="material-symbols-outlined">arrow_back</span> Voltar</button>
                            <LoginView />
                        </div>
                    } />
                    <Route path="/admin-login" element={
                        <div className="relative min-h-screen bg-white dark:bg-gray-900">
                            <button onClick={() => navigate('/')} className="absolute top-4 left-4 z-50 flex items-center gap-2 text-gray-500 hover:text-primary"><span className="material-symbols-outlined">arrow_back</span> Voltar</button>
                            <LoginView isAdminLogin={true} />
                        </div>
                    } />

                    {/* TOOLS (Public + Private Layout) */}
                    <Route path="/tools" element={
                        currentUser ? (
                            <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentUser={currentUser} unreadCount={unreadCount}>
                                <ToolsView currentUser={currentUser} />
                            </MainLayout>
                        ) : (
                            <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
                                <main className="flex-1 w-full max-w-7xl mx-auto py-6 px-6 lg:px-12 pb-20 md:pb-6 overflow-y-auto">
                                    <nav className="mb-6">
                                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-primary font-bold"><span className="material-symbols-outlined">arrow_back</span> Voltar para Home</button>
                                    </nav>
                                    <ToolsView currentUser={null} />
                                </main>
                            </div>
                        )
                    } />
                    {/* Tools with slug for SEO */}
                    <Route path="/tools/:slug" element={
                        currentUser ? (
                            <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentUser={currentUser} unreadCount={unreadCount}>
                                <ToolsView currentUser={currentUser} />
                            </MainLayout>
                        ) : (
                            <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
                                <main className="flex-1 w-full max-w-7xl mx-auto py-6 px-6 lg:px-12 pb-20 md:pb-6 overflow-y-auto">
                                    <nav className="mb-6">
                                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-primary font-bold"><span className="material-symbols-outlined">arrow_back</span> Voltar para Home</button>
                                    </nav>
                                    <ToolsView currentUser={null} />
                                </main>
                            </div>
                        )
                    } />

                    {/* ADMIN ROUTE */}
                    <Route path="/admin" element={
                        <AdminRoute currentUser={currentUser}>
                            <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-white">
                                <AdminView onNavigateToSite={() => window.location.reload()} />
                            </div>
                        </AdminRoute>
                    } />

                    {/* PROTECTED APP ROUTES */}
                    <Route path="/home" element={
                        <ProtectedRoute currentUser={currentUser}>
                            <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentUser={currentUser} unreadCount={unreadCount}>
                                <FeedView currentUser={currentUser!} onShowToast={showToast} onPostClick={handlePostClick} />
                            </MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/post/:id" element={
                        <ProtectedRoute currentUser={currentUser}>
                            <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentUser={currentUser} unreadCount={unreadCount}>
                                <PostDetailView currentUser={currentUser!} onShowToast={showToast} />
                            </MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                        <ProtectedRoute currentUser={currentUser}>
                            <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentUser={currentUser} unreadCount={unreadCount}>
                                <NotificationsView />
                            </MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/courses" element={
                        <ProtectedRoute currentUser={currentUser}>
                            <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentUser={currentUser} unreadCount={unreadCount}>
                                <CoursesView currentUser={currentUser} />
                            </MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/giveaways" element={
                        <ProtectedRoute currentUser={currentUser}>
                            <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentUser={currentUser} unreadCount={unreadCount}>
                                <GiveawaysView />
                            </MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute currentUser={currentUser}>
                            <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentUser={currentUser} unreadCount={unreadCount}>
                                <ProfileView onShowToast={showToast} onUserUpdated={handleUserUpdated} />
                            </MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                        <ProtectedRoute currentUser={currentUser}>
                            <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentUser={currentUser} unreadCount={unreadCount}>
                                <SettingsView />
                            </MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/live" element={
                        <ProtectedRoute currentUser={currentUser}>
                            <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentUser={currentUser} unreadCount={unreadCount}>
                                <LiveView />
                            </MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/suggestions" element={
                        <ProtectedRoute currentUser={currentUser}>
                            <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentUser={currentUser} unreadCount={unreadCount}>
                                <SuggestionsView currentUser={currentUser!} onShowToast={showToast} />
                            </MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/suggestions/:id" element={
                        <ProtectedRoute currentUser={currentUser}>
                            <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentUser={currentUser} unreadCount={unreadCount}>
                                <SuggestionDetailView currentUser={currentUser!} onShowToast={showToast} />
                            </MainLayout>
                        </ProtectedRoute>
                    } />

                    {/* Catch All - 404 Redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav currentUser={currentUser} unreadCount={unreadCount} />

            {/* GLOBAL TOAST COMPONENT */}
            <Toast
                message={toast?.message || ''}
                type={toast?.type}
                isVisible={!!toast}
                onClose={() => setToast(null)}
            />
        </ErrorBoundary>
    );
};

export default App;
