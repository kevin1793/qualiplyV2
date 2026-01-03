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
    coverLetter: "",
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
    setSubmitting(true);

    try {
      // Upload resume to Firebase Storage
      const filePath = `resumes/${jobId}_${Date.now()}_${resumeFile.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, resumeFile);

    // Save resume path in Firestore
    await addDoc(collection(db, "applications"), {
      jobId,
      jobTitle: job.jobTitle || job.title,
      fullName: form.fullName,
      email: form.email,
      coverLetter: form.coverLetter,
      resumePath: filePath, // store path, not URL
      createdAt: serverTimestamp(),
      status: "Submitted",
    });

      alert("Application submitted!");
      navigate("/"); // redirect after submit
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
            <label className="block text-sm font-medium text-slate-700">Resume (PDF/Doc)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Cover Letter (optional)</label>
            <textarea
              name="coverLetter"
              value={form.coverLetter}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-slate-300"
            ></textarea>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

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
