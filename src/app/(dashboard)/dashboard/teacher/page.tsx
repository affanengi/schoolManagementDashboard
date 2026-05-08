"use client";

import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";
import BigCalendar from "@/components/BigCalendar";
import EventCalendar from "@/components/EventCalendar";
import Announcements from "@/components/Announcements";

type MyStudent = {
  id: string;
  name: string;
  class: string;
  grade: number;
};

const TeacherPage = () => {
  const { user } = useAuth();
  const [myStudents, setMyStudents] = useState<MyStudent[]>([]);
  const [teacherClass, setTeacherClass] = useState<string | undefined>(undefined);
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    const fetch = async () => {
      try {
        const teacherQ = query(collection(db, "teachers"), where("email", "==", user.email));
        const teacherSnap = await getDocs(teacherQ);
        if (!teacherSnap.empty) {
          const teacherData = teacherSnap.docs[0].data();
          const classes: string[] = teacherData.classes || [];
          const subjects: string[] = teacherData.subjects || [];
          if (classes.length > 0) setTeacherClass(classes[0]);
          setTeacherSubjects(subjects);
        }
        // Subject-teacher model: show ALL students
        const studentSnap = await getDocs(collection(db, "students"));
        setMyStudents(studentSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as MyStudent[]);
      } catch (err) {
        console.error("Teacher dash error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* ── LEFT COLUMN (2/3) ── */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">

        {/* My Students */}
        <div className="bg-white px-5 py-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-base text-gray-800">MY STUDENTS</h2>
              {teacherSubjects.length > 0 && (
                <p className="text-xs text-lamaSky font-medium mt-0.5">
                  Teaching: {teacherSubjects.join(" & ")}
                </p>
              )}
            </div>
            <Link href="/list/students" className="text-xs text-lamaSky hover:underline font-medium">View All</Link>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
          ) : myStudents.length === 0 ? (
            <p className="text-sm text-gray-500">No students found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {myStudents.sort((a, b) => a.name.localeCompare(b.name)).map((s) => (
                <div key={s.id}
                  className="bg-lamaSkyLight rounded-xl px-3 py-3 flex flex-col items-center gap-1 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-lamaSky">
                  <div className="w-10 h-10 rounded-full bg-lamaSky flex items-center justify-center text-white font-bold text-sm">
                    {s.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-sm text-gray-800 truncate w-full text-center">{s.name}</span>
                  <span className="text-[11px] text-gray-500">{s.class} · Gr.{s.grade}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Schedule — TALL calendar */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ minHeight: "900px" }}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
            <h1 className="text-lg font-bold text-gray-800">My Schedule</h1>
            <Link href="/list/lessons" className="text-xs text-lamaSky hover:underline font-medium">Manage Lessons</Link>
          </div>
          <div className="flex-1" style={{ minHeight: "860px" }}>
            <BigCalendar filterClass={teacherClass} />
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN (1/3) ── */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default TeacherPage;