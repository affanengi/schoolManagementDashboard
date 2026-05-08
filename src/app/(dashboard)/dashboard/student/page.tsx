"use client";

import { useAuth } from "@/components/AuthProvider";
import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalendar";
import EventCalendar from "@/components/EventCalendar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

type MyResult = {
  id: string;
  subject: string;
  score: number;
  grade: string;
};

const StudentPage = () => {
  const { user } = useAuth();
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [myResults, setMyResults] = useState<MyResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyData = async () => {
      if (!user?.email) return;
      try {
        // Find student record linked to this user's email
        const studentQ = query(
          collection(db, "students"),
          where("email", "==", user.email)
        );
        const studentSnap = await getDocs(studentQ);

        if (!studentSnap.empty) {
          const sData = { id: studentSnap.docs[0].id, ...studentSnap.docs[0].data() };
          setStudentInfo(sData);

          // Fetch results for this student
          const resultsQ = query(
            collection(db, "results"),
            where("studentId", "==", (sData as any).studentId)
          );
          const resultsSnap = await getDocs(resultsQ);
          const results = resultsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as MyResult[];
          setMyResults(results);
        }
      } catch (err) {
        console.error("Error loading student data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyData();
  }, [user]);

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        {/* My Info Card */}
        {studentInfo && (
          <div className="bg-white p-4 rounded-md flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-lamaSkyLight flex items-center justify-center text-2xl font-bold text-lamaSky">
              {studentInfo.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-lg">{studentInfo.name}</h2>
              <p className="text-sm text-gray-500">
                Class: <span className="font-medium">{studentInfo.class}</span> · Grade:{" "}
                <span className="font-medium">{studentInfo.grade}</span>
              </p>
              <p className="text-xs text-gray-400">ID: {studentInfo.studentId}</p>
            </div>
          </div>
        )}

        {/* My Results */}
        <div className="bg-white p-4 rounded-md">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base">My Results</h2>
            <Link href="/list/results" className="text-xs text-lamaSky hover:underline">
              View All
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
          ) : myResults.length === 0 ? (
            <p className="text-sm text-gray-500">No results recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {myResults.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm font-medium">{r.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{r.score}%</span>
                    <span className="text-xs bg-lamaSkyLight text-lamaSky px-2 py-0.5 rounded-full">
                      {r.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex-1">
          <h1 className="text-xl font-semibold mb-4">My Schedule</h1>
          <div style={{ height: "680px" }}>
            <BigCalendar filterClass={studentInfo?.class} />
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;