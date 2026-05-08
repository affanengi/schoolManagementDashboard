"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import BigCalendar from "@/components/BigCalendar";
import Announcements from "@/components/Announcements";
import FormModal from "@/components/FormModal";
import Link from "next/link";

type Student = {
  id: string;
  studentId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  class: string;
  grade?: number;
  bloodType?: string;
  birthday?: string;
  sex?: string;
  parentName?: string;
};

type Result = {
  id: string;
  subject: string;
  score: number;
  student: string;
  class: string;
  teacher?: string;
};

type TeacherInfo = { name: string; subjects: string[] };
type AttendanceRecord = { id: string; status: "present" | "absent" | "late" };

const scoreGrade = (s: number) =>
  s >= 90 ? "A+" : s >= 80 ? "A" : s >= 70 ? "B" : s >= 60 ? "C" : s >= 50 ? "D" : "F";

const scoreColor = (s: number) =>
  s >= 90 ? "bg-green-500" : s >= 70 ? "bg-blue-500" : s >= 50 ? "bg-yellow-500" : "bg-red-500";

const scoreBadge = (s: number) =>
  s >= 90 ? "text-green-700 bg-green-50 border-green-200" :
  s >= 70 ? "text-blue-700 bg-blue-50 border-blue-200" :
  s >= 50 ? "text-yellow-700 bg-yellow-50 border-yellow-200" :
  "text-red-700 bg-red-50 border-red-200";

