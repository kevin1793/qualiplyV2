import { useEffect, useState } from "react";
import { niceName } from "../../utils/helper";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage,auth } from "../../firebase";
import { useNavigate } from "react-router-dom";


export default function ApplicationsAdmin() {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filters and sorting
  const [filters, setFilters] = useState({
    fullName: "",
    email: "",
    jobTitle: "",
    status: "",
  });
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
  const checkAdmin = async () => {
    if (!auth.currentUser) {
      console.log("No user signed in");
      return;
    }

    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn("User doc does not exist:", auth.currentUser.uid);
    } else {
      console.log("User role:", userSnap.data().role);
    }
  };

  checkAdmin();
}, []);

  // -----------------------
  // Fetch applications
  // -----------------------
  const fetchApplications = async () => {
    setLoading(true);

    try {
      const snapshot = await getDocs(collection(db, "applications"));

      const appsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let resumeURL = null;

          if (data.resumePath) {
            try {
              resumeURL = await getDownloadURL(
                ref(storage, data.resumePath)
              );
            } catch (err) {
              console.warn(
                `Resume fetch failed for ${data.fullName}`,
                err
              );
            }
          }

          return { id: docSnap.id, ...data, resumeURL };
        })
      );

      setApplications(appsData);
      setFilteredApps(appsData);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchApplications();
  }, []);

  // -----------------------
  // Filtering + sorting
  // -----------------------
  useEffect(() => {
    let apps = [...applications];

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        apps = apps.filter((app) =>
          app[key]?.toLowerCase().includes(filters[key].toLowerCase())
        );
      }
    });

    if (sortField) {
      apps.sort((a, b) => {
        const aVal = a[sortField] || "";
        const bVal = b[sortField] || "";
        if (aVal < bVal) return sortAsc ? -1 : 1;
        if (aVal > bVal) return sortAsc ? 1 : -1;
        return 0;
      });
    }

    setFilteredApps(apps);
  }, [filters, sortField, sortAsc, applications]);

  // -----------------------
  // Update application status
  // -----------------------
  const handleStatusChange = async (id, newStatus) => {
    try {
      const appRef = doc(db, "applications", id);
      await updateDoc(appRef, { status: newStatus });

      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // -----------------------
  // Delete application
  // -----------------------
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "applications", id));
      setApplications((prev) =>
        prev.filter((app) => app.id !== id)
      );
    } catch (err) {
      console.error("Failed to delete application:", err);
    }
  };

  // -----------------------
  // Sorting handler
  // -----------------------
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Applications</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["fullName", "email", "jobTitle", "status"].map((key) => (
          <input
            key={key}
            type="text"
            placeholder={`Filter by ${niceName(key)}`}
            value={filters[key]}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                [key]: e.target.value,
              }))
            }
            className="border px-2 py-1 rounded"
          />
        ))}
      </div>

      <table className="w-full border-collapse border border-slate-300">
        <thead>
          <tr>
            {[
              { label: "Name", field: "fullName" },
              { label: "Email", field: "email" },
              { label: "Job", field: "jobTitle" },
              { label: "Status", field: "status" },
              { label: "Application"},
              { label: "Resume" },
              { label: "Actions" },
            ].map((col) => (
              <th
                key={col.label}
                className="border px-3 py-2 cursor-pointer"
                onClick={() => col.field && handleSort(col.field)}
              >
                {col.label}
                {sortField === col.field && (
                  <span>{sortAsc ? " ↑" : " ↓"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredApps.map((app) => (
            <tr key={app.id} className="hover:bg-slate-50">
              <td className="border px-3 py-2">{app.fullName}</td>
              <td className="border px-3 py-2">{app.email}</td>
              <td className="border px-3 py-2">{app.jobTitle}</td>
              <td className="border px-3 py-2">
                <select
                  value={app.status}
                  onChange={(e) =>
                    handleStatusChange(app.id, e.target.value)
                  }
                  className="border px-2 py-1 rounded"
                >
                  {[
                    "Submitted",
                    "In Review",
                    "Accepted",
                    "Rejected",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>

              <td className="border px-3 py-2">
                {app.id ? (
                  <button
                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                ) : (
                  <span className="text-gray-500">No application</span>
                )}
              </td>


              <td className="border px-3 py-2">
                {app.resumeURL ? (
                  <a
                    href={app.resumeURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                ) : (
                  "No resume"
                )}
              </td>

              <td className="border px-3 py-2 text-center">
                <button
                  onClick={() => handleDelete(app.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
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
