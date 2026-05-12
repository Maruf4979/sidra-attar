import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { insforge } from "@/app/lib/insforge";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    // Synchronize with InsForge Authentication and Database
    try {
      const { data: insData, error: insforgeError } = await insforge.auth.signUp({
        email,
        password, // Raw password for InsForge to hash
        name,
      });

      if (insforgeError) {
        console.error("InsForge registration error:", insforgeError);
      } else if (insData?.user) {
        console.log("InsForge registration successful for:", email);
        
        // Create a record in the customers table in InsForge
        const firstName = name?.split(' ')[0] || 'User';
        const lastName = name?.split(' ').slice(1).join(' ') || '';
        
        const { error: customerError } = await insforge.database
          .from('customers')
          .insert({
            user_id: insData.user.id,
            first_name: firstName,
            last_name: lastName,
            // phone and address can be updated later
          });

        if (customerError) {
          console.error("InsForge customer creation error:", customerError);
        } else {
          console.log("InsForge customer record created for:", email);
        }
      }
      
      // Auto-confirm user email in InsForge
      try {
        const { error: confirmError } = await (insforge.database as any).rpc('confirm_user_email', { 
          user_email: email 
        });
        if (confirmError) console.error("InsForge confirm error:", confirmError);
        else console.log("InsForge email auto-verified for:", email);
      } catch (confirmErr) {
        console.error("Failed to auto-verify email:", confirmErr);
      }
    } catch (err) {
      console.error("Failed to sync with InsForge:", err);
    }

    console.log("Registration successful for:", email);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      { error: "Something went wrong during registration. Please try again." },
      { status: 500 }
    );
  }
}
