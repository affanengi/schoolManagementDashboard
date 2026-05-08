"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { AttendanceSchema, attendanceSchema } from "@/lib/formValidationSchemas";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const AttendanceForm = ({ type, data, setOpen }: { type: "create" | "update"; data?: any; setOpen: (v: boolean) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      studentId: data?.studentId || "",
      studentName: data?.studentName || "",
      class: data?.class || "",
      date: data?.date || "",
      status: data?.status || "Present",
    },
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = handleSubmit(
    async (formData) => {
      setLoading(true);
      try {
        if (type === "create") {
          await setDoc(doc(db, "attendance", crypto.randomUUID()), { ...formData, createdAt: new Date() });
        } else {
          await updateDoc(doc(db, "attendance", data.id), { ...formData, updatedAt: new Date() });
        }
        setOpen(false);
        window.location.reload();
      } catch (err) {
        console.error("AttendanceForm error:", err);
        setErrorMsg("Failed to save.");
      } finally { setLoading(false); }
    },
    (validationErrors) => {
      console.error("Validation failed:", validationErrors);
      setErrorMsg("Please fill in all required fields.");
    }
  );

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Mark Attendance" : "Update Attendance"}</h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Student ID" name="studentId" register={register} error={errors?.studentId} />
        <InputField label="Student Name (optional)" name="studentName" register={register} error={errors?.studentName} />
        <InputField label="Class (optional)" name="class" register={register} error={errors?.class} />
        <InputField label="Date" name="date" type="date" register={register} error={errors?.date} />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Status</label>
          <select {...register("status")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm outline-none focus:ring-lamaSky">
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>
          {errors.status && <p className="text-xs text-red-400">{errors.status.message}</p>}
        </div>
      </div>
      {errorMsg && <span className="text-red-500 text-sm">{errorMsg}</span>}
      <button type="submit" disabled={loading} className="bg-lamaSky text-white p-2 rounded-md disabled:opacity-50">
        {loading ? "Saving..." : type === "create" ? "Mark" : "Update"}
      </button>
    </form>
  );
};
export default AttendanceForm;
