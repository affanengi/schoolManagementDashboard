"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { TeacherSchema, teacherSchema } from "@/lib/formValidationSchemas";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const TeacherForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    defaultValues: data || {},
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    setErrorMsg("");
    try {
      if (type === "create") {
        // Simple auto-id if not provided, or we can use teacherId
        const docId = formData.teacherId;
        await setDoc(doc(db, "teachers", docId), {
          ...formData,
          createdAt: new Date(),
        });
      } else if (type === "update" && data?.id) {
        await updateDoc(doc(db, "teachers", data.id), {
          ...formData,
          updatedAt: new Date(),
        });
      }
      setOpen(false);
      window.location.reload(); // Refresh the list
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Something went wrong!");
    } finally {
      setLoading(false);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update the teacher"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
          type="email"
        />
      </div>
      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Teacher ID"
          name="teacherId"
          defaultValue={data?.teacherId}
          register={register}
          error={errors?.teacherId}
        />
        <InputField
          label="Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors?.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors?.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors?.bloodType}
        />
        <InputField
          label="Emergency Contact"
          name="emergencyContact"
          defaultValue={data?.emergencyContact}
          register={register}
          error={errors?.emergencyContact}
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subjects (comma separated)</label>
          <input
            type="text"
            {...register("subjects", {
              setValueAs: (v) => {
                if (Array.isArray(v)) return v;
                if (typeof v === "string") return v.split(",").map((s: string) => s.trim()).filter(Boolean);
                return [];
              },
            })}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full outline-none focus:ring-lamaSky"
            defaultValue={data?.subjects?.join(", ")}
          />
          {errors.subjects?.message && (
            <p className="text-xs text-red-400">
              {errors.subjects.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Classes (comma separated)</label>
          <input
            type="text"
            {...register("classes", {
              setValueAs: (v) => {
                if (Array.isArray(v)) return v;
                if (typeof v === "string") return v.split(",").map((s: string) => s.trim()).filter(Boolean);
                return [];
              },
            })}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full outline-none focus:ring-lamaSky"
            defaultValue={data?.classes?.join(", ")}
          />
          {errors.classes?.message && (
            <p className="text-xs text-red-400">
              {errors.classes.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
          <label
            className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
            htmlFor="img"
          >
            <Image src="/upload.png" alt="" width={28} height={28} />
            <span>Upload a photo</span>
          </label>
          <input type="file" id="img" {...register("photo")} className="hidden" />
          {errors.photo?.message && (
            <p className="text-xs text-red-400">
              {errors.photo.message.toString()}
            </p>
          )}
        </div>
      </div>
      {errorMsg && <span className="text-red-500 text-sm">{errorMsg}</span>}
      <button disabled={loading} className="bg-lamaSky text-white p-2 rounded-md disabled:bg-opacity-50">
        {loading ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default TeacherForm;
