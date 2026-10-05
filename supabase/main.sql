-- Consolidated safe schema + fixes for BetterAuth integration
-- Run this AFTER taking a full backup of your database.
-- This script is idempotent and defensive: it will create missing tables, convert UUID -> TEXT for user-related columns if needed,
-- recreate RLS policies using explicit casts, and only install the BetterAuth sync trigger if the BetterAuth table exists.

-- WARNING: BACKUP FIRST
-- Example (replace with your DATABASE_URL):
-- pg_dump "$DATABASE_URL" > supabase-backup-$(date +%F).sql

-- 1) Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2) Roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL CHECK (name IN ('user', 'admin')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.roles (name, description)
VALUES ('user','Regular user with basic access'), ('admin','Administrator with full access')
ON CONFLICT (name) DO NOTHING;

-- 3) BetterAuth core tables (must exist before public.users)
CREATE TABLE IF NOT EXISTS public.user (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  name TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.session (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.account (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  scope TEXT,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, account_id)
);

CREATE TABLE IF NOT EXISTS public.verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) Users table (text id to match BetterAuth)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role_id UUID REFERENCES public.roles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5) Plans
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  interval TEXT CHECK (interval IN ('month','year','one-time')),
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6) Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  paystack_reference TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT CHECK (status IN ('pending','success','failed','abandoned','refunded','disputed')),
  plan_id UUID REFERENCES public.plans(id),
  paystack_response JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7) Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  changes JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8) Subscriptions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
    CREATE TYPE public.subscription_tier AS ENUM ('free','pro','premium');
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ensure users.subscription_tier exists (textual enum)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='users' AND column_name='subscription_tier'
  ) THEN
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier public.subscription_tier NOT NULL DEFAULT 'free';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan public.subscription_tier NOT NULL,
  amount DECIMAL(10,2),
  paystack_ref TEXT UNIQUE,
  status TEXT CHECK (status IN ('pending','active','cancelled','expired')) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9) Briefs (MVP schema)
CREATE TABLE IF NOT EXISTS public.briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('pending','completed')) DEFAULT 'pending',
  payment_status TEXT CHECK (payment_status IN ('NOT_PAID','PAID')) DEFAULT 'NOT_PAID',
  final_scope JSONB,
  chat_history JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10) Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON public.users(role_id);

-- BetterAuth table indexes
CREATE INDEX IF NOT EXISTS idx_better_auth_user_email ON public.user(email);
CREATE INDEX IF NOT EXISTS idx_session_user_id ON public.session(user_id);
CREATE INDEX IF NOT EXISTS idx_session_token ON public.session(token);
CREATE INDEX IF NOT EXISTS idx_account_user_id ON public.account(user_id);
CREATE INDEX IF NOT EXISTS idx_account_provider ON public.account(provider_id, account_id);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON public.verification(identifier);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_paystack_reference ON public.payments(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Create index on subscription_tier if column exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='subscription_tier'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON public.users(subscription_tier);
  END IF;
END $$;

-- 11) Timestamp update function and triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers safely
DO $$ BEGIN
  -- BetterAuth tables
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_better_auth_user_updated_at') THEN
      CREATE TRIGGER update_better_auth_user_updated_at BEFORE UPDATE ON public.user
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='session') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_session_updated_at') THEN
      CREATE TRIGGER update_session_updated_at BEFORE UPDATE ON public.session
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='account') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_account_updated_at') THEN
      CREATE TRIGGER update_account_updated_at BEFORE UPDATE ON public.account
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='verification') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_verification_updated_at') THEN
      CREATE TRIGGER update_verification_updated_at BEFORE UPDATE ON public.verification
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;

  -- Application tables
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_users_updated_at') THEN
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='plans') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_plans_updated_at') THEN
      CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='payments') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_payments_updated_at') THEN
      CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='subscriptions') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_subscriptions_updated_at') THEN
      CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='briefs') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_briefs_updated_at') THEN
      CREATE TRIGGER update_briefs_updated_at BEFORE UPDATE ON public.briefs
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;
END $$;

