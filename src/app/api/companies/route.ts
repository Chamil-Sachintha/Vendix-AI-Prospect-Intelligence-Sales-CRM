import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status");
    const industry = searchParams.get("industry");
    const country = searchParams.get("country");
    const sfaProvider = searchParams.get("sfaProvider");
    const companySize = searchParams.get("companySize");
    const followUpsDue = searchParams.get("followUpsDue");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { industry: { contains: search } },
        { country: { contains: search } },
        { currentSfaProvider: { contains: search } },
        { notes: { contains: search } },
        { contacts: { some: { fullName: { contains: search } } } },
        { contacts: { some: { businessEmail: { contains: search } } } },
      ];
    }

    if (status && status !== "ALL") {
      if (status === "Contacted / Awaiting Response") {
        where.prospectStatus = { in: ["Contacted", "Awaiting Response"] };
      } else if (status.includes(",")) {
        where.prospectStatus = { in: status.split(",").map((s) => s.trim()) };
      } else {
        where.prospectStatus = status;
      }
    }

    if (industry && industry !== "ALL") {
      where.industry = { contains: industry };
    }

    if (country && country !== "ALL") {
      where.country = country;
    }

    if (sfaProvider && sfaProvider !== "ALL") {
      where.OR = [
        { currentSfaProvider: { contains: sfaProvider } },
        { softwareRecords: { some: { productName: { contains: sfaProvider } } } },
      ];
    }

    if (companySize && companySize !== "ALL") {
      where.OR = [
        { sizeCategory: companySize },
        { employeeRange: { contains: companySize } },
      ];
    }

    if (followUpsDue === "true") {
      const now = new Date();
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      where.nextFollowUpDate = { lte: endOfToday };
    }

    const [total, companies] = await Promise.all([
      prisma.company.count({ where }),
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ nextFollowUpDate: "asc" }, { updatedAt: "desc" }],
        include: {
          contacts: {
            orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
          },
          softwareRecords: {
            where: { category: "SFA" },
            take: 1,
          },
          timelineEvents: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      }),
    ]);

    return NextResponse.json({
      companies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Companies GET error:", error);
    return NextResponse.json({ error: "Failed to fetch prospects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    const existing = await prisma.company.findFirst({
      where: { name: { equals: body.name.trim() } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A prospect with this company name already exists in the database." },
        { status: 409 }
      );
    }

    const {
      name,
      website,
      logoUrl,
      industry = "FMCG & Retail",
      country = "Sri Lanka",
      companySize,
      currentSfaProvider,
      currentSfaStatus = "Confirmed",
      sfaSourceUrl,
      prospectStatus = "New",
      lastContactedAt,
      nextFollowUpDate,
      notes,
      decisionMakerName,
      decisionMakerJobTitle,
      contactEmail,
      contactPhone,
      linkedinUrl,
      actorName = "User",
    } = body;

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        website: website?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
        industry: industry || "FMCG & Retail",
        country: country || "Sri Lanka",
        employeeRange: companySize || null,
        sizeCategory: companySize || "MEDIUM",
        currentSfaProvider: currentSfaProvider?.trim() || null,
        currentSfaStatus: currentSfaStatus || "Confirmed",
        sfaSourceUrl: sfaSourceUrl?.trim() || null,
        prospectStatus: prospectStatus || "New",
        lastContactedAt: lastContactedAt ? new Date(lastContactedAt) : null,
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
        notes: notes?.trim() || null,
        source: "Manual Entry",
        lastVerifiedDate: new Date(),
      },
    });

    // If decision maker provided, create contact
    if (decisionMakerName && decisionMakerName.trim()) {
      await prisma.contact.create({
        data: {
          companyId: company.id,
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

    // If SFA provider provided, also create software record for backward compatibility
    if (currentSfaProvider && currentSfaProvider.trim()) {
      await prisma.softwareRecord.create({
        data: {
          companyId: company.id,
          category: "SFA",
          productName: currentSfaProvider.trim(),
          vendorName: currentSfaProvider.trim(),
          status: "CURRENTLY_USING",
          confidence: currentSfaStatus === "Confirmed" ? "CONFIRMED" : "UNVERIFIED",
          evidenceUrl: sfaSourceUrl?.trim() || null,
        },
      });
    }

    // Audit log
    await prisma.timelineEvent.create({
      data: {
        companyId: company.id,
        actorName,
        eventType: "PROSPECT_CREATED",
        description: `Prospect "${company.name}" created with status "${company.prospectStatus}".`,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("Company POST error:", error);
    return NextResponse.json({ error: "Failed to create prospect" }, { status: 500 });
  }
}
