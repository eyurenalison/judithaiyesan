import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase();
}

async function isValidAdminPassword(password: string) {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!passwordHash) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}

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
        const adminEmail = getAdminEmail();
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!adminEmail || email !== adminEmail || !password) {
          return null;
        }

        const isValidPassword = await isValidAdminPassword(password);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: "admin",
          email: adminEmail,
          name: "Administrator",
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
