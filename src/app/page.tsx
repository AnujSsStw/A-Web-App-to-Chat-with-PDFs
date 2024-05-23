import { auth } from "@/auth";
import { database } from "@/db/database";
import { userDocs } from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";

export default async function Home() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return <main className="">Login first</main>;
  }

  const docs = await database.query.userDocs.findMany({
    where: eq(userDocs.userId, session.user.id),
  });

  return (
    <main className="">
      <h1>Docs</h1>
      <ul>
        {docs.map((doc) => (
          <li key={doc.id}>
            <h2>{doc.title}</h2>
          </li>
        ))}
      </ul>
    </main>
  );
}
