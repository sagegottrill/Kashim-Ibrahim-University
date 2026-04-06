-- ==========================================
-- UPDATE PHYSIOTHERAPIST REQUIREMENTS
-- ==========================================
-- This script updates the requirements for the Physiotherapist position
-- to match the revised advertisement text.
-- ==========================================

UPDATE public.jobs
SET requirements = ARRAY[
    'Recognized degree (B.Sc.) in Physiotherapy or Bachelor of Medical Rehabilitation (BMR) from a recognized institution',
    'Valid Practicing license',
    'Completion of NYSC'
]
WHERE title LIKE 'Physiotherapist%';

-- Verify the update
SELECT title, requirements FROM public.jobs WHERE title LIKE 'Physiotherapist%';
