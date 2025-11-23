export interface Applicant {
  id: string;
  refNumber: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: 'Draft' | 'Submitted' | 'Shortlisted' | 'Interview';
  appliedDate: string;
}

export const applicantsData: Applicant[] = [
  {
    id: 'APP001',
    refNumber: 'KIUTH-2024-001',
    name: 'Dr. Amina Mohammed',
    email: 'amina.mohammed@email.com',
    phone: '08012345678',
    position: 'Consultant Surgeon',
    department: 'Surgery',
    status: 'Interview',
    appliedDate: '2024-11-15'
  },
  {
    id: 'APP002',
    refNumber: 'KIUTH-2024-002',
    name: 'Ibrahim Musa',
    email: 'ibrahim.musa@email.com',
    phone: '08023456789',
    position: 'Medical Officer',
    department: 'Internal Medicine',
    status: 'Shortlisted',
    appliedDate: '2024-11-16'
  },
  {
    id: 'APP003',
    refNumber: 'KIUTH-2024-003',
    name: 'Fatima Abubakar',
    email: 'fatima.abubakar@email.com',
    phone: '08034567890',
    position: 'Registered Nurse',
    department: 'Nursing Services',
    status: 'Submitted',
    appliedDate: '2024-11-17'
  },
  {
    id: 'APP004',
    refNumber: 'KIUTH-2024-004',
    name: 'Yusuf Ahmed',
    email: 'yusuf.ahmed@email.com',
    phone: '08045678901',
    position: 'Medical Laboratory Scientist',
    department: 'Laboratory Services',
    status: 'Submitted',
    appliedDate: '2024-11-18'
  },
  {
    id: 'APP005',
    refNumber: 'KIUTH-2024-005',
    name: 'Hauwa Bello',
    email: 'hauwa.bello@email.com',
    phone: '08056789012',
    position: 'Pharmacist',
    department: 'Pharmacy',
    status: 'Shortlisted',
    appliedDate: '2024-11-19'
  },
  {
    id: 'APP006',
    refNumber: 'KIUTH-2024-006',
    name: 'Dr. Usman Ali',
    email: 'usman.ali@email.com',
    phone: '08067890123',
    position: 'Lecturer - Anatomy',
    department: 'Basic Medical Sciences',
    status: 'Interview',
    appliedDate: '2024-11-20'
  },
  {
    id: 'APP007',
    refNumber: 'KIUTH-2024-007',
    name: 'Aisha Suleiman',
    email: 'aisha.suleiman@email.com',
    phone: '08078901234',
    position: 'Human Resources Officer',
    department: 'Administration',
    status: 'Submitted',
    appliedDate: '2024-11-21'
  },
  {
    id: 'APP008',
    refNumber: 'KIUTH-2024-008',
    name: 'Mohammed Baba',
    email: 'mohammed.baba@email.com',
    phone: '08089012345',
    position: 'Accountant',
    department: 'Finance',
    status: 'Draft',
    appliedDate: '2024-11-22'
  },
  {
    id: 'APP009',
    refNumber: 'KIUTH-2024-009',
    name: 'Zainab Hassan',
    email: 'zainab.hassan@email.com',
    phone: '08090123456',
    position: 'Radiographer',
    department: 'Radiology',
    status: 'Submitted',
    appliedDate: '2024-11-22'
  },
  {
    id: 'APP010',
    refNumber: 'KIUTH-2024-010',
    name: 'Abdullahi Garba',
    email: 'abdullahi.garba@email.com',
    phone: '08001234567',
    position: 'ICT Officer',
    department: 'Information Technology',
    status: 'Shortlisted',
    appliedDate: '2024-11-22'
  }
];
