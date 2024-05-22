import { NextResponse } from "next/server";
import { database } from "@/db/database";
import { userDocs } from "@/db/schema";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    title: string;
    description: string;
    pdf: string;
    userId: string;
  };
  try {
    await database.insert(userDocs).values({
      title: body.title,
      description: body.description,
      pdf: body.pdf,
      userId: body.userId,
    });
  } catch (error: any) {
    return NextResponse.error();
  }
  return NextResponse.json({ msg: "Hello from server" });
}
