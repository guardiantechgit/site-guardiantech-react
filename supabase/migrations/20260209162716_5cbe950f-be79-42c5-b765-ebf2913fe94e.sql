
-- Create client_logos table
CREATE TABLE public.client_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;

-- Anyone can read active logos
CREATE POLICY "Anyone can read active client logos"
ON public.client_logos
FOR SELECT
USING (true);

-- Admins can manage logos
CREATE POLICY "Admins can manage client logos"
ON public.client_logos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed existing logos
INSERT INTO public.client_logos (name, image_url, sort_order) VALUES
  ('Vencomatic', '/images/cliente-vencomatic.png', 1),
  ('Asernet', '/images/cliente-asernet.png', 2),
  ('Peluso Sperandio', '/images/cliente-peluso-sperandio.png', 3),
  ('Sobradão', '/images/cliente-sobradao.png', 4),
  ('Florestas da São Vicente', '/images/cliente-florestas-da-sao-vicente.png', 5),
  ('Luxi Iluminação', '/images/cliente-luxiluminacao.png', 6),
  ('Sítio dos Ipês', '/images/cliente-sitio-dos-ipes.png', 7),
  ('Villa Real de Bragança', '/images/cliente-villa-real-de-braganca.png', 8),
  ('Lumaq', '/images/cliente-lumaq.png', 9),
  ('AC Oliveira', '/images/cliente-ac-oliveira.png', 10),
  ('HGB', '/images/cliente-hgb.png', 11),
  ('Elétrica Apolo', '/images/cliente-eletricaapolo.png', 12),
  ('Comando Fox', '/images/cliente-comandofox.png', 13),
  ('UAI Veículos', '/images/cliente-uaiveiculos.png', 14),
  ('LogMov', '/images/cliente-logmov.png', 15),
  ('Locagora', '/images/cliente-locagora.png', 16);
