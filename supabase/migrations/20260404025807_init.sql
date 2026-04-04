-- Seed initial user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'rogergenuino@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'rogergenuino@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;
END $$;

-- Create Domain Tables
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.freelancers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "auth_all_companies" ON public.companies;
CREATE POLICY "auth_all_companies" ON public.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_freelancers" ON public.freelancers;
CREATE POLICY "auth_all_freelancers" ON public.freelancers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_contracts" ON public.contracts;
CREATE POLICY "auth_all_contracts" ON public.contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed some mock data so the dashboard has numbers
DO $$
DECLARE
  comp1 uuid := gen_random_uuid();
  comp2 uuid := gen_random_uuid();
  free1 uuid := gen_random_uuid();
  free2 uuid := gen_random_uuid();
  free3 uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.companies (id, name) VALUES
    (comp1, 'Tech Solutions Ltda'),
    (comp2, 'Creative Agency')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.freelancers (id, name, specialty) VALUES
    (free1, 'Ana Silva', 'Frontend Developer'),
    (free2, 'Carlos Gomes', 'UI/UX Designer'),
    (free3, 'Mariana Costa', 'Backend Developer')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.contracts (company_id, freelancer_id, status) VALUES
    (comp1, free1, 'active'),
    (comp1, free3, 'active'),
    (comp2, free2, 'active'),
    (comp2, free1, 'completed')
  ON CONFLICT DO NOTHING;
END $$;
