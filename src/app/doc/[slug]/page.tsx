import { auth } from "@/auth";
import { database } from "@/db/database";
import { msg, userDocs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createTextAction } from "./action";
import { Chat } from "./chat";
export default async function Page({ params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return <div>Login first</div>;
  }
  const doc = await database.query.userDocs.findFirst({
    where: eq(userDocs.id, session.user.id) && eq(userDocs.id, params.slug),
  });

  if (!doc) {
    return <div>Doc not found</div>;
  }

  const msgs = await database.query.msg.findMany({
    where: eq(msg.chat_room, doc.id),
  });

  return (
    <>
      <div>Title: {doc.title}</div>

      <div>Description: {doc.description}</div>

      <div>PDF: {doc.pdf}</div>

      <div className="flex flex-col h-screen">
        <div className="flex flex-grow overflow-y-auto gap-3 items-center p-4 sticky flex-col">
          {msgs.map((msg, i) => (
            <span
              key={i}
              className={`p-2 rounded-lg max-w-lg ${
                msg.user_type === "User"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {msg.message}
            </span>
          ))}
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4">
          <Chat docId={doc.id} />
        </div>
      </div>
    </>
  );
}
