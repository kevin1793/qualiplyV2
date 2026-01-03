import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

export default function JobsAdmin() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newJob, setNewJob] = useState({ title: "", location: "" });

  const jobsRef = collection(db, "jobs");

  // Fetch jobs from Firestore
  const fetchJobs = async () => {
    setLoading(true);
    const snapshot = await getDocs(jobsRef);
    const jobsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setJobs(jobsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Create job
  const handleCreate = async () => {
    if (!newJob.title) return;
    await addDoc(jobsRef, newJob);
    setNewJob({ title: "", location: "" });
    fetchJobs();
  };

  // Update job
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
      <h1 className="text-2xl font-bold mb-4">Manage Jobs</h1>

      {/* New Job Form */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Job title"
          className="border rounded px-2 py-1"
          value={newJob.title}
          onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Location"
          className="border rounded px-2 py-1"
          value={newJob.location}
          onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
        />
        <button
          onClick={handleCreate}
          className="bg-slate-900 text-white px-3 rounded hover:bg-slate-800"
        >
          Add Job
        </button>
      </div>

      {/* Jobs Table */}
      <table className="w-full border-collapse border border-slate-300">
        <thead>
          <tr>
            <th className="border border-slate-300 px-2 py-1">Title</th>
            <th className="border border-slate-300 px-2 py-1">Location</th>
            <th className="border border-slate-300 px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="border border-slate-300 px-2 py-1">
                <input
                  type="text"
                  value={job.title}
                  onChange={(e) => handleUpdate(job.id, "title", e.target.value)}
                  className="w-full border px-1 py-0.5"
                />
              </td>
              <td className="border border-slate-300 px-2 py-1">
                <input
                  type="text"
                  value={job.location}
                  onChange={(e) => handleUpdate(job.id, "location", e.target.value)}
                  className="w-full border px-1 py-0.5"
                />
              </td>
              <td className="border border-slate-300 px-2 py-1">
                <button
                  onClick={() => handleDelete(job.id)}
                  className="bg-red-600 text-white px-2 rounded hover:bg-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
