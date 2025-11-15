import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db"; // Sesuaikan dengan path db Anda
import { users } from "@/lib/db/schema"; // Sesuaikan dengan schema Anda
import { eq } from "drizzle-orm";

/**
 * Module augmentation to extend NextAuth types so session.user.username is available.
 */
declare module "next-auth" {
  interface Session {
    users: {
      id: string;
      username: string;
      role: string;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    id: string;
    username: string;
    role: string;
    name?: string | null;
    email?: string | null;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan password harus diisi");
        }

        // Cari user di database
        const user = await db
          .select()
          .from(users)
          .where(eq(users.username, credentials.username))
          .limit(1);

        if (!user || user.length === 0) {
          throw new Error("Username atau password salah");
        }

        const foundUser = user[0];

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          foundUser.password
        );

        if (!isPasswordValid) {
          throw new Error("Username atau password salah");
        }

        // Return user data
        return {
          id: foundUser.id.toString(),
          name: foundUser.nama,
          username: foundUser.username,
          role: foundUser.role,
        };
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
    if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session.user as any).username = token.username as string;
    }
    return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };