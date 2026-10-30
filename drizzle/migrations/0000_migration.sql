CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  phone text,
  entity_type text,
  reports text[] NOT NULL DEFAULT '{}',
  message text,
  consent boolean NOT NULL DEFAULT false,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  gclid text,
  landing_path text
);

GRANT INSERT ON public.contact_submissions TO anon;
GRANT ALL ON public.contact_submissions TO service_role;

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can submit the contact form"
ON public.contact_submissions
FOR INSERT
TO anon
WITH CHECK (
  consent = true
  AND char_length(full_name) BETWEEN 2 AND 120
  AND char_length(company) BETWEEN 2 AND 160
  AND char_length(email) BETWEEN 5 AND 255
  AND (phone IS NULL OR char_length(phone) <= 40)
  AND (entity_type IS NULL OR char_length(entity_type) <= 80)
  AND (message IS NULL OR char_length(message) <= 2000)
  AND coalesce(array_length(reports, 1), 0) <= 12
  AND (utm_source IS NULL OR char_length(utm_source) <= 200)
  AND (utm_medium IS NULL OR char_length(utm_medium) <= 200)
  AND (utm_campaign IS NULL OR char_length(utm_campaign) <= 200)
  AND (utm_term IS NULL OR char_length(utm_term) <= 200)
  AND (gclid IS NULL OR char_length(gclid) <= 300)
  AND (landing_path IS NULL OR char_length(landing_path) <= 500)
);