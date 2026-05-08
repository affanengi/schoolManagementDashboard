"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { StudentSchema, studentSchema } from "@/lib/formValidationSchemas";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const StudentForm = ({
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
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema) as any,
    defaultValues: data
      ? {
          ...data,
          grade: data.grade?.toString() ?? "",
        }
      : {},
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = handleSubmit(async (formData: any) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const payload = {
        ...formData,
        grade: Number(formData.grade),
      };
      if (type === "create") {
        const docId = formData.studentId;
        await setDoc(doc(db, "students", docId), {
          ...payload,
          createdAt: new Date(),
        });
      } else if (type === "update" && data?.id) {
        await updateDoc(doc(db, "students", data.id), {
          ...payload,
          updatedAt: new Date(),
        });
      }
      setOpen(false);
      window.location.reload();
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
        {type === "create" ? "Create a new student" : "Update the student"}
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
          label="Student ID"
          name="studentId"
          defaultValue={data?.studentId}
          register={register}
          error={errors?.studentId}
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
        <InputField
          label="Grade"
          name="grade"
          type="number"
          defaultValue={data?.grade?.toString()}
          register={register}
          error={errors?.grade as any}
        />
        <InputField
          label="Class"
          name="class"
          defaultValue={data?.class}
          register={register}
          error={errors?.class}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
          <label
            className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
            htmlFor="student-img"
          >
            <Image src="/upload.png" alt="" width={28} height={28} />
            <span>Upload a photo</span>
          </label>
          <input type="file" id="student-img" {...register("photo")} className="hidden" />
        </div>
      </div>
      {errorMsg && <span className="text-red-500 text-sm">{errorMsg}</span>}
      <button
        disabled={loading}
        className="bg-lamaSky text-white p-2 rounded-md disabled:bg-opacity-50"
      >
        {loading ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StudentForm;
