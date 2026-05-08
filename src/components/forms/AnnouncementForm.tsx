"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { AnnouncementSchema, announcementSchema } from "@/lib/formValidationSchemas";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const AnnouncementForm = ({ type, data, setOpen }: { type: "create" | "update"; data?: any; setOpen: (v: boolean) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: data || {},
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    try {
      if (type === "create") {
        await setDoc(doc(db, "announcements", crypto.randomUUID()), { ...formData, date: new Date(formData.date), createdAt: new Date() });
      } else {
        await updateDoc(doc(db, "announcements", data.id), { ...formData, date: new Date(formData.date), updatedAt: new Date() });
      }
      setOpen(false);
      window.location.reload();
    } catch { setErrorMsg("Something went wrong!"); }
    finally { setLoading(false); }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Create Announcement" : "Update Announcement"}</h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Title" name="title" defaultValue={data?.title} register={register} error={errors?.title} />
        <InputField label="Class (optional, blank = all)" name="class" defaultValue={data?.class} register={register} error={errors?.class} />
        <InputField label="Date" name="date" type="date" defaultValue={data?.date} register={register} error={errors?.date} />
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Description</label>
          <textarea {...register("description")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm outline-none focus:ring-lamaSky" rows={4} defaultValue={data?.description} />
          {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
        </div>
      </div>
      {errorMsg && <span className="text-red-500 text-sm">{errorMsg}</span>}
      <button disabled={loading} className="bg-lamaSky text-white p-2 rounded-md disabled:opacity-50">
        {loading ? "Saving..." : type === "create" ? "Publish" : "Update"}
      </button>
    </form>
  );
};
export default AnnouncementForm;
