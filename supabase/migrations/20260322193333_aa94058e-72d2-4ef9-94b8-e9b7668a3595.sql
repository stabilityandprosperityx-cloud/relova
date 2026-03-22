
-- User profiles
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  citizenship text,
  target_country text,
  visa_type text,
  goal text,
  monthly_budget integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Visa documents (public read)
CREATE TABLE public.visa_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visa_type text NOT NULL,
  document_name text NOT NULL,
  is_required boolean NOT NULL DEFAULT true,
  description text
);

ALTER TABLE public.visa_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visa_documents" ON public.visa_documents FOR SELECT USING (true);

-- User documents
CREATE TABLE public.user_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  file_url text,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.user_documents FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own documents" ON public.user_documents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own documents" ON public.user_documents FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own documents" ON public.user_documents FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Relocation steps (public read)
CREATE TABLE public.relocation_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visa_type text NOT NULL,
  step_number integer NOT NULL,
  title text NOT NULL,
  description text,
  estimated_days integer NOT NULL DEFAULT 1
);

ALTER TABLE public.relocation_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read relocation_steps" ON public.relocation_steps FOR SELECT USING (true);

-- User steps
CREATE TABLE public.user_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step_id uuid REFERENCES public.relocation_steps(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'todo',
  completed_at timestamptz,
  UNIQUE(user_id, step_id)
);

ALTER TABLE public.user_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own steps" ON public.user_steps FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own steps" ON public.user_steps FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own steps" ON public.user_steps FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Chat messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Storage bucket for user documents
INSERT INTO storage.buckets (id, name, public) VALUES ('user-documents', 'user-documents', false);

CREATE POLICY "Users can upload own docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own docs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own docs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Seed visa_documents for D7
INSERT INTO public.visa_documents (visa_type, document_name, is_required, description) VALUES
('D7', 'Passport valid 6+ months', true, 'Your passport must be valid for at least 6 months beyond your planned stay'),
('D7', 'NIF certificate', true, 'Portuguese tax identification number — required before visa application'),
('D7', 'Health insurance (€30k min)', true, 'International health insurance with minimum €30,000 coverage'),
('D7', 'Bank statements 6 months', true, 'Last 6 months of bank statements showing sufficient passive income'),
('D7', 'Criminal record certificate (apostilled)', true, 'From your home country, apostilled or legalized'),
('D7', 'Proof of accommodation (12mo lease)', true, 'Signed 12-month rental contract or property ownership proof'),
('D7', 'Proof of passive income', true, 'Documentation of regular passive income sources'),
('D7', 'Biometric passport photos', false, 'Standard biometric photos — check consulate specifications');

-- Seed visa_documents for Digital_Nomad
INSERT INTO public.visa_documents (visa_type, document_name, is_required, description) VALUES
('Digital_Nomad', 'Passport valid 6+ months', true, 'Your passport must be valid for at least 6 months beyond your planned stay'),
('Digital_Nomad', 'Proof of remote employment or freelance', true, 'Employment contract or freelance contracts with non-Portuguese companies'),
('Digital_Nomad', 'Proof of income €3,280+/month', true, 'At least 3 months of income proof showing €3,280+ monthly'),
('Digital_Nomad', 'Health insurance', true, 'International health insurance valid in Portugal'),
('Digital_Nomad', 'Criminal record certificate', true, 'From your home country, apostilled or legalized'),
('Digital_Nomad', 'Accommodation proof', true, 'Rental agreement or booking confirmation in Portugal'),
('Digital_Nomad', 'NIF certificate', true, 'Portuguese tax identification number');

-- Seed relocation_steps for D7
INSERT INTO public.relocation_steps (visa_type, step_number, title, description, estimated_days) VALUES
('D7', 1, 'Get NIF number', 'Apply for your Portuguese tax identification number (NIF) — can be done remotely via a fiscal representative', 7),
('D7', 2, 'Prepare 6 months bank statements', 'Gather and organize your last 6 months of bank statements showing passive income', 3),
('D7', 3, 'Obtain criminal record certificate, apostilled', 'Request from your home country and get the apostille stamp', 14),
('D7', 4, 'Get health insurance policy min €30k', 'Purchase international health insurance with minimum €30,000 coverage valid in Portugal', 3),
('D7', 5, 'Open Portuguese bank account', 'Open a bank account in Portugal — some banks allow remote opening', 7),
('D7', 6, 'Deposit minimum required savings', 'Transfer the minimum required amount to your Portuguese bank account', 1),
('D7', 7, 'Find and sign 12-month lease in Portugal', 'Secure accommodation with a minimum 12-month rental contract', 14),
('D7', 8, 'Book VFS Global appointment', 'Schedule your visa submission appointment through VFS Global', 1),
('D7', 9, 'Submit D7 visa application', 'Submit your complete application with all required documents', 1),
('D7', 10, 'Wait for visa approval', 'Processing time varies — typically 60-90 days', 90),
('D7', 11, 'Travel to Portugal', 'Enter Portugal with your approved D7 visa', 1),
('D7', 12, 'Register at AIMA office within 90 days', 'Schedule and attend your AIMA appointment for residency permit', 30),
('D7', 13, 'Apply for NHR tax status', 'Register for Non-Habitual Resident tax regime for potential tax benefits', 7);

-- Seed relocation_steps for Digital_Nomad
INSERT INTO public.relocation_steps (visa_type, step_number, title, description, estimated_days) VALUES
('Digital_Nomad', 1, 'Confirm income source qualifies', 'Verify your remote work arrangement meets Digital Nomad Visa requirements', 1),
('Digital_Nomad', 2, 'Prepare income proof — 3 months minimum', 'Gather at least 3 months of payslips or invoices showing €3,280+/month', 3),
('Digital_Nomad', 3, 'Get criminal record certificate, apostilled', 'Request from your home country and get the apostille stamp', 14),
('Digital_Nomad', 4, 'Get health insurance', 'Purchase international health insurance valid in Portugal', 3),
('Digital_Nomad', 5, 'Book Portuguese consulate appointment', 'Schedule your visa application appointment at the nearest Portuguese consulate', 1),
('Digital_Nomad', 6, 'Submit Digital Nomad Visa application', 'Submit your complete application with all required documents', 1),
('Digital_Nomad', 7, 'Wait for visa approval', 'Processing time typically 30-60 days', 45),
('Digital_Nomad', 8, 'Travel to Portugal', 'Enter Portugal with your approved Digital Nomad Visa', 1),
('Digital_Nomad', 9, 'Register at AIMA office', 'Schedule and attend your AIMA appointment for residency permit', 30),
('Digital_Nomad', 10, 'Get NIF and open bank account', 'Apply for NIF and open a Portuguese bank account after arrival', 7);
