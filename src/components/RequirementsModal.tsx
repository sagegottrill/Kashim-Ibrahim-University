import { Job } from '../types';

interface RequirementsModalProps {
    job: Job;
    isOpen: boolean;
    onClose: () => void;
    onProceed: () => void;
}

export default function RequirementsModal({ job, isOpen, onClose, onProceed }: RequirementsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-[#1e3a5f]">{job.title}</h2>
                        <p className="text-gray-500 text-sm">{job.department} • {job.location}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">Job Description</h3>
                        <p className="text-gray-700 leading-relaxed">{job.description}</p>
                    </div>

                    <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-3">Eligibility Requirements</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            {job.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-3">Required Documents</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            You will need to combine ALL the following documents into <strong>ONE single PDF file</strong>:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-6">
                            <li className="font-medium text-brand-blue">Application Letter</li>
                            <li className="font-medium text-brand-blue">Curriculum Vitae (CV)</li>
                            {job.required_documents.map((doc, index) => (
                                <li key={index}>{doc}</li>
                            ))}
                            <li>Computer Proficiency Certificate (any computer-related certification)</li>
                        </ul>
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-xs text-yellow-800">
                                <strong>Important:</strong> All documents must be merged into one PDF file before uploading.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4 sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onProceed}
                        className="px-6 py-2.5 bg-[#4a9d7e] text-white rounded-lg font-bold hover:bg-[#3d8568] transition-colors shadow-md hover:shadow-lg"
                    >
                        Proceed to Application
                    </button>
                </div>
            </div >
        </div >
    );
}
