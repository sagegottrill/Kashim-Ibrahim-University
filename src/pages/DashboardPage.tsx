import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import StatusBadge from '../components/StatusBadge';
import { Search, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

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
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const addToSearchHistory = (refNum: string) => {
    const newHistory = [refNum, ...searchHistory.filter(h => h !== refNum)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

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
          toast.error('Application not found');
        } else {
          throw error;
        }
      } else {
        setApplication(data);
        addToSearchHistory(refNumber);
        toast.success('Application found!');
      }
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('An error occurred while checking your status. Please try again.');
      toast.error('Failed to fetch application');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'shortlisted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'interview':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'shortlisted':
        return 'Congratulations! Your application has been shortlisted. We will contact you shortly regarding the next steps.';
      case 'rejected':
        return 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates at this time.';
      case 'interview':
        return 'You have been selected for an interview. Please check your email for details.';
      default:
        return 'Your application has been successfully submitted and is currently under review by our recruitment team.';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold font-serif text-brand-blue mb-8 text-center">Check Application Status</h1>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <form onSubmit={handleCheckStatus} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter your Reference Number (e.g., KIUTH-2025-...)"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:outline-none transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue text-white px-8 py-3 rounded-lg hover:bg-[#162c46] transition-all duration-300 disabled:opacity-50 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </span>
            ) : 'Check Status'}
          </button>
        </form>

        {/* Search History */}
        {searchHistory.length > 0 && !application && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Recent Searches:</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((ref, index) => (
                <button
                  key={index}
                  onClick={() => setRefNumber(ref)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                >
                  {ref}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse">
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      )}

      {/* Application Details */}
      {application && !loading && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-fade-in">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-2xl font-bold font-serif text-brand-blue mb-1">{application.position}</h3>
                <p className="text-gray-600">{application.department}</p>
              </div>
              <StatusBadge status={application.status || 'Submitted'} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Applicant Name</p>
                <p className="font-medium text-lg">{application.full_name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reference Number</p>
                <p className="font-medium text-lg font-mono">{application.reference_number}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date Applied</p>
                <p className="font-medium text-lg">{new Date(application.created_at).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contact Email</p>
                <p className="font-medium text-lg">{application.email}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h4 className="font-semibold text-brand-blue mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Application Journey
              </h4>
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Submitted */}
                <div className="relative mb-6">
                  <div className="absolute left-[-1.4rem] w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-900">Application Submitted</p>
                    <p className="text-sm text-green-700">{new Date(application.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Under Review */}
                <div className="relative mb-6">
                  <div className={`absolute left-[-1.4rem] w-6 h-6 rounded-full flex items-center justify-center ${application.status ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                    {application.status ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Clock className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`p-4 rounded-lg border ${application.status ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                    }`}>
                    <p className={`font-semibold ${application.status ? 'text-green-900' : 'text-yellow-900'}`}>
                      Under Review
                    </p>
                    <p className={`text-sm ${application.status ? 'text-green-700' : 'text-yellow-700'}`}>
                      {application.status ? 'Review completed' : 'Currently being reviewed by our team'}
                    </p>
                  </div>
                </div>

                {/* Final Status */}
                {application.status && (
                  <div className="relative">
                    <div className="absolute left-[-1.4rem] w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center">
                      {getStatusIcon(application.status)}
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="font-semibold text-blue-900">{application.status}</p>
                      <p className="text-sm text-blue-700">{getStatusMessage(application.status)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
              <p className="text-blue-800 text-sm">
                {getStatusMessage(application.status || 'Submitted')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!application && !loading && !error && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Track Your Application</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Enter your reference number above to check the status of your application and see your journey timeline.
          </p>
        </div>
      )}
    </div>
  );
}
