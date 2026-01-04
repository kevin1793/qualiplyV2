import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useNavigate, useParams } from "react-router-dom";

export default function JobEdit() {
  const navigate = useNavigate();
  const { jobId } = useParams(); // get jobId from URL params

  const [form, setForm] = useState({
    jobTitle: "",
    department: "",
    locationType: "Remote",
    location: "",
    employmentType: ["Full-time"],
    jobDescription: "",
    responsibilities: "",
    requirements: "",
    qualifications: "",
    benefits: "",
    status: "Draft",
    isPublic: true,
    payType: "Salary",
    payMin: "",
    payMax: "",
  });

  const [loading, setLoading] = useState(true);

  // -----------------------
  // Fetch job data
  // -----------------------
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobRef = doc(db, "jobs", jobId);
        const jobSnap = await getDoc(jobRef);

        if (jobSnap.exists()) {
          setForm({ ...form, ...jobSnap.data() });
        } else {
          alert("Job not found");
          navigate("/admin/jobs");
        }
      } catch (err) {
        console.error("Failed to fetch job:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, {
        ...form,
        updatedAt: new Date(),
        updatedBy: auth.currentUser.uid,
      });
      navigate("/admin/jobs");
    } catch (err) {
      console.error("Failed to update job:", err);
      alert("Error updating job. Check console.");
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-slate-700 hover:underline mb-4"
      >
        &larr; Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Job</h1>
        <p className="text-slate-500">Update the details below and save changes.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-slate-100 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Basic Information</h2>

          <input
            name="jobTitle"
            placeholder="Job Title"
            className="w-full border rounded-lg px-3 py-2"
            value={form.jobTitle}
            onChange={handleChange}
            required
          />

          <input
            name="department"
            placeholder="Department"
            className="w-full border rounded-lg px-3 py-2"
            value={form.department}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="locationType"
              className="w-full border rounded-lg px-3 py-2"
              value={form.locationType}
              onChange={handleChange}
            >
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
            </select>

            <input
              name="location"
              placeholder="Location (optional)"
              className="w-full border rounded-lg px-3 py-2"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div className="bg-slate-100 rounded-xl py-6  space-y-2">
            <h2 className="font-semibold text-slate-800">Employment Type</h2>

            <div className="flex gap-4 px-2">
              {["Full-time", "Part-time", "Contract"].map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="employmentType"
                    value={type}
                    checked={form.employmentType.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm({
                          ...form,
                          employmentType: [...form.employmentType, type],
                        });
                      } else {
                        setForm({
                          ...form,
                          employmentType: form.employmentType.filter((t) => t !== type),
                        });
                      }
                    }}
                    className="accent-slate-900"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-slate-100 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Job Details</h2>

          <textarea
            name="jobDescription"
            placeholder="Job Description"
            className="w-full border rounded-lg px-3 py-2 h-32"
            value={form.jobDescription}
            onChange={handleChange}
            required
          />

          <textarea
            name="responsibilities"
            placeholder="Responsibilities"
            className="w-full border rounded-lg px-3 py-2 h-28"
            value={form.responsibilities}
            onChange={handleChange}
          />

          <textarea
            name="requirements"
            placeholder="Requirements"
            className="w-full border rounded-lg px-3 py-2 h-28"
            value={form.requirements}
            onChange={handleChange}
          />

          <textarea
            name="qualifications"
            placeholder="Qualifications"
            className="w-full border rounded-lg px-3 py-2 h-28"
            value={form.qualifications}
            onChange={handleChange}
          />
        </div>

        {/* Pay */}
        <div className="bg-slate-100 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Pay</h2>

          <select
            name="payType"
            className="w-full border rounded-lg px-3 py-2"
            value={form.payType}
            onChange={(e) => setForm({ ...form, payType: e.target.value })}
            required
          >
            <option value="Salary">Salary</option>
            <option value="Hourly">Hourly</option>
            <option value="DOE">DOE</option>
          </select>

          {(form.payType === "Salary" || form.payType === "Hourly") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                name="payMin"
                placeholder={`Min ${form.payType}`}
                className="w-full border rounded-lg px-3 py-2"
                value={form.payMin || ""}
                onChange={(e) =>
                  setForm({ ...form, payMin: e.target.value ? Number(e.target.value) : "" })
                }
              />
              <input
                type="number"
                name="payMax"
                placeholder={`Max ${form.payType}`}
                className="w-full border rounded-lg px-3 py-2"
                value={form.payMax || ""}
                onChange={(e) =>
                  setForm({ ...form, payMax: e.target.value ? Number(e.target.value) : "" })
                }
              />
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="bg-slate-100 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Benefits</h2>

          <textarea
            name="benefits"
            placeholder="Benefits (healthcare, PTO, 401k, etc.)"
            className="w-full border rounded-lg px-3 py-2 h-24"
            value={form.benefits}
            onChange={handleChange}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/jobs")}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
