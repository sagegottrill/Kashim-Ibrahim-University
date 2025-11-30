import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { useAuth } from '../contexts/AuthContext';
import ProgressStepper from '../components/ProgressStepper';
import FileUpload from '../components/FileUpload';
import { supabase } from '../lib/supabase';
import { Job } from '../types';
import { generateSlip } from '../utils/generateSlip';
import { sendSMS } from '../utils/sms';
import { sendEmail } from '../utils/email';

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara"
];

export default function ApplyPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [uploadProgress, setUploadProgress] = useState({ cv: 0, passport: 0 });
  const [uploadedUrls, setUploadedUrls] = useState({ cv: '', passport: '' });

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

    const fetchUserProfile = async () => {
      if (user?.uid) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.uid)
          .single();

        if (profile) {
          setFormData(prev => ({
            ...prev,
            full_name: profile.full_name || '',
            email: profile.email || user.email || '',
            phone: profile.phone || '',
          }));
        } else if (user.email) {
          // Fallback if no profile but we have email from auth
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
          }));
        }
      }
    };

    fetchJobs();
    fetchUserProfile();
  }, [user]);

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

  const handleFileUpload = async (file: File, type: 'cv' | 'passport') => {
    if (!file) return;

    // Set file in form data for validation
    setFormData(prev => ({ ...prev, [type]: file }));

    // Reset progress
    setUploadProgress(prev => ({ ...prev, [type]: 1 }));

    let fileToUpload = file;

    // Compress image if it's a passport
    if (type === 'passport' && file.type.startsWith('image/')) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true
        };
        fileToUpload = await imageCompression(file, options);
      } catch (error) {
        console.error('Image compression failed:', error);
        // Continue with original file if compression fails
      }
    }

    const uploadUrl = import.meta.env.VITE_UPLOAD_URL || '/upload.php';
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(prev => ({ ...prev, [type]: percentComplete }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            setUploadedUrls(prev => ({ ...prev, [type]: data.url }));
            setUploadProgress(prev => ({ ...prev, [type]: 100 }));
          } else {
            alert('Upload failed: ' + data.message);
            setUploadProgress(prev => ({ ...prev, [type]: 0 }));
          }
        } else {
          alert('Upload failed with status: ' + xhr.status);
          setUploadProgress(prev => ({ ...prev, [type]: 0 }));
        }
      };

      xhr.onerror = () => {
        alert('Upload failed due to network error');
        setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1: // Personal Info
        if (
          formData.full_name &&
          formData.email &&
          formData.phone &&
          formData.date_of_birth &&
          formData.state_of_origin &&
          formData.lga &&
          formData.nin_number &&
          /^\d{11}$/.test(formData.nin_number) &&
          formData.address &&
          formData.passport
        ) {
          return true;
        }

        if (formData.nin_number && !/^\d{11}$/.test(formData.nin_number)) {
          alert('NIN Number must be exactly 11 digits');
        }
        return false;
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
        // Check if uploads are complete
        if (!uploadedUrls.cv) {
          alert('Please wait for the document upload to complete');
          return false;
        }
        if (!uploadedUrls.passport) {
          alert('Please wait for the passport upload to complete');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      setSubmitted(false); // Reset submitted state if retrying

      // Generate a fresh, unique Reference Number for this specific attempt
      // Format: KIUTH-2025-[TimestampLast6]-[Random2]
      const uniqueRef = `KIUTH-2025-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90)}`;

      // 1. Use already uploaded URLs
      const combinedDocsPath = uploadedUrls.cv;
      const passportPath = uploadedUrls.passport;

      if (!combinedDocsPath || !passportPath) {
        throw new Error("Files not uploaded correctly. Please try uploading again.");
      }

      // 2. Insert Application Data
      const { error: insertError } = await supabase
        .from('applications')
        .insert([
          {
            full_name: formData.full_name,
            email: formData.email.toLowerCase(), // Ensure email is lowercase for matching
            phone: formData.phone,
            date_of_birth: formData.date_of_birth,
            state_of_origin: formData.state_of_origin,
            lga: formData.lga,
            nin_number: formData.nin_number,
            // address: formData.address, // Removed as it causes 400 error (column missing)
            position: formData.position,
            department: formData.department,
            specialty: formData.specialty,
            qualification: formData.qualification,
            year_of_graduation: parseInt(formData.year_of_graduation) || null,
            license_number: formData.license_number,
            institution: formData.institution,
            reference_number: uniqueRef, // Use the fresh uniqueRef
            cv_url: combinedDocsPath,
            photo_url: passportPath,
            // other_documents: [] // Removing this as it might cause type issues if column is not array
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      try {
        await sendSMS(
          formData.phone,
          `Dear ${formData.full_name}, your application for ${formData.position} at KIUTH has been received. Ref: ${uniqueRef}. Keep this safe.`
        );
      } catch (smsError) {
        console.error("Failed to send SMS:", smsError);
      }

      // 4. Send Email Confirmation (No Attachment)
      sendEmail(
        formData.email,
        "Application Received - KIUTH Recruitment",
        `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e3a5f; border-bottom: 2px solid #4a9d7e; padding-bottom: 10px;">Application Received</h2>
              <p>Dear <strong>${formData.full_name}</strong>,</p>
              <p>Thank you for applying for the position of <strong>${formData.position}</strong> at Kashim Ibrahim University Teaching Hospital.</p>
              <p>Your application has been successfully submitted and is currently under review.</p>
              
              <div style="background-color: #f0f9ff; border-left: 4px solid #1e3a5f; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #555;">Your Reference Number:</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #4a9d7e;">${uniqueRef}</p>
              </div>

              <p><strong>Important Next Step:</strong></p>
              <p>Please login to your applicant dashboard to download your <strong>Application Slip</strong>. You will need to present a printed copy of this slip at the interview venue.</p>
              
              <p style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
                <a href="${window.location.origin}/dashboard" style="background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
              </p>
              
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #888;">If the button above doesn't work, copy and paste this link into your browser:<br>${window.location.origin}/dashboard</p>
              <br>
              <p>Best Regards,<br>KIUTH Recruitment Team</p>
            </div>
          `
      )
        .then(() => { /* Email sent */ })
        .catch((emailError) => console.error("Failed to send email:", emailError));

      setSubmitted(true);
      // Clear localStorage after successful submission
      localStorage.removeItem('selectedJobDetails');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    // Auto-generate slip on first render of success screen
    // We can use a useEffect or just a button. A button is safer for browser popup blockers.

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[#1e3a5f] mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-2">Your application has been successfully submitted.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 max-w-md mx-auto">
            <p className="text-sm text-yellow-800 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Please check your email inbox and <strong>spam/junk folder</strong> for the confirmation message.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Reference Number:</p>
            <p className="text-2xl font-bold text-[#4a9d7e]">{refNumber}</p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please download your Application Slip. You will need to present this at the interview.
            </p>
            <button
              onClick={() => generateSlip({
                full_name: formData.full_name,
                reference_number: refNumber,
                position: formData.position,
                department: formData.department,
                date_of_birth: formData.date_of_birth,
                state_of_origin: formData.state_of_origin,
                passportFile: formData.passport
              })}
              className="px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#162c4b] flex items-center justify-center mx-auto gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Application Slip
            </button>
          </div>
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
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setFormData({ ...formData, nin_number: val });
                  }}
                  maxLength={11}
                  placeholder="11 digits"
                />
                <p className="text-xs text-gray-500 mt-1">Must be exactly 11 digits</p>
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

                {/* Manual Upload Button for Passport */}
                {formData.passport && !uploadedUrls.passport && (
                  <button
                    onClick={() => handleFileUpload(formData.passport!, 'passport')}
                    disabled={uploadProgress.passport > 0 && uploadProgress.passport < 100}
                    className={`mt-3 px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded-md hover:bg-[#162c4b] transition-colors flex items-center gap-2 ${uploadProgress.passport > 0 && uploadProgress.passport < 100 ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                  >
                    {uploadProgress.passport > 0 && uploadProgress.passport < 100 ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Upload Passport
                      </>
                    )}
                  </button>
                )}

                {/* Progress Bar for Passport */}
                {uploadProgress.passport > 0 && uploadProgress.passport < 100 && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Uploading...</span>
                      <span className="text-xs font-semibold text-brand-teal">{uploadProgress.passport}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-teal h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress.passport}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {uploadedUrls.passport && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Passport uploaded successfully
                  </p>
                )}
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
                <div className="mt-4 pt-3 border-t border-blue-200">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>
                      <strong>Tip:</strong> If you have many documents, please <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-900">compress your merged PDF</a> before uploading in the next step.
                    </span>
                  </p>
                </div>
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
                  type="number"
                  value={formData.year_of_graduation}
                  onChange={(e) => setFormData({ ...formData, year_of_graduation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a9d7e]"
                  placeholder="YYYY"
                  min="1950"
                  max="2030"
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

            {/* PDF Compression Helper */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  File too large?
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  If your merged PDF is very large, it might take a long time to upload. We recommend compressing it first.
                </p>
              </div>
              <a
                href="https://www.ilovepdf.com/compress_pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap px-4 py-2 bg-white border border-yellow-300 text-yellow-800 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium flex items-center gap-2"
              >
                Compress PDF Online
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>

            {/* CV Upload */}
            <div>
              <FileUpload
                label="Combined Documents (All documents in ONE PDF) *"
                accept=".pdf"
                onChange={(file) => setFormData({ ...formData, cv: file })}
              />

              {/* Manual Upload Button for CV */}
              {formData.cv && !uploadedUrls.cv && (
                <button
                  onClick={() => handleFileUpload(formData.cv!, 'cv')}
                  disabled={uploadProgress.cv > 0 && uploadProgress.cv < 100}
                  className={`mt-3 px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded-md hover:bg-[#162c4b] transition-colors flex items-center gap-2 ${uploadProgress.cv > 0 && uploadProgress.cv < 100 ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  {uploadProgress.cv > 0 && uploadProgress.cv < 100 ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      Upload Document
                    </>
                  )}
                </button>
              )}

              {/* Progress Bar for CV/PDF */}
              {uploadProgress.cv > 0 && uploadProgress.cv < 100 && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Uploading document...</span>
                    <span className="text-xs font-semibold text-brand-teal">{uploadProgress.cv}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-teal to-green-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress.cv}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {uploadedUrls.cv && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Document uploaded successfully
                </p>
              )}
            </div>

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
              disabled={isSubmitting}
              className={`px-6 py-2 bg-[#4a9d7e] text-white rounded-lg hover:bg-[#3d8568] flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
