"use client";

import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────────────────────
// Role-specific info panels
// ─────────────────────────────────────────────────────────────────────────────

const AdminPanel = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 h-full border-t-4 border-t-lamaSky">
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-lamaSkyLight p-2 rounded-full text-lamaSky text-xl">🛡️</div>
      <h2 className="text-lg font-semibold text-gray-800">Administrator Privileges</h2>
    </div>
    <p className="text-gray-600 text-sm mb-4">
      As an administrator, you have full access to the SchoolDash platform.
    </p>
    <ul className="space-y-2 text-sm text-gray-600">
      {[
        "Create, edit, and delete user accounts (Teachers, Students, Parents)",
        "Manage system-wide configuration, subjects, and classes",
        "Post global announcements and events",
        "View all dashboards and override permissions",
        "Access analytics, attendance, and financial data",
      ].map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="text-green-500 mt-0.5">✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const TeacherPanel = ({ email }: { email: string }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    getDocs(query(collection(db, "teachers"), where("email", "==", email)))
      .then((snap) => {
        if (!snap.empty) setProfile(snap.docs[0].data());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [email]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full border-t-4 border-t-lamaPurple">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-lamaPurpleLight p-2 rounded-full text-2xl">👩‍🏫</div>
        <h2 className="text-lg font-semibold text-gray-800">Teacher Profile</h2>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-gray-100 rounded w-3/4" />
          ))}
        </div>
      ) : profile ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
          {[
            { label: "Teacher ID", value: profile.teacherId },
            { label: "Phone", value: profile.phone },
            { label: "Address", value: profile.address },
            { label: "Emergency Contact", value: profile.emergencyContact },
            { label: "Blood Type", value: profile.bloodType || "—" },
            {
              label: "Subjects",
              value: Array.isArray(profile.subjects)
                ? profile.subjects.join(", ")
                : profile.subjects || "—",
            },
            {
              label: "Classes",
              value: Array.isArray(profile.classes)
                ? profile.classes.join(", ")
                : profile.classes || "—",
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {label}
              </span>
              <span className="font-medium text-gray-700">{value || "—"}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 bg-lamaYellowLight p-3 rounded-lg">
          <p className="font-medium mb-1">⚠️ Teacher profile not linked yet</p>
          <p>
            Ask your admin to create a Teacher record with your email address (
            <span className="font-mono text-xs">{email}</span>) so your profile data appears here.
          </p>
        </div>
      )}
    </div>
  );
};

const StudentPanel = ({ email }: { email: string }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    getDocs(query(collection(db, "students"), where("email", "==", email)))
      .then((snap) => {
        if (!snap.empty) setProfile(snap.docs[0].data());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [email]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full border-t-4 border-t-lamaYellow">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-lamaYellowLight p-2 rounded-full text-2xl">👨‍🎓</div>
        <h2 className="text-lg font-semibold text-gray-800">Student Profile</h2>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-gray-100 rounded w-3/4" />
          ))}
        </div>
      ) : profile ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
          {[
            { label: "Student ID", value: profile.studentId },
            { label: "Grade", value: profile.grade },
            { label: "Class", value: profile.class },
            { label: "Phone", value: profile.phone },
            { label: "Address", value: profile.address },
            { label: "Blood Type", value: profile.bloodType || "—" },
            { label: "Emergency Contact", value: profile.emergencyContact },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {label}
              </span>
              <span className="font-medium text-gray-700">{value || "—"}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 bg-lamaYellowLight p-3 rounded-lg">
          <p className="font-medium mb-1">⚠️ Student profile not linked yet</p>
          <p>
            Ask your admin to create a Student record with your email address (
            <span className="font-mono text-xs">{email}</span>) so your profile data appears here.
          </p>
        </div>
      )}
    </div>
  );
};

const ParentPanel = ({ email }: { email: string }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    getDocs(query(collection(db, "parents"), where("email", "==", email)))
      .then((snap) => {
        if (!snap.empty) setProfile(snap.docs[0].data());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [email]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full border-t-4 border-t-lamaSky">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-lamaSkyLight p-2 rounded-full text-2xl">👪</div>
        <h2 className="text-lg font-semibold text-gray-800">Parent Profile</h2>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-100 rounded w-3/4" />
          ))}
        </div>
      ) : profile ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
          {[
            { label: "Phone", value: profile.phone },
            { label: "Address", value: profile.address },
            {
              label: "Children",
              value: Array.isArray(profile.students)
                ? profile.students.join(", ")
                : profile.students || "—",
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {label}
              </span>
              <span className="font-medium text-gray-700">{value || "—"}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 bg-lamaSkyLight p-3 rounded-lg">
          <p className="font-medium mb-1">⚠️ Parent profile not linked yet</p>
          <p>
            Ask your admin to create a Parent record with your email address (
            <span className="font-mono text-xs">{email}</span>) so your profile data appears here.
          </p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Profile Page
// ─────────────────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-10 flex-1 flex justify-center items-center text-gray-400 animate-pulse">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return <div className="p-10 flex-1">Please sign in to view your profile.</div>;
  }

  const displayName =
    user.displayName || (user.email ? user.email.split("@")[0] : "User");
  const displayRole = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "User";

  const roleColors: Record<string, string> = {
    admin: "bg-lamaSkyLight text-lamaSky",
    teacher: "bg-lamaPurpleLight text-lamaPurple",
    student: "bg-lamaYellowLight text-yellow-700",
    parent: "bg-pink-50 text-pink-600",
  };
  const badgeColor = roleColors[role || ""] || "bg-gray-100 text-gray-500";

  const RolePanel = () => {
    if (role === "admin") return <AdminPanel />;
    if (role === "teacher") return <TeacherPanel email={user.email || ""} />;
    if (role === "student") return <StudentPanel email={user.email || ""} />;
    if (role === "parent") return <ParentPanel email={user.email || ""} />;
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-center text-gray-400">
        <p>Role not assigned yet. Contact your administrator.</p>
      </div>
    );
  };

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-6">
        <div className="relative">
          <Image
            src={user.photoURL || "/avatar.png"}
            alt="Profile"
            width={90}
            height={90}
            className="rounded-full w-20 h-20 object-cover ring-4 ring-lamaSkyLight"
          />
          <span className="absolute bottom-0 right-0 bg-green-400 w-4 h-4 rounded-full border-2 border-white" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800">{displayName}</h1>
          <span className="text-sm text-gray-500">{user.email}</span>
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">
              Active
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeColor}`}>
              {displayRole}
            </span>
          </div>
        </div>
      </div>

      {/* DETAIL CARDS */}
      <div className="flex gap-4 flex-col md:flex-row">
        {/* Account Info */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Account Information</h2>
            <div className="flex flex-col gap-3 text-sm text-gray-600">
              {[
                { label: "User ID", value: user.uid.slice(0, 16) + "..." },
                { label: "Email Verified", value: user.emailVerified ? "✓ Yes" : "✗ No" },
                {
                  label: "Member Since",
                  value: user.metadata.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A",
                },
                { label: "Role", value: displayRole },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="font-medium text-gray-500">{label}</span>
                  <span className="text-gray-700 text-right max-w-[60%] truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Role-Specific Panel */}
        <div className="w-full md:w-2/3">
          <RolePanel />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
