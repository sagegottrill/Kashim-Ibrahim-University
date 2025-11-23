import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
}

export default function JobCard({ job, onApply }: JobCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Clinical': return 'bg-blue-100 text-blue-800';
      case 'Non-Clinical': return 'bg-green-100 text-green-800';
      case 'Academic': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold font-serif text-brand-blue group-hover:text-brand-teal transition-colors duration-300 line-clamp-2">
          {job.title}
        </h3>
        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getTypeColor(job.type)}`}>
          {job.type}
        </span>
      </div>

      <div className="mb-6 space-y-3 flex-grow">
        <div className="flex items-center text-gray-600 text-sm">
          <svg className="w-4 h-4 mr-2 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-medium mr-1">Department:</span>
          {job.department}
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <svg className="w-4 h-4 mr-2 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium mr-1">Location:</span>
          {job.location}
        </div>
      </div>

      <button
        onClick={() => onApply(job)}
        className="w-full bg-brand-blue text-white py-3 rounded-lg font-medium hover:bg-brand-teal transition-colors duration-300 flex items-center justify-center gap-2 group-hover:shadow-md"
      >
        <span>View Details & Apply</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}
