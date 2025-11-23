import { useState } from 'react';
import { supabase } from '../lib/supabase';
import StatusBadge from '../components/StatusBadge';

interface Application {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: string;
  reference_number: string;
}

export default function DashboardPage() {
  const [refNumber, setRefNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState('');

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setApplication(null);

    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('reference_number', refNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('No application found with this Reference Number.');
        } else {
          throw error;
        }
      } else {
        setApplication(data);
      }
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('An error occurred while checking your status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[#1e3a5f] mb-8 text-center">Check Application Status</h1>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <form onSubmit={handleCheckStatus} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter your Reference Number (e.g., KIUTH-2025-...)"
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value)}
            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e] focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1e3a5f] text-white px-8 py-3 rounded-lg hover:bg-[#162c46] transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </form>
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
      </div>

      {application && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-fade-in">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-[#1e3a5f] mb-1">{application.position}</h3>
                <p className="text-gray-600">{application.department}</p>
              </div>
              <StatusBadge status={application.status || 'Submitted'} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Applicant Name</p>
                <p className="font-medium text-lg">{application.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reference Number</p>
                <p className="font-medium text-lg font-mono">{application.reference_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date Applied</p>
                <p className="font-medium text-lg">{new Date(application.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contact Email</p>
                <p className="font-medium text-lg">{application.email}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-2">Application Status Update</h4>
              <p className="text-blue-800">
                {!application.status || application.status === 'Submitted'
                  ? 'Your application has been successfully submitted and is currently under review by our recruitment team.'
                  : application.status === 'Shortlisted'
                    ? 'Congratulations! Your application has been shortlisted. We will contact you shortly regarding the next steps.'
                    : application.status === 'Interview'
                      ? 'You have been selected for an interview. Please check your email for details.'
                      : 'Your application status has been updated.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
