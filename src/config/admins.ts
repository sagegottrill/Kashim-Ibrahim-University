// Admin configuration
export const ADMIN_EMAILS = [
    'admin.kiuth@gmail.com',
    'vadmin.hananaelyakub@yahoo.com',
    'admin.imkidah@yahoo.com'
];

export const isAdmin = (email: string | null | undefined): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};
