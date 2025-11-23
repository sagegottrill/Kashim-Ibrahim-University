import { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';
import RequirementsModal from '../components/RequirementsModal';
import { supabase } from '../lib/supabase';
import { Job } from '../types';
import FilterPanel from '../components/FilterPanel';

interface JobsPageProps {
  onNavigate: (page: string) => void;
}

export default function JobsPage({ onNavigate }: JobsPageProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterDept, setFilterDept] = useState('All Departments');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All Types' || job.type === filterType;
    const matchesDept = filterDept === 'All Departments' || job.department === filterDept;
    return matchesSearch && matchesType && matchesDept;
  });

  const departments = ['All Departments', ...Array.from(new Set(jobs.map(j => j.department)))];
  const types = ['All Types', ...Array.from(new Set(jobs.map(j => j.type)))];


  const handleReset = () => {
    setFilterDept('All Departments');
    setFilterType('All Types');
    setSearchTerm('');
  };

  const handleApplyClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleProceedToApply = () => {
    if (selectedJob) {
      setIsModalOpen(false);
      // Store the full job object so ApplyPage can access all details
      localStorage.setItem('selectedJobDetails', JSON.stringify(selectedJob));
      onNavigate('apply');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold font-serif text-brand-blue mb-8">Open Positions</h1>

      {/* General Requirements and Application Method */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8 border-l-4 border-brand-teal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* General Requirements */}
          <div>
            <h2 className="text-2xl font-bold font-serif text-brand-blue mb-4">General Requirements</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-teal mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Required academic and professional qualifications must be met.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-teal mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>NYSC discharge or exemption certificate is mandatory.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-teal mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>ICT proficiency is required.</span>
              </li>
            </ul>
          </div>

          {/* Method of Application */}
          <div>
            <h2 className="text-2xl font-bold font-serif text-brand-blue mb-4">Method of Application</h2>
            <div className="space-y-4 text-gray-700">
              <p className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-teal mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>Applications must be submitted within <strong>six (6) weeks</strong> from the date of this advertisement.</span>
              </p>
              <p className="text-sm text-gray-600 italic">
                <strong>Note:</strong> Only shortlisted candidates will receive an acknowledgment and be invited for an interview.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                <p className="text-sm font-semibold text-brand-blue mb-2">All applications should be addressed to:</p>
                <address className="text-sm text-gray-700 not-italic leading-relaxed">
                  <strong>The Director of Administration</strong><br />
                  Kashim Ibrahim University Teaching Hospital<br />
                  P.M.B. 1065, Njimtilo, Kano Road,<br />
                  Maiduguri, Borno State.
                </address>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FilterPanel
            selectedDepartment={filterDept}
            selectedType={filterType}
            keyword={searchTerm}
            onDepartmentChange={setFilterDept}
            onTypeChange={setFilterType}
            onKeywordChange={setSearchTerm}
            onReset={handleReset}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-[#1e3a5f]">{filteredJobs.length}</span> positions
            </p>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map(job => (
                <JobCard key={job.id} job={job} onApply={handleApplyClick} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No jobs found matching your criteria</p>
              <button
                onClick={handleReset}
                className="mt-4 text-[#4a9d7e] hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}

          {/* General Requirements & Application Method */}
          <div className="mt-16 bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">General Requirements</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Required academic and professional qualifications must be met.</li>
                <li>NYSC discharge or exemption certificate is mandatory.</li>
                <li>ICT proficiency is required.</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">Method of Application</h2>
              <p className="text-gray-700 mb-4">
                Applications must be submitted within six (6) weeks from the date of this advertisement.
                <br />
                <span className="italic text-sm text-gray-500">Note: Only shortlisted candidates will receive an acknowledgment and be invited for an interview.</span>
              </p>
              <div className="bg-gray-50 p-6 rounded-md border-l-4 border-[#1e3a5f]">
                <p className="font-semibold text-gray-900 mb-2">All applications should be addressed to:</p>
                <address className="not-italic text-gray-700">
                  The Director of Administration<br />
                  Kashim Ibrahim University Teaching Hospital<br />
                  P.M.B. 1065, Njimtilo, Kano Road,<br />
                  Maiduguri, Borno State.
                </address>
              </div>
            </div>

            <div className="text-right mt-12 pt-8 border-t border-gray-100">
              <p className="font-bold text-[#1e3a5f]">Signed</p>
              <p className="text-gray-600">Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Modal */}
      {selectedJob && (
        <RequirementsModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onProceed={handleProceedToApply}
        />
      )}
    </div>
  );
}
