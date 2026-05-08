"use client";

import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { useAuth } from "@/components/AuthProvider";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import FormModal from "@/components/FormModal";

type Student = {
  id: number | string;
  studentId: string;
  name: string;
  email?: string;
  photo: string;
  phone: string;
  grade: number;
  class: string;
  address: string;
  bloodType?: string;
  emergencyContact?: string;
};

const columns = [
  { header: "Info", accessor: "info" },
  { header: "Student ID", accessor: "studentId", className: "hidden md:table-cell" },
  { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
  { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
  { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "action" },
];

const ITEM_PER_PAGE = 10;

const StudentList = () => {
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const searchParam = searchParams.get("search");

  const page = pageParam ? parseInt(pageParam) : 1;
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "students"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
        setAllStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { displayedStudents, totalCount } = useMemo(() => {
    let filtered = allStudents;
    if (searchParam) {
      const lowerQuery = searchParam.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerQuery) ||
          s.class.toLowerCase().includes(lowerQuery)
      );
    }
    filtered = [...filtered].sort((a, b) =>
      sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    const count = filtered.length;
    const startIndex = ITEM_PER_PAGE * (page - 1);
    const sliced = filtered.slice(startIndex, startIndex + ITEM_PER_PAGE);
    return { displayedStudents: sliced, totalCount: count };
  }, [allStudents, searchParam, page, sortOrder]);

  const renderRow = (item: Student) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="flex items-center gap-4 p-4">
        {item.photo && item.photo !== "/avatar.png" ? (
          <Image src={item.photo} alt="" width={40} height={40} className="md:hidden xl:block w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className={`md:hidden xl:flex w-10 h-10 rounded-full items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
            ["bg-lamaPurple","bg-lamaSky","bg-pink-400","bg-green-400","bg-amber-400","bg-indigo-400"][item.name.charCodeAt(0) % 6]
          }`}>
            {item.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.class}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.studentId}</td>
      <td className="hidden md:table-cell">{item.grade}</td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <>
              <FormModal table="student" type="update" data={item} />
              <FormModal table="student" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button
              onClick={() => setSortOrder((o) => o === "asc" ? "desc" : "asc")}
              title={`Sorted ${sortOrder === "asc" ? "A→Z" : "Z→A"}`}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow relative"
            >
              <Image src="/sort.png" alt="sort" width={14} height={14} />
              <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-white rounded-full px-0.5 shadow text-gray-500">
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            </button>
            {role === "admin" && (
              <FormModal table="student" type="create" />
            )}
          </div>
        </div>
      </div>
      {loading ? (
        <div className="p-10 text-center text-gray-500">Loading data from Firebase...</div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={displayedStudents} />
      )}
      <Pagination page={page} count={totalCount} ITEM_PER_PAGE={ITEM_PER_PAGE} />
    </div>
  );
};

export default StudentList;
