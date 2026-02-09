
-- Create storage bucket for client logos
INSERT INTO storage.buckets (id, name, public) VALUES ('client-logos', 'client-logos', true);

-- Public read access
CREATE POLICY "Client logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'client-logos');

-- Admins can upload
CREATE POLICY "Admins can upload client logos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'client-logos' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete client logos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'client-logos' AND public.has_role(auth.uid(), 'admin'::app_role));
