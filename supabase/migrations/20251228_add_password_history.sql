-- File: supabase/migrations/20251228_add_password_history.sql

CREATE TABLE IF NOT EXISTS public.password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON public.password_history(user_id);

-- Policy: Only user can view their own password history
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own password history" ON public.password_history
  FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users insert own password history" ON public.password_history
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
