"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
      // Create user document in Firestore
      const role = email === "mohammedaffanrazvi604@gmail.com" ? "admin" : "student";
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        role: role,
        createdAt: new Date().toISOString()
      });
      
      alert(role === "admin" ? "Admin account created!" : "Account created! Please wait for an Admin to assign your specific role.");
      router.push("/sign-in"); 
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
      
      // Check if user document already exists, if not create it
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let role = "student";
      if (!userDoc.exists()) {
        role = userCredential.user.email === "mohammedaffanrazvi604@gmail.com" ? "admin" : "student";
        await setDoc(userDocRef, {
          email: userCredential.user.email,
          role: role,
          createdAt: new Date().toISOString()
        });
      }

      alert("Account linked with Google! Please sign in.");
      router.push("/sign-in");
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
          <h1 className="text-3xl font-bold text-gray-800">Request Access</h1>
          <p className="text-gray-500 mt-2 text-center text-sm leading-relaxed">
            Create an account to join SchoolDash. <br/> 
            <span className="text-xs text-lamaPurple font-medium">Note: An Admin must approve your account before you can view the dashboard.</span>
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
              placeholder="parent@example.com"
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
            className="w-full bg-lamaSky text-white font-semibold py-3 px-4 rounded-lg hover:bg-lamaSkyLight transition-all mt-2 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Already have an account? <Link href="/sign-in" className="text-lamaPurple font-semibold hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
