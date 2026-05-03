import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    // Credentials (email + password) login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.warn("Auth attempt missing credentials");
          throw new Error("Please enter your email and password");
        }

        console.log(`Attempting login for: ${credentials.email}`);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          console.warn(`User not found: ${credentials.email}`);
          throw new Error("No account found with this email");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValid) {
          console.warn(`Invalid password for: ${credentials.email}`);
          throw new Error("Invalid password");
        }

        console.log(`Login successful for: ${credentials.email}`);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    // Google OAuth (only if credentials are provided)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // signUp: "/auth/signup", // custom sign-up page
  },
  secret: process.env.NEXTAUTH_SECRET,
};
