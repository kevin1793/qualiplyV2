const admin = require("firebase-admin");
admin.initializeApp();

admin.auth().setCustomUserClaims("UwrGMOkZfMYL7DrtLic7JmPCiKj2", { admin: true })
  .then(() => console.log("Admin claim set!"))
  .catch(console.error);
