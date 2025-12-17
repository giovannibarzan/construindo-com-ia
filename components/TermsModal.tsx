
import React from 'react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Termos de Uso</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-sm text-gray-500 mb-6">Última atualização: Janeiro de 2025</p>

                            <h3>1. Aceitação dos Termos</h3>
                            <p>
                                Ao acessar e usar a plataforma Construindo com IA, você concorda em cumprir estes Termos de Uso.
                                Se você não concordar com qualquer parte destes termos, não poderá acessar a plataforma.
                            </p>

                            <h3>2. Descrição do Serviço</h3>
                            <p>
                                Construindo com IA é uma comunidade exclusiva para os 150 membros fundadores interessados em
                                Vibe Coding e desenvolvimento com IA. Oferecemos:
                            </p>
                            <ul>
                                <li>Acesso a uma rede de profissionais de alto nível</li>
                                <li>Cursos e conteúdos exclusivos sobre IA</li>
                                <li>Ferramentas e recursos curados</li>
                                <li>Lives e eventos exclusivos</li>
                            </ul>

                            <h3>3. Conta de Usuário</h3>
                            <p>
                                Para acessar certos recursos da plataforma, você deve criar uma conta. Você é responsável por:
                            </p>
                            <ul>
                                <li>Manter a confidencialidade de sua senha</li>
                                <li>Todas as atividades que ocorrem em sua conta</li>
                                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                            </ul>

                            <h3>4. Conduta do Usuário</h3>
                            <p>Você concorda em NÃO:</p>
                            <ul>
                                <li>Usar a plataforma para qualquer propósito ilegal</li>
                                <li>Assediar, abusar ou prejudicar outros usuários</li>
                                <li>Publicar conteúdo ofensivo, difamatório ou inadequado</li>
                                <li>Fazer spam ou distribuir malware</li>
                                <li>Tentar acessar áreas restritas da plataforma</li>
                            </ul>

                            <h3>5. Propriedade Intelectual</h3>
                            <p>
                                Todo o conteúdo da plataforma, incluindo textos, gráficos, logos e software, é propriedade de
                                Construindo com IA e protegido por leis de direitos autorais.
                            </p>

                            <h3>6. Acesso Premium</h3>
                            <p>
                                Os 150 membros fundadores recebem 1 ano de acesso Premium gratuito. Após esse período, o acesso
                                pode ser renovado mediante pagamento ou conforme políticas futuras da plataforma.
                            </p>

                            <h3>7. Cancelamento</h3>
                            <p>
                                Reservamo-nos o direito de suspender ou encerrar sua conta a qualquer momento, sem aviso prévio,
                                por violação destes termos ou por qualquer outro motivo.
                            </p>

                            <h3>8. Limitação de Responsabilidade</h3>
                            <p>
                                A plataforma é fornecida "como está". Não garantimos que o serviço será ininterrupto ou livre de erros.
                                Não nos responsabilizamos por danos diretos, indiretos ou consequenciais.
                            </p>

                            <h3>9. Modificações</h3>
                            <p>
                                Podemos modificar estes termos a qualquer momento. Mudanças significativas serão notificadas aos usuários.
                                O uso continuado da plataforma após as mudanças constitui aceitação dos novos termos.
                            </p>

                            <h3>10. Contato</h3>
                            <p>
                                Para questões sobre estes termos, entre em contato através do formulário de contato na plataforma.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TermsModal;
