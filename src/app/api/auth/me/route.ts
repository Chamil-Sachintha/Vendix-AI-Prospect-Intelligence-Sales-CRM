import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PERMISSIONS, UserRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedEmail = searchParams.get("email");

    let user;
    if (requestedEmail) {
      user = await prisma.user.findUnique({ where: { email: requestedEmail } });
    }

    if (!user) {
      // Default to the first admin or created user
      user = await prisma.user.findFirst({
        orderBy: { createdAt: "asc" },
      });
    }

    const allUsers = await prisma.user.findMany({
      orderBy: { role: "asc" },
    });

    if (!user) {
      return NextResponse.json({ error: "No users found" }, { status: 404 });
    }

    const role = user.role as UserRole;
    const permissions = PERMISSIONS[role] || PERMISSIONS.BUSINESS_DEVELOPMENT;

    return NextResponse.json({
      user,
      permissions,
      allUsers,
    });
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
