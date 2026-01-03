import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function RoleGate({ role, children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (!auth.currentUser) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      try {
        // Query users collection by email
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", auth.currentUser.email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setAllowed(false);
        } else {
          const userData = snapshot.docs[0].data();
          const userRole = userData.role?.toLowerCase() || null;

          setAllowed(userRole === role.toLowerCase());
        }
      } catch (err) {
        console.error("RoleGate error:", err);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [role]);

  if (loading) return <div>Loading…</div>;
  if (!allowed) return <Navigate to="/" replace />;

  return children;
}
