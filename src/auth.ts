import NextAuth from "next-auth";
import github from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { database } from "@/db/database";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [github],
  adapter: DrizzleAdapter(database),
});
