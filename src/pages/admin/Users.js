import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const usersData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUsers(usersData);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Promote user to admin
  const handleMakeAdmin = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to make this user an admin?"
    );
    if (!confirmed) return;

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: "admin" });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: "admin" } : u
        )
      );
      alert("User promoted to admin!");
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Error updating role. See console for details.");
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      <table className="w-full border-collapse border border-slate-300">
        <thead>
          <tr className="bg-slate-200">
            <th className="border px-3 py-2">Email</th>
            <th className="border px-3 py-2">Role</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50">
              <td className="border px-3 py-2">{user.email}</td>
              <td className="border px-3 py-2 capitalize">{user.role}</td>
              <td className="border px-3 py-2 text-center">
                {user.role !== "admin" && user.role !== "applicant" ? (
                  <button
                    onClick={() => handleMakeAdmin(user.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500"
                  >
                    Make Admin
                  </button>
                ) : (
                  <span className="text-gray-500">
                    {user.role === "admin" ? "Admin" : "-"}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
