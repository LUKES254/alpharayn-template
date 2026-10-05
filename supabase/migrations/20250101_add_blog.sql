-- Blog Feature Migration
-- Creates blog_posts and blog_views tables with RLS policies, indexes, and triggers
-- Run this in Supabase SQL Editor after backing up your database

-- 1) Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  description TEXT NOT NULL CHECK (char_length(description) <= 500),
  content_path TEXT NOT NULL,
  author_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  featured BOOLEAN DEFAULT false,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  og_image_url TEXT,
  reading_time INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Create blog_views table
CREATE TABLE IF NOT EXISTS public.blog_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL REFERENCES public.blog_posts(slug) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  ip_hash TEXT,
  session_id TEXT,
  read_percentage INTEGER DEFAULT 0 CHECK (read_percentage >= 0 AND read_percentage <= 100),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_published_at ON public.blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_category ON public.blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_tags ON public.blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_author ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_slug ON public.blog_views(post_slug);
CREATE INDEX IF NOT EXISTS idx_blog_views_date ON public.blog_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_views_user ON public.blog_views(user_id) WHERE user_id IS NOT NULL;

-- 4) Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;

-- 5) RLS Policies for blog_posts
-- Public can view published posts
DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;
CREATE POLICY "Public can view published posts" ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- Admins can do everything
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.blog_posts;
CREATE POLICY "Admins can manage all posts" ON public.blog_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
    )
  );

-- Service role can manage all posts (for admin operations)
DROP POLICY IF EXISTS "Service role can manage posts" ON public.blog_posts;
CREATE POLICY "Service role can manage posts" ON public.blog_posts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (true);

-- 6) RLS Policies for blog_views
-- Anyone can insert views (for analytics)
DROP POLICY IF EXISTS "Anyone can track views" ON public.blog_views;
CREATE POLICY "Anyone can track views" ON public.blog_views
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all analytics
DROP POLICY IF EXISTS "Admins can view analytics" ON public.blog_views;
CREATE POLICY "Admins can view analytics" ON public.blog_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
    )
  );

-- Service role can view all analytics
DROP POLICY IF EXISTS "Service role can view analytics" ON public.blog_views;
CREATE POLICY "Service role can view analytics" ON public.blog_views
  FOR SELECT
  USING (auth.role() = 'service_role');

-- 7) Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trigger_update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_posts_updated_at();

-- 9) Create function to increment view count (for RPC call)
CREATE OR REPLACE FUNCTION public.increment_blog_view_count(post_slug_param TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.blog_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE slug = post_slug_param;
END;
$$ LANGUAGE plpgsql;

-- 10) Rollback SQL (for reference - DO NOT RUN unless rolling back)
-- DROP FUNCTION IF EXISTS public.increment_blog_view_count(TEXT);
-- DROP TRIGGER IF EXISTS trigger_update_blog_posts_updated_at ON public.blog_posts;
-- DROP FUNCTION IF EXISTS public.update_blog_posts_updated_at();
-- DROP TABLE IF EXISTS public.blog_views CASCADE;
-- DROP TABLE IF EXISTS public.blog_posts CASCADE;
