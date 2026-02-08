
-- 1. Create admin role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS: only admins can read user_roles
CREATE POLICY "Admins can view roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Update coupons RLS policies - replace old permissive ones with role-based
DROP POLICY IF EXISTS "Admin full access to coupons" ON public.coupons;
DROP POLICY IF EXISTS "Anyone can read active coupons" ON public.coupons;

CREATE POLICY "Admins full access to coupons"
ON public.coupons
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read active coupons"
ON public.coupons
FOR SELECT
TO anon, authenticated
USING (active = true);

-- 3. Update form_submissions RLS policies
DROP POLICY IF EXISTS "Admin full access to submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Anyone can submit form" ON public.form_submissions;

CREATE POLICY "Admins full access to submissions"
ON public.form_submissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can submit form"
ON public.form_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. Make documents bucket private
UPDATE storage.buckets SET public = false WHERE id = 'documents';

-- 5. Update storage policies for documents
DROP POLICY IF EXISTS "Anyone can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read documents" ON storage.objects;

-- Allow anonymous uploads (form submissions)
CREATE POLICY "Anyone can upload documents"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'documents');

-- Only admins can read documents
CREATE POLICY "Admins can read documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));
