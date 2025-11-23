import { useState } from 'react';
import { jobsData, Job } from '../data/jobsData';
import JobCard from '../components/JobCard';
import FilterPanel from '../components/FilterPanel';
import RequirementsModal from '../components/RequirementsModal';

interface JobsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function JobsPage({ onNavigate }: JobsPageProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedType, setSelectedType] = useState('All Types');
  const [keyword, setKeyword] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredJobs = jobsData.filter(job => {
    const matchesDept = selectedDepartment === 'All Departments' || job.department === selectedDepartment;
    const matchesType = selectedType === 'All Types' || job.type === selectedType;
    const matchesKeyword = keyword === '' ||
      job.title.toLowerCase().includes(keyword.toLowerCase()) ||
      job.department.toLowerCase().includes(keyword.toLowerCase());

    return matchesDept && matchesType && matchesKeyword;
  });

  const handleReset = () => {
    setSelectedDepartment('All Departments');
    setSelectedType('All Types');
    setKeyword('');
  };

  const handleApplyClick = (jobId: string) => {
    const job = jobsData.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setIsModalOpen(true);
    }
  };

  const handleProceedToApply = () => {
    if (selectedJob) {
      setIsModalOpen(false);
      // Pass the selected job title to the apply page
      // We need to update the onNavigate prop signature or how we pass data
      // For now, we'll assume onNavigate can handle params or we use a global state/context in a real app
      // But since onNavigate is simple here, we might need to modify App.tsx or just pass it via localStorage/Context
      // Let's assume onNavigate can take a second arg or we just navigate and ApplyPage reads from a prop if we could pass it.
      // Given the current structure, we'll use localStorage for simplicity to pass the selected job
      localStorage.setItem('selectedJobTitle', selectedJob.title);
      onNavigate('apply');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-[#1e3a5f] mb-8">Open Positions</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FilterPanel
            selectedDepartment={selectedDepartment}
            selectedType={selectedType}
            keyword={keyword}
            onDepartmentChange={setSelectedDepartment}
            onTypeChange={setSelectedType}
            onKeywordChange={setKeyword}
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
