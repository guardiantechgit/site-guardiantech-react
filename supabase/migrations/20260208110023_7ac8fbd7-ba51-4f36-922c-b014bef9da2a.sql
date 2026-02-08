
-- Rate limiting table for edge functions
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  endpoint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_rate_limits_ip_endpoint_time ON public.rate_limits (ip_address, endpoint, created_at DESC);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert (for tracking)
CREATE POLICY "Anyone can insert rate limits"
ON public.rate_limits
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow service role to read/delete (cleanup)
CREATE POLICY "Service role manages rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Auto-cleanup old entries (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.rate_limits WHERE created_at < now() - interval '1 hour';
$$;

-- Validate coupon by code (replaces open SELECT)
CREATE OR REPLACE FUNCTION public.validate_coupon(coupon_code text)
RETURNS TABLE (
  id uuid,
  code text,
  install_discount_enabled boolean,
  install_discount_mode text,
  install_discount_value numeric,
  monthly_discount_enabled boolean,
  monthly_discount_mode text,
  monthly_discount_value numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.code, c.install_discount_enabled, c.install_discount_mode, c.install_discount_value,
         c.monthly_discount_enabled, c.monthly_discount_mode, c.monthly_discount_value
  FROM public.coupons c
  WHERE c.code = coupon_code AND c.active = true
  LIMIT 1;
$$;

-- Remove the public read policy on coupons (replaced by function)
DROP POLICY IF EXISTS "Anyone can read active coupons" ON public.coupons;
