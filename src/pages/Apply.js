import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase"; // make sure storage is exported from firebase.js

export default function Apply() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
    certifications: "",      // e.g., HHA Certified, LVN License
    licenseNumber: "",       // for LVN
    licenseState: "",
    cprCertified: false,
    firstAidCertified: false,
    education: "",
    experience: "",
    languages: [],
    availability: [],        // e.g., Days, Nights, Weekends
    backgroundConsent: false,
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobDoc = await getDoc(doc(db, "jobs", jobId));
        if (jobDoc.exists()) setJob({ id: jobDoc.id, ...jobDoc.data() });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSizeMB = 2; // 2 MB limit
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File is too large. Maximum size is ${maxSizeMB}MB.`);
        e.target.value = ""; // clear the input
        return;
      }
      setResumeFile(file);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!resumeFile) {
      setError("Please upload your resume.");
      return;
    }
    if (!form.backgroundConsent) {
      setError("You must consent to background check.");
      return;
    }

    setSubmitting(true);
    try {
      // Upload resume
      const filePath = `resumes/${jobId}_${Date.now()}_${resumeFile.name}`;
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, resumeFile);

      // Save application
      await addDoc(collection(db, "applications"), {
        jobId,
        jobTitle: job.jobTitle || job.title,
        ...form,
        resumePath: filePath,
        createdAt: serverTimestamp(),
        status: "Submitted",
      });

      alert("Application submitted! We will be in touch if you are selected to interview.");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading job details…</div>;
  if (!job) return <div className="p-6">Job not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 space-y-6">
        <button onClick={() => navigate(-1)} className="text-slate-700 hover:underline">
          &larr; Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900">
          Apply for: {job.jobTitle || job.title}
        </h1>

        {/* Job Details */}
        <div className="space-y-3">
          {job.locationType && (
            <div className="bg-slate-100 rounded p-4 text-slate-700">
              <span className="font-semibold text-slate-800">Location Type:</span>{" "}
              {job.locationType}
            </div>
          )}
          {job.location && (
            <div className="bg-slate-100 rounded p-4 text-slate-700">
              <span className="font-semibold text-slate-800">Location:</span>{" "}
              {job.location}
            </div>
          )}
          {job.employmentType && (
            <div className="bg-slate-100 rounded p-4 text-slate-700">
              <span className="font-semibold text-slate-800">Employment Type:</span>{" "}
              {job.employmentType.join(", ")}
            </div>
          )}
          {job.payType && (
            <div className="bg-slate-100 rounded p-4 text-slate-700">
              <span className="font-semibold text-slate-800">Pay Type:</span>{" "}
              {job.payType} {(job.payMin || job.payMax) && (
                <> - {job.payMin || "-"} to {job.payMax || "-"}</>
              )}
            </div>
          )}
          {job.jobDescription && (
            <div className="bg-slate-100 rounded p-4 text-slate-700">
              <h2 className="font-semibold text-slate-800 mb-1">Job Description</h2>
              <p className="whitespace-pre-line">{job.jobDescription}</p>
            </div>
          )}
          {job.responsibilities && (
            <div className="bg-slate-100 rounded p-4 text-slate-700">
              <h2 className="font-semibold text-slate-800 mb-1">Responsibilities</h2>
              <p className="whitespace-pre-line">{job.responsibilities}</p>
            </div>
          )}
          {job.qualifications && (
            <div className="bg-slate-100 rounded p-4 text-slate-700">
              <h2 className="font-semibold text-slate-800 mb-1">Qualifications</h2>
              <p className="whitespace-pre-line">{job.qualifications}</p>
            </div>
          )}
          {job.benefits && (
            <div className="bg-slate-100 rounded p-4 text-slate-700">
              <h2 className="font-semibold text-slate-800 mb-1">Benefits</h2>
              <p className="whitespace-pre-line">{job.benefits}</p>
            </div>
          )}
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Personal & Contact Info */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Home Address (City, State)</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="42 Wallaby Way, Bedford, TX"
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Preferred Work Schedule / Availability
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {["Days", "Nights", "Weekdays", "Weekends"].map((slot) => (
                <label key={slot} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="availability"
                    value={slot}
                    checked={form.availability.includes(slot)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Add to array
                        setForm((prev) => ({
                          ...prev,
                          availability: [...prev.availability, slot],
                        }));
                      } else {
                        // Remove from array
                        setForm((prev) => ({
                          ...prev,
                          availability: prev.availability.filter((s) => s !== slot),
                        }));
                      }
                    }}
                    className="accent-slate-900"
                  />
                  {slot}
                </label>
              ))}
            </div>
          </div>


          {/* 2. Certification / License Details */}
          <div>
            <label className="block text-sm font-medium text-slate-700">HHA Certified?</label>
            <select
              name="hhaCertified"
              value={form.hhaCertified}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Professional License/Certification and Expiration</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleChange}
                placeholder="License Number"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
              />
              <input
                type="date"
                name="licenseExpiration"
                value={form.licenseExpiration}
                onChange={handleChange}
                placeholder="Expiration Date"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
              />
            </div>
            <input
              type="text"
              name="licenseState"
              value={form.licenseState}
              onChange={handleChange}
              placeholder="State"
              className="mt-2 w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="cprCertified"
                checked={form.cprCertified}
                onChange={handleChange}
                className="accent-slate-900"
              />
              CPR Certified
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="firstAidCertified"
                checked={form.firstAidCertified}
                onChange={handleChange}
                className="accent-slate-900"
              />
              First Aid Certified
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Other Relevant Certifications</label>
            <input
              type="text"
              name="otherCertifications"
              value={form.otherCertifications}
              onChange={handleChange}
              placeholder="Medication aide, Phlebotomy, Wound care, etc."
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          {/* 3. Education & Training */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Highest Level of Education</label>
            <input
              type="text"
              name="education"
              value={form.education}
              onChange={handleChange}
              placeholder="High School, Vocational, College, etc."
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Did you graduate?</label>
            <div className="flex gap-4 mt-1">
              {["Yes", "No"].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="graduated"
                    value={option}
                    checked={form.graduated === option}
                    onChange={handleChange}
                    className="accent-slate-900"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Relevant Training Programs</label>
            <textarea
              name="training"
              value={form.training}
              onChange={handleChange}
              rows={2}
              placeholder="Courses, continuing education, certifications"
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          {/* 4. Work Experience */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Previous Healthcare / Caregiving Experience</label>
            <textarea
              name="experience"
              value={form.experience}
              onChange={handleChange}
              rows={3}
              placeholder="Job title, employer, dates, duties"
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Experience with Elderly / Disabled Patients or Procedures</label>
            <textarea
              name="patientExperience"
              value={form.patientExperience}
              onChange={handleChange}
              rows={3}
              placeholder="Bathing, feeding, lifting, medical equipment, medications, etc."
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">References (1–3 professional)</label>
            <textarea
              name="references"
              value={form.references}
              onChange={handleChange}
              rows={3}
              placeholder="Name, relationship, contact info"
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          {/* 5. Skills & Competencies */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Languages Spoken</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {["English", "Spanish", "Other"].map((lang) => (
                <label key={lang} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="languages"
                    value={lang}
                    checked={form.languages.includes(lang)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm((prev) => ({
                          ...prev,
                          languages: [...prev.languages, lang],
                        }));
                      } else {
                        setForm((prev) => ({
                          ...prev,
                          languages: prev.languages.filter((l) => l !== lang),
                        }));
                      }
                    }}
                    className="accent-slate-900"
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>

          
          {/* transportaion */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Transportation / Willingness to Travel</label>
            <select
              name="transportation"
              value={form.transportation}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            >
              <option value="">Select</option>
              <option value="Own car / reliable transport">Own car / reliable transport</option>
              <option value="Willing to travel by public transport">Willing to travel by public transport</option>
            </select>
          </div>

          {/* 6. Background & Legal */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="eligibility"
                checked={form.eligibility}
                onChange={handleChange}
                className="accent-slate-900"
              />
              I am eligible to work in the U.S.
            </label>
          </div>

          {/* <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="criminalBackground"
                checked={form.criminalBackground}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, criminalBackground: e.target.checked }))
                }
                className="accent-slate-900"
              />
              I have no criminal convictions relevant to this role
            </label>
          </div> */}

          <div>
            <label className="block text-sm font-medium text-slate-700">Willingness to work part-time / PRN / on-call</label>
            <select
              name="workPreference"
              value={form.workPreference}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            >
              <option value="">Select</option>
              <option value="Part-time">Part-time</option>
              <option value="PRN / On-call">PRN / On-call</option>
              <option value="Full-time">Full-time</option>
            </select>
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Resume (PDF/Doc)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          {/* 7. Optional / Additional */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Cover Letter</label>
            <textarea
              name="coverLetter"
              value={form.coverLetter}
              onChange={handleChange}
              rows={3}
              placeholder="(Optional)"
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          {/* ------------------- Consent / Background Check ------------------- */}
          <div className="mt-4">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                name="backgroundConsent"
                checked={form.backgroundConsent || false}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, backgroundConsent: e.target.checked }))
                }
                className="mt-1 accent-slate-900"
                required
              />
              <span className="block text-sm font-medium text-slate-700">
                I consent to background and reference checks as part of the application process.
              </span>
            </label>
          </div>

          {/* ------------------- Legal Disclaimer ------------------- */}
          <div className="mt-4">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                name="legalConsent"
                checked={form.legalConsent || false}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, legalConsent: e.target.checked }))
                }
                className="mt-1 accent-slate-900"
                required
              />
              <span className="block text-sm font-medium text-slate-700">
                I understand that failure to disclose any prior employment or providing false information may 
                result in disqualification from employment or termination if employed.
              </span>
            </label>
          </div>

          {/* ------------------- At-Will Employment Acknowledgment ------------------- */}
          <div className="mt-4">

            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                name="atWillEmployment"
                checked={form.atWillEmployment || false}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, atWillEmployment: e.target.checked }))
                }
                className="mt-1 accent-slate-900"
                required
              />
              <span className="block text-sm font-medium text-slate-700">
                I understand that if hired, my employment is for no definite period and may be terminated at any time without prior notice.
              </span>
            </label>
          </div>

          

          {/* Error */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
