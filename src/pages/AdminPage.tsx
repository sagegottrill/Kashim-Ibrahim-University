import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminCharts from '../components/AdminCharts';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import ExportModal from '../components/ExportModal';
import BulkExportModal from '../components/BulkExportModal';
import SmartHR from '../components/SmartHR';
import SlipGenerator from '../components/SlipGenerator';
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Menu,
  X,
  Printer,
  FileText,
  Briefcase,
  Building,
  GraduationCap,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Download,
  FolderDown,
  ShieldCheck,
  Clock,
  Printer,
  ExternalLink
} from 'lucide-react';
import { generateSlip } from '../utils/generateSlip';
import type { Application } from '../types';

const calculateAge = (dob: string | undefined): number | string => {
  if (!dob) return 'N/A';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  return age;
};

export default function AdminPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, shortlisted: 0, rejected: 0 });

  // Dashboard State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBulkExportModalOpen, setIsBulkExportModalOpen] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();

      // Real-time subscription
      const subscription = supabase
        .channel('applications_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
          fetchApplications();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      if (!user?.email) return;

      let allApps: Application[] = [];
      let from = 0;
      const step = 1000;
      let moreAvailable = true;

      while (moreAvailable) {
        const { data, error } = await supabase
          .rpc('get_all_applications_for_admin', { admin_email: user.email })
          .range(from, from + step - 1);

        if (error) throw error;

        const chunk = data || [];
        allApps = [...allApps, ...chunk];

        if (chunk.length < step) {
          moreAvailable = false;
        } else {
          from += step;
        }
      }

      // Normalize Positions (Merge Duplicates)
      allApps = allApps.map(app => {
        let pos = app.position;
        if (pos === 'Senior_Nursing_Officer' || pos === 'Senior_Nursing_Officer__CONHESS_09_') {
          pos = 'Senior_Nursing_Officer__CONHESS_09';
        }
        return { ...app, position: pos };
      });

      // --- SMART DEDUPLICATION ---
      const deduplicateApplications = (apps: Application[]) => {
        const groups: Record<string, Application[]> = {};

        apps.forEach(app => {
          // Create a unique key for Email + Position
          // Normalized to lower case to avoid case-sensitive dupes
          const key = `${app.email.toLowerCase().trim()}_${app.position}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(app);
        });

        const cleaned: Application[] = [];

        Object.values(groups).forEach(group => {
          if (group.length === 1) {
            cleaned.push(group[0]);
          } else {
            // Sort to find the "Best" candidate
            group.sort((a, b) => {
              // 1. Priority: Status (Shortlisted/Reviewed > Pending)
              const getStatusScore = (s: string) => {
                if (s === 'Shortlisted') return 3;
                if (s === 'Reviewed') return 2;
                if (s === 'Rejected') return 1; // Even rejected is "processed"
                return 0; // Pending
              };
              const scoreA = getStatusScore(a.status);
              const scoreB = getStatusScore(b.status);
              if (scoreA !== scoreB) return scoreB - scoreA; // Higher score first

              // 2. Priority: Has CV
              const hasCvA = a.cv_url ? 1 : 0;
              const hasCvB = b.cv_url ? 1 : 0;
              if (hasCvA !== hasCvB) return hasCvB - hasCvA; // Has CV first

              // 3. Priority: Recency (Newest First)
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });

            // Pick the winner
            cleaned.push(group[0]);
          }
        });

        return cleaned;
      };

      const uniqueApps = deduplicateApplications(allApps);
      // ---------------------------

      setApplications(uniqueApps);
      calculateStats(uniqueApps);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setLoading(false);
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

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingStatusId(id);
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
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedApps.length === 0) return;

    if (!confirm(`Are you sure you want to mark ${selectedApps.length} applications as ${newStatus}?`)) return;

    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .in('id', selectedApps);

      if (error) throw error;

      const updatedApps = applications.map(app =>
        selectedApps.includes(app.id) ? { ...app, status: newStatus } : app
      );
      setApplications(updatedApps);
      calculateStats(updatedApps);
      setSelectedApps([]);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getFileUrl = (path: string) => {
    if (!path) return '#';
    return path;
  };

  // Removed old exportToCSV function in favor of ExportModal

  const filteredApplicants = applications.filter(app => {
    const matchesSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.reference_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || app.department === filterDept;
    const matchesStatus = filterStatus === 'All' || (app.status || 'Pending') === filterStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const departments = ['All', ...Array.from(new Set(applications.map(a => a.department)))];

  const toggleSelectAll = () => {
    if (selectedApps.length === filteredApplicants.length) {
      setSelectedApps([]);
    } else {
      setSelectedApps(filteredApplicants.map(a => a.id));
    }
  };

  const toggleSelectApp = (id: string) => {
    if (selectedApps.includes(id)) {
      setSelectedApps(selectedApps.filter(a => a !== id));
    } else {
      setSelectedApps([...selectedApps, id]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-0 md:ml-64'}`}>
        <div className="p-8 max-w-[1600px] mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'applications' && 'Applications Management'}
                {activeTab === 'analytics' && 'Advanced Analytics & Reports'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {activeTab === 'analytics' ? 'Visualize recruitment data and export reports' : 'Manage your recruitment process efficiently'}
              </p>
            </div>

            <div className="flex gap-3">
              {activeTab !== 'analytics' && (
                <>
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Download size={18} />
                    <span className="hidden sm:inline">Export Data</span>
                  </button>
                  <button
                    onClick={() => setIsBulkExportModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white border border-brand-teal rounded-lg hover:bg-[#3d8568] transition-colors shadow-sm ml-2"
                  >
                    <FolderDown size={18} />
                    <span className="hidden sm:inline">Bulk Engine</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10">
                    <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Applications</div>
                    <div className="text-3xl font-bold text-[#1e3a5f] mt-2">{stats.total}</div>
                    <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <span className="bg-green-100 px-1.5 py-0.5 rounded">All time</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10">
                    <div className="text-brand-blue text-sm font-medium uppercase tracking-wider">Pending Review</div>
                    <div className="text-3xl font-bold text-brand-blue mt-2">{stats.pending}</div>
                    <div className="mt-2 text-xs text-brand-blue flex items-center gap-1">
                      <Clock size={12} />
                      <span>Needs attention</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10">
                    <div className="text-green-600 text-sm font-medium uppercase tracking-wider">Shortlisted</div>
                    <div className="text-3xl font-bold text-green-600 mt-2">{stats.shortlisted}</div>
                    <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle size={12} />
                      <span>Qualified candidates</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10">
                    <div className="text-red-600 text-sm font-medium uppercase tracking-wider">Rejected</div>
                    <div className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</div>
                    <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <XCircle size={12} />
                      <span>Disqualified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <AdminCharts applications={applications} />

              {/* Recent Applications Preview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-[#1e3a5f]">Recent Applications</h3>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-sm text-brand-teal hover:underline"
                  >
                    View All
                  </button>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applications.slice(0, 5).map(app => (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xs">
                              {app.full_name.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{app.full_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">{app.position}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-0.5 inline-flex text-xs font-medium rounded-full 
                              ${app.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                              app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'}`}>
                            {app.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="text-gray-400 hover:text-brand-teal"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          )}

          {/* Applications View */}
          {
            activeTab === 'applications' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-12rem)]">
                {/* Filters Bar */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white rounded-t-xl">
                  <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                    <div className="relative flex-1 md:max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search applicants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all"
                      />
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:border-brand-teal outline-none"
                      >
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>

                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:border-brand-teal outline-none"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedApps.length > 0 && (
                    <div className="flex items-center gap-2 bg-brand-blue/5 px-3 py-1.5 rounded-lg animate-in fade-in slide-in-from-top-2">
                      <span className="text-sm font-medium text-brand-blue">{selectedApps.length} selected</span>
                      <div className="h-4 w-px bg-gray-300 mx-1"></div>
                      <button
                        onClick={() => handleBulkStatusUpdate('Shortlisted')}
                        className="text-xs font-medium text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleBulkStatusUpdate('Rejected')}
                        className="text-xs font-medium text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedApps.length === filteredApplicants.length && filteredApplicants.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300 text-brand-teal focus:ring-brand-teal"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredApplicants.length > 0 ? (
                        filteredApplicants.map(app => (
                          <tr key={app.id} className={`hover:bg-gray-50 transition-colors ${selectedApps.includes(app.id) ? 'bg-blue-50/30' : ''}`}>
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedApps.includes(app.id)}
                                onChange={() => toggleSelectApp(app.id)}
                                className="rounded border-gray-300 text-brand-teal focus:ring-brand-teal"
                              />
                            </td>
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
                                    'bg-blue-100 text-blue-800'}`}>
                                {app.status || 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(app.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="text-brand-teal hover:text-[#3d8568] font-medium p-2 hover:bg-teal-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center">
                              <Search size={48} className="text-gray-200 mb-4" />
                              <p className="text-lg font-medium text-gray-900">No applications found</p>
                              <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination (Visual only for now) */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b-xl">
                  <span className="text-sm text-gray-500">
                    Showing <span className="font-medium">{filteredApplicants.length}</span> results
                  </span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50" disabled>Next</button>
                  </div>
                </div>
              </div>
            )
          }



          {/* Analytics View */}
          {
            activeTab === 'analytics' && (
              <AdvancedAnalytics applications={applications} />
            )
          }

          {/* Smart HR View */}
          {
            activeTab === 'hr-screening' && (
              <SmartHR applications={applications} />
            )
          }

          {/* Slip Generator View */}
          {
            activeTab === 'slip-generator' && (
              <SlipGenerator />
            )
          }



          {/* Application Details Modal */}
          {selectedApp && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end transition-opacity" onClick={() => setSelectedApp(null)}>
              <div className="w-full md:w-[600px] h-full bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                  <h2 className="text-xl font-bold text-[#1e3a5f]">Application Details</h2>
                  <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-8">
                  {/* Header Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                      {selectedApp.photo_url ? (
                        <img src={selectedApp.photo_url} alt={selectedApp.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Users size={32} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedApp.full_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{selectedApp.reference_number}</span>
                        <span>•</span>
                        <span>{selectedApp.position}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${selectedApp.status === 'Shortlisted' ? 'bg-green-50 text-green-700 border-green-200' :
                          selectedApp.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            selectedApp.status === 'Reviewed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>
                          {selectedApp.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          Applied {new Date(selectedApp.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateStatus(selectedApp.id, 'Shortlisted')}
                      disabled={selectedApp.status === 'Shortlisted'}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={16} /> Shortlist
                    </button>
                    <button
                      onClick={() => updateStatus(selectedApp.id, 'Rejected')}
                      disabled={selectedApp.status === 'Rejected'}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" /> Contact Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Email Address</label>
                        <a href={`mailto:${selectedApp.email}`} className="text-sm font-medium text-brand-teal hover:underline flex items-center gap-1">
                          {selectedApp.email}
                        </a>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Phone Number</label>
                        <a href={`tel:${selectedApp.phone}`} className="text-sm font-medium text-gray-900 hover:text-brand-teal">
                          {selectedApp.phone}
                        </a>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">State of Origin</label>
                        <span className="text-sm font-medium text-gray-900">{selectedApp.state_of_origin}</span>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">LGA</label>
                        <span className="text-sm font-medium text-gray-900">{selectedApp.lga}</span>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Date of Birth</label>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedApp.date_of_birth ? `${new Date(selectedApp.date_of_birth).toLocaleDateString()} (${calculateAge(selectedApp.date_of_birth)} years)` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Education & License */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <GraduationCap size={16} className="text-gray-400" /> Qualifications
                    </h4>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4 grid gap-4">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500 text-sm">Qualification:</span>
                          <span className="col-span-2 font-medium text-gray-900">{selectedApp.qualification}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500 text-sm">Institution:</span>
                          <span className="col-span-2 font-medium text-gray-900">{selectedApp.institution}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500 text-sm">Graduation:</span>
                          <span className="col-span-2 font-medium text-gray-900">{selectedApp.year_of_graduation}</span>
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

                  {/* Documents */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <FolderDown size={16} className="text-gray-400" /> Attached Documents
                    </h4>
                    <div className="grid gap-2">
                      <a
                        href={selectedApp.cv_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-brand-teal hover:bg-teal-50/50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-100 transition-colors">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Curriculum Vitae</p>
                            <p className="text-xs text-gray-500">PDF Document</p>
                          </div>
                        </div>
                        <ExternalLink size={16} className="text-gray-400 group-hover:text-brand-teal" />
                      </a>

                      {selectedApp.other_documents?.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-brand-teal hover:bg-teal-50/50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-md group-hover:bg-purple-100 transition-colors">
                              <FileText size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">Attached File</p>
                            </div>
                          </div>
                          <ExternalLink size={16} className="text-gray-400 group-hover:text-brand-teal" />
                        </a>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end sticky bottom-0">
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            filteredApplications={filteredApplicants}
            allApplications={applications}
          />

          <BulkExportModal
            isOpen={isBulkExportModalOpen}
            onClose={() => setIsBulkExportModalOpen(false)}
            applications={applications}
            stats={stats}
          />
        </div>
      </div>
    </div>
  );
}

function Settings({ size, className }: { size?: number, className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
