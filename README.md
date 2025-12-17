# 🚀 Construindo com IA - Plataforma de Comunidade

> Plataforma exclusiva para os 150 membros fundadores da maior comunidade de Vibe Coding e IA do Brasil.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📋 Sobre o Projeto

Plataforma completa de comunidade com:

- 🏠 **Feed Social** - Network de alto nível para construtores de IA
- 📚 **Cursos Premium** - Biblioteca exclusiva de conteúdo
- 🔧 **Ferramentas IA** - Curadoria de ferramentas e recursos
- 💡 **Sistema de Sugestões** - Votação e discussão de ideias
- 🎁 **Sorteios** - Sistema de giveaways para membros
- 📺 **Lives Exclusivas** - Mentorias e eventos ao vivo
- 👤 **Perfis Públicos** - Sistema de perfis com portfólio
- 🌙 **Dark Mode** - Tema escuro completo
- 📱 **Mobile First** - Totalmente responsivo

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + CSS Modules
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Routing**: React Router v7
- **State**: React Hooks
- **Icons**: Material Symbols
- **Animations**: Framer Motion
- **Image Handling**: React Easy Crop

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta Supabase

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/construindo-com-ia.git
cd construindo-com-ia
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. **Configure o banco de dados**

Execute os scripts SQL na ordem:
- `supabase_schema.sql` - Schema principal
- `supabase-suggestions-schema.sql` - Sistema de sugestões
- `supabase-storage-policies.sql` - Políticas de storage
- `supabase-migration-tools.sql` - Ferramentas e migrações

5. **Execute o projeto**
```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 📦 Build para Produção

```bash
npm run build
npm run preview
```

## 🗂️ Estrutura do Projeto

```
construindo-com-ia/
├── components/           # Componentes React
│   ├── pages/           # Páginas principais
│   ├── ErrorBoundary.tsx
│   ├── MobileBottomNav.tsx
│   └── ...
├── services/            # Serviços e APIs
│   └── backend.ts       # Cliente Supabase
├── lib/                 # Configurações
│   └── supabase.ts      # Setup Supabase
├── public/              # Assets estáticos
├── types.ts             # TypeScript types
├── constants.ts         # Constantes da aplicação
└── App.tsx              # Componente raiz
```

## 🔐 Segurança

- ✅ Row Level Security (RLS) no Supabase
- ✅ Autenticação JWT
- ✅ Variáveis de ambiente protegidas
- ✅ Error Boundary para tratamento de erros
- ✅ Validação de inputs
- ✅ Storage policies configuradas

## 📱 Responsividade

- ✅ Mobile-first design
- ✅ Bottom navigation para mobile
- ✅ Touch targets otimizados (44x44px)
- ✅ Layouts adaptativos
- ✅ Testado em múltiplos dispositivos

## 🎨 Features

### Autenticação
- Login/Cadastro com email
- Recuperação de senha
- Perfis de usuário
- Sistema de planos (Free/Premium)

### Feed Social
- Posts com imagens
- Sistema de likes e comentários
- Comentários aninhados (replies)
- Filtros e ordenação

### Cursos
- Categorias e módulos
- Vídeo aulas
- Sistema de progresso
- Cursos premium

### Ferramentas IA
- Curadoria de ferramentas
- Avaliações e reviews
- Categorização
- Links externos

### Sugestões
- Sistema de votação (upvote/downvote)
- Categorias de sugestões
- Status tracking
- Comentários e discussões

### Admin Panel
- Dashboard com estatísticas
- Gerenciamento de usuários
- CRUD completo de conteúdo
- Upload de imagens
- Sistema de notificações

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático a cada push

### Outras Plataformas

O projeto é compatível com:
- Netlify
- Cloudflare Pages
- AWS Amplify

## 📊 Performance

- ⚡ Lazy loading de rotas
- ⚡ Code splitting automático
- ⚡ Compressão de imagens
- ⚡ Cache otimizado
- ⚡ Bundle size otimizado

## 🤝 Contribuindo

Este é um projeto privado para a comunidade Construindo com IA. Contribuições são aceitas apenas de membros autorizados.

## 📝 Licença

Todos os direitos reservados © 2024 Construindo com IA

## 📞 Suporte

Para suporte, entre em contato através da plataforma ou envie um email para suporte@construindocomia.com.br

---

**Desenvolvido com ❤️ pela comunidade Construindo com IA**
