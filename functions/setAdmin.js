const admin = require("firebase-admin");
admin.initializeApp();

admin.auth().setCustomUserClaims("admin@gmail.com", { admin: true })
  .then(() => console.log("Admin claim set!"))
  .catch(console.error);
