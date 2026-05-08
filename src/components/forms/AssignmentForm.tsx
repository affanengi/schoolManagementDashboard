"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { AssignmentSchema, assignmentSchema } from "@/lib/formValidationSchemas";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const AssignmentForm = ({ type, data, setOpen }: { type: "create" | "update"; data?: any; setOpen: (v: boolean) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: data || {},
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    try {
      if (type === "create") {
        await setDoc(doc(db, "assignments", crypto.randomUUID()), { ...formData, createdAt: new Date() });
      } else {
        await updateDoc(doc(db, "assignments", data.id), { ...formData, updatedAt: new Date() });
      }
      setOpen(false);
      window.location.reload();
    } catch { setErrorMsg("Something went wrong!"); }
    finally { setLoading(false); }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Create Assignment" : "Update Assignment"}</h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Title" name="title" defaultValue={data?.title} register={register} error={errors?.title} />
        <InputField label="Subject" name="subject" defaultValue={data?.subject} register={register} error={errors?.subject} />
        <InputField label="Class (e.g. 10A)" name="class" defaultValue={data?.class} register={register} error={errors?.class} />
        <InputField label="Teacher Name" name="teacher" defaultValue={data?.teacher} register={register} error={errors?.teacher} />
        <InputField label="Due Date" name="dueDate" type="date" defaultValue={data?.dueDate} register={register} error={errors?.dueDate} />
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Description (optional)</label>
          <textarea {...register("description")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm outline-none focus:ring-lamaSky" rows={3} defaultValue={data?.description} />
        </div>
      </div>
      {errorMsg && <span className="text-red-500 text-sm">{errorMsg}</span>}
      <button disabled={loading} className="bg-lamaSky text-white p-2 rounded-md disabled:opacity-50">
        {loading ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};
export default AssignmentForm;
