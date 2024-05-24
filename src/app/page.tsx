import { auth } from "@/auth";
import { database } from "@/db/database";
import { userDocs } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return <main className="">Login first</main>;
  }

  const docs = await database.query.userDocs.findMany({
    where: eq(userDocs.userId, session.user.id),
  });

  return (
    <main className="mx-7">
      <h1 className="">Docs</h1>
      <div className="flex gap-5 ">
        {docs.map((doc) => (
          <div
            className="w-2/4 h-2/4 border-blue-50 border p-8 rounded-xl"
            key={doc.id}
          >
            <Link href={`/doc/${doc.id}`}>{doc.title}</Link>
            <p>{doc.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
