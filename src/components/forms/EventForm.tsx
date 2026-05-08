"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { EventSchema, eventSchema } from "@/lib/formValidationSchemas";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const EventForm = ({ type, data, setOpen }: { type: "create" | "update"; data?: any; setOpen: (v: boolean) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: data || {},
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    try {
      if (type === "create") {
        await setDoc(doc(db, "events", crypto.randomUUID()), { ...formData, createdAt: new Date() });
      } else {
        await updateDoc(doc(db, "events", data.id), { ...formData, updatedAt: new Date() });
      }
      setOpen(false);
      window.location.reload();
    } catch { setErrorMsg("Something went wrong!"); }
    finally { setLoading(false); }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Create Event" : "Update Event"}</h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Event Title" name="title" defaultValue={data?.title} register={register} error={errors?.title} />
        <InputField label="Class (optional, blank = all)" name="class" defaultValue={data?.class} register={register} error={errors?.class} />
        <InputField label="Date" name="date" type="date" defaultValue={data?.date} register={register} error={errors?.date} />
        <InputField label="Start Time (e.g. 09:00)" name="startTime" defaultValue={data?.startTime} register={register} error={errors?.startTime} />
        <InputField label="End Time (e.g. 11:00)" name="endTime" defaultValue={data?.endTime} register={register} error={errors?.endTime} />
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
export default EventForm;
