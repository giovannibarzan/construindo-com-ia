-- ============================================
-- SISTEMA DE SUGESTÕES - SCHEMA COMPLETO
-- ============================================

-- Tabela principal de sugestões
CREATE TABLE IF NOT EXISTS suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('course', 'feature', 'content', 'tool', 'other')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'implemented')),
    votes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de votos (1 voto por usuário por sugestão)
CREATE TABLE IF NOT EXISTS suggestion_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_id UUID REFERENCES suggestions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(suggestion_id, user_id)
);

-- Tabela de comentários/discussões
CREATE TABLE IF NOT EXISTS suggestion_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_id UUID REFERENCES suggestions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES suggestion_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_category ON suggestions(category);
CREATE INDEX IF NOT EXISTS idx_suggestions_votes ON suggestions(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_created ON suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestion_votes_suggestion ON suggestion_votes(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_votes_user ON suggestion_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_comments_suggestion ON suggestion_comments(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_comments_parent ON suggestion_comments(parent_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para SUGGESTIONS
DROP POLICY IF EXISTS "Sugestões visíveis para todos" ON suggestions;
CREATE POLICY "Sugestões visíveis para todos" 
    ON suggestions FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem criar sugestões" ON suggestions;
CREATE POLICY "Usuários autenticados podem criar sugestões" 
    ON suggestions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem editar próprias sugestões pendentes" ON suggestions;
CREATE POLICY "Usuários podem editar próprias sugestões pendentes" 
    ON suggestions FOR UPDATE 
    USING (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "Admins podem gerenciar sugestões" ON suggestions;
CREATE POLICY "Admins podem gerenciar sugestões" 
    ON suggestions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND email = 'giovannibarzanlovableia@gmail.com'
        )
    );

-- Políticas para SUGGESTION_VOTES
DROP POLICY IF EXISTS "Votos visíveis para todos" ON suggestion_votes;
CREATE POLICY "Votos visíveis para todos" 
    ON suggestion_votes FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Usuários podem votar" ON suggestion_votes;
CREATE POLICY "Usuários podem votar" 
    ON suggestion_votes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem mudar próprio voto" ON suggestion_votes;
CREATE POLICY "Usuários podem mudar próprio voto" 
    ON suggestion_votes FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem remover próprio voto" ON suggestion_votes;
CREATE POLICY "Usuários podem remover próprio voto" 
    ON suggestion_votes FOR DELETE 
    USING (auth.uid() = user_id);

-- Políticas para SUGGESTION_COMMENTS
DROP POLICY IF EXISTS "Comentários visíveis para todos" ON suggestion_comments;
CREATE POLICY "Comentários visíveis para todos" 
    ON suggestion_comments FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Usuários podem comentar" ON suggestion_comments;
CREATE POLICY "Usuários podem comentar" 
    ON suggestion_comments FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar próprios comentários" ON suggestion_comments;
CREATE POLICY "Usuários podem deletar próprios comentários" 
    ON suggestion_comments FOR DELETE 
    USING (auth.uid() = user_id);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_suggestions_updated_at ON suggestions;
CREATE TRIGGER trigger_update_suggestions_updated_at
    BEFORE UPDATE ON suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_suggestions_updated_at();

-- Função para incrementar contador de votos
CREATE OR REPLACE FUNCTION increment_suggestion_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE suggestions 
        SET votes_count = votes_count + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
        WHERE id = NEW.suggestion_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE suggestions 
        SET votes_count = votes_count + CASE 
            WHEN NEW.vote_type = 'up' AND OLD.vote_type = 'down' THEN 2
            WHEN NEW.vote_type = 'down' AND OLD.vote_type = 'up' THEN -2
            ELSE 0
        END
        WHERE id = NEW.suggestion_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE suggestions 
        SET votes_count = votes_count - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
        WHERE id = OLD.suggestion_id;
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_suggestion_votes ON suggestion_votes;
CREATE TRIGGER trigger_suggestion_votes
    AFTER INSERT OR UPDATE OR DELETE ON suggestion_votes
    FOR EACH ROW
    EXECUTE FUNCTION increment_suggestion_votes();

-- Função para incrementar contador de comentários
CREATE OR REPLACE FUNCTION increment_suggestion_comments()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE suggestions 
        SET comments_count = comments_count + 1
        WHERE id = NEW.suggestion_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE suggestions 
        SET comments_count = comments_count - 1
        WHERE id = OLD.suggestion_id;
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_suggestion_comments ON suggestion_comments;
CREATE TRIGGER trigger_suggestion_comments
    AFTER INSERT OR DELETE ON suggestion_comments
    FOR EACH ROW
    EXECUTE FUNCTION increment_suggestion_comments();

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL - COMENTADO)
-- ============================================

-- Descomente para adicionar dados de exemplo
/*
INSERT INTO suggestions (user_id, title, description, category, status, votes_count) VALUES
    ((SELECT id FROM profiles LIMIT 1), 'Curso de Next.js 14', 'Gostaria de um curso completo sobre Next.js 14 com App Router', 'course', 'approved', 15),
    ((SELECT id FROM profiles LIMIT 1), 'Dark Mode Automático', 'Implementar detecção automática de tema do sistema', 'feature', 'implemented', 8),
    ((SELECT id FROM profiles LIMIT 1), 'Tutorial de Supabase', 'Série de tutoriais sobre Supabase e PostgreSQL', 'content', 'under_review', 12);
*/
