import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import { insforge, insforgeAdmin } from "@/app/lib/insforge";
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
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // Include emailVerified from the user object (Prisma or provider)
        token.emailVerified = (user as any).emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).emailVerified = token.emailVerified;
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
        // 1. If signing in with Google, mark as verified in both Prisma and InsForge
        if (account?.provider === "google") {
          console.log(`Google OAuth detected for ${user.email}. Marking as verified.`);
          
          // Update local Prisma DB
          await prisma.user.update({
            where: { email: user.email },
            data: { emailVerified: new Date() }
          });

          // Update InsForge Auth status via RPC
          try {
            await (insforgeAdmin.database as any).rpc('confirm_user_email', { 
              user_email: user.email 
            });
          } catch (rpcErr) {
            console.error("InsForge RPC error (confirm_user_email):", rpcErr);
          }
        }

        // 2. Check if customer exists in InsForge DB by email
        const { data: customer } = await insforgeAdmin.database
          .from('customers')
          .select('id, user_id')
          .eq('email', user.email)
          .maybeSingle();
        
        let insUserId: string;

        if (!customer) {
          console.log(`Creating new InsForge user record for: ${user.email}`);
          // Create new InsForge Auth user for Google/OAuth signups
          const randomPassword = crypto.randomBytes(16).toString('hex');
          const { data: newUser, error: signUpError } = await insforgeAdmin.auth.signUp({
            email: user.email,
            password: randomPassword,
            name: user.name || '',
          });

          if (signUpError) {
            console.error("InsForge auto-signup error (possibly exists):", signUpError.message);
            return;
          } else {
            insUserId = newUser!.user!.id;
          }

          const firstName = user.name?.split(' ')[0] || 'User';
          const lastName = user.name?.split(' ').slice(1).join(' ') || '';
          
          await insforgeAdmin.database
            .from('customers')
            .insert({
              user_id: insUserId,
              email: user.email,
              first_name: firstName,
              last_name: lastName,
            });
          console.log("InsForge customer record created for user");
        } else {
          console.log("InsForge customer already exists");
        }
      } catch (err) {
        console.error("InsForge sync event error:", err);
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
