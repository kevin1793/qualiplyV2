import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";

export default function RoleGate({ role, children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          console.warn("RoleGate: user doc missing");
          setAllowed(false);
        } else {
          setAllowed(snap.data().role === role);
        }
      } catch (err) {
        console.error("RoleGate error:", err);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [role]);

  if (loading) return <div className="p-6">Checking permissions…</div>;
  if (!allowed) return <Navigate to="/" replace />;

  return children;
}
