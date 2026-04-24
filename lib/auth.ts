// lib/auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret:
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET ??
    "pEgGUKfLh50mDxdSu+guhKj7hfYOlRroZzHD1QqKvTE=",
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "PLACEHOLDER",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "PLACEHOLDER",
    }),
    // Email magic link via Resend — requires RESEND_API_KEY in env
    ...(process.env.RESEND_API_KEY
      ? [Resend({ from: "AI Signal <noreply@ai-signal.app>" })]
      : []),
  ],
  callbacks: {
    async session({ session, token }) {
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
      token["plan"] = token["plan"] ?? "free";
      return token;
    },
  },
});
