import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onApply: (id: string) => void;
}

export default function JobCard({ job, onApply }: JobCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time': return 'bg-blue-100 text-blue-800';
      case 'Part-time': return 'bg-green-100 text-green-800';
      case 'Contract': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-[#1e3a5f]">{job.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
          {job.type}
        </span>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex items-center text-gray-600 text-sm">
          <span className="font-medium mr-2">Department:</span>
          {job.department}
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <span className="font-medium mr-2">Location:</span>
          {job.location}
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <span className="font-medium mr-2">Salary:</span>
          {job.salary}
        </div>
      </div>

      <button
        onClick={() => onApply(job.id)}
        className="w-full bg-[#4a9d7e] text-white py-2 rounded-lg font-medium hover:bg-[#3d8568] transition-colors duration-300"
      >
        Apply Now
      </button>
    </div>
  );
}
