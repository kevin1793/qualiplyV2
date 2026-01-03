import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function JobsAdmin() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const jobsRef = collection(db, "jobs");

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    const snapshot = await getDocs(jobsRef);
    const jobsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setJobs(jobsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Update job field
  const handleUpdate = async (jobId, field, value) => {
    const jobDoc = doc(db, "jobs", jobId);
    await updateDoc(jobDoc, { [field]: value });
    fetchJobs();
  };

  // Delete job
  const handleDelete = async (jobId) => {
    const jobDoc = doc(db, "jobs", jobId);
    await deleteDoc(jobDoc);
    fetchJobs();
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Jobs</h1>
        <button
          onClick={() => navigate("/admin/jobs/create")}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          + Create Job
        </button>
      </div>

      {/* Jobs Table */}
      <table className="w-full border-collapse border border-slate-300">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-300 px-3 py-2 text-left">
              Title
            </th>
            <th className="border border-slate-300 px-3 py-2 text-left">
              Location
            </th>
            <th className="border border-slate-300 px-3 py-2 text-left">
              Status
            </th>
            <th className="border border-slate-300 px-3 py-2">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="border border-slate-300 px-3 py-2 text-slate-800 font-medium">
                {job.jobTitle || "-"}
              </td>
              <td className="border border-slate-300 px-3 py-2 text-slate-500">
                {job.location || "-"}
              </td>
              <td className="border border-slate-300 px-3 py-2 text-slate-500">
                {job.status || "-"}
              </td>

              <td className="border border-slate-300 px-3 py-2 text-center flex justify-center gap-2">
                {/* View Job */}
              <button
                onClick={() => navigate(`/admin/jobs/${job.id}`)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500"
              >
                View
              </button>
              {/* Publish / Unpublish */}
              {job.status === "Draft" ? (
                <button
                  onClick={() => handleUpdate(job.id, "status", "Live")}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500"
                >
                  Publish
                </button>
              ) : (
                <button
                  onClick={() => handleUpdate(job.id, "status", "Draft")}
                  className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-500"
                >
                  Draft
                </button>
              )}

              {/* Delete */}
              <button
                onClick={() => handleDelete(job.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
              >
                Delete
              </button>
            </td>

            </tr>
          ))}

          {jobs.length === 0 && (
            <tr>
              <td
                colSpan="3"
                className="text-center text-slate-500 py-6"
              >
                No jobs created yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
