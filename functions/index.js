const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Callable function to assign admin role
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  const { uid } = data;

  if (!uid) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "User UID is required."
    );
  }

  // Optional security: only allow existing admins to assign roles
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admins can assign roles."
    );
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    return { message: `Admin role set for user ${uid}` };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError("internal", err.message);
  }
});
