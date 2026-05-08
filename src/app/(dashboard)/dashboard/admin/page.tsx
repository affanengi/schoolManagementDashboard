"use client";
import Announcements from "@/components/Announcements";
import AttendanceChart from "@/components/AttendanceChart";
import CountChart from "@/components/CountChart";
import EventCalendar from "@/components/EventCalendar";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import { useState } from "react";
import { resetAndSeedAllData, seedDemoLessons } from "@/lib/seedDemoData";

const AdminPage = () => {
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

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
      `✓ Done! Seeded ${result.teachers} teachers, ${result.students} students, ${result.parents} parents, ${result.subjects} subjects, ${result.classes} classes, ${result.lessons} lessons, ${result.exams} exams, ${result.assignments} assignments, ${result.results} results, ${result.events} events, ${result.announcements} announcements. Refresh the page.`
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
              disabled={seeding}
              className="bg-lamaYellow text-gray-800 px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60 hover:bg-yellow-300 transition-colors"
            >
              {seeding ? "Working..." : "📅 Seed Demo Lessons"}
            </button>
            <button
              onClick={handleResetAll}
              disabled={seeding}
              className="bg-red-100 text-red-700 border border-red-200 px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60 hover:bg-red-200 transition-colors"
            >
              {seeding ? "Working..." : "🔄 Reset & Seed All Data"}
            </button>
          </div>
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