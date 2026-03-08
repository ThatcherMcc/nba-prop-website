/**
 * Minimal NextAuth config for Edge Runtime (middleware).
 *
 * This file must NOT import any Node.js-only modules (drizzle, pg, dotenv, etc.).
 * The full config in auth.ts (with DrizzleAdapter) is used everywhere else.
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth }) {
      // Only used by the middleware wrapper — actual route protection
      // logic lives in src/middleware.ts.
      return !!auth;
    },
  },
};
