"use client";
import Announcements from "@/components/Announcements";
import AttendanceChart from "@/components/AttendanceChart";
import CountChart from "@/components/CountChart";
import EventCalendar from "@/components/EventCalendar";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import { useState } from "react";
import { resetAndSeedAllData, seedDemoLessons } from "@/lib/seedDemoData";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";

const AdminPage = () => {
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [repairing, setRepairing] = useState(false);
  const [repairMsg, setRepairMsg] = useState("");

  const handleRepairRoles = async () => {
    const confirmed = window.confirm(
      "🔧 This will scan all user accounts and fix any that have the wrong role.\n\nFor example, teacher accounts that were incorrectly saved as 'student' will be corrected.\n\nContinue?"
    );
    if (!confirmed) return;
    setRepairing(true);
    setRepairMsg("");
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      let fixedTeachers = 0;
      let fixedParents = 0;

      for (const userDoc of usersSnap.docs) {
        const data = userDoc.data();
        // Only re-check docs that are currently "student" — might be wrong
        if (data.role === "student" && data.email) {
          // Check teachers collection
          const teacherSnap = await getDocs(
            query(collection(db, "teachers"), where("email", "==", data.email))
          );
          if (!teacherSnap.empty) {
            await updateDoc(doc(db, "users", userDoc.id), { role: "teacher" });
            fixedTeachers++;
            continue;
          }
          // Check parents collection
          const parentSnap = await getDocs(
            query(collection(db, "parents"), where("email", "==", data.email))
          );
          if (!parentSnap.empty) {
            await updateDoc(doc(db, "users", userDoc.id), { role: "parent" });
            fixedParents++;
          }
        }
      }

      const parts = [];
      if (fixedTeachers > 0) parts.push(`${fixedTeachers} teacher account${fixedTeachers > 1 ? "s" : ""}`);
      if (fixedParents > 0) parts.push(`${fixedParents} parent account${fixedParents > 1 ? "s" : ""}`);
      setRepairMsg(
        parts.length > 0
          ? `✓ Fixed: ${parts.join(", ")}. Affected users must log out and back in.`
          : "✓ All roles are already correct — nothing to fix!"
      );
    } catch (err) {
      console.error(err);
      setRepairMsg("❌ Error occurred. Check console for details.");
    } finally {
      setRepairing(false);
      setTimeout(() => setRepairMsg(""), 10000);
    }
  };

  const handleSeedLessons = async () => {
    setSeeding(true);
    setSeedMsg("");
    await seedDemoLessons();
    setSeedMsg("✓ Lessons seeded! Refresh /list/lessons to see them.");
    setSeeding(false);
    setTimeout(() => setSeedMsg(""), 6000);
  };

  const handleResetAll = async () => {
    const confirmed = window.confirm(
      "⚠️ This will DELETE all existing teachers, students, parents and lessons, then replace them with demo data.\n\nContinue?"
    );
    if (!confirmed) return;
    setSeeding(true);
    setSeedMsg("");
    const result = await resetAndSeedAllData();
    setSeedMsg(
      `✓ Done! Seeded ${result.teachers} teachers, ${result.students} students, ${result.parents} parents, ${result.subjects} subjects, ${result.classes} classes, ${result.lessons} lessons, ${result.exams} exams, ${result.assignments} assignments, ${result.results} results, ${result.events} events, ${result.announcements} announcements, ${result.attendance} attendance records. Refresh the page.`
    );
    setSeeding(false);
    setTimeout(() => setSeedMsg(""), 8000);
  };

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT COLUMN */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        {/* Stats Cards */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="Students" />
          <UserCard type="Teachers" />
          <UserCard type="Parents" />
          <UserCard type="Staff" />
        </div>

        {/* Admin Tool Banner */}
        <div className="bg-lamaYellowLight border border-yellow-200 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛠️</span>
            <span className="font-semibold text-yellow-900 text-sm">Admin Data Tools</span>
          </div>
          <p className="text-xs text-yellow-700">
            Use these one-time tools to populate or reset the database. They only need to be run
            once. After seeding, data can be managed through the list pages.
          </p>
          <div className="flex flex-wrap gap-3 mt-1">
            <button
              onClick={handleSeedLessons}
              disabled={seeding || repairing}
              className="bg-lamaYellow text-gray-800 px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60 hover:bg-yellow-300 transition-colors"
            >
              {seeding ? "Working..." : "📅 Seed Demo Lessons"}
            </button>
            <button
              onClick={handleResetAll}
              disabled={seeding || repairing}
              className="bg-red-100 text-red-700 border border-red-200 px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60 hover:bg-red-200 transition-colors"
            >
              {seeding ? "Working..." : "🔄 Reset & Seed All Data"}
            </button>
            <button
              onClick={handleRepairRoles}
              disabled={seeding || repairing}
              className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60 hover:bg-blue-100 transition-colors"
            >
              {repairing ? "Repairing..." : "🔧 Repair All Roles"}
            </button>
          </div>
          {repairMsg && (
            <p className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg mt-1">
              {repairMsg}
            </p>
          )}
          {seedMsg && (
            <p className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg mt-1">
              {seedMsg}
            </p>
          )}
        </div>

        {/* Count + Attendance */}
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="w-full lg:w-1/3">
            <CountChart />
          </div>
          <div className="w-full lg:w-2/3">
            <AttendanceChart />
          </div>
        </div>

        {/* Finance */}
        <div className="w-full">
          <FinanceChart />
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default AdminPage;