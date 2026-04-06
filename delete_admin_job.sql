-- ==========================================
-- DELETE ADMINISTRATION JOB & DATA SCRIPT
-- ==========================================

-- 1. First, delete all applications associated with the 'Administration' department
--    or where the position is related to Administration to ensure clean removal.
DELETE FROM public.applications 
WHERE department = 'Administration' 
   OR position ILIKE '%Administration%';

-- 2. Delete the specific job posting for Administration if it exists in the jobs table
DELETE FROM public.jobs 
WHERE department = 'Administration' 
   OR title ILIKE '%Administration%';

-- 3. Verify removal
SELECT count(*) as admin_apps_remaining FROM public.applications WHERE department = 'Administration';
SELECT count(*) as admin_jobs_remaining FROM public.jobs WHERE department = 'Administration';
