-- Add status column to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pending';

-- Update existing records to have 'Pending' status
UPDATE public.applications 
SET status = 'Pending' 
WHERE status IS NULL;
