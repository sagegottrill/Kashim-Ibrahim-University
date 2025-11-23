export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Clinical' | 'Non-Clinical' | 'Academic';
  description: string;
  requirements: string[];
  requiredDocuments: string[];
  licenseLabel: string;
}

export const jobsData: Job[] = [
  {
    id: 'JOB-MO-001',
    title: 'Medical Officer (CONMESS 3)',
    department: 'Clinical Services',
    location: 'Maiduguri',
    type: 'Clinical',
    description: 'Provide general medical care and management of patients.',
    requirements: [
      'MBBS degree from a recognized institution',
      'Full registration with the Medical and Dental Council of Nigeria (MDCN)',
      'Evidence of completion of NYSC'
    ],
    requiredDocuments: ['MBBS Degree Certificate', 'MDCN Full Registration', 'NYSC Discharge/Exemption Certificate', 'Current Practicing License'],
    licenseLabel: 'MDCN Registration Number'
  },
  {
    id: 'JOB-PH-002',
    title: 'Pharmacist (CONHESS 09)',
    department: 'Pharmacy',
    location: 'Maiduguri',
    type: 'Clinical',
    description: 'Dispense medications and provide pharmaceutical care.',
    requirements: [
      'First degree in Pharmacy (B.Pharm) from a recognized institution',
      'Registration with the Pharmacists Council of Nigeria (PCN)',
      'Completion of NYSC'
    ],
    requiredDocuments: ['B.Pharm Degree Certificate', 'PCN Registration Certificate', 'NYSC Discharge/Exemption Certificate', 'Current Practicing License'],
    licenseLabel: 'PCN Registration Number'
  },
  {
    id: 'JOB-RAD-003',
    title: 'Radiographer (CONHESS 09)',
    department: 'Radiology',
    location: 'Maiduguri',
    type: 'Clinical',
    description: 'Perform diagnostic imaging procedures.',
    requirements: [
      'Bachelor’s degree in Radiography (B. Rad) or equivalent',
      'Registration with the Radiographers Registration Board of Nigeria (RRBN)',
      'Completion of NYSC'
    ],
    requiredDocuments: ['B.Rad Degree Certificate', 'RRBN Registration Certificate', 'NYSC Discharge/Exemption Certificate', 'Current Practicing License'],
    licenseLabel: 'RRBN Registration Number'
  },
  {
    id: 'JOB-PHY-004',
    title: 'Physiotherapist (CONHESS 09)',
    department: 'Physiotherapy',
    location: 'Maiduguri',
    type: 'Clinical',
    description: 'Provide physical therapy and rehabilitation services.',
    requirements: [
      'Recognized degree (B.Sc.) in Physiotherapy, Prosthetics/Orthotics, or Human Anatomy',
      'Valid Practicing license',
      'Completion of NYSC'
    ],
    requiredDocuments: ['B.Sc Degree Certificate', 'Practicing License', 'NYSC Discharge/Exemption Certificate'],
    licenseLabel: 'MRTBN Registration Number'
  },
  {
    id: 'JOB-MLS-005',
    title: 'Medical Laboratory Scientist (CONHESS 09)',
    department: 'Laboratory Services',
    location: 'Maiduguri',
    type: 'Clinical',
    description: 'Conduct medical laboratory tests and analyses.',
    requirements: [
      'Bachelor of Medical Laboratory Science (BMLS) degree or equivalent',
      'Registration with the Medical Laboratory Science Council of Nigeria (MLSCN)',
      'Valid practicing license',
      'NYSC certificate'
    ],
    requiredDocuments: ['BMLS Degree Certificate', 'MLSCN Registration', 'Current Practicing License', 'NYSC Discharge/Exemption Certificate'],
    licenseLabel: 'MLSCN Registration Number'
  },
  {
    id: 'JOB-MLT-006',
    title: 'Medical Laboratory Technician (CONHESS 06)',
    department: 'Laboratory Services',
    location: 'Maiduguri',
    type: 'Clinical',
    description: 'Assist in performing laboratory tests and procedures.',
    requirements: [
      'National Diploma (ND) in Medical Laboratory Technician (MLT)',
      'Registration with the Institute of Medical Laboratory Technology of Nigeria (IMLT)'
    ],
    requiredDocuments: ['MLT National Diploma', 'IMLT Registration Certificate', 'Current Practicing License'],
    licenseLabel: 'IMLT Registration Number'
  },
  {
    id: 'JOB-NUR-007',
    title: 'Staff Nurse (CONHESS 06)',
    department: 'Nursing Services',
    location: 'Maiduguri',
    type: 'Clinical',
    description: 'Provide professional nursing care to patients.',
    requirements: [
      'Nurse (RN or RM) qualifications',
      'Registration with the Nursing and Midwifery Council of Nigeria (NMCN)'
    ],
    requiredDocuments: ['RN/RM Certificate', 'NMCN Registration', 'Current Practicing License'],
    licenseLabel: 'NMCN Registration Number'
  },
  {
    id: 'JOB-HIM-008',
    title: 'Health Information Management Officer (CONHESS 06)',
    department: 'Health Records',
    location: 'Maiduguri',
    type: 'Non-Clinical',
    description: 'Manage patient health information and records.',
    requirements: [
      'National Diploma (ND) in Health Information Management',
      'Registration with the HRORBN',
      'Valid practicing license',
      'Computer proficiency'
    ],
    requiredDocuments: ['HIM National Diploma', 'HRORBN Registration', 'Current Practicing License'],
    licenseLabel: 'HRORBN Registration Number'
  },
  {
    id: 'JOB-EHO-009',
    title: 'Environmental Health Officer (CONHESS 06)',
    department: 'Environmental Health',
    location: 'Maiduguri',
    type: 'Non-Clinical',
    description: 'Ensure environmental health standards are met within the hospital.',
    requirements: [
      'National Diploma (ND) in Environment Health Technician (MHT)',
      'Registration with EHORECON',
      'Valid practicing license'
    ],
    requiredDocuments: ['MHT National Diploma', 'EHORECON Registration', 'Current Practicing License'],
    licenseLabel: 'EHORECON Registration Number'
  }
];
