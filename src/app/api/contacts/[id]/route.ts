import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    if (body.isPrimary && !existing.isPrimary) {
      await prisma.contact.updateMany({
        where: { companyId: existing.companyId },
        data: { isPrimary: false },
      });
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: {
        fullName: body.fullName?.trim() || existing.fullName,
        jobTitle: body.jobTitle?.trim() || existing.jobTitle,
        avatarUrl: body.avatarUrl !== undefined ? (body.avatarUrl?.trim() || null) : existing.avatarUrl,
        department: body.department !== undefined ? body.department : existing.department,
        seniorityLevel: body.seniorityLevel !== undefined ? body.seniorityLevel : existing.seniorityLevel,
        roleInPurchasing: body.roleInPurchasing || existing.roleInPurchasing,
        businessEmail: body.businessEmail !== undefined ? (body.businessEmail?.trim() || null) : existing.businessEmail,
        businessPhone: body.businessPhone !== undefined ? (body.businessPhone?.trim() || null) : existing.businessPhone,
        linkedinUrl: body.linkedinUrl !== undefined ? body.linkedinUrl : existing.linkedinUrl,
        preferredChannel: body.preferredChannel || existing.preferredChannel,
        country: body.country || existing.country,
        isVerified: body.isVerified !== undefined ? Boolean(body.isVerified) : existing.isVerified,
        verifiedAt: body.isVerified ? new Date() : (body.isVerified === false ? null : existing.verifiedAt),
        assignedOwnerId: body.assignedOwnerId !== undefined ? (body.assignedOwnerId || null) : existing.assignedOwnerId,
        isPrimary: body.isPrimary !== undefined ? Boolean(body.isPrimary) : existing.isPrimary,
        notes: body.notes !== undefined ? body.notes : existing.notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Contact PUT error:", error);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.contact.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
