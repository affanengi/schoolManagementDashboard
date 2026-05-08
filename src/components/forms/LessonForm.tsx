"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { LessonSchema, lessonSchema } from "@/lib/formValidationSchemas";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const LessonForm = ({ type, data, setOpen }: { type: "create" | "update"; data?: any; setOpen: (v: boolean) => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
    // Pass ALL existing data as defaultValues — this is the ONLY place to set defaults for react-hook-form
    defaultValues: {
      subject: data?.subject || "",
      class: data?.class || "",
      teacher: data?.teacher || "",
      day: data?.day || "",
      startTime: data?.startTime || "",
      endTime: data?.endTime || "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = handleSubmit(
    async (formData) => {
      setLoading(true);
      try {
        if (type === "create") {
          await setDoc(doc(db, "lessons", crypto.randomUUID()), {
            ...formData,
            createdAt: new Date(),
          });
        } else {
          await updateDoc(doc(db, "lessons", data.id), {
            ...formData,
            updatedAt: new Date(),
          });
        }
        setOpen(false);
        window.location.reload();
      } catch (err) {
        console.error("LessonForm error:", err);
        setErrorMsg("Failed to save. Check Firebase permissions.");
      } finally {
        setLoading(false);
      }
    },
    // Show validation errors if form submit is blocked
    (validationErrors) => {
      console.error("Validation failed:", validationErrors);
      setErrorMsg("Please fill in all required fields.");
    }
  );

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Lesson" : "Update Lesson"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subject"
          name="subject"
          register={register}
          error={errors?.subject}
        />
        <InputField
          label="Class (e.g. 10A)"
          name="class"
          register={register}
          error={errors?.class}
        />
        <InputField
          label="Teacher Name"
          name="teacher"
          register={register}
          error={errors?.teacher}
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Day</label>
          {/* Use register only — NO defaultValue on the element (breaks react-hook-form) */}
          <select
            {...register("day")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm outline-none focus:ring-lamaSky"
          >
            <option value="">Select a day</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.day && <p className="text-xs text-red-400">{errors.day.message}</p>}
        </div>
        <InputField
          label="Start Time (e.g. 09:00)"
          name="startTime"
          register={register}
          error={errors?.startTime}
        />
        <InputField
          label="End Time (e.g. 10:00)"
          name="endTime"
          register={register}
          error={errors?.endTime}
        />
      </div>
      {errorMsg && <span className="text-red-500 text-sm">{errorMsg}</span>}
      <button
        type="submit"
        disabled={loading}
        className="bg-lamaSky text-white p-2 rounded-md disabled:opacity-50"
      >
        {loading ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};
export default LessonForm;
