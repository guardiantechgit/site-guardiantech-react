
-- Add explicit SELECT policy for defense in depth on form_submissions
CREATE POLICY "Only admins can read submissions"
ON public.form_submissions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
