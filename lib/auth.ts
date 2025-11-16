import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan password harus diisi")
        }

        // ==== LOGIN CHECK (ganti dengan query ke DB-mu) ====
        const user = {
          id: "1",
          name: "Administrator",
          email: "admin@example.com",
          username: credentials.username,
          role: "admin",
        }

        // LOGIN INVALID
        if (credentials.password !== "admin123") return null

        // RETURN HARUS SESUAI TIPENYA!
        return user
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.username = token.username as string
      }
      return session
    },
  },
}
