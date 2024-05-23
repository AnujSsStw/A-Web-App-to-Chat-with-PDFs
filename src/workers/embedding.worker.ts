import { Queue } from "bullmq";
import Redis from "ioredis";
const PDFParser = require("pdf-parse");

export const connection = new Redis(process.env.REDIS_URL!, {
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});

export const sampleQueue = new Queue("embeddingQueue", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});
