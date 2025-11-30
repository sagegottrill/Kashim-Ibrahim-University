-- ==========================================
-- KIUTH Recruitment Portal - Database Setup (Final Fix)
-- ==========================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLE: jobs
-- ==========================================
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns if they don't exist
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS required_documents TEXT[] DEFAULT '{}';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS license_label TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_range TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public jobs view" ON public.jobs;
DROP POLICY IF EXISTS "Admin jobs modification" ON public.jobs;

CREATE POLICY "Public jobs view" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Admin jobs modification" ON public.jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==========================================
-- TABLE: applications
-- ==========================================
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS state_of_origin TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS lga TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS nin_number TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS qualification TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS year_of_graduation INTEGER;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS reference_number TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS cv_url TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';

-- RELAX CONSTRAINTS (Fix for "violates not-null constraint")
ALTER TABLE public.applications ALTER COLUMN year_of_graduation DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN date_of_birth DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN nin_number DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN license_number DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN specialty DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN department DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN institution DROP NOT NULL;

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public application submission" ON public.applications;
DROP POLICY IF EXISTS "Admin view all applications" ON public.applications;
DROP POLICY IF EXISTS "Admin update applications" ON public.applications;
DROP POLICY IF EXISTS "User view own application" ON public.applications;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Public application submission" ON public.applications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admin view all applications" ON public.applications FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admin update applications" ON public.applications FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "User view own application" ON public.applications FOR SELECT TO authenticated USING (lower(email) = lower((auth.jwt() ->> 'email')::text));


-- ==========================================
-- TABLE: users
-- ==========================================
-- ==========================================
-- TABLE: users
-- ==========================================
-- Re-creating users table to support Firebase Auth (decoupled from Supabase Auth)
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text, -- Changed to TEXT to support Firebase UIDs or auto-generated IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT,
    email TEXT UNIQUE, -- Ensure email is unique for lookups
    phone TEXT,
    role TEXT DEFAULT 'user'
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "User view own profile" ON public.users;
DROP POLICY IF EXISTS "User update own profile" ON public.users;

-- Allow anyone to read users (needed for admin checks via RPC) or restrict as needed
CREATE POLICY "User view own profile" ON public.users FOR SELECT TO anon, authenticated USING (true);

-- ==========================================
-- SEED ADMIN USER
-- ==========================================
INSERT INTO public.users (email, role, full_name)
VALUES ('admin.kiuth@gmail.com', 'admin', 'System Admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Trigger (Optional: Only works if you were using Supabase Auth, keeping for reference but likely unused with Firebase)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id::text, new.email, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (email) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- SAMPLE DATA
-- ==========================================
INSERT INTO public.jobs (title, department, location, type, description, requirements, required_documents, license_label, is_active)
SELECT 'Chief Medical Director', 'Administration', 'KIUTH Main Campus', 'Clinical', 'Oversee the medical operations of the hospital.', ARRAY['MBBS or equivalent', 'Fellowship of National Postgraduate Medical College', '15+ years experience'], ARRAY['Practicing License', 'Fellowship Certificate'], 'MDCN License', true
WHERE NOT EXISTS (SELECT 1 FROM public.jobs WHERE title = 'Chief Medical Director');

INSERT INTO public.jobs (title, department, location, type, description, requirements, required_documents, license_label, is_active)
SELECT 'Senior Nursing Officer', 'Nursing Services', 'KIUTH Main Campus', 'Clinical', 'Manage nursing staff and patient care.', ARRAY['B.Sc Nursing', 'Registered Nurse/Midwife', '5+ years experience'], ARRAY['Nursing License'], 'NMCN License', true
WHERE NOT EXISTS (SELECT 1 FROM public.jobs WHERE title = 'Senior Nursing Officer');

INSERT INTO public.jobs (title, department, location, type, description, requirements, required_documents, license_label, is_active)
SELECT 'Hospital Administrator', 'Administration', 'KIUTH Main Campus', 'Non-Clinical', 'Manage hospital administrative functions.', ARRAY['B.Sc/HND in Hospital Administration or related field', 'MBA is an advantage', '7+ years experience'], ARRAY['Degree Certificate'], 'Professional Membership', true
WHERE NOT EXISTS (SELECT 1 FROM public.jobs WHERE title = 'Hospital Administrator');
-- ==========================================
-- GRANT ADMIN ROLE
-- ==========================================
-- Ensure the main admin user has the correct role
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin.kiuth@gmail.com';

-- ==========================================
-- RPC FUNCTION (Fix for Firebase Auth + Supabase RLS)
-- ==========================================
-- Since users are authenticated via Firebase, they appear as 'anon' to Supabase.
-- This function allows the dashboard to securely fetch the application by email.

CREATE OR REPLACE FUNCTION public.get_application_by_email(email_input TEXT)
RETURNS SETOF public.applications AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.applications
  WHERE email ILIKE email_input
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to anon (Firebase users)
GRANT EXECUTE ON FUNCTION public.get_application_by_email(TEXT) TO anon;

-- ==========================================
-- RPC FUNCTION (Admin Access for Firebase Auth)
-- ==========================================
-- Allows fetching all applications if the email belongs to an admin.
CREATE OR REPLACE FUNCTION public.get_all_applications_for_admin(admin_email TEXT)
RETURNS SETOF public.applications AS $$
BEGIN
  -- Check if the user exists and is an admin
  IF EXISTS (SELECT 1 FROM public.users WHERE email = admin_email AND role = 'admin') THEN
    RETURN QUERY SELECT * FROM public.applications ORDER BY created_at DESC;
  ELSE
    -- Return empty set if not admin
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_all_applications_for_admin(TEXT) TO anon;
