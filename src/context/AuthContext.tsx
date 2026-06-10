"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth, googleProvider, hasFirebaseConfig } from "@/lib/firebase";
import { showAppToast } from "@/lib/toasts";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  hasConfig: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logOut: async () => {},
  hasConfig: hasFirebaseConfig,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!hasFirebaseConfig ? false : true);

  useEffect(() => {
    if (!hasFirebaseConfig) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!hasFirebaseConfig) {
      showAppToast({
        type: "warning",
        title: "Firebase is not configured",
        description: "Add your credentials in .env.local before signing in.",
      });
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Authentication error during Google Sign-in: ", error);
      throw error;
    }
  };

  const logOut = async () => {
    if (!hasFirebaseConfig) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logOut, hasConfig: hasFirebaseConfig }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
