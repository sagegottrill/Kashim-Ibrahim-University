-- Add nin_number and address columns to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS nin_number text,
ADD COLUMN IF NOT EXISTS address text;
