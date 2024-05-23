"use client";
import { UploadButton, UploadDropzone } from "@/components/uploadthing";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClientUploadedFileData } from "uploadthing/types";
import axios from "axios";
import { sendToQueue } from "./f";

export default function Create() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  async function handleUpload(
    res: ClientUploadedFileData<{
      uploadedBy: string | undefined;
    }>[]
  ) {
    try {
      await sendToQueue(title, description, res);
      router.push("/");
    } catch (error: any) {
      alert(`ERROR! ${error.message}`);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form className="bg-slate-900 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <textarea
            id="description"
            placeholder="Description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <UploadDropzone
            endpoint="pdfUploader"
            onBeforeUploadBegin={(files) => {
              // Do something with the files
              console.log("Files: ", files);
              files.filter((file) => {
                return file.type === "application/pdf";
              });
              return files;
            }}
            onClientUploadComplete={async (res) => {
              // Do something with the response
              await handleUpload(res);
            }}
            onUploadError={(error: Error) => {
              // Do something with the error.
              alert(`ERROR! ${error.message}`);
            }}
          />
        </div>
      </form>
    </div>
  );
}
