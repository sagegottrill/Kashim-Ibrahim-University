-- Create jobs table
create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  department text not null,
  location text not null,
  type text not null,
  description text not null,
  requirements text[] not null,
  required_documents text[] not null,
  license_label text,
  is_active boolean default true
);

-- Enable RLS for jobs
alter table public.jobs enable row level security;

-- Allow everyone to read active jobs
create policy "Enable read access for everyone" on public.jobs
  for select using (is_active = true);

-- Allow admins (authenticated) to insert/update/delete jobs
create policy "Enable write access for authenticated users" on public.jobs
  for all using (auth.role() = 'authenticated');

-- Create contact_messages table
create table public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text default 'New'
);

-- Enable RLS for contact_messages
alter table public.contact_messages enable row level security;

-- Allow everyone to insert messages
create policy "Enable insert for everyone" on public.contact_messages
  for insert with check (true);

-- Allow admins to read messages
create policy "Enable read access for authenticated users" on public.contact_messages
  for select using (auth.role() = 'authenticated');

-- Seed initial jobs data (migrating from jobsData.ts)
insert into public.jobs (title, department, location, type, description, requirements, required_documents, license_label)
values
  (
    'Medical Officer (CONMESS 3)',
    'Clinical Services',
    'Maiduguri',
    'Clinical',
    'Provide general medical care and management of patients.',
    ARRAY['MBBS degree from a recognized institution', 'Full registration with the Medical and Dental Council of Nigeria (MDCN)', 'Evidence of completion of NYSC'],
    ARRAY['MBBS Degree Certificate', 'MDCN Full Registration', 'NYSC Discharge/Exemption Certificate', 'Current Practicing License'],
    'MDCN Registration Number'
  ),
  (
    'Pharmacist (CONHESS 09)',
    'Pharmacy',
    'Maiduguri',
    'Clinical',
    'Dispense medications and provide pharmaceutical care.',
    ARRAY['First degree in Pharmacy (B.Pharm) from a recognized institution', 'Registration with the Pharmacists Council of Nigeria (PCN)', 'Completion of NYSC'],
    ARRAY['B.Pharm Degree Certificate', 'PCN Registration Certificate', 'NYSC Discharge/Exemption Certificate', 'Current Practicing License'],
    'PCN Registration Number'
  ),
  (
    'Radiographer (CONHESS 09)',
    'Radiology',
    'Maiduguri',
    'Clinical',
    'Perform diagnostic imaging procedures.',
    ARRAY['Bachelor’s degree in Radiography (B. Rad) or equivalent', 'Registration with the Radiographers Registration Board of Nigeria (RRBN)', 'Completion of NYSC'],
    ARRAY['B.Rad Degree Certificate', 'RRBN Registration Certificate', 'NYSC Discharge/Exemption Certificate', 'Current Practicing License'],
    'RRBN Registration Number'
  ),
  (
    'Physiotherapist (CONHESS 09)',
    'Physiotherapy',
    'Maiduguri',
    'Clinical',
    'Provide physical therapy and rehabilitation services.',
    ARRAY['Recognized degree (B.Sc.) in Physiotherapy, Prosthetics/Orthotics, or Human Anatomy', 'Valid Practicing license', 'Completion of NYSC'],
    ARRAY['B.Sc Degree Certificate', 'Practicing License', 'NYSC Discharge/Exemption Certificate'],
    'MRTBN Registration Number'
  ),
  (
    'Medical Laboratory Scientist (CONHESS 09)',
    'Laboratory Services',
    'Maiduguri',
    'Clinical',
    'Conduct medical laboratory tests and analyses.',
    ARRAY['Bachelor of Medical Laboratory Science (BMLS) degree or equivalent', 'Registration with the Medical Laboratory Science Council of Nigeria (MLSCN)', 'Valid practicing license', 'NYSC certificate'],
    ARRAY['BMLS Degree Certificate', 'MLSCN Registration', 'Current Practicing License', 'NYSC Discharge/Exemption Certificate'],
    'MLSCN Registration Number'
  ),
  (
    'Medical Laboratory Technician (CONHESS 06)',
    'Laboratory Services',
    'Maiduguri',
    'Clinical',
    'Assist in performing laboratory tests and procedures.',
    ARRAY['National Diploma (ND) in Medical Laboratory Technician (MLT)', 'Registration with the Institute of Medical Laboratory Technology of Nigeria (IMLT)'],
    ARRAY['MLT National Diploma', 'IMLT Registration Certificate', 'Current Practicing License'],
    'IMLT Registration Number'
  ),
  (
    'Staff Nurse (CONHESS 06)',
    'Nursing Services',
    'Maiduguri',
    'Clinical',
    'Provide professional nursing care to patients.',
    ARRAY['Nurse (RN or RM) qualifications', 'Registration with the Nursing and Midwifery Council of Nigeria (NMCN)'],
    ARRAY['RN/RM Certificate', 'NMCN Registration', 'Current Practicing License'],
    'NMCN Registration Number'
  ),
  (
    'Health Information Management Officer (CONHESS 06)',
    'Health Records',
    'Maiduguri',
    'Non-Clinical',
    'Manage patient health information and records.',
    ARRAY['National Diploma (ND) in Health Information Management', 'Registration with the HRORBN', 'Valid practicing license', 'Computer proficiency'],
    ARRAY['HIM National Diploma', 'HRORBN Registration', 'Current Practicing License'],
    'HRORBN Registration Number'
  ),
  (
    'Environmental Health Officer (CONHESS 06)',
    'Environmental Health',
    'Maiduguri',
    'Non-Clinical',
    'Ensure environmental health standards are met within the hospital.',
    ARRAY['National Diploma (ND) in Environment Health Technician (MHT)', 'Registration with EHORECON', 'Valid practicing license'],
    ARRAY['MHT National Diploma', 'EHORECON Registration', 'Current Practicing License'],
    'EHORECON Registration Number'
  );
