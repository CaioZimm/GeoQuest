import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import NextAuth, { NextAuthOptions } from "next-auth";
import jwt from "jsonwebtoken";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
            headers: { "Content-Type": "application/json" }
          });

          const user = await res.json();
          if (res.ok && user) {
            return user;
          }
          return null;
        } catch {
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {
    encode: ({ secret, token }) => {
      const encodedToken = jwt.sign(token!, secret as string, { algorithm: "HS256" });
      return encodedToken;
    },
    decode: async ({ secret, token }) => {
      if (!token) return null;
      try {
        const decodedToken = jwt.verify(token, secret as string) as Record<string, unknown>;
        return decodedToken;
      } catch (error) {
        return null;
      }
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Sync google user to our database
        try {
          const res = await fetch(`${API_URL}/api/auth/google`, {
            method: 'POST',
            body: JSON.stringify({
              email: user.email,
              name: user.name,
            }),
            headers: { "Content-Type": "application/json" }
          });

          const dbUser = await res.json();
          if (res.ok && dbUser) {
            user.id = dbUser.id;
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
      }

      // Update session when user updates profile
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      // Put the token on the session so the frontend can send it to FastAPI
      const secret = process.env.NEXTAUTH_SECRET || "super-secret-key-123";
      console.log("[NextAuth] Generating JWT with secret ending in:", secret.slice(-4));
      const signedToken = jwt.sign(token, secret, { algorithm: "HS256" });
      (session as unknown as Record<string, unknown>).token = signedToken;
      return session;
    }
  },
  pages: {
    signIn: '/', // The auth modal is on the main page
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };