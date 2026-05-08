"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, getDocs, query, collection, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";

type AuthState = {
  user: User | null;
  role: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, role: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Single state object ensures ONE atomic re-render — eliminates any flash from separate setState calls
  const [authState, setAuthState] = useState<AuthState>({ user: null, role: null, loading: true });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setAuthState({ user: null, role: null, loading: false });
        router.push("/sign-in");
        return;
      }

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        let currentRole = "student";

        if (userDoc.exists()) {
          currentRole = userDoc.data().role;

          // Always re-verify "student" role against the teachers collection.
          // This fixes stale docs that were saved with wrong role on previous logins.
          if (currentRole === "student" && currentUser.email) {
            const teacherSnap = await getDocs(
              query(collection(db, "teachers"), where("email", "==", currentUser.email))
            );
            if (!teacherSnap.empty) {
              currentRole = "teacher";
              // Correct the stale Firestore document so future logins skip this check
              await setDoc(userDocRef, {
                email: currentUser.email,
                role: "teacher",
                createdAt: new Date().toISOString(),
              });
            }
          }
        } else {
          // No document yet — detect role by checking Firestore collections
          if (currentUser.email === "mohammedaffanrazvi604@gmail.com") {
            currentRole = "admin";
          } else {
            const teacherSnap = await getDocs(
              query(collection(db, "teachers"), where("email", "==", currentUser.email))
            );
            if (!teacherSnap.empty) {
              currentRole = "teacher";
            } else {
              const studentSnap = await getDocs(
                query(collection(db, "students"), where("email", "==", currentUser.email))
              );
              currentRole = !studentSnap.empty ? "student" : "student";
            }
          }
          // Cache the detected role
          await setDoc(userDocRef, {
            email: currentUser.email,
            role: currentRole,
            createdAt: new Date().toISOString(),
          });
        }

        // ─── ATOMIC UPDATE ───────────────────────────────────────────────
        // user + role + loading=false in ONE setState → ONE render → NO flash
        setAuthState({ user: currentUser, role: currentRole, loading: false });

      } catch (error) {
        console.error("Error fetching user role:", error);
        // Even on error, unblock the UI with a safe fallback
        setAuthState({ user: currentUser, role: "student", loading: false });
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (authState.loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F7F8FA]">
        <Image src="/logo.png" alt="logo" width={60} height={60} className="animate-pulse mb-4" />
        <h2 className="text-xl font-semibold text-gray-500">Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}
