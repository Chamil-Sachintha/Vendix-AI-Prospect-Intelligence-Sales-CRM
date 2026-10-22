import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        contacts: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
        },
        softwareRecords: {
          orderBy: { createdAt: "desc" },
        },
        timelineEvents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Company detail GET error:", error);
    return NextResponse.json({ error: "Failed to load prospect" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.company.findUnique({
      where: { id },
      include: { contacts: { where: { isPrimary: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    const {
      name,
      website,
      industry,
      country,
      companySize,
      currentSfaProvider,
      currentSfaStatus,
      sfaSourceUrl,
      prospectStatus,
      lastContactedAt,
      nextFollowUpDate,
      notes,
      newDatedNote,
      decisionMakerName,
      decisionMakerJobTitle,
      contactEmail,
      contactPhone,
      linkedinUrl,
      actorName = "User",
    } = body;

    const updated = await prisma.company.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        website: website !== undefined ? (website?.trim() || null) : undefined,
        industry: industry || undefined,
        country: country || undefined,
        employeeRange: companySize !== undefined ? companySize : undefined,
        sizeCategory: companySize !== undefined ? companySize : undefined,
        currentSfaProvider: currentSfaProvider !== undefined ? currentSfaProvider : undefined,
        currentSfaStatus: currentSfaStatus !== undefined ? currentSfaStatus : undefined,
        sfaSourceUrl: sfaSourceUrl !== undefined ? sfaSourceUrl : undefined,
        prospectStatus: prospectStatus || undefined,
        lastContactedAt: lastContactedAt !== undefined ? (lastContactedAt ? new Date(lastContactedAt) : null) : undefined,
        nextFollowUpDate: nextFollowUpDate !== undefined ? (nextFollowUpDate ? new Date(nextFollowUpDate) : null) : undefined,
        notes: notes !== undefined ? (notes?.trim() || null) : undefined,
        lastVerifiedDate: new Date(),
      },
    });

    // Handle primary contact update/creation if fields provided
    if (decisionMakerName !== undefined) {
      const primaryContact = existing.contacts?.[0];
      if (primaryContact) {
        await prisma.contact.update({
          where: { id: primaryContact.id },
          data: {
            fullName: decisionMakerName ? decisionMakerName.trim() : primaryContact.fullName,
            jobTitle: decisionMakerJobTitle !== undefined ? decisionMakerJobTitle?.trim() : primaryContact.jobTitle,
            businessEmail: contactEmail !== undefined ? (contactEmail?.trim() || null) : primaryContact.businessEmail,
            businessPhone: contactPhone !== undefined ? (contactPhone?.trim() || null) : primaryContact.businessPhone,
            linkedinUrl: linkedinUrl !== undefined ? (linkedinUrl?.trim() || null) : primaryContact.linkedinUrl,
          },
        });
      } else if (decisionMakerName && decisionMakerName.trim()) {
        await prisma.contact.create({
          data: {
            companyId: id,
            fullName: decisionMakerName.trim(),
            jobTitle: decisionMakerJobTitle?.trim() || "Decision-Maker",
            businessEmail: contactEmail?.trim() || null,
            businessPhone: contactPhone?.trim() || null,
            linkedinUrl: linkedinUrl?.trim() || null,
            isPrimary: true,
            isVerified: true,
          },
        });
      }
    }

    // Add dated note to timeline if provided
    if (newDatedNote && newDatedNote.trim()) {
      await prisma.timelineEvent.create({
        data: {
          companyId: id,
          actorName,
          eventType: "INTERACTION_NOTE",
          description: newDatedNote.trim(),
        },
      });
    } else if (prospectStatus && prospectStatus !== existing.prospectStatus) {
      await prisma.timelineEvent.create({
        data: {
          companyId: id,
          actorName,
          eventType: "STATUS_CHANGED",
          description: `Status changed from "${existing.prospectStatus}" to "${prospectStatus}".`,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Company PUT error:", error);
    return NextResponse.json({ error: "Failed to update prospect" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await prisma.company.findUnique({ where: { id }, select: { name: true } });

    if (!company) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    await prisma.company.delete({ where: { id } });

    return NextResponse.json({ success: true, message: `Prospect ${company.name} deleted successfully.` });
  } catch (error) {
    console.error("Company DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete prospect" }, { status: 500 });
  }
}
