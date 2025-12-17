-- =====================================================
-- MIGRATION: Expand Tools Table with Detailed Fields
-- =====================================================
-- Execute this SQL in your Supabase SQL Editor
-- This adds all the new columns needed for the expanded tool details

-- Step 1: Add new columns to the tools table
ALTER TABLE tools
ADD COLUMN IF NOT EXISTS what_is TEXT,
ADD COLUMN IF NOT EXISTS how_to_use TEXT,
ADD COLUMN IF NOT EXISTS use_cases JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS pricing JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS related_tool_ids TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Step 2: Update existing Lovable tool with complete data
UPDATE tools
SET 
  what_is = 'Lovable é uma plataforma de desenvolvimento de aplicações web alimentada por IA que transforma descrições em linguagem natural em aplicações fullstack funcionais. Utilizando modelos de linguagem avançados, o Lovable gera código React, TypeScript e Tailwind CSS de alta qualidade, integra automaticamente com Supabase para backend e banco de dados, e permite deploy instantâneo. É a ferramenta perfeita para desenvolvedores que querem acelerar o desenvolvimento, empreendedores validando ideias rapidamente, ou qualquer pessoa que queira construir aplicações web sem escrever código manualmente.',
  
  how_to_use = E'1. Acesse lovable.dev e crie uma conta\n2. Descreva sua aplicação em linguagem natural no chat\n3. O Lovable gera o código React + TypeScript automaticamente\n4. Revise e refine através de iterações no chat\n5. Conecte ao GitHub com um clique\n6. Deploy automático - sua app está no ar!',
  
  use_cases = '[
    {
      "id": "uc1",
      "title": "Prototipagem Rápida de MVPs",
      "description": "Valide ideias de negócio em horas, não semanas. Crie protótipos funcionais para mostrar a investidores ou testar com usuários reais.",
      "icon": "rocket_launch"
    },
    {
      "id": "uc2", 
      "title": "Ferramentas Internas para Empresas",
      "description": "Desenvolva dashboards, CRMs personalizados e ferramentas administrativas sem ocupar seu time de engenharia por semanas.",
      "icon": "business_center"
    },
    {
      "id": "uc3",
      "title": "Aprendizado de Desenvolvimento Web",
      "description": "Estudantes e iniciantes podem ver código de qualidade sendo gerado e aprender padrões modernos de React e TypeScript na prática.",
      "icon": "school"
    },
    {
      "id": "uc4",
      "title": "Landing Pages e Sites Institucionais",
      "description": "Crie sites responsivos e modernos para produtos, serviços ou eventos em minutos, com design profissional.",
      "icon": "web"
    }
  ]'::jsonb,
  
  faq = '[
    {
      "id": "faq1",
      "question": "Preciso saber programar para usar o Lovable?",
      "answer": "Não! O Lovable foi projetado para ser acessível a todos. Você descreve o que quer em português (ou inglês) e a IA gera o código. Porém, conhecimento técnico ajuda a refinar e personalizar ainda mais."
    },
    {
      "id": "faq2",
      "question": "O código gerado é de boa qualidade?",
      "answer": "Sim! O Lovable gera código React e TypeScript seguindo as melhores práticas da indústria. O código é limpo, componentizado e pronto para produção. Você pode revisar e modificar tudo."
    },
    {
      "id": "faq3",
      "question": "Posso exportar meu projeto?",
      "answer": "Absolutamente! O Lovable se integra diretamente com o GitHub. Você tem controle total do código e pode continuar desenvolvendo localmente ou em qualquer plataforma."
    },
    {
      "id": "faq4",
      "question": "Qual é o limite do que posso construir?",
      "answer": "O Lovable é ideal para aplicações web fullstack de pequeno a médio porte. Funciona muito bem para MVPs, dashboards, CRMs, landing pages e ferramentas internas. Para sistemas muito complexos, pode ser melhor usar como ponto de partida."
    },
    {
      "id": "faq5",
      "question": "O Lovable substitui desenvolvedores?",
      "answer": "Não, ele os potencializa! Desenvolvedores usam Lovable para acelerar tarefas repetitivas e focar em lógica complexa. Não-técnicos usam para validar ideias antes de contratar um time."
    }
  ]'::jsonb,
  
  reviews = '[
    {
      "id": "r1",
      "userId": "user1",
      "userName": "Carlos Silva",
      "userAvatar": "https://ui-avatars.com/api/?name=Carlos+Silva&background=0D8ABC&color=fff",
      "rating": 5,
      "comment": "Incrível! Consegui criar um MVP funcional em 3 horas. A integração com Supabase é perfeita e o deploy foi instantâneo. Recomendo muito!",
      "createdAt": "15/11/2024",
      "helpful": 24
    },
    {
      "id": "r2",
      "userId": "user2",
      "userName": "Ana Rodrigues",
      "userAvatar": "https://ui-avatars.com/api/?name=Ana+Rodrigues&background=6366f1&color=fff",
      "rating": 5,
      "comment": "Como designer sem conhecimento de código, consegui tirar minhas ideias do papel. A qualidade do código gerado impressiona até desenvolvedores experientes.",
      "createdAt": "10/11/2024",
      "helpful": 18
    },
    {
      "id": "r3",
      "userId": "user3",
      "userName": "Pedro Santos",
      "userAvatar": "https://ui-avatars.com/api/?name=Pedro+Santos&background=f59e0b&color=fff",
      "rating": 4,
      "comment": "Muito bom para prototipagem rápida! Alguns ajustes manuais são necessários para casos mais específicos, mas economiza MUITO tempo no desenvolvimento inicial.",
      "createdAt": "05/11/2024",
      "helpful": 12
    }
  ]'::jsonb,
  
  pricing = '[
    {
      "id": "free",
      "name": "Free",
      "price": "R$ 0",
      "period": "month",
      "features": [
        "1 projeto ativo",
        "Geração ilimitada de código",
        "Deploy básico",
        "Suporte da comunidade"
      ],
      "isPopular": false
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": "R$ 99",
      "period": "month",
      "features": [
        "Projetos ilimitados",
        "Geração prioritária",
        "Deploy avançado com domínio customizado",
        "Integração GitHub avançada",
        "Suporte prioritário",
        "Histórico completo de versões"
      ],
      "isPopular": true
    },
    {
      "id": "team",
      "name": "Team",
      "price": "R$ 299",
      "period": "month",
      "features": [
        "Tudo do Pro",
        "Até 5 membros no time",
        "Colaboração em tempo real",
        "Ambientes de staging",
        "SSO e controles de segurança",
        "Suporte dedicado"
      ],
      "isPopular": false
    }
  ]'::jsonb,
  
  related_tool_ids = ARRAY['t2', 't3']
WHERE name = 'Lovable';

-- Step 3: Verify the update
SELECT 
  id, 
  name, 
  what_is IS NOT NULL as has_what_is,
  how_to_use IS NOT NULL as has_how_to_use,
  jsonb_array_length(use_cases) as use_cases_count,
  jsonb_array_length(faq) as faq_count,
  jsonb_array_length(reviews) as reviews_count,
  jsonb_array_length(pricing) as pricing_count,
  array_length(related_tool_ids, 1) as related_tools_count
FROM tools
WHERE name = 'Lovable';

-- =====================================================
-- OPTIONAL: Add data for other tools (ChatGPT, Cursor)
-- =====================================================
-- You can run these separately if you want to add data for other tools

-- ChatGPT data (if exists)
-- UPDATE tools SET ... WHERE name = 'ChatGPT';

-- Cursor data (if exists)  
-- UPDATE tools SET ... WHERE name = 'Cursor';