-- 12) Defensive conversion: if any of these columns are currently UUID, convert them to TEXT preserving values
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT unnest(ARRAY['public','public','public','public','public']) as schema_name,
           unnest(ARRAY['users','payments','audit_logs','subscriptions','briefs']) as table_name,
           unnest(ARRAY['id','user_id','user_id','user_id','agency_id']) as column_name
  LOOP
    BEGIN
      PERFORM 1 FROM information_schema.columns 
      WHERE table_schema = r.schema_name 
        AND table_name = r.table_name 
        AND column_name = r.column_name 
        AND data_type = 'uuid';
      IF FOUND THEN
        EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I TYPE TEXT USING %I::text', 
          r.schema_name, r.table_name, r.column_name, r.column_name);
      END IF;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Skipping conversion for %.% due to: %', r.table_name, r.column_name, SQLERRM;
    END;
  END LOOP;
END $$ LANGUAGE plpgsql;

-- 13) Recreate Row Level Security (policies) with explicit casts (id::text / auth.uid()::text)

-- USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role can update users" ON public.users;
CREATE POLICY "Service role can update users" ON public.users
  FOR UPDATE USING (auth.role() = 'service_role')
  WITH CHECK (true);

-- Only attempt to revoke/grant if the subscription_tier column exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='subscription_tier'
  ) THEN
    EXECUTE 'REVOKE UPDATE (subscription_tier) ON public.users FROM authenticated';
  END IF;
  -- Ensure other columns remain updatable
  EXECUTE 'GRANT UPDATE (email, name, role_id, updated_at) ON public.users TO authenticated';
END $$;

-- ROLES
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles;
CREATE POLICY "Authenticated users can view roles" ON public.roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- PLANS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view active plans" ON public.plans;
CREATE POLICY "Users can view active plans" ON public.plans
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can view all plans" ON public.plans;
CREATE POLICY "Admins can view all plans" ON public.plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
    )
  );

-- PAYMENTS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
CREATE POLICY "Users can insert their own payments" ON public.payments
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can update any payment" ON public.payments;
CREATE POLICY "Admins can update any payment" ON public.payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
    )
  );

-- AUDIT LOGS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can create audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- SUBSCRIPTIONS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users view own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Admins view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins view all subscriptions" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
    )
  );

-- BRIEFS
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agencies can view their own briefs" ON public.briefs;
CREATE POLICY "Agencies can view their own briefs" ON public.briefs
  FOR SELECT USING (agency_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Agencies can create briefs" ON public.briefs;
CREATE POLICY "Agencies can create briefs" ON public.briefs
  FOR INSERT WITH CHECK (agency_id::text = auth.uid()::text);

-- 14) Defensive BetterAuth sync: only install sync trigger if public.user exists
DO $$ 
DECLARE
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='roles') THEN

    -- Drop existing function if it exists (defensive - handles signature changes)
    DROP FUNCTION IF EXISTS public.sync_better_auth_user() CASCADE;

    -- Create a defensive sync function (replaces sync_better_auth_user.sql content) if not exists
    CREATE OR REPLACE FUNCTION public.sync_better_auth_user()
    RETURNS TRIGGER AS $sync_func$
    DECLARE
      default_role_id UUID;
    BEGIN
      SELECT id INTO default_role_id FROM public.roles WHERE name = 'user' LIMIT 1;
      IF default_role_id IS NULL THEN
        RAISE NOTICE 'No default role id found - aborting sync for this operation';
        RETURN NEW;
      END IF;

      IF TG_OP = 'INSERT' THEN
        INSERT INTO public.users (id, email, name, role_id, created_at, updated_at)
        VALUES (
          NEW.id,
          NEW.email,
          NEW.name,
          default_role_id,
          COALESCE(NEW.created_at, NOW()),
          COALESCE(NEW.updated_at, NOW())
        )
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          updated_at = EXCLUDED.updated_at;

      ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.users
        SET email = NEW.email, name = NEW.name, updated_at = COALESCE(NEW.updated_at, NOW())
        WHERE id = NEW.id;

      ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.users WHERE id = OLD.id;
        RETURN OLD;
      END IF;

      RETURN NEW;
    END;
    $sync_func$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create trigger if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'sync_better_auth_user_trigger') THEN
      CREATE TRIGGER sync_better_auth_user_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.user
        FOR EACH ROW EXECUTE FUNCTION public.sync_better_auth_user();
    END IF;

    -- Run initial one-time sync: copy existing public.user rows into public.users (idempotent)
    INSERT INTO public.users (id, email, name, role_id, created_at, updated_at)
    SELECT u.id, u.email, u.name, r.id as role_id, COALESCE(u.created_at, NOW()), COALESCE(u.updated_at, NOW())
    FROM public.user u
    CROSS JOIN (SELECT id FROM public.roles WHERE name = 'user' LIMIT 1) r
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, updated_at = EXCLUDED.updated_at;

  ELSE
    RAISE NOTICE 'BetterAuth `public.user` table or `public.roles` table not present; skipping BetterAuth sync installation';
  END IF;
  
  -- Final notice
  RAISE NOTICE 'Consolidated schema script completed. Verify by inspecting tables and policies. If you still see uuid=text errors, run the "inspect types" query and paste results to me for a precise fix.';
