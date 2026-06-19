import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getPrisma } from "./app/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const adminUser = await getPrisma().adminUser.findUnique({
          where: { email },
        });

        if (!adminUser?.active) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          password,
          adminUser.passwordHash,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = "admin";
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role === "admin" ? "admin" : undefined;
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
