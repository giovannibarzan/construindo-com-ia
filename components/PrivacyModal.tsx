
import React from 'react';

interface PrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Política de Privacidade</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-sm text-gray-500 mb-6">Última atualização: Janeiro de 2025</p>

                            <h3>1. Informações que Coletamos</h3>
                            <p>Coletamos as seguintes informações quando você usa nossa plataforma:</p>
                            <ul>
                                <li><strong>Informações de Conta:</strong> Nome, email, senha (criptografada)</li>
                                <li><strong>Informações de Perfil:</strong> Avatar, bio, handle, projetos</li>
                                <li><strong>Conteúdo:</strong> Posts, comentários, sugestões que você cria</li>
                                <li><strong>Uso:</strong> Páginas visitadas, tempo de uso, interações</li>
                                <li><strong>Técnicas:</strong> Endereço IP, tipo de navegador, dispositivo</li>
                            </ul>

                            <h3>2. Como Usamos suas Informações</h3>
                            <p>Usamos suas informações para:</p>
                            <ul>
                                <li>Fornecer e melhorar nossos serviços</li>
                                <li>Personalizar sua experiência na plataforma</li>
                                <li>Comunicar atualizações e novidades</li>
                                <li>Analisar uso e tendências</li>
                                <li>Prevenir fraudes e abusos</li>
                                <li>Cumprir obrigações legais</li>
                            </ul>

                            <h3>3. Compartilhamento de Informações</h3>
                            <p>NÃO vendemos suas informações pessoais. Podemos compartilhar dados com:</p>
                            <ul>
                                <li><strong>Outros Usuários:</strong> Informações de perfil público são visíveis na comunidade</li>
                                <li><strong>Provedores de Serviço:</strong> Empresas que nos ajudam a operar (ex: Supabase, Vercel)</li>
                                <li><strong>Requisitos Legais:</strong> Quando exigido por lei ou para proteger direitos</li>
                            </ul>

                            <h3>4. Cookies e Tecnologias Similares</h3>
                            <p>
                                Usamos cookies e tecnologias similares para melhorar sua experiência, analisar uso e personalizar conteúdo.
                                Você pode controlar cookies através das configurações do seu navegador.
                            </p>

                            <h3>5. Segurança dos Dados</h3>
                            <p>
                                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados:
                            </p>
                            <ul>
                                <li>Criptografia de senhas (bcrypt)</li>
                                <li>Conexões HTTPS</li>
                                <li>Row Level Security (RLS) no banco de dados</li>
                                <li>Autenticação JWT</li>
                                <li>Backups regulares</li>
                            </ul>

                            <h3>6. Seus Direitos (LGPD)</h3>
                            <p>Você tem direito a:</p>
                            <ul>
                                <li><strong>Acesso:</strong> Solicitar cópia dos seus dados</li>
                                <li><strong>Correção:</strong> Atualizar informações incorretas</li>
                                <li><strong>Exclusão:</strong> Solicitar remoção dos seus dados</li>
                                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                                <li><strong>Oposição:</strong> Opor-se ao processamento de certos dados</li>
                            </ul>

                            <h3>7. Retenção de Dados</h3>
                            <p>
                                Mantemos suas informações enquanto sua conta estiver ativa ou conforme necessário para fornecer serviços.
                                Após exclusão da conta, dados podem ser retidos por até 90 dias para backup e conformidade legal.
                            </p>

                            <h3>8. Transferência Internacional</h3>
                            <p>
                                Seus dados podem ser transferidos e processados em servidores localizados fora do Brasil,
                                incluindo Estados Unidos e Europa, onde nossos provedores de serviço operam.
                            </p>

                            <h3>9. Menores de Idade</h3>
                            <p>
                                Nossa plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente informações
                                de menores. Se descobrirmos que coletamos dados de um menor, excluiremos imediatamente.
                            </p>

                            <h3>10. Mudanças nesta Política</h3>
                            <p>
                                Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas via email
                                ou notificação na plataforma. Recomendamos revisar esta política regularmente.
                            </p>

                            <h3>11. Contato</h3>
                            <p>
                                Para exercer seus direitos ou questões sobre privacidade, entre em contato através do formulário
                                de contato na plataforma ou email: privacidade@construindocomia.com.br
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrivacyModal;
