"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, getDocs, query, collection, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Step = "credentials" | "role-select" | "pending";

const ROLE_CARDS = [
  {
    role: "teacher" as const,
    icon: "🎓",
    label: "Teacher",
    desc: "I teach classes and manage student assessments",
    grad: "from-sky-50 to-blue-100",
    border: "border-sky-200 hover:border-sky-400",
    iconBg: "bg-sky-100",
    glow: "hover:shadow-sky-100",
  },
  {
    role: "student" as const,
    icon: "📚",
    label: "Student",
    desc: "I attend classes and track my academic progress",
    grad: "from-purple-50 to-violet-100",
    border: "border-purple-200 hover:border-purple-400",
    iconBg: "bg-purple-100",
    glow: "hover:shadow-purple-100",
  },
  {
    role: "parent" as const,
    icon: "👨‍👩‍👧",
    label: "Parent",
    desc: "I monitor my child's learning and school activities",
    grad: "from-amber-50 to-yellow-100",
    border: "border-amber-200 hover:border-amber-400",
    iconBg: "bg-amber-100",
    glow: "hover:shadow-amber-100",
  },
];

export default function SignUpPage() {
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const router = useRouter();

  // ── Step 1: Email sign-up → creates Firebase Auth account, moves to role selector
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      setPendingUser(cred.user);
      setStep("role-select");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1 (Google): if doc exists → dashboard, else → role selector
  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const userDocRef = doc(db, "users", cred.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        router.push("/dashboard");
      } else {
        setEmail(cred.user.email || "");
        setPendingUser(cred.user);
        setStep("role-select");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign up with Google.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: User picks a role → write to Firestore
  const handleRoleSelect = async (role: "teacher" | "student" | "parent") => {
    if (!pendingUser) return;
    setAssigning(true);
    setError("");
    try {
      if (role === "parent") {
        const snap = await getDocs(
          query(collection(db, "parents"), where("email", "==", pendingUser.email))
        );
        const resolvedRole = snap.empty ? "parent_pending" : "parent";
        await setDoc(doc(db, "users", pendingUser.uid), {
          email: pendingUser.email,
          role: resolvedRole,
          createdAt: new Date().toISOString(),
        });
        if (snap.empty) {
          setStep("pending");
          return;
        }
      } else {
        await setDoc(doc(db, "users", pendingUser.uid), {
          email: pendingUser.email,
          role,
          createdAt: new Date().toISOString(),
        });
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError("Failed to save your role. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 2: Role Selector Screen
  // ─────────────────────────────────────────────────────────────
  if (step === "role-select") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EFF4FF] via-[#F7F8FA] to-[#FFF8EC] p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lamaSky to-lamaPurple flex items-center justify-center mb-4 shadow-lg shadow-purple-100">
              <span className="text-3xl">🏫</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">How do you use SchoolDash?</h1>
            <p className="text-gray-400 text-sm mt-2 text-center">
              Choose your role so we can set up the right dashboard for you.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm text-center">{error}</div>
          )}

          {/* Role Cards */}
          <div className="flex flex-col gap-3">
            {ROLE_CARDS.map((card) => (
              <button
                key={card.role}
                onClick={() => handleRoleSelect(card.role)}
                disabled={assigning}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 bg-gradient-to-r ${card.grad} ${card.border} ${card.glow} transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-wait group text-left`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0 text-2xl shadow-sm group-hover:scale-110 transition-transform duration-200`}
                >
                  {card.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-base">{card.label}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{card.desc}</div>
                </div>
                <span className="text-gray-300 group-hover:text-gray-500 transition-colors text-lg">›</span>
              </button>
            ))}
          </div>

          {assigning && (
            <p className="text-center text-sm text-gray-400 mt-5 animate-pulse">
              Setting up your account...
            </p>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 3: Parent Pending Screen
  // ─────────────────────────────────────────────────────────────
  if (step === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8EC] to-[#F7F8FA] p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 text-3xl shadow-md shadow-amber-100">
            ⏳
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Account Pending</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-5">
            Your account was created, but your email isn&apos;t linked to any student record yet.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-amber-800 text-xs font-semibold mb-1">📋 Contact your school admin and say:</p>
            <p className="text-amber-700 text-xs">
              &quot;Please link <strong>{pendingUser?.email}</strong> to my child&apos;s parent record in SchoolDash.&quot;
            </p>
          </div>
          <Link
            href="/sign-in"
            className="w-full inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-all text-sm shadow-md shadow-amber-100"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 1: Credentials Form
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo.png" alt="logo" width={50} height={50} className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-400 mt-2 text-center text-sm">
            Join SchoolDash — you&apos;ll pick your role in the next step.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm text-center">{error}</div>
        )}

        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all mb-6 disabled:opacity-50"
        >
          <span className="text-xl font-bold text-blue-500">G</span>
          Continue with Google
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-gray-200" />
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR REGISTER WITH EMAIL</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Email</label>
            <input
              type="email"
              className="p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lamaSky text-sm"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Password</label>
            <input
              type="password"
              className="p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-lamaSky text-sm"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-lamaSky to-lamaPurple text-white font-semibold py-3 px-4 rounded-xl hover:opacity-90 transition-all mt-2 disabled:opacity-50 shadow-md shadow-purple-100"
          >
            {loading ? "Creating Account..." : "Continue →"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-lamaPurple font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
