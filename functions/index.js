const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Callable function to assign admin role
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  // Only existing admins can assign roles
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admins can assign roles."
    );
  }

  const { uid } = data;
  if (!uid) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "User UID is required."
    );
  }

  await admin.auth().setCustomUserClaims(uid, { admin: true });
  return { message: `Admin role set for user ${uid}` };
});
