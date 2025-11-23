import { useState, useEffect } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import FileUpload from '../components/FileUpload';
import { supabase } from '../lib/supabase';

interface Job {
  id?: string;
  title: string;
  department: string;
  requirements: string[];
  required_documents: string[];
  license_label: string;
}

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber] = useState(`KIUTH - 2025 - ${Math.floor(1000 + Math.random() * 9000)} `);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobsList, setJobsList] = useState<Job[]>([]);


  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase.from('jobs').select('*').eq('is_active', true);
      if (data) {
        setJobsList(data);

        // After jobs are fetched, check if there's a stored job selection
        const storedJobDetails = localStorage.getItem('selectedJobDetails');
        if (storedJobDetails) {
          const job = JSON.parse(storedJobDetails);
          setSelectedJob(job);
          setFormData(prev => ({
            ...prev,
            position: job.title,
            department: job.department
          }));
        }
      }
    };
    fetchJobs();
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    state: '',
    lga: '',
    position: '',
    department: '',
    specialty: '',
    qualification: '',
    yearGrad: '',
    license: '',
    institution: '',
    cv: null as File | null,
    photo: null as File | null,
    ndprConsent: false
  });

  const steps = ['Personal', 'Position', 'Qualifications', 'Uploads', 'Review'];

  const [dynamicDocs, setDynamicDocs] = useState<Record<string, File | null>>({});

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1: // Personal Details
        if (!formData.fullName || !formData.email || !formData.phone || !formData.state || !formData.lga) {
          alert('Please fill in all personal details');
          return false;
        }
        return true;
      case 2: // Position Details
        if (!formData.position) {
          alert('Please select a position');
          return false;
        }
        return true;
      case 3: // Qualifications
        if (!formData.qualification || !formData.yearGrad || !formData.institution) {
          alert('Please fill in your qualification details');
          return false;
        }
        return true;
      case 4: // Uploads
        if (!formData.cv || !formData.photo || !formData.ndprConsent) {
          alert('Please upload your CV, Passport Photo and accept NDPR consent');
          return false;
        }

        // Validate dynamic required documents
        if (selectedJob) {
          const missingDocs = selectedJob.required_documents.filter(doc => !dynamicDocs[doc]);
          if (missingDocs.length > 0) {
            alert(`Please upload the following required documents: ${missingDocs.join(', ')} `);
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitted(false); // Reset submitted state if retrying
      // Show loading state here if you had one, e.g., setIsSubmitting(true)

      // 1. Upload Files
      const uploadFile = async (file: File, folder: string, name: string) => {
        const fileExt = file.name.split('.').pop();
        // Sanitize file name to avoid issues
        const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${folder}/${sanitizedName}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('job_documents')
          .upload(fileName, file);

        if (error) throw error;
        return data.path;
      };

      const folderName = `${refNumber}`;
      let cvPath = null;
      let photoPath = null;
      const otherDocsData: { name: string; path: string }[] = [];

      if (formData.cv) cvPath = await uploadFile(formData.cv, folderName, 'cv');
      if (formData.photo) photoPath = await uploadFile(formData.photo, folderName, 'passport_photo');

      // Upload dynamic docs
      if (selectedJob) {
        for (const docName of selectedJob.required_documents) {
          const file = dynamicDocs[docName];
          if (file) {
            const path = await uploadFile(file, folderName, docName);
            otherDocsData.push({ name: docName, path });
          }
        }
      }

      // 2. Insert Data
      const { error: insertError } = await supabase
        .from('applications')
        .insert([
          {
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            state_of_origin: formData.state,
            lga: formData.lga,
            position: formData.position,
            department: formData.department,
            specialty: formData.specialty,
            qualification: formData.qualification,
            year_of_graduation: formData.yearGrad,
            license_number: formData.license,
            institution: formData.institution,
            reference_number: refNumber,
            cv_url: cvPath,
            photo_url: photoPath,
            other_documents: otherDocsData
          }
        ]);

      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('There was an error submitting your application. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[#1e3a5f] mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">Your application has been successfully submitted.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Reference Number:</p>
            <p className="text-2xl font-bold text-[#4a9d7e]">{refNumber}</p>
          </div>
          <p className="text-sm text-gray-600">
            Please save this reference number for tracking your application status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[#1e3a5f] mb-8">Application Form</h1>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <ProgressStepper currentStep={currentStep} steps={steps} />

        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#1e3a5f] mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State of Origin</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">LGA</label>
                <input
                  type="text"
                  value={formData.lga}
                  onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Position Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#1e3a5f] mb-4">Position Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position Applied For</label>
              <select
                value={formData.position}
                onChange={(e) => {
                  const job = jobsList.find(j => j.title === e.target.value);
                  if (job) {
                    setSelectedJob(job);
                    setFormData({
                      ...formData,
                      position: e.target.value,
                      department: job.department
                    });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e]"
              >
                <option value="">Select a position</option>
                {jobsList.map(job => (
                  <option key={job.id || job.title} value={job.title}>{job.title}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Requirements Display */}
            {selectedJob && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-[#1e3a5f] mb-2">Requirements for {selectedJob.title}</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {selectedJob.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialty (if clinical)</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <input
                type="text"
                value={formData.department}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {/* Step 3: Qualifications */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#1e3a5f] mb-4">Qualifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Highest Qualification</label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year of Graduation</label>
                <input
                  type="text"
                  value={formData.yearGrad}
                  onChange={(e) => setFormData({ ...formData, yearGrad: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedJob?.license_label || 'Professional License Number'}
                </label>
                <input
                  type="text"
                  value={formData.license}
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e] focus:border-transparent"
                  placeholder={selectedJob?.license_label ? `Enter your ${selectedJob.license_label}` : "Enter license number if applicable"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Uploads */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#1e3a5f] mb-4">Document Uploads</h3>
            <p className="text-sm text-gray-500 mb-4">Please upload the following mandatory documents for <span className="font-semibold">{formData.position}</span>. Fields marked with <span className="text-red-500">*</span> are required.</p>

            <FileUpload
              label="CV / Resume *"
              accept=".pdf"
              onChange={(file) => setFormData({ ...formData, cv: file })}
            />

            {/* Dynamic Documents based on Job Data */}
            {selectedJob && selectedJob.required_documents.map((docName, idx) => (
              <FileUpload
                key={idx}
                label={`${docName} *`}
                accept=".pdf,.jpg,.png"
                onChange={(file) => {
                  setDynamicDocs(prev => ({ ...prev, [docName]: file }));
                }}
              />
            ))}

            <FileUpload label="Passport Photo *" accept=".jpg,.png" onChange={(file) => setFormData({ ...formData, photo: file })} />

            <div className="mt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ndprConsent}
                  onChange={(e) => setFormData({ ...formData, ndprConsent: e.target.checked })}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  I consent to the collection and processing of my personal data in accordance with the Nigeria Data Protection Regulation (NDPR)
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#1e3a5f] mb-4">Review Your Application</h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{formData.fullName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{formData.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="font-medium">{formData.position || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Qualification</p>
                  <p className="font-medium">{formData.qualification || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-[#4a9d7e] text-white rounded-lg hover:bg-[#3d8568]"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#4a9d7e] text-white rounded-lg hover:bg-[#3d8568]"
            >
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
