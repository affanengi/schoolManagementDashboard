"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { ResultSchema, resultSchema } from "@/lib/formValidationSchemas";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const ResultForm = ({ type, data, setOpen }: { type: "create" | "update"; data?: any; setOpen: (v: boolean) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema) as any,
    defaultValues: {
      subject: data?.subject || "",
      student: data?.student || "",
      studentId: data?.studentId || "",
      studentEmail: data?.studentEmail || "",
      class: data?.class || "",
      teacher: data?.teacher || "",
      type: data?.type || "exam",
      date: data?.date || "",
      score: data?.score ?? 0,
      grade: data?.grade || "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = handleSubmit(
    async (formData: any) => {
      setLoading(true);
      const score = Number(formData.score);
      const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
      const payload = { ...formData, score, grade };
      try {
        if (type === "create") {
          await setDoc(doc(db, "results", crypto.randomUUID()), { ...payload, createdAt: new Date() });
        } else {
          await updateDoc(doc(db, "results", data.id), { ...payload, updatedAt: new Date() });
        }
        setOpen(false);
        window.location.reload();
      } catch (err) {
        console.error("ResultForm error:", err);
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
      <h1 className="text-xl font-semibold">{type === "create" ? "Create Result" : "Update Result"}</h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Subject" name="subject" register={register} error={errors?.subject} />
        <InputField label="Student Name" name="student" register={register} error={errors?.student} />
        <InputField label="Student ID" name="studentId" register={register} error={errors?.studentId} />
        <InputField label="Student Email (optional)" name="studentEmail" type="email" register={register} error={errors?.studentEmail} />
        <InputField label="Class" name="class" register={register} error={errors?.class} />
        <InputField label="Teacher (optional)" name="teacher" register={register} error={errors?.teacher} />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Type</label>
          <select {...register("type")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm outline-none focus:ring-lamaSky">
            <option value="exam">Exam</option>
            <option value="assignment">Assignment</option>
          </select>
          {errors.type && <p className="text-xs text-red-400">{errors.type.message}</p>}
        </div>
        <InputField label="Date" name="date" type="date" register={register} error={errors?.date} />
        <InputField label="Score (0–100)" name="score" type="number" register={register} error={errors?.score as any} />
      </div>
      {errorMsg && <span className="text-red-500 text-sm">{errorMsg}</span>}
      <button type="submit" disabled={loading} className="bg-lamaSky text-white p-2 rounded-md disabled:opacity-50">
        {loading ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};
export default ResultForm;
