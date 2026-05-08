"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { ParentSchema, parentSchema } from "@/lib/formValidationSchemas";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const ParentForm = ({
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
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema),
    defaultValues: data || {},
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    setErrorMsg("");
    try {
      if (type === "create") {
        const docId = crypto.randomUUID();
        await setDoc(doc(db, "parents", docId), {
          ...formData,
          createdAt: new Date(),
        });
      } else if (type === "update" && data?.id) {
        await updateDoc(doc(db, "parents", data.id), {
          ...formData,
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
        {type === "create" ? "Create a new parent" : "Update the parent"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">Personal Information</span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Full Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">
            Children Student IDs (comma separated)
          </label>
          <input
            type="text"
            {...register("students", {
              setValueAs: (v) => {
                if (Array.isArray(v)) return v;
                if (typeof v === "string")
                  return v.split(",").map((s: string) => s.trim()).filter(Boolean);
                return [];
              },
            })}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full outline-none focus:ring-lamaSky"
            defaultValue={data?.students?.join(", ")}
          />
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

export default ParentForm;
