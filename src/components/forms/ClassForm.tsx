"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { ClassSchema, classSchema } from "@/lib/formValidationSchemas";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const ClassForm = ({ type, data, setOpen }: { type: "create" | "update"; data?: any; setOpen: (v: boolean) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema) as any,
    defaultValues: data ? { ...data, capacity: data.capacity?.toString(), grade: data.grade?.toString() } : {},
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = handleSubmit(async (formData: any) => {
    setLoading(true);
    const payload = { ...formData, capacity: Number(formData.capacity), grade: Number(formData.grade) };
    try {
      if (type === "create") {
        await setDoc(doc(db, "classes", crypto.randomUUID()), { ...payload, createdAt: new Date() });
      } else {
        await updateDoc(doc(db, "classes", data.id), { ...payload, updatedAt: new Date() });
      }
      setOpen(false);
      window.location.reload();
    } catch { setErrorMsg("Something went wrong!"); }
    finally { setLoading(false); }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Create Class" : "Update Class"}</h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Class Name (e.g. 10A)" name="name" defaultValue={data?.name} register={register} error={errors?.name} />
        <InputField label="Capacity" name="capacity" type="number" defaultValue={data?.capacity?.toString()} register={register} error={errors?.capacity as any} />
        <InputField label="Grade" name="grade" type="number" defaultValue={data?.grade?.toString()} register={register} error={errors?.grade as any} />
        <InputField label="Supervisor (Teacher name)" name="supervisor" defaultValue={data?.supervisor} register={register} error={errors?.supervisor} />
      </div>
      {errorMsg && <span className="text-red-500 text-sm">{errorMsg}</span>}
      <button disabled={loading} className="bg-lamaSky text-white p-2 rounded-md disabled:opacity-50">
        {loading ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};
export default ClassForm;
