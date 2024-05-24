import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
// import { vector } from "pgvector/drizzle-orm";

export const msg = pgTable(
  "msg",
  {
    chat_room: text("chat_room"),
    message: text("message"),
    created_at: timestamp("created_at", { mode: "date" }).$defaultFn(
      () => new Date()
    ),

    user_type: text("user_type").notNull(),
  },
  (table) => {
    return {
      chat_roomIdx: index("chat_room_idx").on(table.chat_room),
    };
  }
);

import { customType } from "drizzle-orm/pg-core";
import { create } from "domain";

export const vector = customType<{
  data: number[];
  driverData: string;
  config: { size: number };
}>({
  dataType(config) {
    const dt =
      !!config && typeof config.size === "number"
        ? `vector(${config.size})`
        : "vector";
    return dt;
  },
  fromDriver(value) {
    return JSON.parse(value);
  },
  toDriver(value) {
    return JSON.stringify(value);
  },
});

export const embeddings = pgTable("embeddings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // by default it create ALTER TABLE "embeddings" ADD COLUMN "embedding" "vector(1024)" NOT NULL;
  // but it should be ALTER TABLE "embeddings" ADD COLUMN "embedding" vector(1024) NOT NULL;
  // size can be different for different embeddings model
  embedding: vector("embedding", { size: 1024 }).notNull(),
  text: text("text").notNull(),
  tokenLength: integer("token_length").notNull(),

  userDocId: text("user_doc_id").references(() => userDocs.id, {
    onDelete: "cascade",
  }),
});

export const userDocs = pgTable("user_docs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  title: text("title").notNull(),
  description: text("description").notNull(),
  pdf: text("pdf").notNull(),

  created_at: timestamp("created_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
