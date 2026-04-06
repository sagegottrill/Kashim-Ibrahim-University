export interface Job {
    id: string;
    title: string;
    department: string;
    location: string;
    type: 'Clinical' | 'Non-Clinical' | 'Academic';
    description: string;
    requirements: string[];
    required_documents: string[];
    license_label: string;
    is_active?: boolean;
    created_at?: string;
}

export interface Application {
    id: string;
    created_at: string;
    full_name: string;
    email: string;
    phone: string;
    job_id?: string;
    position: string;
    department: string;
    status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Rejected' | string;
    resume_url?: string;
    cv_url: string;
    cover_letter_url?: string;
    photo_url: string;
    documents?: Record<string, string>;
    other_documents?: { name: string; path: string }[];
    reference_number: string;
    nin_number?: string;
    date_of_birth: string;
    state_of_origin: string;
    lga: string;
    qualification: string;
    institution: string;
    year_of_graduation: string;
    license_number: string;
}

export interface ContactMessage {
    id: string;
    created_at: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'New' | 'Read' | 'Replied';
}
