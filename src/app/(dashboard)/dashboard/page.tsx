"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This root page reads the authenticated user's role and redirects
// them to the appropriate role-specific dashboard.
const DashboardRouterPage = () => {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role) {
      switch (role) {
        case "admin":
          router.replace("/dashboard/admin");
          break;
        case "teacher":
          router.replace("/dashboard/teacher");
          break;
        case "student":
          router.replace("/dashboard/student");
          break;
        case "parent":
          router.replace("/dashboard/parent");
          break;
        default:
          router.replace("/dashboard/student");
      }
    }
  }, [role, loading, router]);

  return null; // AuthProvider shows a loading spinner while loading=true
};

export default DashboardRouterPage;