export default function SingleStudentPage() {
  const params = useParams();
  const router = useRouter();
  const { role, user, loading: authLoading } = useAuth();
  const id = params?.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Access guard — admin + teacher only
  useEffect(() => {
    if (!authLoading && role && role !== "admin" && role !== "teacher") {
      router.replace("/dashboard");
    }
  }, [role, authLoading, router]);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      try {
        // Student doc
        const studentDoc = await getDoc(doc(db, "students", id));
        if (!studentDoc.exists()) { router.replace("/list/students"); return; }
        const s = { id: studentDoc.id, ...studentDoc.data() } as Student;
        setStudent(s);

        // Results for this student
        const resultsSnap = await getDocs(
          query(collection(db, "results"), where("student", "==", s.name))
        );
        setResults(resultsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Result)));

        // Teachers who teach this student's class
        const teachersSnap = await getDocs(
          query(collection(db, "teachers"), where("classes", "array-contains", s.class))
        );
        setTeachers(teachersSnap.docs.map(d => ({
          name: d.data().name as string,
          subjects: d.data().subjects as string[],
        })));

        // Attendance for this student
        const attSnap = await getDocs(
          query(collection(db, "attendance"), where("studentName", "==", s.name))
        );
        setAttendance(attSnap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord)));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [id, router]);

  // ── Computed performance stats ──────────────────────────────
  const perfStats = useMemo(() => {
    if (!results.length) return null;
    // Average per subject
    const bySubject: Record<string, number[]> = {};
    results.forEach(r => {
      if (!bySubject[r.subject]) bySubject[r.subject] = [];
      bySubject[r.subject].push(r.score);
    });
    const subjectAvgs = Object.entries(bySubject).map(([subject, scores]) => ({
      subject,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    })).sort((a, b) => b.avg - a.avg);

    const overall = Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);
    return { overall, subjectAvgs, best: subjectAvgs[0], worst: subjectAvgs[subjectAvgs.length - 1] };
  }, [results]);

  // ── Shortcut URLs (context-aware) ──────────────────────────
  const shortcuts = useMemo(() => {
    if (!student) return [];
    const teacherName = role === "teacher" ? user?.displayName || "" : "";
    return [
      {
        label: "Student's Results",
        href: `/list/results?student=${encodeURIComponent(student.name)}`,
        color: "bg-pink-100 text-pink-700",
      },
      {
        label: "Student's Assignments",
        // Teacher viewing → show THEIR assignments for this class; admin → show all for this class
        href: role === "teacher" && teacherName
          ? `/list/assignments?teacher=${encodeURIComponent(teacherName)}&class=${encodeURIComponent(student.class)}`
          : `/list/assignments?class=${encodeURIComponent(student.class)}`,
        color: "bg-lamaYellowLight text-yellow-700",
      },
      {
        label: "Student's Exams",
        href: role === "teacher" && teacherName
          ? `/list/exams?teacher=${encodeURIComponent(teacherName)}&class=${encodeURIComponent(student.class)}`
          : `/list/exams?class=${encodeURIComponent(student.class)}`,
        color: "bg-lamaSkyLight text-lamaSky",
      },
    ];
  }, [student, role, user]);

  if (authLoading || loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-pulse text-gray-400 text-lg">Loading student profile...</div>
    </div>
  );

  if (!student) return null;

  const avatarColors = ["bg-lamaSky", "bg-lamaPurple", "bg-lamaYellow", "bg-pink-400", "bg-green-400"];
  const avatarColor = avatarColors[student.name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="flex-1 p-4 flex flex-col xl:flex-row gap-4">

      {/* ── LEFT COLUMN ── */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-lamaPurpleLight via-white to-lamaSkyLight rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">

            {/* Avatar */}
            <div className={`w-24 h-24 rounded-2xl ${avatarColor} flex items-center justify-center text-white text-4xl font-bold shadow-md flex-shrink-0`}>
              {student.name.charAt(0)}
            </div>

            {/* Name + badges + details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-800">{student.name}</h1>
                {role === "admin" && <FormModal table="student" type="update" data={student} />}
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-lamaPurple text-white text-xs px-3 py-1 rounded-full font-medium">
                  📚 {student.class}
                </span>
                {student.grade && (
                  <span className="bg-lamaYellow text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                    Grade {student.grade}
                  </span>
                )}
                {student.studentId && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                    ID: {student.studentId}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                {student.bloodType && <span>🩸 <strong>{student.bloodType}</strong></span>}
                {student.birthday  && <span>📅 {student.birthday}</span>}
                {student.email     && <span>✉️ {student.email}</span>}
                {student.phone     && <span>📞 {student.phone}</span>}
                {student.parentName && <span>👨‍👩‍👧 {student.parentName}</span>}
              </div>
            </div>

            {/* Overall score pill */}
            {perfStats && (
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-md ${
                  perfStats.overall >= 90 ? "bg-green-100" :
                  perfStats.overall >= 70 ? "bg-blue-100" :
                  perfStats.overall >= 50 ? "bg-yellow-100" : "bg-red-100"
                }`}>
                  <span className="text-2xl font-bold text-gray-800">{perfStats.overall}</span>
                  <span className="text-xs text-gray-500">Avg Score</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subject Performance */}
        {perfStats && perfStats.subjectAvgs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Subject Performance</h2>
              <div className="flex gap-3 text-xs text-gray-500">
                {perfStats.best && (
                  <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full font-medium">
                    💪 Best: {perfStats.best.subject}
                  </span>
                )}
                {perfStats.worst && perfStats.worst.subject !== perfStats.best?.subject && (
                  <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-full font-medium">
                    🔴 Weak: {perfStats.worst.subject}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {perfStats.subjectAvgs.map(({ subject, avg }) => (
                <div key={subject}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{subject}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${scoreBadge(avg)}`}>
                        {scoreGrade(avg)}
                      </span>
                      <span className="text-sm font-bold text-gray-800 w-8 text-right">{avg}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${scoreColor(avg)}`}
                      style={{ width: `${avg}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No results state */}
        {!perfStats && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm">No results recorded for this student yet.</p>
          </div>
        )}

        {/* Attendance Section */}
        {(() => {
          if (!attendance.length) return null;
          const total = attendance.length;
          const presentCount = attendance.filter(a => a.status === "present" || a.status === "late").length;
          const rate = Math.round((presentCount / total) * 100);
          const MIN = 75;
          const isGood = rate >= MIN;
          const isExcellent = rate >= 90;

          // How many more classes needed to reach 75%?
          // (MIN/100) = (presentCount + x) / (total + x) → solve for x
          const classesNeeded = isGood ? 0 : Math.ceil((MIN * total - 100 * presentCount) / (100 - MIN));

          const barColor   = isExcellent ? "bg-green-500" : isGood ? "bg-blue-500" : "bg-red-500";
          const bgColor    = isExcellent ? "bg-green-50 border-green-200" : isGood ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200";
          const textColor  = isExcellent ? "text-green-700" : isGood ? "text-blue-700" : "text-red-700";
          const rateColor  = isExcellent ? "text-green-600" : isGood ? "text-blue-600" : "text-red-600";
          const icon       = isExcellent ? "🟢" : isGood ? "🔵" : "🔴";
          const statusMsg  = isExcellent
            ? "Excellent attendance — keep it up!"
            : isGood
            ? "Good standing — above 75% minimum"
            : `⚠️ Warning: below required 75% minimum`;

          return (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800">Attendance</h2>
                <span className="text-xs text-gray-400">Jan – Apr 2026 · {total} school days</span>
              </div>

              {/* Rate + bar */}
              <div className="flex items-center gap-4 mb-3">
                <div className={`text-3xl font-black ${rateColor}`}>{rate}%</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-1 relative overflow-hidden">
                    {/* Min threshold marker */}
                    <div className="absolute top-0 h-full border-l-2 border-dashed border-orange-400 z-10" style={{ left: `${MIN}%` }} />
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span className="text-orange-500 font-medium">75% min</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-3 mb-3">
                <div className="bg-gray-50 rounded-xl px-4 py-2 text-center flex-1">
                  <p className="text-lg font-bold text-gray-800">{presentCount}</p>
                  <p className="text-xs text-gray-500">Present</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-2 text-center flex-1">
                  <p className="text-lg font-bold text-gray-800">{total - presentCount}</p>
                  <p className="text-xs text-gray-500">Absent</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-2 text-center flex-1">
                  <p className="text-lg font-bold text-gray-800">{total}</p>
                  <p className="text-xs text-gray-500">Total Days</p>
                </div>
              </div>

              {/* Status message */}
              <div className={`rounded-xl border px-4 py-3 ${bgColor}`}>
                <p className={`text-sm font-semibold ${textColor}`}>{icon} {statusMsg}</p>
                {!isGood && classesNeeded > 0 && (
                  <p className={`text-xs mt-1 ${textColor} opacity-80`}>
                    Must attend <strong>{classesNeeded}</strong> more consecutive classes to reach 75%.
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Class Schedule */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ minHeight: "900px" }}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Class Schedule</h2>
            <span className="text-xs text-gray-400 font-medium">{student.class}</span>
          </div>
          <div className="flex-1" style={{ minHeight: "860px" }}>
            <BigCalendar filterClass={student.class} />
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">

        {/* Quick stats */}
        {perfStats && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-800 mb-3">Performance Overview</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Avg Score", value: `${perfStats.overall}%`, color: "bg-lamaSkyLight" },
                { label: "Best Subject", value: perfStats.best?.subject || "—", color: "bg-green-50" },
                { label: "Needs Work", value: perfStats.worst?.subject !== perfStats.best?.subject ? perfStats.worst?.subject || "—" : "—", color: "bg-red-50" },
                { label: "Total Results", value: results.length, color: "bg-lamaPurpleLight" },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.color} rounded-xl p-3 text-center`}>
                  <p className="text-base font-bold text-gray-800 truncate">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shortcuts */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-800 mb-3">Shortcuts</h2>
          <div className="flex flex-wrap gap-2">
            {shortcuts.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className={`${s.color} rounded-full px-4 py-2 text-xs font-semibold hover:opacity-80 transition-opacity`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Student's Teachers */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-800 mb-3">Teachers</h2>
          {teachers.length === 0 ? (
            <p className="text-sm text-gray-400">No teachers assigned to {student.class} yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {teachers.map((t) => (
                <div key={t.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-lamaSkyLight flex items-center justify-center text-lamaSky font-bold text-sm flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.subjects?.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Details */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Student Details</h2>
          <div className="space-y-3 text-sm">
            {student.studentId && (
              <div className="flex items-center gap-3">
                <span className="text-base">🪪</span>
                <div><p className="text-xs text-gray-400">Student ID</p><p className="font-semibold">{student.studentId}</p></div>
              </div>
            )}
            {student.address && (
              <div className="flex items-center gap-3">
                <span className="text-base">📍</span>
                <div><p className="text-xs text-gray-400">Address</p><p className="font-semibold">{student.address}</p></div>
              </div>
            )}
            {student.sex && (
              <div className="flex items-center gap-3">
                <span className="text-base">👤</span>
                <div><p className="text-xs text-gray-400">Gender</p><p className="font-semibold">{student.sex}</p></div>
              </div>
            )}
            {student.grade && (
              <div className="flex items-center gap-3">
                <span className="text-base">🎓</span>
                <div><p className="text-xs text-gray-400">Grade</p><p className="font-semibold">{student.grade}</p></div>
              </div>
            )}
          </div>
        </div>

        <Announcements />
      </div>
    </div>
  );
}
