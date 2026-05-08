"use client";

import { useAuth } from "@/components/AuthProvider";
import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalendar";
import EventCalendar from "@/components/EventCalendar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

type ChildInfo = {
  id: string;
  name: string;
  class: string;
  grade: number;
  studentId: string;
};

const ParentPage = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!user?.email) return;
      try {
        const parentQ = query(collection(db, "parents"), where("email", "==", user.email));
        const parentSnap = await getDocs(parentQ);
        if (parentSnap.empty) { setLoading(false); return; }

        const parentData = parentSnap.docs[0].data();
        // parents.students stores child names — match by name in students collection
        const childNames: string[] = parentData.students || [];
        if (childNames.length === 0) { setLoading(false); return; }

        const childrenQ = query(collection(db, "students"), where("name", "in", childNames.slice(0, 10)));
        const childrenSnap = await getDocs(childrenQ);
        setChildren(childrenSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as ChildInfo[]);
      } catch (err) {
        console.error("Parent dash error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, [user]);

  // Use the first child's class for the schedule
  const firstChildClass = children[0]?.class;

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* ── LEFT (2/3): Children + Schedule ── */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">

        {/* My Children */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base">My Children</h2>
            <Link href="/list/students" className="text-xs text-lamaSky hover:underline">
              View All Students
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
          ) : children.length === 0 ? (
            <p className="text-sm text-gray-500">
              No children linked. Ask an admin to create a Parent record with your email.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="bg-lamaPurpleLight rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl font-bold text-lamaPurple shrink-0">
                    {child.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{child.name}</h3>
                    <p className="text-xs text-gray-500">Class {child.class} · Grade {child.grade}</p>
                    <p className="text-xs text-gray-400">ID: {child.studentId}</p>
                  </div>
                  <Link
                    href={`/list/students/${child.id}`}
                    className="text-xs bg-white px-3 py-1 rounded-full text-lamaPurple hover:bg-lamaPurple hover:text-white transition-colors shrink-0"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Child's Schedule */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">
              {firstChildClass ? `${firstChildClass} Schedule` : "School Schedule"}
            </h1>
            {firstChildClass && (
              <span className="text-xs bg-lamaPurpleLight text-lamaPurple px-2 py-1 rounded-full">
                Class {firstChildClass}
              </span>
            )}
          </div>
          <div style={{ height: "680px" }}>
            <BigCalendar filterClass={firstChildClass} />
          </div>
        </div>
      </div>

      {/* ── RIGHT (1/3): EventCalendar + Announcements ── */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;