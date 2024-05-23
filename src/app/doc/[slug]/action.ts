"use server";

import { database } from "@/db/database";
import { embeddings, msg } from "@/db/schema";
import { env } from "@/env";
import { get_embeddings } from "@/workers/util";
import axios from "axios";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import { l2Distance } from "pgvector/drizzle-orm";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  baseURL: "http://localhost:3040/v1",
});

const system_message = `
    You are a friendly chatbot. \
    You can answer questions about timescaledb, its features and its use cases. \
    You respond in a concise, technically credible tone. \
    `;
const delimiter = "###";

export async function createTextAction({
  chat_room,
  message,
}: {
  chat_room: string;
  message: string;
}) {
  console.log(chat_room, message);
  try {
    await database.insert(msg).values({
      chat_room,
      message,
      user_type: "User",
    });
  } catch (error) {
    console.log("db error", error);
  }

  try {
    const res = await axios.post("http://localhost:11434/api/embeddings", {
      model: "mxbai-embed-large",
      prompt: message.replace("\n", " "),
    });
    const e = res.data.embedding;
    const nearest = await database
      .select({
        content: embeddings.text,
      })
      .from(embeddings)
      .orderBy(l2Distance(embeddings.embedding, e))
      .limit(3);

    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: system_message },
        { role: "user", content: `${delimiter}${message}${delimiter}` },
        {
          role: "assistant",
          content: `${nearest[0].content}\n ${nearest[1].content}\n ${nearest[2].content}`,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    console.log(chatCompletion);
  } catch (error) {
    console.error(error);
  }

  revalidatePath(`/doc/${chat_room}`);
}
