import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";

export async function assignAdminRole(uid) {
  const auth = getAuth();
  const functions = getFunctions();

  try {
    // Make sure the user is logged in first
    if (!auth.currentUser) throw new Error("You must be logged in");

    const setAdminRole = httpsCallable(functions, "setAdminRole");
    const result = await setAdminRole({ uid });
    console.log(result.data.message);
    return result.data;
  } catch (err) {
    console.error("Error assigning admin role:", err);
    throw err;
  }
}
