-- ============================================================
-- BGT MAGAZINE — SQL SETUP PËRFUNDIMTAR (100% I SAKTË)
-- Kopjo të gjithën dhe ekzekuto në: Supabase > SQL Editor > Run
-- ============================================================


-- ============================================================
-- 1. PASTRIMI I STRUKTURËS SË VJETËR
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();


-- ============================================================
-- 2. TABELA PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text NOT NULL DEFAULT '',
  role        text NOT NULL DEFAULT 'viewer'
              CHECK (role IN ('viewer', 'student', 'gazetar', 'editor', 'admin')),
  updated_at  timestamptz DEFAULT now()
);


-- ============================================================
-- 3. TABELA ARTICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       text NOT NULL,
  content     text NOT NULL DEFAULT '',
  category    text NOT NULL DEFAULT 'Lajme'
              CHECK (category IN ('Lajme', 'Sukseset', 'Inovacioni', 'Sporti', 'Projektet', 'Klubet')),
  image_url   text,
  video_url   text,
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'published', 'archived')),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);


-- ============================================================
-- 4. TABELA COMMENTS (emri i saktë sipas kodit: 'comments')
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id  uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);


-- ============================================================
-- 5. TABELA LIKES (emri i saktë sipas kodit: 'likes')
-- ============================================================
CREATE TABLE IF NOT EXISTS public.likes (
  article_id  uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  PRIMARY KEY (article_id, user_id)  -- 1 like për user për artikull
);


-- ============================================================
-- 6. FUNKSIONI DHE TRIGGERI PËR SIGN-UP AUTOMATIK
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'viewer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Barto userat ekzistues (nëse ke të regjistruar tashmë)
INSERT INTO public.profiles (id, full_name, role)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', ''),
  'viewer'
FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 7. STORAGE BUCKET (për imazhe dhe video)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS) — Aktivizim
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes    ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 9. POLICIES PËR PROFILES
-- ============================================================
DROP POLICY IF EXISTS "Profilet shihen nga të gjithë"  ON public.profiles;
DROP POLICY IF EXISTS "Update profilin tend"           ON public.profiles;

CREATE POLICY "Profilet shihen nga të gjithë"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Update profilin tend"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- ============================================================
-- 10. POLICIES PËR ARTICLES
-- ============================================================
DROP POLICY IF EXISTS "Artikujt shihen nga të gjithë"  ON public.articles;
DROP POLICY IF EXISTS "Stafi poston artikuj"           ON public.articles;
DROP POLICY IF EXISTS "Autori ose editor edito"        ON public.articles;
DROP POLICY IF EXISTS "Autori ose editor fshij"        ON public.articles;

CREATE POLICY "Artikujt shihen nga të gjithë"
  ON public.articles FOR SELECT
  USING (true);

CREATE POLICY "Stafi poston artikuj"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('gazetar', 'editor', 'admin')
    )
  );

CREATE POLICY "Autori ose editor edito"
  ON public.articles FOR UPDATE
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

CREATE POLICY "Autori ose editor fshij"
  ON public.articles FOR DELETE
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );


-- ============================================================
-- 11. POLICIES PËR COMMENTS
-- ============================================================
DROP POLICY IF EXISTS "Komentet shihen nga të gjithë"   ON public.comments;
DROP POLICY IF EXISTS "Komentoni nëse jeni loguar"      ON public.comments;
DROP POLICY IF EXISTS "Fshij koment (vete ose editor)"  ON public.comments;

CREATE POLICY "Komentet shihen nga të gjithë"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Komentoni nëse jeni loguar"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Fshij koment (vete ose editor)"
  ON public.comments FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );


-- ============================================================
-- 12. POLICIES PËR LIKES
-- ============================================================
DROP POLICY IF EXISTS "Likes shihen nga të gjithë"  ON public.likes;
DROP POLICY IF EXISTS "Like nëse jeni loguar"       ON public.likes;
DROP POLICY IF EXISTS "Hiq like-un tënd"            ON public.likes;

CREATE POLICY "Likes shihen nga të gjithë"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Like nëse jeni loguar"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hiq like-un tënd"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- 13. POLICIES PËR STORAGE (Media: foto & video)
-- ============================================================
DROP POLICY IF EXISTS "Lejo leximin publik 1ps738_0"      ON storage.objects;
DROP POLICY IF EXISTS "Lejo ngarkimin per Stafin 1ps738_0" ON storage.objects;

CREATE POLICY "Lejo leximin publik 1ps738_0"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Lejo ngarkimin per Stafin 1ps738_0"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');


-- ============================================================
-- 14. INDEKSET (Performanca)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_articles_status     ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category   ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_author_id  ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_likes_article_id    ON public.likes(article_id);


-- ============================================================
-- 15. BËJ VETEN ADMIN (pas regjistrimit)
--     Shko te: Supabase > Authentication > Users
--     Kopjo UUID-n tënd dhe vendose këtu:
-- ============================================================
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'VENDOS-UUID-KETU';


-- ============================================================
-- ✅ GATI! Tabelat u krijuan me sukses.
--
-- TABELA        → EMRI SAKTË (siç e kërkon kodi)
-- ─────────────────────────────────────────────
-- profiles      → profili i çdo useri
-- articles      → lajmet
-- comments      → komentet (.from('comments'))
-- likes         → reagimet (.from('likes'))
-- storage/media → imazhe & video
--
-- ROLET:     viewer | student | gazetar | editor | admin
-- STATUSET:  pending | published | archived
-- KATEGORITË: Lajme | Sukseset | Inovacioni | Sporti | Projektet | Klubet
-- ============================================================
