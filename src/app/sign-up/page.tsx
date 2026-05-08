"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, getDocs, query, collection, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Detect role by checking Firestore collections — same logic as AuthProvider
async function detectRole(email: string): Promise<string> {
  if (email === "mohammedaffanrazvi604@gmail.com") return "admin";
  const teacherSnap = await getDocs(query(collection(db, "teachers"), where("email", "==", email)));
  if (!teacherSnap.empty) return "teacher";
  const studentSnap = await getDocs(query(collection(db, "students"), where("email", "==", email)));
  if (!studentSnap.empty) return "student";
  return "student"; // default
}

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Detect actual role from Firestore — never default blindly to "student"
      const role = await detectRole(email);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        role,
        createdAt: new Date().toISOString(),
      });
      // Always go to /dashboard — AuthProvider handles role-based routing
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign up.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const userEmail = userCredential.user.email || "";

      // Only write a new doc if one doesn't exist already
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        const role = await detectRole(userEmail);
        await setDoc(userDocRef, {
          email: userEmail,
          role,
          createdAt: new Date().toISOString(),
        });
      }
      // Always go to /dashboard — AuthProvider handles role-based routing
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign up with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo.png" alt="logo" width={50} height={50} className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 mt-2 text-center text-sm leading-relaxed">
            Join SchoolDash — your role will be detected automatically.
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm text-center">{error}</div>}

        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-all mb-6 disabled:opacity-50"
        >
          <span className="text-xl">G</span>
          Sign up with Google
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or register with email</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium uppercase">Email</label>
            <input
              type="email"
              className="p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-lamaSky"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium uppercase">Password</label>
            <input
              type="password"
              className="p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-lamaSky"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lamaSky text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-all mt-2 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-lamaPurple font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
