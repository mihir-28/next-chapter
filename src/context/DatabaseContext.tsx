"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  FieldValue
} from "firebase/firestore";
import { db, hasFirebaseConfig } from "@/lib/firebase";
import { useAuth } from "./AuthContext";

export type ReadingStatus = "To Read" | "Currently Reading" | "Finished" | "DNF";
export type ReviewStatus = "Not Started" | "Drafted" | "Submitted" | "Published";

export interface ARC {
  id: string;
  title: string;
  author: string;
  deadline: string; // YYYY-MM-DD
  readingStatus: ReadingStatus;
  reviewStatus: ReviewStatus;
  
  // Optional Fields
  coverUrl?: string;
  releaseDate?: string; // YYYY-MM-DD
  dateReceived?: string; // YYYY-MM-DD
  progress?: number; // 0-100
  notes?: string;
  rating?: number; // 0-5
  reviewLink?: string;
  
  // Scoping
  ownerId: string;
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}

export type NewARCData = Omit<ARC, "id" | "ownerId" | "createdAt" | "updatedAt">;

interface DatabaseContextType {
  arcs: ARC[];
  loading: boolean;
  addARC: (arc: NewARCData) => Promise<void>;
  updateARC: (id: string, arcData: Partial<ARC>) => Promise<void>;
  deleteARC: (id: string) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType>({
  arcs: [],
  loading: true,
  addARC: async () => {},
  updateARC: async () => {},
  deleteARC: async () => {},
});

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [arcs, setArcs] = useState<ARC[]>([]);
  const [loading, setLoading] = useState(hasFirebaseConfig ? true : false);

  useEffect(() => {
    if (!hasFirebaseConfig) return;

    if (!user) {
      const timer = setTimeout(() => {
        setArcs([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setLoading(true);
    }, 0);

    const q = query(
      collection(db, "arcs"),
      where("ownerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedArcs: ARC[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedArcs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        } as ARC);
      });
      setArcs(fetchedArcs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore loading error: ", error);
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [user]);

  const addARC = async (arcData: NewARCData) => {
    if (!hasFirebaseConfig || !user) {
      throw new Error("Firebase is not initialized or user is not logged in.");
    }
    
    // Clean any undefined values to prevent Firestore serialization errors
    const cleanedData = Object.fromEntries(
      Object.entries(arcData).filter(([_, v]) => v !== undefined)
    );
    
    try {
      await addDoc(collection(db, "arcs"), {
        ...cleanedData,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding ARC: ", error);
      throw error;
    }
  };

  const updateARC = async (id: string, arcData: Partial<ARC>) => {
    if (!hasFirebaseConfig || !user) {
      throw new Error("Firebase is not initialized or user is not logged in.");
    }

    // Clean any undefined values to prevent Firestore serialization errors
    const cleanedData = Object.fromEntries(
      Object.entries(arcData).filter(([_, v]) => v !== undefined)
    );

    try {
      const docRef = doc(db, "arcs", id);
      await updateDoc(docRef, {
        ...cleanedData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating ARC: ", error);
      throw error;
    }
  };

  const deleteARC = async (id: string) => {
    if (!hasFirebaseConfig || !user) {
      throw new Error("Firebase is not initialized or user is not logged in.");
    }

    try {
      const docRef = doc(db, "arcs", id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting ARC: ", error);
      throw error;
    }
  };

  return (
    <DatabaseContext.Provider value={{ arcs, loading, addARC, updateARC, deleteARC }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
