import ollama from "ollama";
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

export async function get_embeddings(text: string) {
  const res = await ollama.embeddings({
    model: "mxbai-embed-large",
    prompt: text.replace("\n", " "),
  });
  return res.embedding;
}
import { encode } from "gpt-3-encoder";
import axios from "axios";

interface ContentChunk {
  content: string;
  tokenLen: number;
  embedding?: any;
}

export function chunkContent(df: { content: string }): ContentChunk[] {
  const newList: ContentChunk[] = [];
  const idealTokenSize = 512;
  const idealSize = Math.floor(idealTokenSize / (4 / 3));

  const { content } = df;
  const tokenLen = encode(content).length;

  if (tokenLen <= idealTokenSize) {
    newList.push({ content, tokenLen });
  } else {
    const words = content.split(" ").filter((word) => word !== "");
    const totalWords = words.length;
    const chunks = Math.ceil(totalWords / idealSize);
    let start = 0;
    let end = idealSize;

    for (let j = 0; j < chunks; j++) {
      if (end > totalWords) {
        end = totalWords;
      }

      const newContent = words.slice(start, end).join(" ");
      const newContentTokenLen = encode(newContent).length;

      if (newContentTokenLen > 0) {
        newList.push({
          content: newContent,
          tokenLen: newContentTokenLen,
        });
      }

      start += idealSize;
      end += idealSize;
    }
  }

  return newList;
}
