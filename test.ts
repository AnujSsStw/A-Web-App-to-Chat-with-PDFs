import ollama from "ollama";
const res = await ollama.chat({
  model: "llama3",
  messages: [{ role: "system", content: "hi" }],
});
res.message.content;
import { get_embeddings, chunkContent } from "@/workers/util";
import { Result } from "@/workers";

const PDFParser = require("pdf-parse");

async function getPDFContent(pdfUrl: string): Promise<Result> {
  const res = (await PDFParser(pdfUrl)) as Result;
  return res;
}
const doi = async () => {
  const pdfContent = await getPDFContent(
    "https://utfs.io/f/ca9d1f78-3644-4a67-9bb8-eaeffcead637-2dvlla.pdf"
  );
  const l = chunkContent({ content: pdfContent.text });
  for (const list of l) {
    const embedding = await get_embeddings(list.content);
    list.embedding = embedding;
  }
  console.log(l);
};
doi();
