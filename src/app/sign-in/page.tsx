"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const notRegistered = searchParams.get("error") === "not_registered";
  const [error, setError] = useState(
    notRegistered
      ? "Your Google account is not registered in this school system. Please contact your administrator."
      : ""
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Always go to /dashboard — AuthProvider detects the correct role (admin/teacher/student)
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Always go to /dashboard — AuthProvider detects the correct role (admin/teacher/student)
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="logo" width={50} height={50} className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 mt-2 text-center text-sm">Sign in to your SchoolDash account</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm text-center">{error}</div>}

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-all mb-6 disabled:opacity-50"
        >
          {/* Using a simple emoji or standard icon since we don't have a google.png guaranteed */}
          <span className="text-xl">G</span> 
          Sign in with Google
        </button>

        <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or sign in with email</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium uppercase">Email</label>
            <input 
              type="email" 
              className="p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-lamaSky" 
              placeholder="admin@schooldash.com"
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
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-lamaPurple text-white font-semibold py-3 px-4 rounded-lg hover:bg-lamaPurpleLight transition-all mt-2 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Don&apos;t have an account? <Link href="/sign-up" className="text-lamaSky font-semibold hover:underline">Request Access</Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
