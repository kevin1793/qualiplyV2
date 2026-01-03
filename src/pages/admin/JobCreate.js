import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";

export default function JobCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    jobTitle: "",
    department: "",
    locationType: "Remote",
    location: "",
    employmentType: ["Full-time"], // array
    jobDescription: "",
    responsibilities: "",
    qualifications: "",
    benefits: "",
    status: "Draft",
    isPublic: true,
    payType: "Salary", // default
    payMin: "",        // optional
    payMax: "",        // optional
  });


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "jobs"), {
      ...form,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.uid,
    });

    navigate("/admin/jobs");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)} // goes back to previous page
        className="text-slate-700 hover:underline mb-4"
      >
        &larr; Back
      </button>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Job</h1>
        <p className="text-slate-500">
          Fill out the details below to publish a new role.
        </p>
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

        {/* Pay Type */}
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

  {/* Conditional min/max inputs */}
  {form.payType === "Salary" || form.payType === "Hourly" ? (
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
  ) : null}
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
            Save Job
          </button>
        </div>
      </form>
    </div>
  );
}
