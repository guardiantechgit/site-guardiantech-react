
-- 1. Create representatives table
CREATE TABLE public.representatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  pix_key TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.representatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to representatives"
  ON public.representatives FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Add representative_id and commission to coupons
ALTER TABLE public.coupons
  ADD COLUMN representative_id UUID REFERENCES public.representatives(id) ON DELETE SET NULL,
  ADD COLUMN commission_mode TEXT NOT NULL DEFAULT 'fixed',
  ADD COLUMN commission_value NUMERIC NOT NULL DEFAULT 0;

-- 3. Update form_submissions: add cancellation_reason, installation_paid
-- Change default status from 'novo' to 'recebido'
ALTER TABLE public.form_submissions
  ALTER COLUMN status SET DEFAULT 'recebido',
  ADD COLUMN cancellation_reason TEXT,
  ADD COLUMN installation_paid BOOLEAN NOT NULL DEFAULT false;

-- Update existing 'novo' submissions to 'recebido'
UPDATE public.form_submissions SET status = 'recebido' WHERE status = 'novo';
