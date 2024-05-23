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

      {msgs.map((msg, i) => (
        <div key={i}>
          {msg.user_type}: {msg.message}
        </div>
      ))}
      <Chat docId={doc.id} />
    </>
  );
}
