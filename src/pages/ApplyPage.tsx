import { useState, useEffect } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import FileUpload from '../components/FileUpload';
import { supabase } from '../lib/supabase';
import { Job } from '../types';

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara"
];

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber] = useState(`KIUTH-2025-${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobsList, setJobsList] = useState<Job[]>([]);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    state_of_origin: '',
    lga: '',
    nin_number: '',
    address: '',
    position: '',
    department: '',
    specialty: '',
    qualification: '',
    year_of_graduation: '',
    license_number: '',
    institution: '',
    reference_number: '',
    cv: null as File | null,
    passport: null as File | null,
    ndpr_consent: false
  });

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

  const steps = ['Personal', 'Position', 'Qualifications', 'Uploads', 'Review'];

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) setCurrentStep(currentStep + 1);
    } else {
      alert('Please fill in all required fields for this step.');
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1: // Personal Info
        return (
          formData.full_name &&
          formData.email &&
          formData.phone &&
          formData.date_of_birth &&
          formData.state_of_origin &&
          formData.lga &&
          formData.nin_number &&
          formData.address &&
          formData.passport
        );
      case 2: // Position Details
        if (!formData.position) {
          alert('Please select a position');
          return false;
        }
        return true;
      case 3: // Qualifications
        if (!formData.qualification || !formData.year_of_graduation || !formData.institution) {
          alert('Please fill in your qualification details');
          return false;
        }
        return true;
      case 4: // Uploads
        if (!formData.cv || !formData.ndpr_consent) {
          alert('Please upload your combined documents PDF and accept NDPR consent');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitted(false); // Reset submitted state if retrying

      // 1. Upload Combined Documents PDF and Passport
      const uploadFile = async (file: File, folder: string, name: string) => {
        const fileExt = file.name.split('.').pop();
        const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${folder}/${sanitizedName}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('job_documents')
          .upload(fileName, file);

        if (error) throw error;
        return data.path;
      };

      const folderName = `${refNumber}`;
      let combinedDocsPath = null;
      let passportPath = null;

      if (formData.cv) {
        combinedDocsPath = await uploadFile(formData.cv, folderName, 'combined_documents');
      }
      if (formData.passport) {
        passportPath = await uploadFile(formData.passport, folderName, 'passport_photo');
      }

      // 2. Insert Application Data
      const { error: insertError } = await supabase
        .from('applications')
        .insert([
          {
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            date_of_birth: formData.date_of_birth,
            state_of_origin: formData.state_of_origin,
            lga: formData.lga,
            nin_number: formData.nin_number,
            address: formData.address,
            position: formData.position,
            department: formData.department,
            specialty: formData.specialty,
            qualification: formData.qualification,
            year_of_graduation: formData.year_of_graduation,
            license_number: formData.license_number,
            institution: formData.institution,
            reference_number: refNumber,
            cv_url: combinedDocsPath,
            photo_url: passportPath,
            other_documents: [] // No longer needed
          }
        ]);

      if (insertError) throw insertError;

      setSubmitted(true);
      // Clear localStorage after successful submission
      localStorage.removeItem('selectedJobDetails');
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

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-xl font-semibold text-[#1e3a5f] mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e] focus:border-transparent"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e] focus:border-transparent"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e] focus:border-transparent"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e] focus:border-transparent"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIN Number</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e] focus:border-transparent"
                  value={formData.nin_number}
                  onChange={(e) => setFormData({ ...formData, nin_number: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address</label>
                <textarea
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e] focus:border-transparent"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State of Origin</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e] focus:border-transparent"
                  value={formData.state_of_origin}
                  onChange={(e) => setFormData({ ...formData, state_of_origin: e.target.value })}
                >
                  <option value="">Select State</option>
                  {nigerianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e] focus:border-transparent"
                  value={formData.lga}
                  onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Photograph</label>
                <p className="text-xs text-gray-500 mb-2">Upload a recent passport photograph (JPG/PNG, max 2MB).</p>
                <FileUpload
                  accept=".jpg,.jpeg,.png"
                  label="Upload Passport"
                  onChange={(file) => setFormData({ ...formData, passport: file })}
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
                  value={formData.year_of_graduation}
                  onChange={(e) => setFormData({ ...formData, year_of_graduation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedJob?.license_label || 'Professional License Number'}
                </label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
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

            {/* Required Documents List */}
            {selectedJob && (
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-200 mb-6">
                <h4 className="font-semibold text-[#1e3a5f] mb-3">Required Documents for {selectedJob.title}</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Please combine ALL the following documents into <strong>ONE single PDF file</strong> before uploading:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li className="font-medium text-brand-blue">Application Letter</li>
                  <li className="font-medium text-brand-blue">Curriculum Vitae (CV)</li>
                  {selectedJob.required_documents.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                  <li>Computer Proficiency Certificate (any computer-related certification)</li>
                </ul>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> All documents must be merged into one PDF file. Separate uploads will not be accepted.
                  </p>
                </div>
              </div>
            )}

            <FileUpload
              label="Combined Documents (All documents in ONE PDF) *"
              accept=".pdf"
              onChange={(file) => setFormData({ ...formData, cv: file })}
            />

            <div className="mt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ndpr_consent}
                  onChange={(e) => setFormData({ ...formData, ndpr_consent: e.target.checked })}
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
                  <p className="font-medium">{formData.full_name || 'Not provided'}</p>
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
