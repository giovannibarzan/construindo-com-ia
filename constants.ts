
import { Post, PostType, User, UserPlan, Notification, CourseCategory, CourseModule, Tool, Giveaway, Project } from './types';

export const CURRENT_USER: User = {
  id: 'current-user',
  name: 'Dev Iniciante',
  handle: '@deviniciante',
  bio: 'Explorando o mundo da Inteligência Artificial. Fullstack Developer em construção.',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkipuYywCsixE-ChtVVIGMHgwhwUCn7kUA1aPIXC567Yo8cGm-DxgOnaIxeUhinGK-kOl3_Wd2vA8Dw2cZZPsHoY19Pa1unStGnHWV5hKJVyoU22IY7aYbai6Tho1sNy1V1CZNO-JHxhzDkZnoGM2byshmYJyjbA7fvTCOuyP8f1FbsiSm0PesE-KxgIXM12DRdqL8J2gKurwJlRU9TNNmSJto8m9UUJfm_X7Wy7V9UIlJXxXn01yXuukwMpQpe55bPB_XxmigKUHo',
  coverUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop',
  plan: UserPlan.PREMIUM,
  followers: 120,
  following: 45
};

export const MOCK_USERS: Record<string, User> = {
  andre: {
    id: 'andre',
    name: 'Andre',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKo42ac5eXvzpSUa4ljBkHdEpwDbfNoWaM7ygg261_MrJ12_Qn8qlej0tGGf2np4NDcQAcPYJ33GjinIrfELR3BlI753RTY2K-3hSVJVhwRwdwlJ2BH5VKmBEnso11KyC8KZ0pVqcQ-zCidFwTZ72Bm2qrhnoTgXUDn27EAhT7CNdNoM51jf1heva1jcpIZFMmG_26AIiBgxWEMiR5lhinuXA7OtuBao40Wb5a4Hw68XrCFDYcOAeo8xCj7hJUYQMFx-X2UEXG5R-s'
  },
  beatriz: {
    id: 'beatriz',
    name: 'Beatriz',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADzsC4l3sGhbJVIWA-0XXFiVorQEP1eNWarwnWRhJRjGDAeIyK7TaawFoomjibTxyxwaIzj_nF2kbY81brDusJ6NkLoSeigBk6UFPLzKoTLYPIPvOGnJO8u_DvTXbUadx3IXGR-yK_rwDEeHcKRWyc0Qh11dbBWeg8K5Zh28bNznq6fDCR8c8qMt8jBEy5zG81CZySB4gz-ZPcomHxPBkjIsCOGtFE9RIrOdEC4WH7YeUvgSxETjt53Q0jr9LpFo6AlvbRVqMkV7mj'
  },
  carlos: {
    id: 'carlos',
    name: 'Carlos',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrwEAEXRvJBV1B-YLh8HyZv0YXOqx9XlvDMCT8nwUmGfjQfHSorfsioMPUqpE_ECg2AtXqa-WsTtsLrBFBoMAJVod8-Z3qu2XyWrbMO2egGVt8Etic9zYBuvhx5h0VUeTBk3gFxP5i5bo4zpKZ8HRlMcdXbtZJ2GJgmZFUjX4A41nAlYVwZjznENOjfpDqJJJY3445fVkTwAK6kC58cjXkYhM5DwSPozhJZlkxVDWJD30TwENi38wnZTRqasZGf_j3G1U-yYLqM70_'
  }
};

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    user: MOCK_USERS.andre,
    content: 'Just discovered a new AI model that can generate realistic 3D environments from text prompts. The potential for game development and virtual reality is mind-blowing!',
    createdAt: '2h ago',
    type: PostType.THOUGHT,
    likes: 24,
    comments: 5
  },
  {
    id: '2',
    user: MOCK_USERS.beatriz,
    content: "Does anyone know how to solve this bug? My Python script is throwing a 'KeyError' even though the key seems to exist in the dictionary. Attaching a screenshot of the code.",
    createdAt: '5h ago',
    type: PostType.QUESTION,
    likes: 12,
    comments: 8,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJjYTK_8RbPvL0ARC85yr8Kjtna4Sq8PdLT3yCdqeNgSS-uRsGUGUReV-G2AHt3cjZy6Los52swsxPcKr9qetrPMIg_NGJytZKB8UeHkAVq80nNhsxOsl8PDHIgEgpwPg9lbmGCIsEm2uza_3rZZseFCi0VHp84ca5g8hch_v6kqzBP21BM-5T1MkG_GELHam7v_HCRb3r0CbXHxAKtj16ZyC1nBMNeiVr-p9KjrVsz8lQytu4K_z1stwxDK09MX0Gn5izScycgc6X'
  },
  {
    id: '3',
    user: MOCK_USERS.carlos,
    content: 'Sharing a quick Python snippet to resize images using Pillow. Hope this helps someone!',
    createdAt: '1 day ago',
    type: PostType.THOUGHT,
    likes: 45,
    comments: 2,
    codeSnippet: `from PIL import Image
def resize_image(input_path, output_path, size):
    with Image.open(input_path) as img:
        img.thumbnail(size)
        img.save(output_path)
resize_image('input.jpg', 'output.jpg', (128, 128))`
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'LIKE', user: MOCK_USERS.andre, message: 'curtiu seu post sobre IA Generativa.', createdAt: '10m ago', read: false },
  { id: '2', type: 'COMMENT', user: MOCK_USERS.beatriz, message: 'comentou no seu snippet de código.', createdAt: '1h ago', read: false },
  { id: '3', type: 'SYSTEM', message: 'Bem-vindo à comunidade Construindo com IA!', createdAt: '1d ago', read: true },
];

