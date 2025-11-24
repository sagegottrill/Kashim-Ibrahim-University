import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Application {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: string;
  cv_url: string; // This now points to the combined PDF
  photo_url: string; // Legacy, might be same as cv_url or null
  other_documents: { name: string; path: string }[]; // Legacy
  reference_number: string;
  state_of_origin: string;
  lga: string;
  qualification: string;
  institution: string;
  year_of_graduation: string;
  license_number: string;
}

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, shortlisted: 0, rejected: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchApplications();
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchApplications();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const apps = data || [];
      setApplications(apps);
      calculateStats(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const calculateStats = (apps: Application[]) => {
    const newStats = {
      total: apps.length,
      pending: apps.filter(a => !a.status || a.status === 'Pending').length,
      shortlisted: apps.filter(a => a.status === 'Shortlisted').length,
      rejected: apps.filter(a => a.status === 'Rejected').length
    };
    setStats(newStats);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/admin',
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setApplications([]);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      const updatedApps = applications.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      );
      setApplications(updatedApps);
      calculateStats(updatedApps);

      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getFileUrl = (path: string) => {
    if (!path) return '#';
    const { data } = supabase.storage.from('job_documents').getPublicUrl(path);
    return data.publicUrl;
  };

  const filteredApplicants = applications.filter(app => {
    const matchesSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.reference_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || app.department === filterDept;
    const matchesStatus = filterStatus === 'All' || (app.status || 'Pending') === filterStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const departments = ['All', ...Array.from(new Set(applications.map(a => a.department)))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-[#1e3a5f]">
              Admin Portal
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to manage recruitment
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-teal focus:border-brand-teal focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-teal focus:border-brand-teal focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#1e3a5f] hover:bg-[#162c46] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal transition-colors"
              >
                Sign in
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center gap-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal transition-colors"
              >
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l2.84-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[#1e3a5f]">HR Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {session.user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm font-medium uppercase">Total Applications</div>
            <div className="text-3xl font-bold text-[#1e3a5f] mt-2">{stats.total}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-yellow-600 text-sm font-medium uppercase">Pending Review</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-green-600 text-sm font-medium uppercase">Shortlisted</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{stats.shortlisted}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-red-600 text-sm font-medium uppercase">Rejected</div>
            <div className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name, position or ref number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplicants.length > 0 ? (
                  filteredApplicants.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                            {app.full_name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{app.full_name}</div>
                            <div className="text-sm text-gray-500">{app.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.position}</div>
                        <div className="text-xs text-gray-500">{app.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${app.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                          {app.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="text-brand-teal hover:text-[#3d8568] font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No applications found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold text-[#1e3a5f]">Application Details</h2>
                <p className="text-sm text-gray-500">Ref: {selectedApp.reference_number}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8">
              {/* Status Actions */}
              <div className="bg-gray-50 p-6 rounded-lg mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Current Status</span>
                  <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full 
                    ${selectedApp.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                      selectedApp.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                    {selectedApp.status || 'Pending'}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(selectedApp.id, 'Pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedApp.status === 'Pending' || !selectedApp.status ? 'bg-gray-200 text-gray-800 cursor-default' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    disabled={selectedApp.status === 'Pending' || !selectedApp.status}
                  >
                    Mark Pending
                  </button>
                  <button
                    onClick={() => updateStatus(selectedApp.id, 'Rejected')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedApp.status === 'Rejected' ? 'bg-red-100 text-red-800 cursor-default' : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'}`}
                    disabled={selectedApp.status === 'Rejected'}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => updateStatus(selectedApp.id, 'Shortlisted')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedApp.status === 'Shortlisted' ? 'bg-green-100 text-green-800 cursor-default' : 'bg-brand-teal text-white hover:bg-[#3d8568] shadow-sm'}`}
                    disabled={selectedApp.status === 'Shortlisted'}
                  >
                    Shortlist Application
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-4 border-b pb-2">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500 text-sm">Full Name:</span>
                      <span className="col-span-2 font-medium text-gray-900">{selectedApp.full_name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500 text-sm">Email:</span>
                      <span className="col-span-2 font-medium text-gray-900">{selectedApp.email}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500 text-sm">Phone:</span>
                      <span className="col-span-2 font-medium text-gray-900">{selectedApp.phone}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500 text-sm">State/LGA:</span>
                      <span className="col-span-2 font-medium text-gray-900">{selectedApp.state_of_origin} / {selectedApp.lga}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-4 border-b pb-2">Position & Qualification</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500 text-sm">Position:</span>
                      <span className="col-span-2 font-medium text-gray-900">{selectedApp.position}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500 text-sm">Department:</span>
                      <span className="col-span-2 font-medium text-gray-900">{selectedApp.department}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500 text-sm">Degree:</span>
                      <span className="col-span-2 font-medium text-gray-900">{selectedApp.qualification}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500 text-sm">Institution:</span>
                      <span className="col-span-2 font-medium text-gray-900">{selectedApp.institution} ({selectedApp.year_of_graduation})</span>
                    </div>
                    {selectedApp.license_number && (
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-gray-500 text-sm">License:</span>
                        <span className="col-span-2 font-medium text-gray-900">{selectedApp.license_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-[#1e3a5f] mb-4 border-b pb-2">Application Documents</h3>
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#1e3a5f]">Combined Application PDF</h4>
                    <p className="text-sm text-gray-600 mt-1">Contains Cover Letter/Resume, Certificates, License, etc.</p>
                  </div>
                  <a
                    href={getFileUrl(selectedApp.cv_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-lg hover:bg-[#162c46] transition-colors shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Document
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
