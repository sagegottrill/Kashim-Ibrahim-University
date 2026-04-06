-- ==========================================
-- KIUTH Recruitment Portal - Complete Database Schema
-- ==========================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLE: users
-- ==========================================
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'user'
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User view own profile" ON public.users FOR SELECT TO anon, authenticated USING (true);

-- ==========================================
-- TABLE: jobs
-- ==========================================
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT,
    department TEXT,
    location TEXT,
    type TEXT,
    description TEXT,
    requirements TEXT[] DEFAULT '{}',
    required_documents TEXT[] DEFAULT '{}',
    license_label TEXT,
    salary_range TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public jobs view" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Admin jobs modification" ON public.jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- TABLE: applications
-- ==========================================
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    state_of_origin TEXT,
    lga TEXT,
    nin_number TEXT,
    position TEXT,
    department TEXT,
    specialty TEXT,
    qualification TEXT,
    year_of_graduation INTEGER,
    license_number TEXT,
    institution TEXT,
    reference_number TEXT,
    cv_url TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'Pending',
    other_documents JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

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
-- TABLE: contact_messages
-- ==========================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public contact submission" ON public.contact_messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admin view contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_admin());

-- ==========================================
-- RPC FUNCTIONS
-- ==========================================

-- Get application by email (for dashboard)
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

GRANT EXECUTE ON FUNCTION public.get_application_by_email(TEXT) TO anon;

-- Get all applications for admin
CREATE OR REPLACE FUNCTION public.get_all_applications_for_admin(admin_email TEXT)
RETURNS SETOF public.applications AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.users WHERE email = admin_email AND role = 'admin') THEN
    RETURN QUERY SELECT * FROM public.applications ORDER BY created_at DESC;
  ELSE
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_all_applications_for_admin(TEXT) TO anon;

-- ==========================================
-- SEED DATA
-- ==========================================

-- Admin User
INSERT INTO public.users (email, role, full_name)
VALUES ('admin.kiuth@gmail.com', 'admin', 'System Admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Jobs
INSERT INTO public.jobs (title, department, location, type, description, requirements, required_documents, license_label, is_active)
SELECT 'Chief Medical Director', 'Administration', 'KIUTH Main Campus', 'Clinical', 'Oversee the medical operations of the hospital.', ARRAY['MBBS or equivalent', 'Fellowship of National Postgraduate Medical College', '15+ years experience'], ARRAY['Practicing License', 'Fellowship Certificate'], 'MDCN License', true
WHERE NOT EXISTS (SELECT 1 FROM public.jobs WHERE title = 'Chief Medical Director');

INSERT INTO public.jobs (title, department, location, type, description, requirements, required_documents, license_label, is_active)
SELECT 'Senior Nursing Officer', 'Nursing Services', 'KIUTH Main Campus', 'Clinical', 'Manage nursing staff and patient care.', ARRAY['B.Sc Nursing', 'Registered Nurse/Midwife', '5+ years experience'], ARRAY['Nursing License'], 'NMCN License', true
WHERE NOT EXISTS (SELECT 1 FROM public.jobs WHERE title = 'Senior Nursing Officer');

INSERT INTO public.jobs (title, department, location, type, description, requirements, required_documents, license_label, is_active)
SELECT 'Hospital Administrator', 'Administration', 'KIUTH Main Campus', 'Non-Clinical', 'Manage hospital administrative functions.', ARRAY['B.Sc/HND in Hospital Administration or related field', 'MBA is an advantage', '7+ years experience'], ARRAY['Degree Certificate'], 'Professional Membership', true
WHERE NOT EXISTS (SELECT 1 FROM public.jobs WHERE title = 'Hospital Administrator');
