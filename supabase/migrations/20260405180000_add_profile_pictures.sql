-- Adiciona a coluna profile_picture_url na tabela users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Cria o bucket 'profile-pictures' caso não exista
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de segurança (RLS) para o bucket 'profile-pictures'
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'profile-pictures');

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-pictures');

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id = 'profile-pictures');

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'profile-pictures');
