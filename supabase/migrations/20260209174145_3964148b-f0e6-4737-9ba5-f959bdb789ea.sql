-- Remove the unnecessary public INSERT policy on rate_limits
-- Edge functions use service_role key which bypasses RLS, so this policy is not needed
DROP POLICY IF EXISTS "Anyone can insert rate limits" ON public.rate_limits;