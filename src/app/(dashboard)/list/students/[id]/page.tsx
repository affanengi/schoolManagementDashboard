"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

// Phase 4 will replace this placeholder with the full student profile UI.
// Phase 3 adds the access guard so teachers can reach this page from their dashboard.
const SingleStudentPage = () => {
  const params = useParams();
  const router = useRouter();
  const { role, loading } = useAuth();

  // Admin + Teacher can view; everyone else gets redirected
  useEffect(() => {
    if (!loading && role && role !== "admin" && role !== "teacher") {
      router.replace("/dashboard");
    }
  }, [role, loading, router]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-pulse text-gray-400 text-lg">Loading...</div>
    </div>
  );

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Student Details ({params?.id})</h1>
      <p className="text-gray-500 mt-4">
        Full profile coming in Phase 4 — schedule, performance bars, teachers list and shortcuts.
      </p>
    </div>
  );
};

export default SingleStudentPage;
