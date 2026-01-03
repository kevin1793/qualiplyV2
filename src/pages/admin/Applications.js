import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase"; // make sure storage is exported from firebase.js


export default function ApplicationsAdmin() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const applicationsRef = collection(db, "applications");

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(applicationsRef);
      const appsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let resumeURL = null;
          if (data.resumePath) {
            try {
              const storageRef = ref(storage, data.resumePath);
              resumeURL = await getDownloadURL(storageRef);
            } catch (err) {
              console.warn("Failed to get resume URL for", data.fullName, err);
            }
          }
          return { id: docSnap.id, ...data, resumeURL };
        })
      );
      setApplications(appsData);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Update status
  const handleStatusChange = async (appId, newStatus) => {
    try {
      const appDoc = doc(db, "applications", appId);
      await updateDoc(appDoc, { status: newStatus });
      fetchApplications(); // refresh list
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Delete application
  const handleDelete = async (appId) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      const appDoc = doc(db, "applications", appId);
      await deleteDoc(appDoc);
      fetchApplications();
    } catch (err) {
      console.error("Error deleting application:", err);
    }
  };

  if (loading) return <div>Loading applications…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Job Applications</h1>
      {applications.length === 0 && <p>No applications submitted yet.</p>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-200">
              <th className="border border-slate-300 px-3 py-2">Applicant Name</th>
              <th className="border border-slate-300 px-3 py-2">Email</th>
              <th className="border border-slate-300 px-3 py-2">Job Title</th>
              <th className="border border-slate-300 px-3 py-2">Status</th>
              <th className="border border-slate-300 px-3 py-2">Resume</th>
              <th className="border border-slate-300 px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-slate-100">
                <td className="border border-slate-300 px-3 py-2">{app.fullName}</td>
                <td className="border border-slate-300 px-3 py-2">{app.email}</td>
                <td className="border border-slate-300 px-3 py-2">{app.jobTitle}</td>
                <td className="border border-slate-300 px-3 py-2">{app.status}</td>
                <td className="border border-slate-300 px-3 py-2">
                  {app.resumePath ? (
                    <a
                      href={app.resumePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-700 hover:underline"
                    >
                      View Resume
                    </a>
                  ) : (
                    "No resume"
                  )}
                </td>
                <td className="border border-slate-300 px-3 py-2 space-x-1">
                  <button
                    onClick={() => handleStatusChange(app.id, "Reviewed")}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-400"
                  >
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => handleStatusChange(app.id, "Accepted")}
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-500"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange(app.id, "Rejected")}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
