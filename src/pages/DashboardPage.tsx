import { useState } from 'react';
import { applicantsData } from '../data/applicantsData';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // For demo, show first 3 applicants as "my applications"
  const myApplications = applicantsData.slice(0, 3);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[#1e3a5f] mb-8">My Applications</h1>

      <div className="space-y-4">
        {myApplications.map(app => (
          <div key={app.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">{app.position}</h3>
                  <p className="text-gray-600 text-sm">{app.department}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Reference Number</p>
                  <p className="font-medium text-sm">{app.refNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Applied Date</p>
                  <p className="font-medium text-sm">{new Date(app.appliedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Contact</p>
                  <p className="font-medium text-sm">{app.email}</p>
                </div>
              </div>

              <button
                onClick={() => toggleExpand(app.id)}
                className="text-[#4a9d7e] hover:text-[#3d8568] text-sm font-medium flex items-center gap-2"
              >
                {expandedId === app.id ? 'Hide Details' : 'View Details'}
                <svg
                  className={`w-4 h-4 transition-transform ${expandedId === app.id ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {expandedId === app.id && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <h4 className="font-semibold text-[#1e3a5f] mb-3">Application Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Applicant Name</p>
                    <p className="font-medium">{app.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium">{app.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Current Status</p>
                    <p className="font-medium">{app.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Department</p>
                    <p className="font-medium">{app.department}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {app.status === 'Interview' && 'Congratulations! You have been shortlisted for an interview. You will be contacted soon.'}
                    {app.status === 'Shortlisted' && 'Your application has been shortlisted for review. We will contact you soon.'}
                    {app.status === 'Submitted' && 'Your application is under review. We will notify you of any updates.'}
                    {app.status === 'Draft' && 'Your application is saved as draft. Please complete and submit it.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {myApplications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg mb-4">You haven't submitted any applications yet</p>
          <button className="text-[#4a9d7e] hover:underline">Browse Open Positions</button>
        </div>
      )}
    </div>
  );
}
