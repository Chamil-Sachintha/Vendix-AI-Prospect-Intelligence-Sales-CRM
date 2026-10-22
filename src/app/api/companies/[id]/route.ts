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
        assignedOwner: { select: { id: true, name: true, email: true, avatar: true } },
        contacts: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
        },
        softwareRecords: {
          orderBy: { createdAt: "desc" },
        },
        intentSignals: {
          orderBy: { dateObserved: "desc" },
        },
        qualification: true,
        opportunities: {
          include: {
            stage: true,
            primaryContact: { select: { id: true, fullName: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        outreachActivities: {
          include: {
            contact: { select: { id: true, fullName: true } },
            owner: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        tasks: {
          include: {
            assignedOwner: { select: { id: true, name: true } },
            contact: { select: { id: true, fullName: true } },
          },
          orderBy: [{ isCompleted: "asc" }, { dueDate: "asc" }],
        },
        timelineEvents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Company detail GET error:", error);
    return NextResponse.json({ error: "Failed to load company" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
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
      yearEstablished,
      description,
      parentCompany,
      subsidiaries,
      slraMember,
      source,
      assignedOwnerId,
      employeeCount,
      employeeRange,
      annualRevenue,
      revenueRange,
      branchesCount,
      distributorsCount,
      fieldSalesRepsCount,
      countriesServed,
      distributionModel,
      mainProducts,
      customerSegments,
      geographicCoverage,
      businessMaturity,
      sizeCategory,
      isEstimated,
      estimatesSource,
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
      actorName = "User",
    } = body;

    const updated = await prisma.company.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
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
        yearEstablished: yearEstablished ? parseInt(yearEstablished, 10) : undefined,
        description,
        parentCompany,
        subsidiaries,
        slraMember: slraMember !== undefined ? Boolean(slraMember) : undefined,
        source,
        lastVerifiedDate: new Date(),
        assignedOwnerId: assignedOwnerId !== undefined ? (assignedOwnerId || null) : undefined,
        employeeCount: employeeCount ? parseInt(employeeCount, 10) : undefined,
        employeeRange,
        annualRevenue: annualRevenue ? parseFloat(annualRevenue) : undefined,
        revenueRange,
        branchesCount: branchesCount ? parseInt(branchesCount, 10) : undefined,
        distributorsCount: distributorsCount ? parseInt(distributorsCount, 10) : undefined,
        fieldSalesRepsCount: fieldSalesRepsCount ? parseInt(fieldSalesRepsCount, 10) : undefined,
        countriesServed: countriesServed ? parseInt(countriesServed, 10) : undefined,
        distributionModel,
        mainProducts,
        customerSegments,
        geographicCoverage,
        businessMaturity,
        sizeCategory,
        isEstimated: isEstimated !== undefined ? Boolean(isEstimated) : undefined,
        estimatesSource,
        estimatesVerifiedAt: isEstimated ? new Date() : undefined,
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
      },
    });

    await prisma.timelineEvent.create({
      data: {
        companyId: id,
        actorName,
        eventType: "COMPANY_UPDATED",
        description: `Company details updated. Status: ${updated.qualificationStatus}.`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Company PUT error:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
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
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    await prisma.company.delete({ where: { id } });

    return NextResponse.json({ success: true, message: `Company ${company.name} deleted successfully.` });
  } catch (error) {
    console.error("Company DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 });
  }
}
