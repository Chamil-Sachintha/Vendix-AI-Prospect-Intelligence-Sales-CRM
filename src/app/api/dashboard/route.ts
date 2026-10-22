import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry");
    const country = searchParams.get("country");
    const ownerId = searchParams.get("ownerId");
    const competitor = searchParams.get("competitor");
    const stageId = searchParams.get("stageId");

    // Build company filter
    const companyWhere: any = {};
    if (industry && industry !== "ALL") companyWhere.industry = { contains: industry };
    if (country && country !== "ALL") companyWhere.country = country;
    if (ownerId && ownerId !== "ALL") companyWhere.assignedOwnerId = ownerId;
    if (competitor && competitor !== "ALL") {
      companyWhere.softwareRecords = {
        some: {
          category: "SFA",
          OR: [
            { productName: { contains: competitor } },
            { vendorName: { contains: competitor } },
          ],
        },
      };
    }

    // 1. Core KPIs
    const totalCompanies = await prisma.company.count({ where: companyWhere });

    const qualifiedProspects = await prisma.company.count({
      where: { ...companyWhere, qualificationStatus: "QUALIFIED" },
    });

    const competitorSfaProspects = await prisma.company.count({
      where: {
        ...companyWhere,
        softwareRecords: {
          some: {
            category: "SFA",
            status: { in: ["CURRENTLY_USING", "EVALUATING", "REPLACING"] },
          },
        },
      },
    });

    const highIntentProspects = await prisma.company.count({
      where: { ...companyWhere, intentLevel: "HIGH" },
    });

    // Outreach KPIs
    const outreachWhere: any = {};
    if (ownerId && ownerId !== "ALL") outreachWhere.ownerId = ownerId;

    const contactsReached = await prisma.outreachActivity.count({
      where: outreachWhere,
    });

    const positiveResponses = await prisma.outreachActivity.count({
      where: { ...outreachWhere, outreachStatus: "POSITIVE_RESPONSE" },
    });

    const meetingsBooked = await prisma.outreachActivity.count({
      where: { ...outreachWhere, outreachStatus: "MEETING_BOOKED" },
    });

    // Opportunities & Pipeline KPIs
    const oppWhere: any = {};
    if (ownerId && ownerId !== "ALL") oppWhere.ownerId = ownerId;
    if (stageId && stageId !== "ALL") oppWhere.stageId = stageId;

    const allOpportunities = await prisma.opportunity.findMany({
      where: oppWhere,
      include: { stage: true },
    });

    const demosCompleted = allOpportunities.filter((o) =>
      ["Demo Completed", "Proposal Sent", "Negotiation", "Won"].includes(o.stage.name)
    ).length;

    const openOpportunities = allOpportunities.filter(
      (o) => !o.stage.isWon && !o.stage.isLost
    ).length;

    const dealsWon = allOpportunities.filter((o) => o.stage.isWon).length;

    // Currency grouped pipeline value
    const pipelineByCurrency: Record<string, { total: number; weighted: number }> = {};
    for (const opp of allOpportunities) {
      if (!opp.stage.isLost) {
        const curr = opp.currency || "LKR";
        if (!pipelineByCurrency[curr]) {
          pipelineByCurrency[curr] = { total: 0, weighted: 0 };
        }
        pipelineByCurrency[curr].total += opp.estimatedAcv || 0;
        pipelineByCurrency[curr].weighted +=
          ((opp.estimatedAcv || 0) * (opp.probability || 0)) / 100;
      }
    }

    // 2. Charts Data
    // A. Pipeline by stage
    const stages = await prisma.pipelineStage.findMany({
      orderBy: { order: "asc" },
      include: {
        opportunities: {
          select: { id: true, estimatedAcv: true, currency: true },
        },
      },
    });

    const pipelineByStage = stages.map((s) => ({
      stageId: s.id,
      name: s.name,
      color: s.color,
      count: s.opportunities.length,
      isWon: s.isWon,
      isLost: s.isLost,
    }));

    // B. Prospects by industry
    const companies = await prisma.company.findMany({
      where: companyWhere,
      select: {
        id: true,
        industry: true,
        country: true,
        sizeCategory: true,
        intentLevel: true,
      },
    });

    const industryMap: Record<string, number> = {};
    const countryMap: Record<string, number> = {};
    const sizeMap: Record<string, number> = {};
    const intentMap: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };

    for (const c of companies) {
      industryMap[c.industry] = (industryMap[c.industry] || 0) + 1;
      countryMap[c.country] = (countryMap[c.country] || 0) + 1;
      sizeMap[c.sizeCategory] = (sizeMap[c.sizeCategory] || 0) + 1;
      if (intentMap[c.intentLevel] !== undefined) {
        intentMap[c.intentLevel]++;
      }
    }

    const prospectsByIndustry = Object.entries(industryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const prospectsByCountry = Object.entries(countryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const prospectsBySize = Object.entries(sizeMap).map(([name, count]) => ({
      name,
      count,
    }));

    const buyingIntentDistribution = [
      { name: "High Intent (>=65)", count: intentMap.HIGH, color: "#10B981" },
      { name: "Medium Intent (35-64)", count: intentMap.MEDIUM, color: "#F59E0B" },
      { name: "Low Intent (<35)", count: intentMap.LOW, color: "#64748B" },
    ];

    // C. Current SFA Vendors Market Share
    const sfaSoftwareRecords = await prisma.softwareRecord.findMany({
      where: {
        category: "SFA",
        status: { in: ["CURRENTLY_USING", "EVALUATING", "REPLACING"] },
      },
      select: {
        productName: true,
        vendorName: true,
      },
    });

    const vendorMap: Record<string, number> = {};
    for (const rec of sfaSoftwareRecords) {
      const label = rec.productName || rec.vendorName;
      vendorMap[label] = (vendorMap[label] || 0) + 1;
    }

    const sfaVendorsShare = Object.entries(vendorMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 3. Upcoming Follow-ups and Overdue Tasks
    const now = new Date();
    const tasks = await prisma.taskFollowUp.findMany({
      where: {
        isCompleted: false,
        ...(ownerId && ownerId !== "ALL" ? { assignedOwnerId: ownerId } : {}),
      },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, fullName: true, jobTitle: true } },
        opportunity: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    });

    const overdueCount = await prisma.taskFollowUp.count({
      where: {
        isCompleted: false,
        dueDate: { lt: now },
        ...(ownerId && ownerId !== "ALL" ? { assignedOwnerId: ownerId } : {}),
      },
    });

    // 4. Recent Activity Timeline
    const recentTimeline = await prisma.timelineEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, fullName: true } },
        opportunity: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      kpis: {
        totalCompanies,
        qualifiedProspects,
        competitorSfaProspects,
        highIntentProspects,
        contactsReached,
        positiveResponses,
        meetingsBooked,
        demosCompleted,
        openOpportunities,
        dealsWon,
        pipelineByCurrency,
        overdueTasksCount: overdueCount,
      },
      charts: {
        pipelineByStage,
        prospectsByIndustry,
        prospectsByCountry,
        sfaVendorsShare,
        prospectsBySize,
        buyingIntentDistribution,
      },
      tasks,
      recentTimeline,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
