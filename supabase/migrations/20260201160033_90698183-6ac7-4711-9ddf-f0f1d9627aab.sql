-- Create services table
CREATE TABLE public.services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL DEFAULT 0,
    duration integer NOT NULL DEFAULT 30,
    is_active boolean NOT NULL DEFAULT true,
    category text NOT NULL DEFAULT 'عام',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create visits table
CREATE TABLE public.visits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    date date NOT NULL DEFAULT CURRENT_DATE,
    diagnosis text,
    treatment text,
    notes text,
    total_cost numeric(10,2) NOT NULL DEFAULT 0,
    doctor_name text NOT NULL DEFAULT 'الطبيب',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create visit_services junction table for many-to-many relationship
CREATE TABLE public.visit_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id uuid REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
    service_id uuid REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    price_at_time numeric(10,2) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(visit_id, service_id)
);

-- Enable RLS on all tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_services ENABLE ROW LEVEL SECURITY;

-- RLS policies for services (public read, public write for now)
CREATE POLICY "Allow public read access to services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow public insert to services" ON public.services FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to services" ON public.services FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to services" ON public.services FOR DELETE USING (true);

-- RLS policies for visits
CREATE POLICY "Allow public read access to visits" ON public.visits FOR SELECT USING (true);
CREATE POLICY "Allow public insert to visits" ON public.visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to visits" ON public.visits FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to visits" ON public.visits FOR DELETE USING (true);

-- RLS policies for visit_services
CREATE POLICY "Allow public read access to visit_services" ON public.visit_services FOR SELECT USING (true);
CREATE POLICY "Allow public insert to visit_services" ON public.visit_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to visit_services" ON public.visit_services FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to visit_services" ON public.visit_services FOR DELETE USING (true);

-- Add service_id column to appointments table
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.services(id) ON DELETE SET NULL;

-- Create triggers for updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON public.visits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default services data
INSERT INTO public.services (name, description, price, duration, is_active, category) VALUES
('فحص وتنظيف الأسنان', 'فحص شامل مع تنظيف احترافي', 200, 30, true, 'وقائي'),
('حشو الأسنان', 'حشو تجميلي بمواد عالية الجودة', 350, 45, true, 'علاجي'),
('تبييض الأسنان', 'تبييض بتقنية الليزر', 1500, 60, true, 'تجميلي'),
('خلع ضرس العقل', 'خلع جراحي لضرس العقل', 800, 45, true, 'جراحي'),
('تركيب تاج', 'تاج خزفي عالي الجودة', 2000, 60, true, 'تعويضي'),
('علاج العصب', 'علاج جذور الأسنان', 1200, 90, true, 'علاجي');