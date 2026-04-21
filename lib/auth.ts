// lib/auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
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
