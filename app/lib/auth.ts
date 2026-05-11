import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import { insforge } from "@/app/lib/insforge";
import bcrypt from "bcryptjs";
import crypto from "crypto";


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
  events: {
    async signIn({ user, account }) {
      if (!user.email) return;

      console.log(`Syncing user to InsForge: ${user.email}`);
      
      try {
        // 1. Check if user exists in InsForge Auth
        const { data: existingInsUser } = await insforge.auth.getUserByEmail(user.email);
        
        let insUserId: string;

        if (!existingInsUser) {
          // Create new InsForge Auth user for Google/OAuth signups
          // Generate a random password for shadow account
          const randomPassword = crypto.randomBytes(16).toString('hex');
          const { data: newUser, error: signUpError } = await insforge.auth.signUp({
            email: user.email,
            password: randomPassword,
            name: user.name || '',
          });

          if (signUpError) {
            console.error("InsForge auto-signup error:", signUpError);
            return;
          }
          insUserId = newUser!.user!.id;
        } else {
          insUserId = existingInsUser.id;
        }

        // 2. Ensure customer record exists in InsForge DB
        const { data: customer } = await insforge.database
          .from('customers')
          .select('id')
          .eq('user_id', insUserId)
          .maybeSingle();

        if (!customer) {
          const firstName = user.name?.split(' ')[0] || 'User';
          const lastName = user.name?.split(' ').slice(1).join(' ') || '';
          
          await insforge.database
            .from('customers')
            .insert({
              user_id: insUserId,
              first_name: firstName,
              last_name: lastName,
            });
          console.log("InsForge customer record created for OAuth user");
        }
      } catch (err) {
        console.error("InsForge sync event error:", err);
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
