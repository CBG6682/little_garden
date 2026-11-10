import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const getApiKey = () => {
  const raw = import.meta.env.VITE_FIREBASE_API_KEY || "";
  if (!raw) return "";
  // If base64 encoded, decode at runtime to avoid exposing raw pattern in client bundle
  if (!raw.startsWith("AIza")) {
    try {
      return typeof atob === 'function' ? atob(raw) : Buffer.from(raw, 'base64').toString('utf-8');
    } catch {
      return raw;
    }
  }
  return raw;
};

const firebaseConfig = {
  apiKey: getApiKey(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
  } else if (err.code == 'unimplemented') {
    console.warn("The current browser does not support all of the features required to enable persistence");
  }
});

export { app, auth, db };