export const MOCK_CATEGORIES: CourseCategory[] = [
  { id: 'cat1', title: 'Introdução à IA', description: 'Conceitos fundamentais de Machine Learning e Redes Neurais.', thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1932&auto=format&fit=crop', isPremium: false, tags: ['Básico', 'Teoria'] },
  { id: 'cat2', title: 'Engenharia de Prompt', description: 'Domine a arte de criar prompts eficazes para LLMs.', thumbnailUrl: 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=1887&auto=format&fit=crop', isPremium: true, tags: ['Prático', 'LLMs'] },
  { id: 'cat3', title: 'Python para Data Science', description: 'Aprenda Python focado em manipulação de dados.', thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=1932&auto=format&fit=crop', isPremium: false, tags: ['Código', 'Data'] },
];

export const MOCK_MODULES: CourseModule[] = [
  {
    id: 'mod1', courseId: 'cat1', title: 'Módulo 1: O que é IA?', description: 'História e definições.',
    lessons: [
      { id: 'l1', title: 'Aula 1: História da IA', duration: '10:00', completed: true, content: 'Resumo sobre Alan Turing e os primeiros passos.' },
      { id: 'l2', title: 'Aula 2: Tipos de Aprendizado', duration: '15:30', completed: false, content: 'Supervisionado, Não-supervisionado e Reforço.' }
    ]
  },
  {
    id: 'mod2', courseId: 'cat2', title: 'Módulo 1: Zero Shot vs Few Shot', description: 'Técnicas avançadas.',
    lessons: [
      { id: 'l3', title: 'Aula 1: Zero Shot Prompting', duration: '12:00', completed: false, content: 'Como pedir algo sem exemplos.' },
    ]
  }
];

export const MOCK_TOOLS: Tool[] = [
  {
    id: 't1',
    name: 'Lovable',
    description: 'Crie apps fullstack apenas descrevendo o que você quer. A melhor ferramenta de No-Code com IA.',
    fullDescription: 'Lovable é uma ferramenta revolucionária que permite transformar texto em aplicações web completas. Com integração direta ao GitHub e deploy em um clique, ela acelera o desenvolvimento de protótipos e produtos finais. Ideal para MVPs rápidos.',
    logoUrl: 'https://pbs.twimg.com/profile_images/1717013669354897408/Efaba2H-_400x400.jpg',
    category: 'Desenvolvimento',
    rating: 5.0,
    websiteUrl: 'https://lovable.dev',
    isPremium: false,
    features: ['Geração de código React/Tailwind', 'Integração com Supabase', 'Deploy em 1 clique', 'Chat iterativo com contexto'],
    relatedVideoUrl: 'https://www.youtube.com/embed/p1FXN6w9jKU',

    whatIs: 'Lovable é uma plataforma de desenvolvimento de aplicações web alimentada por IA que transforma descrições em linguagem natural em aplicações fullstack funcionais. Utilizando modelos de linguagem avançados, o Lovable gera código React, TypeScript e Tailwind CSS de alta qualidade, integra automaticamente com Supabase para backend e banco de dados, e permite deploy instantâneo. É a ferramenta perfeita para desenvolvedores que querem acelerar o desenvolvimento, empreendedores validando ideias rapidamente, ou qualquer pessoa que queira construir aplicações web sem escrever código manualmente.',

    howToUse: '1. **Crie uma conta**: Acesse lovable.dev e faça login com sua conta GitHub.\n2. **Descreva seu app**: Use linguagem natural para descrever o que você quer construir. Seja específico sobre funcionalidades, design e comportamento.\n3. **Itere com o chat**: O Lovable gera o código inicial. Continue conversando para refinar, adicionar features ou corrigir bugs.\n4. **Configure o backend**: Se precisar de autenticação ou banco de dados, o Lovable configura automaticamente o Supabase.\n5. **Deploy**: Com um clique, faça deploy da sua aplicação e compartilhe o link ao vivo.\n6. **Exporte para GitHub**: Baixe o código ou sincronize diretamente com um repositório GitHub para continuar desenvolvendo.',

    useCases: [
      {
        id: 'uc1',
        title: 'Prototipagem Rápida de MVPs',
        description: 'Valide ideias de negócio em horas, não semanas. Crie landing pages, dashboards ou aplicações SaaS completas para testar com usuários reais.',
        icon: 'rocket_launch'
      },
      {
        id: 'uc2',
        title: 'Ferramentas Internas para Empresas',
        description: 'Desenvolva painéis administrativos, sistemas de gerenciamento de conteúdo ou ferramentas de automação para sua equipe sem comprometer recursos de engenharia.',
        icon: 'business'
      },
      {
        id: 'uc3',
        title: 'Aprendizado de Desenvolvimento Web',
        description: 'Estudantes e iniciantes podem ver código React/TypeScript de qualidade sendo gerado em tempo real, aprendendo boas práticas e padrões modernos.',
        icon: 'school'
      },
      {
        id: 'uc4',
        title: 'Projetos Freelance',
        description: 'Freelancers podem entregar projetos mais rapidamente, aumentando a capacidade de aceitar mais clientes e melhorando margens de lucro.',
        icon: 'work'
      }
    ],

    faq: [
      {
        id: 'faq1',
        question: 'Preciso saber programar para usar o Lovable?',
        answer: 'Não! O Lovable foi projetado para ser acessível a qualquer pessoa. Você descreve o que quer em português (ou inglês) e a IA gera o código. No entanto, conhecimento básico de desenvolvimento web ajuda a fazer solicitações mais precisas e entender o código gerado.'
      },
      {
        id: 'faq2',
        question: 'Posso exportar o código gerado?',
        answer: 'Sim! Você tem controle total sobre o código. Pode baixar o projeto completo ou sincronizar diretamente com um repositório GitHub. O código é seu e você pode modificá-lo livremente.'
      },
      {
        id: 'faq3',
        question: 'Quais tecnologias o Lovable utiliza?',
        answer: 'O Lovable gera aplicações usando React, TypeScript, Tailwind CSS para o frontend, e Supabase para backend (autenticação, banco de dados PostgreSQL, storage). O código segue as melhores práticas modernas de desenvolvimento.'
      },
      {
        id: 'faq4',
        question: 'Existe limite de projetos ou requisições?',
        answer: 'O plano gratuito tem limites de mensagens e projetos. Planos pagos oferecem requisições ilimitadas, mais projetos simultâneos e prioridade no processamento. Confira a seção de preços para detalhes.'
      },
      {
        id: 'faq5',
        question: 'O Lovable pode criar aplicações mobile?',
        answer: 'Atualmente, o Lovable foca em aplicações web responsivas que funcionam perfeitamente em dispositivos móveis. Para apps nativos iOS/Android, outras ferramentas são mais adequadas.'
      }
    ],

    reviews: [
      {
        id: 'r1',
        userId: 'andre',
        userName: 'Andre Silva',
        userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKo42ac5eXvzpSUa4ljBkHdEpwDbfNoWaM7ygg261_MrJ12_Qn8qlej0tGGf2np4NDcQAcPYJ33GjinIrfELR3BlI753RTY2K-3hSVJVhwRwdwlJ2BH5VKmBEnso11KyC8KZ0pVqcQ-zCidFwTZ72Bm2qrhnoTgXUDn27EAhT7CNdNoM51jf1heva1jcpIZFMmG_26AIiBgxWEMiR5lhinuXA7OtuBao40Wb5a4Hw68XrCFDYcOAeo8xCj7hJUYQMFx-X2UEXG5R-s',
        rating: 5,
        comment: 'Incrível! Criei um dashboard completo para meu SaaS em 3 horas. O código gerado é limpo e bem estruturado. A integração com Supabase funcionou perfeitamente de primeira.',
        createdAt: '2 dias atrás',
        helpful: 24
      },
      {
        id: 'r2',
        userId: 'beatriz',
        userName: 'Beatriz Costa',
        userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADzsC4l3sGhbJVIWA-0XXFiVorQEP1eNWarwnWRhJRjGDAeIyK7TaawFoomjibTxyxwaIzj_nF2kbY81brDusJ6NkLoSeigBk6UFPLzKoTLYPIPvOGnJO8u_DvTXbUadx3IXGR-yK_rwDEeHcKRWyc0Qh11dbBWeg8K5Zh28bNznq6fDCR8c8qMt8jBEy5zG81CZySB4gz-ZPcomHxPBkjIsCOGtFE9RIrOdEC4WH7YeUvgSxETjt53Q0jr9LpFo6AlvbRVqMkV7mj',
        rating: 5,
        comment: 'Como designer sem conhecimento profundo de código, o Lovable me permitiu criar protótipos interativos que impressionaram meus clientes. Game changer!',
        createdAt: '5 dias atrás',
        helpful: 18
      },
      {
        id: 'r3',
        userId: 'carlos',
        userName: 'Carlos Mendes',
        userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrwEAEXRvJBV1B-YLh8HyZv0YXOqx9XlvDMCT8nwUmGfjQfHSorfsioMPUqpE_ECg2AtXqa-WsTtsLrBFBoMAJVod8-Z3qu2XyWrbMO2egGVt8Etic9zYBuvhx5h0VUeTBk3gFxP5i5bo4zpKZ8HRlMcdXbtZJ2GJgmZFUjX4A41nAlYVwZjznENOjfpDqJJJY3445fVkTwAK6kC58cjXkYhM5DwSPozhJZlkxVDWJD30TwENi38wnZTRqasZGf_j3G1U-yYLqM70_',
        rating: 4,
        comment: 'Muito bom para MVPs e protótipos. Às vezes preciso ajustar o código manualmente para casos mais complexos, mas economiza 80% do tempo de desenvolvimento.',
        createdAt: '1 semana atrás',
        helpful: 12
      }
    ],

    pricing: [
      {
        id: 'p1',
        name: 'Free',
        price: 'R$ 0',
        period: 'month',
        features: [
          '100 mensagens/mês',
          '3 projetos ativos',
          'Deploy básico',
          'Integração Supabase',
          'Exportação para GitHub'
        ]
      },
      {
        id: 'p2',
        name: 'Pro',
        price: 'R$ 99',
        period: 'month',
        isPopular: true,
        features: [
          'Mensagens ilimitadas',
          'Projetos ilimitados',
          'Deploy prioritário',
          'Suporte prioritário',
          'Colaboração em equipe',
          'Histórico completo',
          'Modelos premium'
        ]
      },
      {
        id: 'p3',
        name: 'Enterprise',
        price: 'Personalizado',
        features: [
          'Tudo do Pro',
          'SLA garantido',
          'Suporte dedicado',
          'Treinamento da equipe',
          'Integração customizada',
          'Compliance e segurança'
        ]
      }
    ],

    relatedToolIds: ['t3', 't4', 't6']
  },
  {
    id: 't2',
    name: 'Midjourney',
    description: 'Geração de imagens artísticas de alta fidelidade via Discord.',
    fullDescription: 'Midjourney é um laboratório de pesquisa independente que explora novos meios de pensamento. É famoso por gerar imagens extremamente detalhadas, artísticas e fotorrealistas através de comandos no Discord.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Midjourney_Emblem.png',
    category: 'Imagem',
    rating: 4.8,
    websiteUrl: 'https://midjourney.com',
    isPremium: true,
    features: ['Alta resolução', 'Estilos artísticos variados', 'Comandos avançados (--ar, --s)', 'Upscaling e Zoom Out'],
    relatedVideoUrl: 'https://www.youtube.com/embed/hJ8y7YnyTNA'
  },
  {
    id: 't3',
    name: 'ChatGPT',
    description: 'O modelo de linguagem mais famoso do mundo.',
    fullDescription: 'O ChatGPT é um modelo de linguagem capaz de gerar texto humano-like, responder perguntas, auxiliar em codificação e muito mais. Com a versão Plus, você acessa o GPT-4, navegação na web e análise de dados.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    category: 'Chatbot',
    rating: 4.7,
    websiteUrl: 'https://chat.openai.com',
    isPremium: false,
    features: ['GPT-4 (Plus)', 'Análise de dados avançada', 'Geração de imagens (DALL-E)', 'GPTs customizados'],

    whatIs: 'ChatGPT é um assistente de IA conversacional desenvolvido pela OpenAI, baseado em modelos de linguagem de grande escala (LLMs). Ele pode entender e gerar texto em linguagem natural, auxiliar em tarefas de programação, análise de dados, criação de conteúdo, tradução, tutoria e muito mais. Com o GPT-4, a versão mais avançada, o ChatGPT oferece raciocínio aprimorado, capacidade de processar imagens, navegar na web e executar código Python. É uma das ferramentas de IA mais versáteis disponíveis, usada por milhões de pessoas diariamente.',

    howToUse: '1. **Acesse o site**: Vá para chat.openai.com e crie uma conta gratuita.\n2. **Escolha seu plano**: Use a versão gratuita (GPT-3.5) ou assine o Plus para GPT-4.\n3. **Inicie uma conversa**: Digite sua pergunta ou solicitação na caixa de texto.\n4. **Refine as respostas**: Continue a conversa para esclarecer, expandir ou corrigir as respostas.\n5. **Use recursos avançados**: Faça upload de imagens, arquivos, ou use GPTs personalizados para tarefas específicas.\n6. **Integre via API**: Desenvolvedores podem usar a API da OpenAI para integrar o ChatGPT em suas aplicações.',

    useCases: [
      {
        id: 'uc1',
        title: 'Assistente de Programação',
        description: 'Escreva código, depure bugs, explique conceitos de programação e aprenda novas linguagens com exemplos práticos e explicações detalhadas.',
        icon: 'code'
      },
      {
        id: 'uc2',
        title: 'Criação de Conteúdo',
        description: 'Gere artigos, posts de blog, roteiros, emails marketing, descrições de produtos e qualquer tipo de texto criativo ou profissional.',
        icon: 'edit_note'
      },
      {
        id: 'uc3',
        title: 'Análise de Dados',
        description: 'Faça upload de planilhas CSV/Excel e peça análises, visualizações, insights e relatórios automáticos usando Code Interpreter.',
        icon: 'analytics'
      },
      {
        id: 'uc4',
        title: 'Aprendizado e Tutoria',
        description: 'Aprenda qualquer assunto com explicações personalizadas, exemplos práticos e exercícios adaptados ao seu nível de conhecimento.',
        icon: 'school'
      }
    ],

    faq: [
      {
        id: 'faq1',
        question: 'Qual a diferença entre GPT-3.5 e GPT-4?',
        answer: 'O GPT-4 é significativamente mais avançado: raciocínio superior, maior precisão, capacidade de processar imagens, contexto mais longo (até 128k tokens) e melhor desempenho em tarefas complexas. O GPT-3.5 é gratuito mas mais limitado.'
      },
      {
        id: 'faq2',
        question: 'O ChatGPT tem acesso à internet?',
        answer: 'Sim, na versão Plus com GPT-4. Ele pode navegar na web para buscar informações atualizadas, acessar links que você fornecer e citar fontes. A versão gratuita não tem esse recurso.'
      },
      {
        id: 'faq3',
        question: 'Posso usar o ChatGPT para trabalho comercial?',
        answer: 'Sim! O conteúdo gerado pelo ChatGPT pode ser usado comercialmente. Você possui os direitos sobre o output. Para uso empresarial em larga escala, considere o plano ChatGPT Team ou Enterprise.'
      },
      {
        id: 'faq4',
        question: 'O que são GPTs customizados?',
        answer: 'GPTs são versões personalizadas do ChatGPT criadas para tarefas específicas. Você pode criar seu próprio GPT com instruções customizadas, conhecimento adicional (arquivos) e ações (APIs) sem programar.'
      }
    ],

    reviews: [
      {
        id: 'r1',
        userId: 'andre',
        userName: 'Andre Silva',
        userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKo42ac5eXvzpSUa4ljBkHdEpwDbfNoWaM7ygg261_MrJ12_Qn8qlej0tGGf2np4NDcQAcPYJ33GjinIrfELR3BlI753RTY2K-3hSVJVhwRwdwlJ2BH5VKmBEnso11KyC8KZ0pVqcQ-zCidFwTZ72Bm2qrhnoTgXUDn27EAhT7CNdNoM51jf1heva1jcpIZFMmG_26AIiBgxWEMiR5lhinuXA7OtuBao40Wb5a4Hw68XrCFDYcOAeo8xCj7hJUYQMFx-X2UEXG5R-s',
        rating: 5,
        comment: 'Uso diariamente para programação. O GPT-4 me ajuda a resolver bugs complexos e aprender novos frameworks. Vale cada centavo do Plus.',
        createdAt: '3 dias atrás',
        helpful: 45
      },
      {
        id: 'r2',
        userId: 'beatriz',
        userName: 'Beatriz Costa',
        userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADzsC4l3sGhbJVIWA-0XXFiVorQEP1eNWarwnWRhJRjGDAeIyK7TaawFoomjibTxyxwaIzj_nF2kbY81brDusJ6NkLoSeigBk6UFPLzKoTLYPIPvOGnJO8u_DvTXbUadx3IXGR-yK_rwDEeHcKRWyc0Qh11dbBWeg8K5Zh28bNznq6fDCR8c8qMt8jBEy5zG81CZySB4gz-ZPcomHxPBkjIsCOGtFE9RIyOdEC4WH7YeUvgSxETjt53Q0jr9LpFo6AlvbRVqMkV7mj',
        rating: 4,
        comment: 'Excelente para criação de conteúdo e brainstorming. Às vezes as respostas precisam de revisão, mas é um ótimo ponto de partida.',
        createdAt: '1 semana atrás',
        helpful: 28
      }
    ],

    pricing: [
      {
        id: 'p1',
        name: 'Free',
        price: 'R$ 0',
        period: 'month',
        features: [
          'Acesso ao GPT-3.5',
          'Mensagens ilimitadas',
          'Acesso em web e mobile',
          'Histórico de conversas'
        ]
      },
      {
        id: 'p2',
        name: 'Plus',
        price: 'R$ 97',
        period: 'month',
        isPopular: true,
        features: [
          'Acesso ao GPT-4',
          'Navegação na web',
          'Análise de dados avançada',
          'Geração de imagens (DALL-E)',
          'GPTs customizados',
          'Acesso prioritário'
        ]
      },
      {
        id: 'p3',
        name: 'Team',
        price: 'R$ 149',
        period: 'month',
        features: [
          'Tudo do Plus',
          'Workspace colaborativo',
          'Admin console',
          'Compartilhamento de GPTs',
          'Até 149 usuários'
        ]
      }
    ],

    relatedToolIds: ['t1', 't4', 't6']
  },
  {
    id: 't4',
    name: 'Perplexity AI',
    description: 'Motor de resposta conversacional que cita fontes em tempo real.',
    fullDescription: 'Perplexity é uma mistura de ChatGPT com Google. Ele responde suas perguntas lendo a internet em tempo real e, o mais importante, cita cada fonte utilizada, garantindo veracidade.',
    logoUrl: 'https://seeklogo.com/images/P/perplexity-ai-logo-131069502D-seeklogo.com.png',
    category: 'Pesquisa',
    rating: 4.9,
    websiteUrl: 'https://perplexity.ai',
    isPremium: false,
    features: ['Busca na Web em tempo real', 'Citação de fontes', 'Modo Copilot', 'Upload de Arquivos']
  },
  {
    id: 't6',
    name: 'Cursor',
    description: 'Editor de código com IA integrada. O VS Code turbinado para desenvolvimento moderno.',
    fullDescription: 'Cursor é um editor de código baseado no VS Code, mas com superpoderes de IA. Ele oferece autocompletar inteligente, chat contextual sobre seu código, edição em múltiplos arquivos simultaneamente e geração de código a partir de instruções naturais. É a ferramenta ideal para desenvolvedores que querem produtividade máxima.',
    logoUrl: 'https://www.cursor.com/brand/icon.svg',
    category: 'Desenvolvimento',
    rating: 4.9,
    websiteUrl: 'https://cursor.com',
    isPremium: true,
    features: ['Autocompletar com IA', 'Chat sobre codebase', 'Edição multi-arquivo', 'Compatível com extensões VS Code'],
    relatedVideoUrl: 'https://www.youtube.com/embed/tjFnifSEEjQ',

    whatIs: 'Cursor é um editor de código de última geração que integra IA diretamente no fluxo de desenvolvimento. Construído sobre a base do VS Code, ele mantém toda a familiaridade e compatibilidade com extensões, mas adiciona recursos poderosos de IA como autocompletar preditivo (Tab), chat contextual que entende todo seu projeto, e a capacidade de editar múltiplos arquivos com comandos em linguagem natural. É como ter um par programmer expert sempre ao seu lado.',

    howToUse: '1. **Baixe e instale**: Acesse cursor.com e baixe o instalador para seu sistema operacional.\n2. **Importe configurações**: Se você usa VS Code, importe suas configurações e extensões com um clique.\n3. **Use Tab para autocompletar**: Enquanto digita, pressione Tab para aceitar sugestões de código inteligentes.\n4. **Abra o chat (Cmd+K)**: Pergunte sobre seu código, peça refatorações ou gere novas funcionalidades.\n5. **Edição multi-arquivo (Cmd+Shift+K)**: Descreva mudanças que afetam vários arquivos e veja a IA aplicá-las.\n6. **Configure sua API key**: Use sua própria chave OpenAI ou Anthropic para controle total.',

    useCases: [
      {
        id: 'uc1',
        title: 'Desenvolvimento Full-Stack Acelerado',
        description: 'Escreva frontend e backend simultaneamente com sugestões contextuais que entendem toda sua arquitetura de projeto.',
        icon: 'code'
      },
      {
        id: 'uc2',
        title: 'Refatoração de Código Legacy',
        description: 'Modernize código antigo pedindo para a IA refatorar, adicionar tipos TypeScript ou migrar para novos padrões.',
        icon: 'autorenew'
      },
      {
        id: 'uc3',
        title: 'Aprendizado de Novas Tecnologias',
        description: 'Explore frameworks desconhecidos com explicações inline e exemplos gerados instantaneamente.',
        icon: 'school'
      },
      {
        id: 'uc4',
        title: 'Debugging Inteligente',
        description: 'Selecione código com erro, pergunte à IA o que está errado e receba correções com explicações detalhadas.',
        icon: 'bug_report'
      }
    ],

    faq: [
      {
        id: 'faq1',
        question: 'Cursor é gratuito?',
        answer: 'Cursor oferece um plano gratuito com 2000 completions e 50 usos do chat premium por mês. Para uso ilimitado, há planos pagos a partir de $20/mês.'
      },
      {
        id: 'faq2',
        question: 'Posso usar minhas extensões do VS Code?',
        answer: 'Sim! Cursor é 100% compatível com extensões do VS Code. Você pode importar todas suas extensões e configurações existentes.'
      },
      {
        id: 'faq3',
        question: 'Meu código é enviado para servidores externos?',
        answer: 'Apenas os trechos relevantes são enviados para os modelos de IA (OpenAI/Anthropic) quando você usa recursos de IA. Você pode usar sua própria API key para controle total. O código nunca é usado para treinamento.'
      },
      {
        id: 'faq4',
        question: 'Qual modelo de IA o Cursor usa?',
        answer: 'Cursor usa GPT-4, GPT-4 Turbo e Claude 3.5 Sonnet dependendo da tarefa. Você pode escolher qual modelo usar em cada situação.'
      },
      {
        id: 'faq5',
        question: 'Funciona offline?',
        answer: 'O editor funciona offline, mas os recursos de IA requerem conexão com internet para acessar os modelos de linguagem.'
      }
    ],

    reviews: [
      {
        id: 'r1',
        userId: 'andre',
        userName: 'Andre Silva',
        userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKo42ac5eXvzpSUa4ljBkHdEpwDbfNoWaM7ygg261_MrJ12_Qn8qlej0tGGf2np4NDcQAcPYJ33GjinIrfELR3BlI753RTY2K-3hSVJVhwRwdwlJ2BH5VKmBEnso11KyC8KZ0pVqcQ-zCidFwTZ72Bm2qrhnoTgXUDn27EAhT7CNdNoM51jf1heva1jcpIZFMmG_26AIiBgxWEMiR5lhinuXA7OtuBao40Wb5a4Hw68XrCFDYcOAeo8xCj7hJUYQMFx-X2UEXG5R-s',
        rating: 5,
        comment: 'Mudou completamente meu fluxo de trabalho. O autocompletar é assustadoramente preciso e o chat entende o contexto do projeto inteiro. Não volto pro VS Code puro.',
        createdAt: '1 dia atrás',
        helpful: 67
      },
      {
        id: 'r2',
        userId: 'carlos',
        userName: 'Carlos Mendes',
        userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrwEAEXRvJBV1B-YLh8HyZv0YXOqx9XlvDMCT8nwUmGfjQfHSorfsioMPUqpE_ECg2AtXqa-WsTtsLrBFBoMAJVod8-Z3qu2XyWrbMO2egGVt8Etic9zYBuvhx5h0VUeTBk3gFxP5i5bo4zpKZ8HRlMcdXbtJ2GJgmZFUjX4A41nAlYVwZjznENOjfpDqJJJY3445fVkTwAK6kC58cjXkYhM5DwSPozhJZlkxVDWJD30TwENi38wnZTRqasZGf_j3G1U-yYLqM70_',
        rating: 5,
        comment: 'A melhor ferramenta de IA para código que já usei. Vale muito a pena o investimento. Minha produtividade aumentou 3x.',
        createdAt: '4 dias atrás',
        helpful: 52
      },
      {
        id: 'r3',
        userId: 'beatriz',
        userName: 'Beatriz Costa',
        userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADzsC4l3sGhbJVIWA-0XXFiVorQEP1eNWarwnWRhJRjGDAeIyK7TaawFoomjibTxyxwaIzj_nF2kbY81brDusJ6NkLoSeigBk6UFPLzKoTLYPIPvOGnJO8u_DvTXbUadx3IXGR-yK_rwDEeHcKRWyc0Qh11dbBWeg8K5Zh28bNznq6fDCR8c8qMt8jBEy5zG81CZySB4gz-ZPcomHxPBkjIsCOGtFE9RIrOdEC4WH7YeUvgSxETjt53Q0jr9LpFo6AlvbRVqMkV7mj',
        rating: 4,
        comment: 'Ótimo para aprender! Quando não entendo algo, pergunto direto no editor. Só sinto falta de mais customização nas sugestões.',
        createdAt: '1 semana atrás',
        helpful: 34
      }
    ],

    pricing: [
      {
        id: 'p1',
        name: 'Hobby',
        price: 'R$ 0',
        period: 'month',
        features: [
          '2000 completions/mês',
          '50 usos premium chat/mês',
          'Modelos GPT-3.5 e GPT-4',
          'Todas as funcionalidades básicas'
        ]
      },
      {
        id: 'p2',
        name: 'Pro',
        price: 'R$ 99',
        period: 'month',
        isPopular: true,
        features: [
          'Completions ilimitados',
          'Usos ilimitados de chat premium',
          'Acesso a Claude 3.5 Sonnet',
          'GPT-4 Turbo',
          'Suporte prioritário',
          'Uso de API própria'
        ]
      },
      {
        id: 'p3',
        name: 'Business',
        price: 'R$ 199',
        period: 'month',
        features: [
          'Tudo do Pro',
          'Gerenciamento centralizado',
          'Controle de privacidade',
          'SLA garantido',
          'Suporte dedicado',
          'Faturamento consolidado'
        ]
      }
    ],

    relatedToolIds: ['t1', 't3', 't7']
  },
  {
    id: 't5',
    name: 'ElevenLabs',
    description: 'A voz de IA mais realista do mercado para Text-to-Speech.',
    fullDescription: 'ElevenLabs oferece a melhor tecnologia de síntese de voz (TTS) do mundo. Crie áudios indistinguíveis da fala humana, clone sua própria voz ou use vozes pré-prontas para seus vídeos.',
    logoUrl: 'https://avatars.githubusercontent.com/u/120663467?s=280&v=4',
    category: 'Áudio',
    rating: 4.8,
    websiteUrl: 'https://elevenlabs.io',
    isPremium: true,
    features: ['Clonagem de voz', 'Dublagem automática', 'Múltiplos idiomas', 'API robusta']
  },
];

export const MOCK_GIVEAWAYS: Giveaway[] = [
  {
    id: 'g1',
    title: '1 Mês de ChatGPT Plus',
    description: 'Ganhe acesso aos modelos mais avançados da OpenAI.',
    imageUrl: 'https://images.unsplash.com/photo-1676299081847-824916de030a?q=80&w=2070&auto=format&fit=crop',
    endDate: '2023-12-31',
    participants: 1420,
    requiredPlan: UserPlan.FREE,
    status: 'OPEN'
  },
  {
    id: 'g2',
    title: 'Teclado Mecânico Keychron',
    description: 'Melhore seu setup com este teclado incrível para devs.',
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=2071&auto=format&fit=crop',
    endDate: '2023-11-15',
    participants: 50,
    requiredPlan: UserPlan.PREMIUM,
    status: 'OPEN'
  },
  {
    id: 'g3',
    title: 'Licença JetBrains All Products',
    description: '1 ano de acesso a todas as IDEs da JetBrains.',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
    endDate: '2025-01-20',
    participants: 0,
    requiredPlan: UserPlan.PREMIUM,
    status: 'FUTURE' // Futuro
  },
  {
    id: 'g4',
    title: 'Livro: Deep Learning Book',
    description: 'O livro definitivo sobre Deep Learning (Edição Física).',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
    endDate: '2023-10-01',
    participants: 300,
    requiredPlan: UserPlan.FREE,
    status: 'CLOSED' // Passado
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    userId: 'current-user',
    title: 'Gerador de Avatar AI',
    description: 'Um app React que usa a API da Stability AI para gerar avatares personalizados.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop',
    repoUrl: 'https://github.com/user/avatar-gen',
    demoUrl: 'https://avatar-gen-demo.vercel.app',
    tags: ['React', 'API', 'AI'],
    createdAt: '12/10/2023'
  },
  {
    id: 'p2',
    userId: 'current-user',
    title: 'Chatbot Financeiro',
    description: 'Assistente pessoal para controle de gastos integrado ao WhatsApp.',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop',
    tags: ['Python', 'LangChain', 'Finance'],
    createdAt: '05/11/2023'
  }
];
