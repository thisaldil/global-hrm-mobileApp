import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase configuration
export const firebaseConfig = {
  apiKey: "apiKey",
  authDomain: "authDomain",
  databaseURL: "databaseURL",
  projectId: "projectId",
  storageBucket: "storageBucket",
  messagingSenderId: "messagingSenderId",
  appId: "appId",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Sign in anonymously
signInAnonymously(auth)
  .then(() => {
    console.log("Signed in anonymously");
  })
  .catch((error) => {
    console.error("Error with anonymous sign-in", error);
  });

export { db, auth };
