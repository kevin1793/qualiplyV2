import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAaacH6IIEHfpvSTMu7PLTZhdy-PoAgcFM",
  authDomain: "qualiply-354a0.firebaseapp.com",
  projectId: "qualiply-354a0",
  storageBucket: "qualiply-354a0.firebasestorage.app",
  messagingSenderId: "937171229186",
  appId: "1:937171229186:web:60dfc340303b55774b651b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();