import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const roleInPurchasing = searchParams.get("roleInPurchasing");
    const isVerified = searchParams.get("isVerified");
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (roleInPurchasing && roleInPurchasing !== "ALL") where.roleInPurchasing = roleInPurchasing;
    if (isVerified === "true") where.isVerified = true;
    if (isVerified === "false") where.isVerified = false;

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { jobTitle: { contains: search } },
        { department: { contains: search } },
        { businessEmail: { contains: search } },
        { company: { name: { contains: search } } },
      ];
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
      include: {
        company: { select: { id: true, name: true, industry: true, country: true } },
        assignedOwner: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Contacts GET error:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyId,
      fullName,
      jobTitle,
      department,
      seniorityLevel,
      roleInPurchasing = "INFLUENCER",
      businessEmail,
      businessPhone,
      linkedinUrl,
      preferredChannel = "EMAIL",
      country,
      timezone,
      source = "Manual Entry",
      isVerified = false,
      assignedOwnerId,
      isPrimary = false,
      notes,
      actorName = "User",
    } = body;

    if (!companyId || !fullName || !jobTitle) {
      return NextResponse.json(
        { error: "Company, full name, and job title are required" },
        { status: 400 }
      );
    }

    // If marked primary, unset other contacts as primary for this company
    if (isPrimary) {
      await prisma.contact.updateMany({
        where: { companyId },
        data: { isPrimary: false },
      });
    }

    const contact = await prisma.contact.create({
      data: {
        companyId,
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim(),
        department,
        seniorityLevel,
        roleInPurchasing,
        businessEmail: businessEmail?.trim() || null,
        businessPhone: businessPhone?.trim() || null,
        linkedinUrl,
        preferredChannel,
        country: country || "Sri Lanka",
        timezone: timezone || "Asia/Colombo",
        source,
        isVerified: Boolean(isVerified),
        verifiedAt: isVerified ? new Date() : null,
        assignedOwnerId: assignedOwnerId || null,
        isPrimary: Boolean(isPrimary),
        notes,
      },
      include: { company: { select: { name: true } } },
    });

    await prisma.timelineEvent.create({
      data: {
        companyId,
        contactId: contact.id,
        actorName,
        eventType: "CONTACT_ADDED",
        description: `Contact added: ${contact.fullName} (${contact.jobTitle}) - ${contact.roleInPurchasing}.`,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Contact POST error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
