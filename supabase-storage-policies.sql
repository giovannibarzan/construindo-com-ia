-- =============================================
-- POLÍTICAS DE STORAGE PARA UPLOAD DE IMAGENS
-- Execute no SQL Editor do Supabase
-- =============================================

-- Habilitar RLS nos buckets (se ainda não estiver)
-- Isso deve ser feito via Dashboard do Supabase

-- =============================================
-- BUCKET: images (categories, courses, tools, giveaways)
-- =============================================

-- Permitir SELECT (leitura) público para todas as imagens
CREATE POLICY "Imagens públicas para leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Permitir INSERT (upload) apenas para usuários autenticados
CREATE POLICY "Upload de imagens para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
);

-- Permitir UPDATE apenas para admins ou dono do arquivo
CREATE POLICY "Atualização de imagens para admins"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
);

-- Permitir DELETE apenas para usuários autenticados
CREATE POLICY "Deletar imagens para usuários autenticados"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
);

-- =============================================
-- BUCKET: avatars (fotos de perfil de usuários)
-- =============================================

-- Permitir SELECT (leitura) público para todos os avatars
CREATE POLICY "Avatars públicos para leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permitir INSERT (upload) apenas para usuários autenticados
CREATE POLICY "Upload de avatars para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

-- Permitir UPDATE para usuários autenticados
CREATE POLICY "Atualização de avatars para usuários autenticados"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

-- Permitir DELETE para usuários autenticados
CREATE POLICY "Deletar avatars para usuários autenticados"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

-- =============================================
-- BUCKET: covers (capas de perfil de usuários)
-- =============================================

-- Permitir SELECT (leitura) público para todas as capas
CREATE POLICY "Capas públicas para leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

-- Permitir INSERT (upload) apenas para usuários autenticados
CREATE POLICY "Upload de capas para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'covers' 
    AND auth.role() = 'authenticated'
);

-- Permitir UPDATE para usuários autenticados
CREATE POLICY "Atualização de capas para usuários autenticados"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'covers' 
    AND auth.role() = 'authenticated'
);

-- Permitir DELETE para usuários autenticados
CREATE POLICY "Deletar capas para usuários autenticados"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'covers' 
    AND auth.role() = 'authenticated'
);

-- =============================================
-- VERIFICAÇÃO
-- =============================================
-- Após executar, verifique se as políticas foram criadas:
-- SELECT * FROM pg_policies WHERE tablename = 'objects';
