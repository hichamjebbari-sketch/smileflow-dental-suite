-- جدول المواعيد
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30, -- مدة الموعد بالدقائق
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- منع تكرار الموعد في نفس الوقت
  UNIQUE(date, time)
);

-- تفعيل RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول العام
CREATE POLICY "Allow public read access to appointments" 
ON public.appointments 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update to appointments" 
ON public.appointments 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete to appointments" 
ON public.appointments 
FOR DELETE 
USING (true);

-- Trigger لتحديث updated_at
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index للبحث السريع
CREATE INDEX idx_appointments_date ON public.appointments(date);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);