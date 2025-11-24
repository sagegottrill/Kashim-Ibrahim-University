-- Add date_of_birth column to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS date_of_birth date;
