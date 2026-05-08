"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import BigCalendar from "@/components/BigCalendar";
import Announcements from "@/components/Announcements";
import FormModal from "@/components/FormModal";
import Link from "next/link";

type Teacher = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  subjects: string[];
  classes: string[];
  teacherId: string;
  bloodType?: string;
  birthday?: string;
  sex?: string;
  photo?: string;
};

export default function SingleTeacherPage() {
  const params = useParams();
  const router = useRouter();
  const { role } = useAuth();
  const id = params?.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [lessonCount, setLessonCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Admin + Teacher + Parent can view; everyone else gets redirected
  useEffect(() => {
    if (!loading && role && role !== "admin" && role !== "teacher" && role !== "parent") {
      router.replace("/dashboard");
    }
  }, [role, loading, router]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const teacherDoc = await getDoc(doc(db, "teachers", id));
        if (!teacherDoc.exists()) { notFound(); return; }
        const data = { id: teacherDoc.id, ...teacherDoc.data() } as Teacher;
        setTeacher(data);
        const lessonsSnap = await getDocs(
          query(collection(db, "lessons"), where("teacher", "==", data.name))
        );
        setLessonCount(lessonsSnap.size);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-pulse text-gray-400 text-lg">Loading teacher profile...</div>
    </div>
  );

  if (!teacher) return null;

  const stats = [
    { label: "Subjects", value: teacher.subjects?.length || 0, color: "bg-lamaSkyLight" },
    { label: "Lessons",  value: lessonCount,                   color: "bg-lamaPurpleLight" },
    { label: "Classes",  value: teacher.classes?.length || 0,  color: "bg-lamaYellowLight" },
  ];

  const shortcuts = [
    { label: "Teacher's Lessons",     href: `/list/lessons?search=${teacher.name}`,     color: "bg-lamaSkyLight text-lamaSky" },
    { label: "Teacher's Exams",       href: `/list/exams?search=${teacher.name}`,       color: "bg-lamaPurpleLight text-purple-600" },
    { label: "Teacher's Assignments", href: `/list/assignments?search=${teacher.name}`, color: "bg-lamaYellowLight text-yellow-700" },
    { label: "Teacher's Results",     href: `/list/results?teacher=${teacher.name}`,    color: "bg-pink-100 text-pink-600" },
  ];

  return (
    <div className="flex-1 p-4 flex flex-col xl:flex-row gap-4">

      {/* ── LEFT COLUMN ── */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-lamaSkyLight via-white to-lamaPurpleLight rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-lamaSky flex items-center justify-center text-white text-4xl font-bold shadow-md flex-shrink-0">
              {teacher.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-800">{teacher.name}</h1>
                {/* FormModal own button IS the trigger — one click opens the form directly */}
                {role === "admin" && <FormModal table="teacher" type="update" data={teacher} />}
              </div>
              <p className="text-gray-500 text-sm mt-1">Subject Specialist Teacher</p>

              <div className="flex flex-wrap gap-2 mt-3">
                {teacher.subjects?.map((s) => (
                  <span key={s} className="bg-lamaSky text-white text-xs px-3 py-1 rounded-full font-medium">{s}</span>
                ))}
                {teacher.classes?.map((c) => (
                  <span key={c} className="bg-lamaYellow text-gray-700 text-xs px-3 py-1 rounded-full font-medium">{c}</span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                {teacher.bloodType && <span>🩸 <strong>{teacher.bloodType}</strong></span>}
                {teacher.birthday  && <span>📅 {teacher.birthday}</span>}
                {teacher.email     && <span>✉️ {teacher.email}</span>}
                {teacher.phone     && <span>📞 {teacher.phone}</span>}
              </div>
            </div>

            {/* Stats mini row */}
            <div className="flex gap-3 flex-shrink-0">
              {stats.map((s) => (
                <div key={s.label} className={`${s.color} rounded-xl px-4 py-3 text-center min-w-[72px]`}>
                  <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ minHeight: "900px" }}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-800">Teacher&apos;s Schedule</h2>
            <Link href={`/list/lessons?search=${teacher.name}`} className="text-xs text-lamaSky hover:underline font-medium">
              View Lessons
            </Link>
          </div>
          <div className="flex-1" style={{ minHeight: "860px" }}>
            <BigCalendar filterTeacher={teacher.name} />
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">

        {/* Shortcuts */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-800 mb-3">Shortcuts</h2>
          <div className="flex flex-wrap gap-2">
            {shortcuts.map((s) => (
              <Link key={s.label} href={s.href}
                className={`${s.color} rounded-full px-4 py-2 text-xs font-semibold hover:opacity-80 transition-opacity`}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Teacher Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-base">🪪</span>
              <div><p className="text-xs text-gray-400">Teacher ID</p><p className="font-semibold">{teacher.teacherId}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base">📍</span>
              <div><p className="text-xs text-gray-400">Address</p><p className="font-semibold">{teacher.address || "—"}</p></div>
            </div>
            {teacher.sex && (
              <div className="flex items-center gap-3">
                <span className="text-base">👤</span>
                <div><p className="text-xs text-gray-400">Gender</p><p className="font-semibold">{teacher.sex}</p></div>
              </div>
            )}
          </div>
        </div>

        <Announcements />
      </div>
    </div>
  );
}
