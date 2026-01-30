-- Create settings table for storing clinic configuration
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for settings (since no auth)
CREATE POLICY "Allow public read access to settings"
ON public.settings
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to settings"
ON public.settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to settings"
ON public.settings
FOR UPDATE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
  ('webhook_url', ''),
  ('agent_enabled', 'true'),
  ('clinic_name', 'عيادة الأسنان المتقدمة'),
  ('clinic_phone', '0112345678'),
  ('clinic_email', 'info@dentalclinic.sa'),
  ('clinic_address', 'الرياض، حي النخيل');