
import React, { useEffect, useState } from 'react';
import { backend } from '../services/backend';
import { useNavigate } from 'react-router-dom';

// Prop onNavigate removida, pois agora usamos o hook
interface LandingPageProps {
  // empty
}

const LandingPage: React.FC<LandingPageProps> = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    backend.getAppConfig().then(config => {
      // Se estiver fechado OU atingiu o limite, consideramos fechado para a Landing Page
      backend.getAdminStats().then(stats => {
        const limitReached = stats.totalUsers >= config.maxUsers;
        setIsRegistrationOpen(config.registrationOpen && !limitReached);
        setLoading(false);
      });
    });
  }, []);

  const handleAction = () => {
    // Se estiver fechado, a navegação vai para o login, mas o LoginView saberá lidar com a lista de espera
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen bg-white dark:bg-gray-900"></div>;

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-sans transition-colors duration-200">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

          {/* Header */}
          <section className="text-center py-6 sm:py-10">
            <header className="flex items-center justify-between mb-16 sm:mb-24">
              <div className="flex items-center gap-4">
                <div className="size-8 text-primary">
                  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
                  </svg>
                </div>
                <h2 className="text-lg font-bold tracking-tight">Construindo com IA</h2>
              </div>

              <nav className="hidden md:flex items-center gap-8">
                <button
                  onClick={() => navigate('/tools')}
                  className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                  Guia de Ferramentas de IA
                </button>
              </nav>

              <div className="flex items-center gap-4">
                <div className="hidden md:block">
                  <button
                    onClick={() => navigate('/login')}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-bold leading-normal tracking-wide hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="truncate">Entrar</span>
                  </button>
                </div>
              </div>

              <div className="md:hidden">
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-800 dark:text-gray-200 hover:text-primary"
                >
                  <span className="material-symbols-outlined text-3xl">login</span>
                </button>
              </div>
            </header>

            {/* Hero */}
            <div className={`inline-block px-4 py-1.5 mb-6 rounded-full font-bold text-sm tracking-wide animate-pulse ${isRegistrationOpen ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
              {isRegistrationOpen ? '⚠️ Vagas Limitadas: Apenas 150 disponíveis' : '🔒 Inscrições Encerradas Temporariamente'}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Acesso Exclusivo para<br />Construtores de IA.
            </h1>
            <p className="max-w-3xl mx-auto text-base sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
              Estamos selecionando os <strong>150 membros fundadores</strong> da maior comunidade de Vibe Coding e IA do Brasil.
              {isRegistrationOpen ? ' Ao atingir o limite, fecharemos as portas por tempo indeterminado.' : ' O limite de membros foi atingido. Entre na lista de espera.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleAction}
                className={`w-full sm:w-auto flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-8 text-white text-lg font-bold leading-normal tracking-wide hover:scale-105 transition-all shadow-lg ${isRegistrationOpen ? 'bg-primary hover:bg-blue-600 shadow-blue-500/30' : 'bg-gray-900 hover:bg-gray-800 shadow-gray-500/30'}`}
              >
                <span className="truncate">{isRegistrationOpen ? 'Garantir Vaga Agora' : 'Entrar na Lista de Espera'}</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="truncate">Já sou membro</span>
              </button>
            </div>
          </section>

          {/* Offer Banner */}
          <section className="mb-16 sm:mb-24 px-2 scroll-animate">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-9xl">lock_clock</span>
              </div>
              <div className="flex items-center gap-6 z-10">
                <div className={`hidden sm:flex items-center justify-center size-16 rounded-full text-white ${isRegistrationOpen ? 'bg-red-500' : 'bg-amber-500'}`}>
                  <span className="material-symbols-outlined text-4xl">{isRegistrationOpen ? 'priority_high' : 'hourglass_top'}</span>
                </div>
                <div className="flex flex-col gap-1 text-center md:text-left">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{isRegistrationOpen ? 'Última Chamada!' : 'Ainda há esperança!'}</p>
                  <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                    {isRegistrationOpen
                      ? <>As 150 pessoas aceitas terão <strong className="text-primary">1 ano de acesso Premium Grátis</strong>. Após preencher as vagas, a comunidade será fechada.</>
                      : <>As vagas foram preenchidas, mas abriremos lotes extras ocasionalmente. Entre na lista para ser avisado primeiro.</>
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleAction}
                className={`w-full md:w-auto flex-shrink-0 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-white text-base font-bold leading-normal transition-colors z-10 ${isRegistrationOpen ? 'bg-primary hover:bg-blue-600' : 'bg-gray-900 hover:bg-black'}`}
              >
                <span className="truncate">{isRegistrationOpen ? 'Garantir minha vaga agora' : 'Entrar na Lista de Espera'}</span>
              </button>
            </div>
          </section>

          {/* Features */}
          <section className="mb-16 sm:mb-24 scroll-animate" id="funcionalidades">
            <h2 className="text-center text-3xl font-bold tracking-tighter mb-4">O que os 150 fundadores terão acesso?</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-12">Nossa plataforma oferece as ferramentas definitivas para quem quer liderar a revolução da IA.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex flex-col gap-4 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all">
                <span className="material-symbols-outlined text-primary text-4xl">forum</span>
                <h3 className="text-xl font-bold">Network de Alto Nível</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Não é apenas um feed. É um espaço para conectar com quem está construindo soluções reais usando LLMs, Agentes e Vibe Coding.</p>
              </div>
              <div className="flex flex-col gap-4 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all">
                <span className="material-symbols-outlined text-primary text-4xl">school</span>
                <h3 className="text-xl font-bold">Cursos Exclusivos</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Acesse nossa biblioteca premium de graça por 1 ano. Do básico ao deploy de Agentes Autônomos.</p>
              </div>
              <div className="flex flex-col gap-4 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all">
                <span className="material-symbols-outlined text-primary text-4xl">emoji_events</span>
                <h3 className="text-xl font-bold">Lives & Desafios</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Mentorias semanais ao vivo e hackathons internos com prêmios para os melhores projetos.</p>
              </div>
            </div>
          </section>

          {/* Tools Teaser */}
          <section className="mb-16 sm:mb-24 scroll-animate" id="ferramentas">
            <div
              onClick={() => navigate('/tools')}
              className="block group cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 group-hover:border-primary/50 transition-all duration-300 transform group-hover:scale-[1.01] group-hover:shadow-2xl">
                <div className="flex-shrink-0 size-20 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-5xl">auto_awesome</span>
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Acesse nosso Guia de Ferramentas IA</h3>
                  <p className="text-gray-600 dark:text-gray-400">Mesmo que não consiga uma vaga de membro, você pode acessar nossa curadoria de ferramentas 100% grátis.</p>
                </div>
                <div className="hidden sm:block text-primary group-hover:translate-x-2 transition-transform">
                  <span className="material-symbols-outlined text-4xl">arrow_forward</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Footer */}
          <section className="text-center py-16 sm:py-20 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-tight mb-6">
              {isRegistrationOpen ? 'Restam poucas vagas.' : 'Não fique de fora da próxima turma.'}
            </h2>
            <p className="max-w-3xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-10">
              {isRegistrationOpen
                ? 'Não perca a chance de ser um dos 150 fundadores. Se você deixar para depois, poderá encontrar as inscrições encerradas.'
                : 'Cadastre-se na lista de espera e seja avisado imediatamente quando novas vagas surgirem.'
              }
            </p>
            <button
              onClick={handleAction}
              className={`flex mx-auto min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-8 text-white text-lg font-bold leading-normal tracking-wide transition-colors shadow-lg ${isRegistrationOpen ? 'bg-primary hover:bg-blue-600 shadow-blue-500/30' : 'bg-gray-900 hover:bg-gray-800 shadow-gray-500/30'}`}
            >
              <span className="truncate">{isRegistrationOpen ? 'Garantir Acesso Premium Grátis' : 'Entrar na Lista de Espera'}</span>
            </button>
          </section>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2024 Construindo com IA. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6">
              <a className="text-sm text-gray-500 hover:text-primary transition-colors" href="#">Termos</a>
              <a className="text-sm text-gray-500 hover:text-primary transition-colors" href="#">Privacidade</a>
              <a className="text-sm text-gray-500 hover:text-primary transition-colors" href="#">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
