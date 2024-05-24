"use server";

import { database } from "@/db/database";
import { embeddings, msg } from "@/db/schema";
import { env } from "@/env";
import axios from "axios";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import { l2Distance } from "pgvector/drizzle-orm";

export async function get_chat_response({
  system_message,
  delimiter,
  message,
  nearest,
}: {
  system_message: string;
  delimiter: string;
  message: string;
  nearest: any;
}) {
  console.log({
    messages: [
      { role: "system", content: system_message },
      { role: "user", content: `${delimiter}${message}${delimiter}` },
      {
        role: "assistant",
        content: `${nearest[0].content}\n ${nearest[1].content}\n ${nearest[2].content}`,
      },
    ],
  });

  const res = await axios.post("http://localhost:11434/api/chat", {
    model: "llama3",
    messages: [
      { role: "system", content: system_message },
      { role: "user", content: `${delimiter}${message}${delimiter}` },
      {
        role: "assistant",
        content: `${nearest[0].content}\n ${nearest[1].content}\n ${nearest[2].content}`,
      },
    ],
  });
  return res;
}

const system_message = `
    You are a friendly chatbot. \
    You respond in a concise, technically credible tone. \
    `;
const delimiter = "```";

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
    // for some
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

    console.log(nearest[0]);

    const chatCompletion = await get_chat_response({
      delimiter: delimiter,
      message: message,
      nearest: nearest,
      system_message: system_message,
    });

    console.log(chatCompletion.data.message.content);

    await database.insert(msg).values({
      chat_room,
      message: chatCompletion.data.message.content,
      user_type: "Assistant",
    });
  } catch (error) {
    console.error(error);
  }

  revalidatePath(`/doc/${chat_room}`);
}
