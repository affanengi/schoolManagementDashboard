"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormModal from "@/components/FormModal";
import Image from "next/image";

type Result = {
  id: string;
  subject: string;
  student: string;
  studentId: string;
  class: string;
  teacher?: string;
  score: number;
  grade?: string;
};

const columns = [
  { header: "Subject", accessor: "subject" },
  { header: "Student", accessor: "student" },
  { header: "Score", accessor: "score" },
  { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
  { header: "Class", accessor: "class", className: "hidden md:table-cell" },
  { header: "Teacher", accessor: "teacher", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "action" },
];

const ITEM_PER_PAGE = 10;

const ResultList = () => {
  const { role, user } = useAuth();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const searchParam = searchParams.get("search") || "";
  const teacherParam = searchParams.get("teacher") || ""; // from teacher detail shortcut
  const studentParam = searchParams.get("student") || ""; // from student detail shortcut
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [allData, setAllData] = useState<Result[]>([]);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
  const [parentChildNames, setParentChildNames] = useState<string[] | null>(null); // null = not parent
  const [loading, setLoading] = useState(true);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (role === "teacher" && user?.email) {
          const teacherQ = query(collection(db, "teachers"), where("email", "==", user.email));
          const snap = await getDocs(teacherQ);
          if (!snap.empty) {
            const data = snap.docs[0].data();
            setTeacherName(data.name || null);
            setTeacherSubjects(data.subjects || []);
          }
        }
        if (role === "parent" && user?.email) {
          const pSnap = await getDocs(query(collection(db, "parents"), where("email", "==", user.email)));
          if (!pSnap.empty) {
            const names: string[] = pSnap.docs[0].data().students || [];
            setParentChildNames(names);
          } else {
            setParentChildNames([]);
          }
        }
        const snap = await getDocs(collection(db, "results"));
        setAllData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Result)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [role, user]);

  // Available subjects for filter dropdown
  const availableSubjects = useMemo(() => {
    if (role === "teacher") return teacherSubjects;
    // Admin: derive from data
    return Array.from(new Set(allData.map((r) => r.subject))).sort();
  }, [role, teacherSubjects, allData]);

  const { displayed, total } = useMemo(() => {
    let filtered = allData;

    // Exact teacher filter — from teacher detail shortcut (?teacher=Name)
    if (teacherParam) {
      filtered = filtered.filter((r) => r.teacher === teacherParam);
    }
    // Exact student filter — from student detail shortcut (?student=Name)
    else if (studentParam) {
      filtered = filtered.filter((r) => r.student === studentParam);
    }
    // Teacher role: always filter to their own results only
    else if (role === "teacher" && teacherName) {
      filtered = filtered.filter((r) => r.teacher === teacherName);
    }
    // Parent role: only their child's results
    else if (role === "parent" && parentChildNames !== null) {
      filtered = filtered.filter((r) => parentChildNames.some(n => n.toLowerCase() === r.student.toLowerCase()));
    }

    // Subject dropdown filter
    if (subjectFilter !== "all") {
      if (role === "teacher" && !teacherSubjects.includes(subjectFilter)) {
        filtered = [];
      } else {
        filtered = filtered.filter((r) => r.subject === subjectFilter);
      }
    }

    // Search filter — includes teacher field
    filtered = filtered.filter((r) =>
      !searchParam ||
      r.student.toLowerCase().includes(searchParam.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchParam.toLowerCase()) ||
      r.class.toLowerCase().includes(searchParam.toLowerCase()) ||
      r.teacher?.toLowerCase().includes(searchParam.toLowerCase())
    );

    filtered = [...filtered].sort((a, b) =>
      sortOrder === "asc" ? a.score - b.score : b.score - a.score
    );

    return {
      displayed: filtered.slice((page - 1) * ITEM_PER_PAGE, page * ITEM_PER_PAGE),
      total: filtered.length,
    };
  }, [allData, searchParam, teacherParam, studentParam, page, sortOrder, role, teacherName, teacherSubjects, subjectFilter, parentChildNames]);

  const scoreColor = (score: number) =>
    score >= 90 ? "text-green-600" : score >= 70 ? "text-blue-600" : score >= 50 ? "text-yellow-600" : "text-red-500";

  const renderRow = (item: Result) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4 font-semibold">{item.subject}</td>
      <td className="p-4">{item.student}</td>
      <td className={`p-4 font-semibold ${scoreColor(item.score)}`}>{item.score}%</td>
      <td className="hidden md:table-cell p-4">
        <span className="bg-lamaSkyLight px-2 py-1 rounded-full text-xs font-medium">{item.grade || "—"}</span>
      </td>
      <td className="hidden md:table-cell p-4">{item.class}</td>
      <td className="hidden lg:table-cell p-4 text-gray-500">{item.teacher || "—"}</td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <><FormModal table="result" type="update" data={item} /><FormModal table="result" type="delete" id={item.id} /></>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
          {role === "teacher" && teacherSubjects.length > 0 && (
            <p className="text-xs text-lamaSky font-medium mt-0.5">
              Showing: {teacherSubjects.join(" & ")}
              {subjectFilter !== "all" && ` › ${subjectFilter}`}
            </p>
          )}
          {role === "parent" && parentChildNames !== null && parentChildNames.length > 0 && (
            <p className="text-xs text-lamaSky font-medium mt-0.5">
              Showing: {parentChildNames.join(" & ")}&apos;s Results
            </p>
          )}
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-2 self-end">

            {/* ── Subject Filter Dropdown ── */}
            <div ref={filterRef} className="relative">
              <button
                onClick={() => setFilterOpen((o) => !o)}
                title="Filter by subject"
                className={`w-8 h-8 flex items-center justify-center rounded-full relative transition-all ${
                  subjectFilter !== "all" ? "bg-lamaSky" : "bg-lamaYellow"
                }`}
              >
                <Image src="/filter.png" alt="filter" width={14} height={14} />
                {subjectFilter !== "all" && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-10 z-50 bg-white rounded-xl shadow-xl border border-gray-100 min-w-[180px] py-1 overflow-hidden">
                  <button
                    onClick={() => { setSubjectFilter("all"); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-lamaSkyLight transition-colors ${
                      subjectFilter === "all" ? "font-semibold text-lamaSky" : "text-gray-700"
                    }`}
                  >
                    All Subjects
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  {availableSubjects.map((subj) => (
                    <button
                      key={subj}
                      onClick={() => { setSubjectFilter(subj); setFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-lamaSkyLight transition-colors ${
                        subjectFilter === subj ? "font-semibold text-lamaSky" : "text-gray-700"
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Sort Button ── */}
            <button
              onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}
              title={`Sort by score ${sortOrder === "asc" ? "↓" : "↑"}`}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow relative"
            >
              <Image src="/sort.png" alt="sort" width={14} height={14} />
              <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-white rounded-full px-0.5 shadow text-gray-500">
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            </button>

            {(role === "admin" || role === "teacher") && <FormModal table="result" type="create" />}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-400 animate-pulse">Loading...</div>
      ) : displayed.length === 0 && subjectFilter !== "all" && role === "teacher" && !teacherSubjects.includes(subjectFilter) ? (
        <div className="p-10 text-center text-gray-400">
          <p className="text-2xl mb-2">🚫</p>
          <p className="font-medium text-gray-600">You don&apos;t teach <span className="text-lamaSky">{subjectFilter}</span></p>
          <p className="text-sm text-gray-400 mt-1">You can only view results for subjects you teach.</p>
        </div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={displayed} />
      )}
      <Pagination page={page} count={total} ITEM_PER_PAGE={ITEM_PER_PAGE} />
    </div>
  );
};
export default ResultList;
