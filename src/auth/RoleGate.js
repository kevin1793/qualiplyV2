import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
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
        // Fetch user doc by UID
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.warn("No user document found, defaulting to denied");
          setAllowed(false);
        } else {
          const userRole = userDoc.data().role?.toLowerCase() || null;
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
