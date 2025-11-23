-- Create a table for job applications
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  email text not null,
  phone text not null,
  state_of_origin text not null,
  lga text not null,
  position text not null,
  department text not null,
  specialty text,
  qualification text not null,
  year_of_graduation text not null,
  license_number text,
  institution text not null,
  reference_number text not null unique,
  cv_url text,
  photo_url text,
  other_documents jsonb default '[]'::jsonb
);

-- Set up Row Level Security (RLS)
alter table public.applications enable row level security;

-- Create a policy that allows anyone to insert (since it's a public form)
create policy "Enable insert for everyone" on public.applications
  for insert with check (true);

-- Create a policy that allows only authenticated users (admins) to view
-- For now, we'll leave it open for development or restrict to service role
-- Ideally, you'd have an admin role. For simplicity in this demo:
create policy "Enable read access for authenticated users only" on public.applications
  for select using (auth.role() = 'authenticated');

-- Create a storage bucket for documents
insert into storage.buckets (id, name, public) 
values ('job_documents', 'job_documents', false);

-- Policy to allow public to upload files
create policy "Enable upload for everyone" on storage.objects
  for insert with check (bucket_id = 'job_documents');

-- Policy to allow authenticated users to view files
create policy "Enable read for authenticated users" on storage.objects
  for select using (bucket_id = 'job_documents' and auth.role() = 'authenticated');
