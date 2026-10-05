-- Add content column to blog_posts table to store HTML/markdown content
-- This allows content to be accessible in serverless/production environments

ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS content TEXT;

-- Optionally make content_path nullable since we'll store content directly now
ALTER TABLE public.blog_posts
ALTER COLUMN content_path DROP NOT NULL;

COMMENT ON COLUMN public.blog_posts.content IS 'The actual blog post content (HTML or Markdown)';
