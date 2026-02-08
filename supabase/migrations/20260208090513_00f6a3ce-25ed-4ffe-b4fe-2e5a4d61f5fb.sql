
-- Coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  install_discount_enabled BOOLEAN NOT NULL DEFAULT false,
  install_discount_mode TEXT NOT NULL DEFAULT 'percent',
  install_discount_value NUMERIC NOT NULL DEFAULT 0,
  monthly_discount_enabled BOOLEAN NOT NULL DEFAULT false,
  monthly_discount_mode TEXT NOT NULL DEFAULT 'percent',
  monthly_discount_value NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint on uppercase code
CREATE UNIQUE INDEX coupons_code_upper_idx ON public.coupons (UPPER(code));

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can read active coupons (for the form validation)
CREATE POLICY "Anyone can read active coupons" ON public.coupons
  FOR SELECT USING (active = true);

-- Authenticated users (admin) have full access
CREATE POLICY "Admin full access to coupons" ON public.coupons
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Form submissions table
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf TEXT NOT NULL,
  rg TEXT NOT NULL,
  birth_date TEXT,
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT,
  platform_username TEXT,
  address_cep TEXT,
  address_uf TEXT,
  address_city TEXT,
  address_neighborhood TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_note TEXT,
  emergency_name TEXT,
  emergency_phone TEXT,
  emergency_relationship TEXT,
  vehicle_type TEXT,
  vehicle_fuel TEXT,
  vehicle_color TEXT,
  vehicle_plate TEXT,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_year TEXT,
  vehicle_max_days TEXT,
  remote_blocking TEXT,
  install_address_choice TEXT,
  install_cep TEXT,
  install_uf TEXT,
  install_city TEXT,
  install_neighborhood TEXT,
  install_street TEXT,
  install_number TEXT,
  install_complement TEXT,
  install_note TEXT,
  install_periods TEXT,
  installation_payment TEXT,
  monthly_payment TEXT,
  monthly_due_day TEXT,
  plan_name TEXT,
  monthly_value TEXT,
  install_value TEXT,
  coupon_code TEXT,
  coupon_description TEXT,
  doc1_url TEXT,
  doc1_name TEXT,
  doc2_url TEXT,
  doc2_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  user_agent_friendly TEXT,
  geolocation TEXT,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'novo',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (form submission from website)
CREATE POLICY "Anyone can submit form" ON public.form_submissions
  FOR INSERT WITH CHECK (true);

-- Authenticated users (admin) can read/update/delete
CREATE POLICY "Admin full access to submissions" ON public.form_submissions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Anyone can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated can view documents" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documents');
