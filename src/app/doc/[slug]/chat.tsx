"use client";

import { createTextAction } from "./action";

export function Chat(doc: { docId: string }) {
  return (
    <>
      <form
        className="flex flex-row gap-7  border p-8 rounded-xl  max-w-2xl w-10/12 mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();

          const form = e.currentTarget as HTMLFormElement;
          const formData = new FormData(form);

          const text = formData.get("text") as string;

          await createTextAction({
            chat_room: doc.docId,
            message: text,
          });
        }}
      >
        <input
          type="text"
          name="text"
          className="border border-gray-300 rounded-md p-2 w-full max-w-2xl text-black"
        />

        <button
          className="bg-blue-500 text-white rounded-md p-2 mt-0 hover:bg-blue-600"
          type="submit"
        >
          send
        </button>
      </form>
    </>
  );
}
