"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { SubjectSchema, subjectSchema } from "@/lib/formValidationSchemas";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const SubjectForm = ({ type, data, setOpen }: { type: "create" | "update"; data?: any; setOpen: (v: boolean) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: data || {},
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    try {
      if (type === "create") {
        const id = crypto.randomUUID();
        await setDoc(doc(db, "subjects", id), { ...formData, createdAt: new Date() });
      } else {
        await updateDoc(doc(db, "subjects", data.id), { ...formData, updatedAt: new Date() });
      }
      setOpen(false);
      window.location.reload();
    } catch { setErrorMsg("Something went wrong!"); }
    finally { setLoading(false); }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Create Subject" : "Update Subject"}</h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Subject Name" name="name" defaultValue={data?.name} register={register} error={errors?.name} />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teachers (comma separated)</label>
          <input type="text" {...register("teachers", { setValueAs: (v) => Array.isArray(v) ? v : typeof v === "string" ? v.split(",").map((s: string) => s.trim()).filter(Boolean) : [] })}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm outline-none focus:ring-lamaSky"
            defaultValue={data?.teachers?.join(", ")} />
        </div>
      </div>
      {errorMsg && <span className="text-red-500 text-sm">{errorMsg}</span>}
      <button disabled={loading} className="bg-lamaSky text-white p-2 rounded-md disabled:opacity-50">
        {loading ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};
export default SubjectForm;
