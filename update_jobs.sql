-- ==========================================
-- UPDATE JOBS SCRIPT (SAFE ADD)
-- ==========================================
-- This script will:
-- 1. Check if the job title already exists in the database.
-- 2. If it does NOT exist, it inserts the job.
-- 3. This ensures we add only the NEW jobs (Senior Nursing Officer, Nursing Officer I, Nursing Officer II)
--    without creating duplicates or deleting existing data.
-- ==========================================

-- VII. Senior Nursing Officer (CONHESS 09)
INSERT INTO public.jobs (
    title, department, location, type, description, 
    requirements, required_documents, license_label, is_active
) 
SELECT 
    'Senior Nursing Officer (CONHESS 09)',
    'Nursing Services',
    'Maiduguri',
    'Clinical',
    'Provide advanced nursing care and supervision.',
    ARRAY[
        'First degree in Nursing Sciences (BNSc) from a recognized institution',
        'Registered with Nursing and Midwifery Council of Nigeria',
        'Valid practicing license',
        'NYSC certificate or exemption letter'
    ],
    ARRAY['BNSc Degree Certificate', 'NMCN Registration', 'Current Practicing License', 'NYSC Discharge/Exemption Certificate'],
    'NMCN Registration Number',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.jobs WHERE title = 'Senior Nursing Officer (CONHESS 09)'
);

-- VIII. Nursing Officer I (CONHESS 08)
INSERT INTO public.jobs (
    title, department, location, type, description, 
    requirements, required_documents, license_label, is_active
) 
SELECT 
    'Nursing Officer I (CONHESS 08)',
    'Nursing Services',
    'Maiduguri',
    'Clinical',
    'Provide nursing care and patient management.',
    ARRAY[
        'Registered Nurse Certificate (RN/RM)',
        'Post Basic Nursing Qualification',
        'Registration with Nursing and Midwifery Council of Nigeria',
        'Valid practicing license'
    ],
    ARRAY['RN/RM Certificate', 'Post Basic Certificate', 'NMCN Registration', 'Current Practicing License'],
    'NMCN Registration Number',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.jobs WHERE title = 'Nursing Officer I (CONHESS 08)'
);

-- IX. Nursing Officer II (CONHESS 06)
INSERT INTO public.jobs (
    title, department, location, type, description, 
    requirements, required_documents, license_label, is_active
) 
SELECT 
    'Nursing Officer II (CONHESS 06)',
    'Nursing Services',
    'Maiduguri',
    'Clinical',
    'Provide basic nursing care to patients.',
    ARRAY[
        'Registered Nurse (RN) or Registered Midwife (RM) Certificate',
        'Registration with Nursing and Midwifery Council of Nigeria'
    ],
    ARRAY['RN/RM Certificate', 'NMCN Registration', 'Current Practicing License'],
    'NMCN Registration Number',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.jobs WHERE title = 'Nursing Officer II (CONHESS 06)'
);

-- Verify the count
SELECT count(*) as total_jobs FROM public.jobs;
