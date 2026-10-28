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

    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { industry: { contains: search, mode: "insensitive" } },
          { country: { contains: search, mode: "insensitive" } },
          { currentSfaProvider: { contains: search, mode: "insensitive" } },
          { notes: { contains: search, mode: "insensitive" } },
          { contacts: { some: { fullName: { contains: search, mode: "insensitive" } } } },
          { contacts: { some: { businessEmail: { contains: search, mode: "insensitive" } } } },
        ],
      });
    }

    if (status && status !== "ALL") {
      if (status === "Contacted / Awaiting Response") {
        andConditions.push({ prospectStatus: { in: ["Contacted", "Awaiting Response"] } });
      } else if (status.includes(",")) {
        andConditions.push({ prospectStatus: { in: status.split(",").map((s) => s.trim()) } });
      } else {
        andConditions.push({ prospectStatus: status });
      }
    }

    if (industry && industry !== "ALL") {
      const keywords = industry.split("|").map((k) => k.trim()).filter(Boolean);
      andConditions.push({
        OR: keywords.map((kw) => ({ industry: { contains: kw, mode: "insensitive" } })),
      });
    }

    if (country && country !== "ALL") {
      andConditions.push({ country: { equals: country, mode: "insensitive" } });
    }

    if (sfaProvider && sfaProvider !== "ALL") {
      if (sfaProvider === "NONE_OR_UNKNOWN") {
        andConditions.push({
          OR: [
            { currentSfaProvider: null },
            { currentSfaProvider: "" },
            { currentSfaProvider: { contains: "Unknown", mode: "insensitive" } },
          ],
        });
      } else {
        const sfaKeywords = sfaProvider.split("|").map((k) => k.trim()).filter(Boolean);
        andConditions.push({
          OR: sfaKeywords.flatMap((kw) => [
            { currentSfaProvider: { contains: kw, mode: "insensitive" } },
            { softwareRecords: { some: { productName: { contains: kw, mode: "insensitive" } } } },
          ]),
        });
      }
    }

    if (companySize && companySize !== "ALL") {
      andConditions.push({
        OR: [
          { sizeCategory: { contains: companySize, mode: "insensitive" } },
          { employeeRange: { contains: companySize, mode: "insensitive" } },
        ],
      });
    }

    if (followUpsDue === "true") {
      const now = new Date();
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      andConditions.push({ nextFollowUpDate: { lte: endOfToday } });
    }

    const where: any = andConditions.length > 0 ? { AND: andConditions } : {};

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
      companyPhone,
      companyEmail,
      companyLinkedinUrl,
      hqAddress,
      companyAddress,
      industry = "FMCG & Retail",
      country = "Sri Lanka",
      companySize,
      employeeRange,
      currentSfaProvider,
      currentSfaStatus = "Confirmed",
      sfaSourceUrl,
      prospectStatus = "New",
      lastContactedAt,
      nextFollowUpDate,
      notes,
      contacts,
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
        companyPhone: companyPhone?.trim() || null,
        companyEmail: companyEmail?.trim() || null,
        linkedinUrl: (companyLinkedinUrl || (!decisionMakerName ? linkedinUrl : null))?.trim() || null,
        hqAddress: (hqAddress || companyAddress)?.trim() || null,
        industry: industry || "FMCG & Retail",
        country: country || "Sri Lanka",
        employeeRange: employeeRange || companySize || null,
        sizeCategory: companySize || employeeRange || "MEDIUM",
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

    // If decision makers provided as an array, create contacts
    if (Array.isArray(contacts) && contacts.length > 0) {
      const validContacts = contacts.filter((c: any) => c.fullName && c.fullName.trim());
      const hasPrimary = validContacts.some((c: any) => Boolean(c.isPrimary));

      for (let i = 0; i < validContacts.length; i++) {
        const c = validContacts[i];
        await prisma.contact.create({
          data: {
            companyId: company.id,
            fullName: c.fullName.trim(),
            jobTitle: c.jobTitle?.trim() || "Decision-Maker",
            avatarUrl: c.avatarUrl?.trim() || null,
            businessEmail: c.businessEmail?.trim() || null,
            businessPhone: c.businessPhone?.trim() || null,
            linkedinUrl: c.linkedinUrl?.trim() || null,
            isPrimary: hasPrimary ? Boolean(c.isPrimary) : i === 0,
            isVerified: true,
          },
        });
      }
    } else if (decisionMakerName && decisionMakerName.trim()) {
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

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("Company POST error:", error);
    return NextResponse.json({ error: "Failed to create prospect" }, { status: 500 });
  }
}
