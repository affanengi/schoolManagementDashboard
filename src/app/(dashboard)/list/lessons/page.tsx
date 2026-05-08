"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormModal from "@/components/FormModal";
import Image from "next/image";

type Lesson = { id: string; subject: string; class: string; teacher: string; day?: string; startTime?: string; endTime?: string };

const columns = [
  { header: "Subject", accessor: "subject" },
  { header: "Class", accessor: "class" },
  { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
  { header: "Day", accessor: "day", className: "hidden lg:table-cell" },
  { header: "Time", accessor: "time", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "action" },
];

const ITEM_PER_PAGE = 10;

const LessonList = () => {
  const { role, user } = useAuth();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const searchParam = searchParams.get("search") || "";
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [allData, setAllData] = useState<Lesson[]>([]);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (role === "teacher" && user?.email) {
          const snap = await getDocs(query(collection(db, "teachers"), where("email", "==", user.email)));
          if (!snap.empty) setTeacherName(snap.docs[0].data().name || null);
        }
        const snap = await getDocs(collection(db, "lessons"));
        setAllData(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson)));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [role, user]);

  const { displayed, total } = useMemo(() => {
    let filtered = allData;
    if (role === "teacher" && teacherName) filtered = filtered.filter(l => l.teacher === teacherName);
    filtered = filtered.filter(l =>
      !searchParam ||
      l.subject.toLowerCase().includes(searchParam.toLowerCase()) ||
      l.class.toLowerCase().includes(searchParam.toLowerCase()) ||
      l.teacher.toLowerCase().includes(searchParam.toLowerCase())
    );
    filtered = [...filtered].sort((a, b) =>
      sortOrder === "asc" ? a.subject.localeCompare(b.subject) : b.subject.localeCompare(a.subject)
    );
    return { displayed: filtered.slice((page - 1) * ITEM_PER_PAGE, page * ITEM_PER_PAGE), total: filtered.length };
  }, [allData, searchParam, page, sortOrder, role, teacherName]);

  const renderRow = (item: Lesson) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4 font-semibold">{item.subject}</td>
      <td className="p-4">{item.class}</td>
      <td className="hidden md:table-cell p-4">{item.teacher}</td>
      <td className="hidden lg:table-cell p-4">{item.day || "—"}</td>
      <td className="hidden lg:table-cell p-4">{item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : "—"}</td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <><FormModal table="lesson" type="update" data={item} /><FormModal table="lesson" type="delete" id={item.id} /></>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="hidden md:block text-lg font-semibold">All Lessons</h1>
          {role === "teacher" && teacherName && (
            <p className="text-xs text-lamaSky font-medium mt-0.5">Showing: Your Lessons</p>
          )}
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")} className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow relative">
              <Image src="/sort.png" alt="sort" width={14} height={14} />
              <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-white rounded-full px-0.5 shadow text-gray-500">
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            </button>
            {(role === "admin" || role === "teacher") && <FormModal table="lesson" type="create" />}
          </div>
        </div>
      </div>
      {loading ? <div className="p-10 text-center text-gray-400 animate-pulse">Loading...</div>
        : <Table columns={columns} renderRow={renderRow} data={displayed} />}
      <Pagination page={page} count={total} ITEM_PER_PAGE={ITEM_PER_PAGE} />
    </div>
  );
};
export default LessonList;
