import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBUWjq5TEZ7lh9JpzMCfGLOPX_WbLqBLGw",
  authDomain: "hrm-system-9f4a3.firebaseapp.com",
  databaseURL: "https://hrm-system-9f4a3-default-rtdb.firebaseio.com",
  projectId: "hrm-system-9f4a3",
  storageBucket: "hrm-system-9f4a3.appspot.com",
  messagingSenderId: "698601974813",
  appId: "1:698601974813:web:8331ea64861511b33eeaf4",
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