END $$ LANGUAGE plpgsql;

-- 15) Security fixes for BetterAuth tables (RLS policies)
-- Enable RLS on BetterAuth core tables
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (defensive)
DROP POLICY IF EXISTS "Users can view their own data" ON public."user";
DROP POLICY IF EXISTS "Users can update their own data" ON public."user";
DROP POLICY IF EXISTS "Users can delete their own data" ON public."user";
DROP POLICY IF EXISTS "Service role can manage users" ON public."user";

DROP POLICY IF EXISTS "Users can view their own sessions" ON public.session;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.session;
DROP POLICY IF EXISTS "Service role can manage sessions" ON public.session;

DROP POLICY IF EXISTS "Users can view their own accounts" ON public.account;
DROP POLICY IF EXISTS "Users can update their own accounts" ON public.account;
DROP POLICY IF EXISTS "Service role can manage accounts" ON public.account;

DROP POLICY IF EXISTS "Service role can manage verifications" ON public.verification;

-- Create RLS policies for 'user' table (BetterAuth)
CREATE POLICY "Users can view their own data"
  ON public."user"
  FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data"
  ON public."user"
  FOR UPDATE
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can delete their own data"
  ON public."user"
  FOR DELETE
  USING (auth.uid()::text = id::text);

CREATE POLICY "Service role can manage users"
  ON public."user"
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create RLS policies for 'session' table
CREATE POLICY "Users can view their own sessions"
  ON public.session
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own sessions"
  ON public.session
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage sessions"
  ON public.session
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create RLS policies for 'account' table
CREATE POLICY "Users can view their own accounts"
  ON public.account
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own accounts"
  ON public.account
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage accounts"
  ON public.account
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create RLS policies for 'verification' table
-- Only service role can manage verification tokens
CREATE POLICY "Service role can manage verifications"
  ON public.verification
  FOR ALL
  USING (auth.role() = 'service_role');

-- 16) Optional: Create additional indexes for better RLS performance
CREATE INDEX IF NOT EXISTS user_id_idx ON public."user"(id);
CREATE INDEX IF NOT EXISTS session_user_id_idx_rls ON public.session(user_id);
CREATE INDEX IF NOT EXISTS account_user_id_idx_rls ON public.account(user_id);
CREATE INDEX IF NOT EXISTS verification_identifier_idx_rls ON public.verification(identifier);

-- Final completion message
DO $$ BEGIN
  RAISE NOTICE '=============================================================';
  RAISE NOTICE 'Database setup complete with security fixes!';
  RAISE NOTICE 'All tables created, RLS enabled, and policies configured.';
  RAISE NOTICE '=============================================================';
END $$;
