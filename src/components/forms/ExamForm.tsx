"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { ExamSchema, examSchema } from "@/lib/formValidationSchemas";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const ExamForm = ({ type, data, setOpen }: { type: "create" | "update"; data?: any; setOpen: (v: boolean) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
    defaultValues: data || {},
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    try {
      if (type === "create") {
        await setDoc(doc(db, "exams", crypto.randomUUID()), { ...formData, createdAt: new Date() });
      } else {
        await updateDoc(doc(db, "exams", data.id), { ...formData, updatedAt: new Date() });
      }
      setOpen(false);
      window.location.reload();
    } catch { setErrorMsg("Something went wrong!"); }
    finally { setLoading(false); }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Create Exam" : "Update Exam"}</h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Subject" name="subject" defaultValue={data?.subject} register={register} error={errors?.subject} />
        <InputField label="Class (e.g. 10A)" name="class" defaultValue={data?.class} register={register} error={errors?.class} />
        <InputField label="Teacher Name" name="teacher" defaultValue={data?.teacher} register={register} error={errors?.teacher} />
        <InputField label="Date" name="date" type="date" defaultValue={data?.date} register={register} error={errors?.date} />
        <InputField label="Start Time (optional)" name="startTime" defaultValue={data?.startTime} register={register} error={errors?.startTime} />
        <InputField label="End Time (optional)" name="endTime" defaultValue={data?.endTime} register={register} error={errors?.endTime} />
      </div>
      {errorMsg && <span className="text-red-500 text-sm">{errorMsg}</span>}
      <button disabled={loading} className="bg-lamaSky text-white p-2 rounded-md disabled:opacity-50">
        {loading ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};
export default ExamForm;
