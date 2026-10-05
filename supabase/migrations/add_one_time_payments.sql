-- One-time purchase products
-- Add this to your Supabase migration

CREATE TABLE public.one_time_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  slug VARCHAR UNIQUE NOT NULL,
  amount INT NOT NULL, -- In minor units (kobo/cents)
  currency VARCHAR(3) NOT NULL DEFAULT 'KES',
  category VARCHAR(50), -- e.g., 'template', 'license', 'addon', 'course'
  features TEXT[], -- Array of feature descriptions
  icon VARCHAR, -- Icon name from lucide-react
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_one_time_products_active ON public.one_time_products(is_active);
CREATE INDEX idx_one_time_products_currency ON public.one_time_products(currency);
CREATE INDEX idx_one_time_products_order ON public.one_time_products(display_order);

-- Track one-time purchases
CREATE TABLE public.one_time_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.one_time_products(id) ON DELETE RESTRICT,
  paystack_reference VARCHAR UNIQUE NOT NULL,
  amount INT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, success, failed, abandoned
  paystack_response JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_one_time_purchases_user ON public.one_time_purchases(user_id);
CREATE INDEX idx_one_time_purchases_product ON public.one_time_purchases(product_id);
CREATE INDEX idx_one_time_purchases_status ON public.one_time_purchases(status);
CREATE INDEX idx_one_time_purchases_reference ON public.one_time_purchases(paystack_reference);

-- Enable RLS
ALTER TABLE public.one_time_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_time_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for one_time_products (public read, authenticated admin create/update)
CREATE POLICY "Products are viewable by everyone" ON public.one_time_products
  FOR SELECT USING (is_active = true);

-- Allow all authenticated users to insert (API will check admin role)
CREATE POLICY "Authenticated users can manage products" ON public.one_time_products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products" ON public.one_time_products
  FOR UPDATE WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for one_time_purchases
CREATE POLICY "Users view own purchases" ON public.one_time_purchases
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users insert own purchases" ON public.one_time_purchases
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Admins view all purchases" ON public.one_time_purchases
  FOR SELECT USING (auth.role() = 'authenticated');
