import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { collection, query, where, getDocs,getDoc, doc, setDoc  } from "firebase/firestore";

import { auth, db } from "../firebase";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
          role: "applicant",
        });

        console.log("Created user doc with UID:", userCredential.user.uid);
      } else {
        // Sign in
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        await auth.currentUser.getIdToken(true); // refresh to pick up admin claim

        console.log("Signed in user UID:", userCredential.user.uid);
      }

      // Fetch user document by UID
      console.log('fetching ref by id',userCredential.user.uid);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      console.log('userDocRef.exists()', userDocRef);
      console.log('getDoc userDocRef');
      const userDoc = await getDoc(userDocRef);
      console.log(userDoc.exists());

      let role = "applicant"; // default fallback
      if (userDoc.exists()) {
        role = userDoc.data().role || "applicant";
        console.log("Fetched user doc:", userDoc.data());
      } else {
        console.log("No user document found, defaulting role to applicant");
      }

      // Redirect based on role
      console.log("Logged in email:", userCredential.user.email);
      console.log("Logged in role:", role);

      if (role.toLowerCase() === "admin") navigate("/admin");
      else if (role.toLowerCase() === "applicant") navigate("/applicant");
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
            ? "Create an account to track your application"
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
