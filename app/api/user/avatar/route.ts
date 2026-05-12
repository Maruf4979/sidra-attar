import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { insforgeAdmin } from "@/app/lib/insforge";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Upload to InsForge Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `${(session.user as any).id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data: storageData, error: storageError } = await insforgeAdmin.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (storageError) {
      console.error("Storage upload error:", storageError);
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

    // Get public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_INSFORGE_URL}/api/storage/buckets/avatars/objects/${filePath}`;

    // 2. Update Prisma User
    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: publicUrl }
    });

    // 3. Update InsForge Customer table
    await insforgeAdmin.database
      .from('customers')
      .update({ avatar_url: publicUrl })
      .eq('email', session.user.email);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
