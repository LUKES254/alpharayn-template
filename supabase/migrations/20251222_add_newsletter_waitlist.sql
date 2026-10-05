-- Newsletter + Waitlist schema
-- Run in Supabase SQL editor. Keeps RLS and triggers aligned with existing platform rules.

-- 1) Enums (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'newsletter_status') THEN
    CREATE TYPE public.newsletter_status AS ENUM ('active','unsubscribed','bounced');
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'waitlist_status') THEN
    CREATE TYPE public.waitlist_status AS ENUM ('pending','approved','invited','converted');
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'newsletter_campaign_status') THEN
    CREATE TYPE public.newsletter_campaign_status AS ENUM ('draft','scheduled','sending','sent','failed');
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Tables
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  status public.newsletter_status NOT NULL DEFAULT 'active',
  source TEXT DEFAULT 'website',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  confirmation_token TEXT UNIQUE,
  confirmed_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{"product_updates":true,"blog_posts":true,"promotions":false}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.waitlist_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  use_case TEXT,
  company_size TEXT CHECK (company_size IN ('1-10','11-50','51-200','201-1000','1000+')),
  referred_by UUID REFERENCES public.waitlist_entries(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referral_count INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  status public.waitlist_status NOT NULL DEFAULT 'pending',
  priority BOOLEAN NOT NULL DEFAULT false,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  content TEXT NOT NULL,
  status public.newsletter_campaign_status NOT NULL DEFAULT 'draft',
  sent_count INTEGER NOT NULL DEFAULT 0,
  open_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON public.newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_user_id ON public.newsletter_subscribers(user_id);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist_entries(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON public.waitlist_entries(referral_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_referred_by ON public.waitlist_entries(referred_by);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON public.waitlist_entries(position);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist_entries(status);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.newsletter_campaigns(status);

-- 4) Utility function: update updated_at (uses existing if present)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5) Waitlist position calculation
CREATE OR REPLACE FUNCTION public.calculate_waitlist_position(entry_id UUID)
RETURNS INTEGER AS $$
DECLARE
  base_position INTEGER;
  adjusted INTEGER;
  entry_record RECORD;
BEGIN
  SELECT joined_at, referral_count, priority INTO entry_record
  FROM public.waitlist_entries
  WHERE id = entry_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Base position by join time (1-based)
  SELECT COUNT(*) + 1
    INTO base_position
  FROM public.waitlist_entries w
  WHERE w.joined_at < entry_record.joined_at
     OR (w.joined_at = entry_record.joined_at AND w.id <> entry_id);

  adjusted := base_position - (COALESCE(entry_record.referral_count, 0) * 10);
  IF entry_record.priority THEN
    adjusted := adjusted - 1000;
  END IF;
  IF adjusted < 1 THEN
    adjusted := 1;
  END IF;
  RETURN adjusted;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  NEW.position := COALESCE(public.calculate_waitlist_position(COALESCE(NEW.id, gen_random_uuid())), 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.increment_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE public.waitlist_entries
      SET referral_count = referral_count + 1
      WHERE id = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6) Triggers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_newsletter_subscribers_updated_at') THEN
    CREATE TRIGGER update_newsletter_subscribers_updated_at
    BEFORE UPDATE ON public.newsletter_subscribers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_newsletter_campaigns_updated_at') THEN
    CREATE TRIGGER update_newsletter_campaigns_updated_at
    BEFORE UPDATE ON public.newsletter_campaigns
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_waitlist_position_before_insert') THEN
    CREATE TRIGGER set_waitlist_position_before_insert
    BEFORE INSERT ON public.waitlist_entries
    FOR EACH ROW EXECUTE FUNCTION public.set_waitlist_position();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_waitlist_position_before_update') THEN
    CREATE TRIGGER set_waitlist_position_before_update
    BEFORE UPDATE OF referral_count, priority, joined_at ON public.waitlist_entries
    FOR EACH ROW EXECUTE FUNCTION public.set_waitlist_position();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'increment_referral_after_insert') THEN
    CREATE TRIGGER increment_referral_after_insert
    AFTER INSERT ON public.waitlist_entries
    FOR EACH ROW EXECUTE FUNCTION public.increment_referral_count();
  END IF;
END $$;

-- 7) RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Newsletter subscribers policies
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own subscription" ON public.newsletter_subscribers;
CREATE POLICY "Users can view own subscription" ON public.newsletter_subscribers
  FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.newsletter_subscribers;
CREATE POLICY "Users can update own subscription" ON public.newsletter_subscribers
  FOR UPDATE USING (user_id::text = auth.uid()::text)
  WITH CHECK (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can manage newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can manage newsletter subscribers" ON public.newsletter_subscribers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
    )
  );

-- Waitlist entries policies
DROP POLICY IF EXISTS "Public can join waitlist" ON public.waitlist_entries;
CREATE POLICY "Public can join waitlist" ON public.waitlist_entries
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can check waitlist position" ON public.waitlist_entries;
CREATE POLICY "Public can check waitlist position" ON public.waitlist_entries
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage waitlist" ON public.waitlist_entries;
CREATE POLICY "Admins can manage waitlist" ON public.waitlist_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
    )
  );

-- Newsletter campaigns policies
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.newsletter_campaigns;
CREATE POLICY "Admins can manage campaigns" ON public.newsletter_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
    )
  );

-- 8) Rollback helpers (drop tables/types) - execute manually if needed
-- DROP TABLE IF EXISTS public.newsletter_campaigns CASCADE;
-- DROP TABLE IF EXISTS public.waitlist_entries CASCADE;
-- DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;
