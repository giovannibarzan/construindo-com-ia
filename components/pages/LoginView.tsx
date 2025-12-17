

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { backend } from '../../services/backend';

interface LoginViewProps {
    isAdminLogin?: boolean;
}

const LoginView: React.FC<LoginViewProps> = ({ isAdminLogin = false }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Estado para controlar se o cadastro está aberto (UI)
    const [canRegisterUser, setCanRegisterUser] = useState(true);
    const [checkingConfig, setCheckingConfig] = useState(true);

    const ADMIN_EMAIL = 'giovannibarzanlovableia@gmail.com';

    useEffect(() => {
        let isMounted = true;
        if (!isAdminLogin) {
            setCheckingConfig(true);
            backend.canRegister()
                .then(result => {
                    if (isMounted) {
                        setCanRegisterUser(result.allowed);
                        setCheckingConfig(false);
                    }
                })
                .catch(err => {
                    // Silently ignore config fetch errors for UI
                    if (isMounted) {
                        setCanRegisterUser(true);
                        setCheckingConfig(false);
                    }
                });
        } else {
            setCheckingConfig(false);
        }
        return () => { isMounted = false; };
    }, [isAdminLogin]);

    const handleAuth = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        // --- MODO RECUPERAR SENHA ---
        if (isForgotPassword) {
            try {
                const { error } = await backend.resetPassword(email);
                if (error) throw error;
                setSuccessMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
            } catch (err: any) {
                console.warn("Reset pass error:", err.message);
                setError(err.message || 'Erro ao enviar email. Verifique se o endereço está correto.');
            } finally {
                setLoading(false);
            }
            return;
        }

        // --- VALIDAÇÃO ESTRITA DE ENTRADA ---
        if (isAdminLogin) {
            if (email !== ADMIN_EMAIL) {
                // Embora o backend proteja, validamos no front para UX
            }
        } else {
            if (email === ADMIN_EMAIL) {
                setError('Administradores devem usar o Painel Administrativo ("Admin") no menu superior.');
                setLoading(false);
                return;
            }
        }

        try {
            if (isSignUp && !isAdminLogin) {
                // MODO LISTA DE ESPERA (Se cadastro fechado)
                if (!canRegisterUser) {
                    await backend.addToWaitlist(email);
                    setSuccessMessage('Você entrou na lista de espera! Avisaremos quando abrir.');
                    setEmail('');
                    setLoading(false);
                    return;
                }

                // MODO CADASTRO NORMAL
                const { error } = await backend.signUp(email, password, {
                    data: {
                        full_name: email.split('@')[0],
                        handle: '@' + email.split('@')[0]
                    }
                });
                if (error) throw error;

                setSuccessMessage('Conta criada! Verifique seu email para confirmar.');
                setIsSignUp(false);

            } else {
                // LOGIN
                const { error } = await backend.signIn(email, password);
                if (error) throw error;

                // Redirect after successful login
                if (isAdminLogin) {
                    navigate('/admin');
                } else {
                    navigate('/home');
                }
            }
        } catch (err: any) {
            // Evitar spam no console para erros esperados de usuário
            const msg = err.message || 'Ocorreu um erro ao tentar entrar.';

            if (msg === 'Invalid login credentials') {
                setError('Email ou senha incorretos.');
            } else if (msg === 'Failed to fetch') {
                setError('Erro de conexão com o servidor. Verifique sua internet.');
            } else if (msg.includes('unique constraint')) {
                setSuccessMessage('Você já está na lista de espera ou cadastrado!');
            } else {
                // Só loga erros desconhecidos/críticos
                console.error("Auth Error:", err);
                setError(msg);
            }
        } finally {
            if (!successMessage) {
                setLoading(false);
            }
        }
    };

    const toggleTab = (signUpMode: boolean) => {
        setIsSignUp(signUpMode);
        setIsForgotPassword(false); // Reset forgot password state
        setError('');
        setSuccessMessage('');
    };

    const handleForgotPasswordClick = () => {
        setIsForgotPassword(true);
        setIsSignUp(false);
        setError('');
        setSuccessMessage('');
    };

    const handleBackToLogin = () => {
        setIsForgotPassword(false);
        setError('');
        setSuccessMessage('');
    };

    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-background-dark animate-in fade-in duration-500">
            {/* LEFT SIDE - Branding & Offer */}
            <div className={`hidden lg:flex w-1/2 flex-col justify-center px-16 xl:px-24 relative overflow-hidden ${isAdminLogin ? 'bg-gray-900 text-white' : 'bg-background-light dark:bg-gray-900'}`}>
                {/* Decorative Circle */}
                <div className="absolute -top-20 -left-20 size-96 bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 size-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10">
                    <h1 className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-6">
                        {isAdminLogin ? 'Acesso Administrativo' : 'Construindo com IA'}
                    </h1>
                    <p className={`text-lg mb-8 leading-relaxed ${isAdminLogin ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {isAdminLogin
                            ? 'Portal exclusivo para gerenciamento da comunidade, cursos e eventos. Acesso restrito ao Super Admin.'
                            : 'A maior comunidade de entusiastas de IA. Cursos, projetos e networking para quem está moldando o futuro.'}
                    </p>
                    {!isAdminLogin && !isForgotPassword && (
                        <p className={`text-xl font-bold ${canRegisterUser ? 'text-primary' : 'text-amber-600'}`}>
                            {canRegisterUser
                                ? 'Junte-se agora e ganhe 1 ano grátis - oferta limitada aos primeiros 150 membros fundadores!'
                                : 'As inscrições para membros fundadores estão temporariamente encerradas.'
                            }
                        </p>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md flex flex-col gap-8">

                    <div className="lg:hidden text-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isAdminLogin ? 'Admin Panel' : 'Construindo com IA'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isAdminLogin ? 'Login restrito' : (isForgotPassword ? 'Recuperação de Conta' : 'Entre para a comunidade.')}
                        </p>
                    </div>

                    {!isAdminLogin && !isForgotPassword && (
                        <div className="grid grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                            <button onClick={() => toggleTab(false)} className={`py-2.5 text-sm font-semibold rounded-lg transition-all ${!isSignUp ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Entrar</button>
                            <button onClick={() => toggleTab(true)} className={`py-2.5 text-sm font-semibold rounded-lg transition-all ${isSignUp ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                                {canRegisterUser ? 'Criar Conta' : 'Lista de Espera'}
                            </button>
                        </div>
                    )}

                    {/* FORGOT PASSWORD HEADER */}
                    {isForgotPassword && (
                        <div className="text-center">
                            <div className="size-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl">lock_reset</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Esqueceu sua senha?</h2>
                            <p className="text-gray-500 mt-2">Digite seu email e enviaremos um link para você redefinir sua senha.</p>
                        </div>
                    )}

                    {isAdminLogin && (
                        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined">shield_lock</span>
                            Área exclusiva para Administradores.
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="flex flex-col gap-5">
                        {successMessage && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 shrink-0">check_circle</span>
                                <div className="text-sm text-emerald-700 dark:text-emerald-400">{successMessage}</div>
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium text-center border border-red-100 dark:border-red-900/50 animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        {/* Waitlist Warning */}
                        {isSignUp && !canRegisterUser && !successMessage && !isAdminLogin && !isForgotPassword && (
                            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl text-center">
                                <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">hourglass_top</span>
                                <h4 className="font-bold text-gray-900 dark:text-white">Limite Atingido</h4>
                                <p className="text-sm text-gray-500 mt-1">Deixe seu email abaixo para ser avisado quando abrirmos novas vagas.</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="seuemail@exemplo.com" />
                        </div>

                        {/* Hide Password if in Waitlist Mode (SignUp + !CanRegister) or Forgot Password Mode */}
                        {(!isSignUp || canRegisterUser || isAdminLogin) && !isForgotPassword && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Senha</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 px-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Digite sua senha" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><span className="material-symbols-outlined !text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span></button>
                                </div>
                                {!isSignUp && (
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="button"
                                            onClick={handleForgotPasswordClick}
                                            className="text-sm text-primary hover:text-blue-600 hover:underline font-medium"
                                        >
                                            Esqueceu sua senha?
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            id="submit-btn"
                            type="submit"
                            disabled={loading || checkingConfig}
                            className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 ${isAdminLogin ? 'bg-gray-900 hover:bg-black' : (isSignUp && !canRegisterUser ? 'bg-gray-800 hover:bg-gray-900' : 'bg-primary hover:bg-blue-600')}`}
                        >
                            {loading ? 'Processando...' : (
                                isForgotPassword ? 'Enviar Link de Recuperação' : (
                                    isAdminLogin ? 'Entrar' : (
                                        isSignUp ? (canRegisterUser ? 'Criar Conta' : 'Entrar na Lista de Espera') : 'Entrar'
                                    )
                                )
                            )}
                        </button>

                        {isForgotPassword && (
                            <button
                                type="button"
                                onClick={handleBackToLogin}
                                className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Voltar ao Login
                            </button>
                        )}

                        {/* Guide Promo (Only on Community Login) */}
                        {!isAdminLogin && !isForgotPassword && (
                            <div className="mt-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                    <div className="size-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined">auto_awesome</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Guia de Ferramentas de IA Grátis</h4>
                                        <p className="text-xs text-gray-500">Descubra as melhores ferramentas para acelerar seus projetos. <a href="#" className="underline font-bold text-gray-700 dark:text-gray-300">Baixe agora!</a></p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
