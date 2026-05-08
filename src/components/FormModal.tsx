"use client";

import Image from "next/image";
import { useState } from "react";
import dynamic from "next/dynamic";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";

// Lazy-load all forms for code splitting
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), { loading: () => <p className="text-gray-400 animate-pulse">Loading form...</p> });
const StudentForm = dynamic(() => import("./forms/StudentForm"), { loading: () => <p className="text-gray-400 animate-pulse">Loading form...</p> });
const ParentForm = dynamic(() => import("./forms/ParentForm"), { loading: () => <p className="text-gray-400 animate-pulse">Loading form...</p> });
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), { loading: () => <p className="text-gray-400 animate-pulse">Loading form...</p> });
const ClassForm = dynamic(() => import("./forms/ClassForm"), { loading: () => <p className="text-gray-400 animate-pulse">Loading form...</p> });
const LessonForm = dynamic(() => import("./forms/LessonForm"), { loading: () => <p className="text-gray-400 animate-pulse">Loading form...</p> });
const ExamForm = dynamic(() => import("./forms/ExamForm"), { loading: () => <p className="text-gray-400 animate-pulse">Loading form...</p> });
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), { loading: () => <p className="text-gray-400 animate-pulse">Loading form...</p> });
const ResultForm = dynamic(() => import("./forms/ResultForm"), { loading: () => <p className="text-gray-400 animate-pulse">Loading form...</p> });
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), { loading: () => <p className="text-gray-400 animate-pulse">Loading form...</p> });
const EventForm = dynamic(() => import("./forms/EventForm"), { loading: () => <p className="text-gray-400 animate-pulse">Loading form...</p> });
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), { loading: () => <p className="text-gray-400 animate-pulse">Loading form...</p> });

// Maps table name -> Firestore collection name
const collectionMap: Record<string, string> = {
  teacher: "teachers",
  student: "students",
  parent: "parents",
  subject: "subjects",
  class: "classes",
  lesson: "lessons",
  exam: "exams",
  assignment: "assignments",
  result: "results",
  attendance: "attendance",
  event: "events",
  message: "messages",
  announcement: "announcements",
};

type TableType =
  | "teacher" | "student" | "parent" | "subject" | "class"
  | "lesson" | "exam" | "assignment" | "result" | "attendance"
  | "event" | "message" | "announcement";

type FormRenderer = (
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  type: "create" | "update",
  data?: any
) => JSX.Element;

const forms: Record<string, FormRenderer> = {
  teacher: (s, t, d) => <TeacherForm type={t} data={d} setOpen={s} />,
  student: (s, t, d) => <StudentForm type={t} data={d} setOpen={s} />,
  parent: (s, t, d) => <ParentForm type={t} data={d} setOpen={s} />,
  subject: (s, t, d) => <SubjectForm type={t} data={d} setOpen={s} />,
  class: (s, t, d) => <ClassForm type={t} data={d} setOpen={s} />,
  lesson: (s, t, d) => <LessonForm type={t} data={d} setOpen={s} />,
  exam: (s, t, d) => <ExamForm type={t} data={d} setOpen={s} />,
  assignment: (s, t, d) => <AssignmentForm type={t} data={d} setOpen={s} />,
  result: (s, t, d) => <ResultForm type={t} data={d} setOpen={s} />,
  attendance: (s, t, d) => <AttendanceForm type={t} data={d} setOpen={s} />,
  event: (s, t, d) => <EventForm type={t} data={d} setOpen={s} />,
  announcement: (s, t, d) => <AnnouncementForm type={t} data={d} setOpen={s} />,
};

const iconMap = { create: "plus.png", update: "edit.png", delete: "delete.png" };

const FormModal = ({
  table, type, data, id,
}: {
  table: TableType;
  type: "create" | "update" | "delete";
  data?: any;
  id?: string | number;
}) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor = type === "create" ? "bg-lamaYellow" : type === "update" ? "bg-lamaSky" : "bg-lamaPurple";

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    try {
      const collectionName = collectionMap[table] || table + "s";
      await deleteDoc(doc(db, collectionName, String(id)));
      setOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete. Check Firebase permissions.");
    } finally {
      setLoading(false);
    }
  };

  const FormBody = () => {
    if (type === "delete" && id) {
      return (
        <div className="flex flex-col gap-6 p-4">
          <span className="text-center font-medium text-gray-700">
            Are you sure you want to delete this{" "}
            <span className="font-bold capitalize">{table}</span>?{" "}
            This action cannot be undone.
          </span>
          {errorMsg && <span className="text-red-500 text-sm text-center">{errorMsg}</span>}
          <div className="flex justify-center gap-4">
            <button onClick={handleDelete} disabled={loading}
              className="bg-red-500 text-white py-2 px-6 rounded-md disabled:opacity-50">
              {loading ? "Deleting..." : "Yes, Delete"}
            </button>
            <button onClick={() => setOpen(false)} disabled={loading}
              className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md">
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if ((type === "create" || type === "update") && forms[table]) {
      return forms[table](setOpen, type, data);
    }

    return (
      <div className="p-6 text-center text-gray-500">
        <p>Form for <span className="font-bold capitalize">{table}</span> is coming soon!</p>
      </div>
    );
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
        title={`${type} ${table}`}
      >
        <Image src={`/${iconMap[type]}`} alt={type} width={16} height={16} />
      </button>

      {open && (
        <div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] max-h-[90vh] overflow-y-auto shadow-2xl">
            <FormBody />
            <button className="absolute top-4 right-4" onClick={() => setOpen(false)}>
              <Image src="/close.png" alt="close" width={14} height={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
