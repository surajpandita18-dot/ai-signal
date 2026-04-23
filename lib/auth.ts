// lib/auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // secret: env var in production; hardcoded fallback for local dev (no .env.local needed)
  // To override: set NEXTAUTH_SECRET or AUTH_SECRET in .env.local
  secret:
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET ??
    "pEgGUKfLh50mDxdSu+guhKj7hfYOlRroZzHD1QqKvTE=",
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "PLACEHOLDER",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "PLACEHOLDER",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Store plan in session. Default: "free".
      // After real Stripe integration, look up DB. For MVP: always "free".
      return {
        ...session,
        user: {
          ...session.user,
          plan: (token["plan"] as string) ?? "free",
          githubId: token.sub,
        },
      };
    },
    async jwt({ token }) {
      // plan lives here until we have a DB
      token["plan"] = token["plan"] ?? "free";
      return token;
    },
  },
});
