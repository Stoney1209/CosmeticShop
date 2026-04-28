import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { recordLoginAttempt, isIpBlocked, getRecentFailedAttempts } from "./security";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Credenciales incompletas");
        }

        const ipAddress = (credentials as any).ipAddress || "unknown";
        const username = credentials.username;

        // Check if IP is blocked
        if (await isIpBlocked(ipAddress)) {
          throw new Error("Demasiados intentos fallidos. Intenta más tarde.");
        }

        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user || !user.isActive) {
          await recordLoginAttempt(ipAddress, username, false);
          throw new Error("Usuario no encontrado o inactivo");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          await recordLoginAttempt(ipAddress, username, false);
          const recentAttempts = await getRecentFailedAttempts(ipAddress);
          if (recentAttempts > 0) {
            throw new Error(`Contraseña incorrecta. Intentos restantes: ${5 - recentAttempts}`);
          }
          throw new Error("Contraseña incorrecta");
        }

        await recordLoginAttempt(ipAddress, username, true);

        return {
          id: user.id.toString(),
          name: user.fullName,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
