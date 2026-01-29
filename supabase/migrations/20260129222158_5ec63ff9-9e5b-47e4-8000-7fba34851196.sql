-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create patients table
CREATE TABLE public.patients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female')),
    address TEXT,
    medical_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create public read policy (for API access without auth)
CREATE POLICY "Allow public read access to patients"
ON public.patients
FOR SELECT
USING (true);

-- Create public insert policy
CREATE POLICY "Allow public insert to patients"
ON public.patients
FOR INSERT
WITH CHECK (true);

-- Create public update policy
CREATE POLICY "Allow public update to patients"
ON public.patients
FOR UPDATE
USING (true);

-- Create public delete policy
CREATE POLICY "Allow public delete to patients"
ON public.patients
FOR DELETE
USING (true);

-- Create index on phone for faster lookups
CREATE INDEX idx_patients_phone ON public.patients(phone);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data from mock
INSERT INTO public.patients (id, name, phone, email, date_of_birth, gender, address, medical_history, created_at, updated_at)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'أحمد محمد العلي', '0501234567', 'ahmed@email.com', '1985-03-15', 'male', 'الرياض، حي النخيل', 'لا يوجد أمراض مزمنة', '2024-01-15', '2024-01-15'),
    ('00000000-0000-0000-0000-000000000002', 'فاطمة عبدالله السعيد', '0559876543', 'fatima@email.com', '1990-07-22', 'female', 'الرياض، حي الياسمين', 'حساسية من البنسلين', '2024-01-20', '2024-01-20'),
    ('00000000-0000-0000-0000-000000000003', 'خالد سعود المطيري', '0541112233', 'khaled@email.com', '1978-11-08', 'male', 'الرياض، حي الملقا', NULL, '2024-02-01', '2024-02-01'),
    ('00000000-0000-0000-0000-000000000004', 'نورة محمد الشمري', '0567778899', 'noura@email.com', '1995-04-12', 'female', 'الرياض، حي الربوة', NULL, '2024-02-10', '2024-02-10');