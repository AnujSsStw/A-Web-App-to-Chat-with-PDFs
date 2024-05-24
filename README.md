to vector embedding in pg use -> CREATE EXTENSION if not exist vector;
by default it create ALTER TABLE "embeddings" ADD COLUMN "embedding" "vector(1024)" NOT NULL;
but it should be ALTER TABLE "embeddings" ADD COLUMN "embedding" vector(1024) NOT NULL;
size can be different for different embeddings model

so pnpm db:push don't work because of drizzle vector problem so to solve this just run above query (ALTER TABLE "embeddings" ADD COLUMN "embedding" vector(1024) NOT NULL) in psql;

by default i'm use ollama(llama3:latest, mxbai-embed-large:latest) models and it's installed on my local machine / no gpt(no money sad face emoji).

run bun src/workers/index.ts for running queue service
i have to create a sepreate express app because of issuse with pdf-parser in nextjs api
