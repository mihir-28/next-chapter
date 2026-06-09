import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that we have at least the critical keys before using the real config
const isConfigValid = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const app = getApps().length > 0 
  ? getApp() 
  : initializeApp(isConfigValid ? firebaseConfig : {
      apiKey: "placeholder-api-key",
      authDomain: "placeholder-auth-domain",
      projectId: "placeholder-next-chapter", // MUST have a project-id structure
      storageBucket: "placeholder-storage-bucket",
      messagingSenderId: "placeholder-messaging-sender-id",
      appId: "placeholder-app-id",
    });

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Custom Google provider setup to prompt select_account
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export { app };
export const hasFirebaseConfig = !!isConfigValid;
