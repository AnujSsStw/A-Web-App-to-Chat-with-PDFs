import express from "express";
import { sampleQueue, connection } from "./embedding.worker";
import { Worker, Queue, Job } from "bullmq";
import { database } from "@/db/database";
import { embeddings, userDocs } from "@/db/schema";
import { chunkContent, get_embeddings } from "./util";
const PDFParser = require("pdf-parse");
var cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
const port = 6969;
export interface Result {
  numpages: number;
  numrender: number;
  info: any;
  metadata: any;
  text: string;
}

async function getPDFContent(pdfUrl: string): Promise<Result> {
  const res = (await PDFParser(pdfUrl)) as Result;
  return res;
}

const worker = new Worker(
  "embeddingQueue", // this is the queue name, the first string parameter we provided for Queue()
  async (job: Job) => {
    console.log("Job data:", job.data);
    const body = job.data as {
      title: string;
      description: string;
      pdf: string;
      userId: string;
    };

    const pdfContent = await getPDFContent(body.pdf);
    const l = chunkContent({ content: pdfContent.text });
    for (const list of l) {
      const embedding = await get_embeddings(list.content);
      list.embedding = embedding;
    }
    console.log(l);

    try {
      const { id } = (
        await database
          .insert(userDocs)
          .values({
            title: body.title,
            description: body.description,
            pdf: body.pdf,
            userId: body.userId,
          })
          .returning({ id: userDocs.id })
      )[0];
      for (const list of l) {
        await database.insert(embeddings).values({
          embedding: list.embedding,
          text: list.content,
          tokenLength: list.tokenLen,
          userDocId: id,
        });
      }
    } catch (error: any) {
      console.log("Error: ", error);
    }

    return "some value";
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
);

worker.on("completed", (job: Job, returnvalue: any) => {
  // Do something with the return value.
  console.log("Job completed with return value:", returnvalue);
});
//@ts-ignore
worker.on("failed", (job: Job, error: Error) => {
  // Do something with the return value.
  console.log("Job failed with error:", error);
});

app.post("/api/create", async (req, res) => {
  const { title, description, pdf, userId } = req.body;

  // Add the job to the queue
  const a = await sampleQueue.add("someJob", {
    title,
    description,
    pdf,
    userId,
  });

  return res
    .json({ message: "Job added to the queue", jobId: a.id })
    .status(200);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
