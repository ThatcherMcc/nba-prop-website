import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  authUsers,
  authAccounts,
  authSessions,
  authVerificationTokens,
} from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: authUsers,
    accountsTable: authAccounts,
    sessionsTable: authSessions,
    verificationTokensTable: authVerificationTokens,
  }),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;

      // Re-query subscription tier from DB so webhook updates are reflected immediately
      const [freshUser] = await db
        .select({
          subscriptionTier: authUsers.subscriptionTier,
          subscriptionStatus: authUsers.subscriptionStatus,
        })
        .from(authUsers)
        .where(eq(authUsers.id, user.id))
        .limit(1);

      if (freshUser) {
        session.user.subscriptionTier = freshUser.subscriptionTier;
        session.user.subscriptionStatus = freshUser.subscriptionStatus ?? undefined;
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
});
