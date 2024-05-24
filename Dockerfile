FROM node:18

# Install required packages
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash


WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN bun src/workers/index.ts

EXPOSE 3000
CMD npm run dev