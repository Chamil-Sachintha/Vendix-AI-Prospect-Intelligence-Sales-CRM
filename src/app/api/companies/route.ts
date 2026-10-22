import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateCompanyIntentScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const industry = searchParams.get("industry");
    const country = searchParams.get("country");
    const intentLevel = searchParams.get("intentLevel");
    const qualificationStatus = searchParams.get("qualificationStatus");
    const slraMember = searchParams.get("slraMember");
    const competitor = searchParams.get("competitor");
    const ownerId = searchParams.get("ownerId");
    const isInternational = searchParams.get("isInternational");
    const hasCompetitorSfa = searchParams.get("hasCompetitorSfa");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { tradingName: { contains: search } },
        { city: { contains: search } },
        { mainProducts: { contains: search } },
        { operationalChallenges: { contains: search } },
      ];
    }

    if (industry && industry !== "ALL") where.industry = { contains: industry };
    if (country && country !== "ALL") where.country = country;
    if (intentLevel && intentLevel !== "ALL") where.intentLevel = intentLevel;
    if (qualificationStatus && qualificationStatus !== "ALL") {
      where.qualificationStatus = qualificationStatus;
    }
    if (slraMember === "true") where.slraMember = true;
    if (isInternational === "true") where.country = { not: "Sri Lanka" };
    if (ownerId && ownerId !== "ALL") where.assignedOwnerId = ownerId;

    if (competitor && competitor !== "ALL") {
      where.softwareRecords = {
        some: {
          category: "SFA",
          OR: [
            { productName: { contains: competitor } },
            { vendorName: { contains: competitor } },
          ],
        },
      };
    } else if (hasCompetitorSfa === "true") {
      where.softwareRecords = {
        some: {
          category: "SFA",
          status: { in: ["CURRENTLY_USING", "EVALUATING", "REPLACING"] },
        },
      };
    }

    const [total, companies] = await Promise.all([
      prisma.company.count({ where }),
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ intentScore: "desc" }, { updatedAt: "desc" }],
        include: {
          assignedOwner: { select: { id: true, name: true, email: true, avatar: true } },
          contacts: {
            where: { isPrimary: true },
            select: { id: true, fullName: true, jobTitle: true, businessEmail: true, businessPhone: true, isVerified: true },
          },
          softwareRecords: {
            select: { id: true, category: true, productName: true, vendorName: true, status: true, confidence: true },
          },
          opportunities: {
            select: { id: true, name: true, estimatedAcv: true, currency: true, stage: { select: { name: true, color: true } } },
          },
          _count: {
            select: { contacts: true, softwareRecords: true, intentSignals: true, opportunities: true },
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
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    // Check for duplicate company
    const existing = await prisma.company.findFirst({
      where: { name: { equals: body.name.trim() } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A company with this name already exists in the database." },
        { status: 409 }
      );
    }

    const {
      name,
      tradingName,
      registrationNo,
      website,
      linkedinUrl,
      industry = "FMCG & Retail",
      subIndustry,
      country = "Sri Lanka",
      city,
      operatingRegions,
      hqAddress,
      yearEstablished,
      description,
      parentCompany,
      subsidiaries,
      slraMember = false,
      source = "Manual Research",
      assignedOwnerId,
      employeeCount,
      employeeRange,
      annualRevenue,
      revenueRange,
      branchesCount,
      distributorsCount,
      fieldSalesRepsCount,
      countriesServed = 1,
      distributionModel,
      mainProducts,
      customerSegments,
      geographicCoverage,
      businessMaturity = "ESTABLISHED",
      sizeCategory = "MEDIUM",
      isEstimated = false,
      estimatesSource,
      hasFieldSalesTeam = "Yes",
      sellsThroughDistributors = "Yes",
      regularRetailVisits = "Yes",
      vanSalesOrPreSales = "Pre-Sales",
      managesTerritoriesRoutes = "Yes",
      orderTakingInField = "Yes",
      managesCollectionsCash = "Yes",
      distributesPhysicalProducts = "Yes",
      requiresOfflineMobile = "Yes",
      usesExistingSoftware = "Yes",
      operationalChallenges,
      sfaComplexity = "MEDIUM",
      qualificationStatus = "RESEARCHING",
      actorName = "User",
    } = body;

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        tradingName,
        registrationNo,
        website,
        linkedinUrl,
        industry,
        subIndustry,
        country,
        city,
        operatingRegions,
        hqAddress,
        yearEstablished: yearEstablished ? parseInt(yearEstablished, 10) : null,
        description,
        parentCompany,
        subsidiaries,
        slraMember: Boolean(slraMember),
        source,
        lastVerifiedDate: new Date(),
        assignedOwnerId: assignedOwnerId || null,
        employeeCount: employeeCount ? parseInt(employeeCount, 10) : null,
        employeeRange,
        annualRevenue: annualRevenue ? parseFloat(annualRevenue) : null,
        revenueRange,
        branchesCount: branchesCount ? parseInt(branchesCount, 10) : null,
        distributorsCount: distributorsCount ? parseInt(distributorsCount, 10) : null,
        fieldSalesRepsCount: fieldSalesRepsCount ? parseInt(fieldSalesRepsCount, 10) : null,
        countriesServed: countriesServed ? parseInt(countriesServed, 10) : 1,
        distributionModel,
        mainProducts,
        customerSegments,
        geographicCoverage,
        businessMaturity,
        sizeCategory,
        isEstimated: Boolean(isEstimated),
        estimatesSource,
        estimatesVerifiedAt: isEstimated ? new Date() : null,
        hasFieldSalesTeam,
        sellsThroughDistributors,
        regularRetailVisits,
        vanSalesOrPreSales,
        managesTerritoriesRoutes,
        orderTakingInField,
        managesCollectionsCash,
        distributesPhysicalProducts,
        requiresOfflineMobile,
        usesExistingSoftware,
        operationalChallenges,
        sfaComplexity,
        qualificationStatus,
        intentScore: 0,
        intentLevel: "LOW",
        qualification: {
          create: {
            industryFit: "High",
            companySizeFit: sizeCategory === "ENTERPRISE" ? "High" : "Medium",
            fieldSalesFit: hasFieldSalesTeam === "Yes" ? "High" : "Medium",
            techMaturity: usesExistingSoftware === "Yes" ? "High" : "Medium",
            painPoint: operationalChallenges,
            budgetStatus: "POSSIBLE",
            potentialUsers: fieldSalesRepsCount ? parseInt(fieldSalesRepsCount, 10) : null,
          },
        },
      },
    });

    // Create audit timeline event
    await prisma.timelineEvent.create({
      data: {
        companyId: company.id,
        actorName,
        eventType: "COMPANY_CREATED",
        description: `Company ${company.name} created.`,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("Company POST error:", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}
