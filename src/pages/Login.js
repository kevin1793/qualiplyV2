import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { collection, query, where, getDocs, getDoc, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState(null); // Track current auth user

  const navigate = useNavigate();

  // Listen for auth state change (user is signed in)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user); // Set auth user to state
        // Check if Firestore user document exists for the signed-in user
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          // If no document exists for the user, create it with default role
          await setDoc(userDocRef, {
            email: user.email,
            role: "default", // Default role for signed-in users who don't have a Firestore doc
          });
        }
      } else {
        setAuthUser(null); // Reset auth user on sign-out
      }
    });

    return unsubscribe; // Clean up the listener on unmount
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let userCredential;

      if (isRegistering) {
        // Create user
        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Save default role = 'applicant' in Firestore using UID
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email,
          role: "default",
        });

      } else {
        // Sign in
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        await auth.currentUser.getIdToken(true); // refresh to pick up admin claim

      }

      // Fetch user document by UID
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      let role = "default"; // default fallback
      if (userDoc.exists()) {
        role = userDoc.data().role || "default";
      }

      // Redirect based on role

      if (role.toLowerCase() === "admin") navigate("/admin");
      // else if (role.toLowerCase() === "applicant") navigate("/applicant");
      else navigate("/"); // fallback

    } catch (err) {
      setError(err.message);
      console.error("Login/Register error:", err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">ATS Login</h1>
        <p className="text-slate-500 mb-6">
          {isRegistering
            ? "Create an account"
            : "Sign in to continue"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-slate-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-slate-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-lg py-2 hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading ? "Please wait…" : isRegistering ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-slate-600">
          {isRegistering ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsRegistering(false)}
                className="text-slate-900 font-medium hover:underline"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setIsRegistering(true)}
                className="text-slate-900 font-medium hover:underline"
              >
                Create one
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
