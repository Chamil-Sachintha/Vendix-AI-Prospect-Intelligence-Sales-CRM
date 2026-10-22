import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const stageId = searchParams.get("stageId");
    const currency = searchParams.get("currency");
    const ownerId = searchParams.get("ownerId");

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (stageId && stageId !== "ALL") where.stageId = stageId;
    if (currency && currency !== "ALL") where.currency = currency;
    if (ownerId && ownerId !== "ALL") where.ownerId = ownerId;

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        stage: true,
        company: { select: { id: true, name: true, industry: true, country: true } },
        primaryContact: { select: { id: true, fullName: true, jobTitle: true, businessEmail: true } },
        owner: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error("Opportunities GET error:", error);
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      companyId,
      primaryContactId,
      productInterest = "Vendix Enterprise SFA",
      potentialUsers,
      estimatedAcv = 0,
      currency = "LKR",
      ownerId,
      expectedCloseDate,
      probability = 20,
      stageId,
      painPoints,
      competitorEvaluated,
      nextAction,
      notes,
      actorName = "User",
    } = body;

    if (!name || !companyId || !stageId) {
      return NextResponse.json(
        { error: "Opportunity name, company, and stage are required" },
        { status: 400 }
      );
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        name: name.trim(),
        companyId,
        primaryContactId: primaryContactId || null,
        productInterest,
        potentialUsers: potentialUsers ? parseInt(potentialUsers, 10) : null,
        estimatedAcv: parseFloat(estimatedAcv) || 0,
        currency,
        ownerId: ownerId || null,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        probability: parseInt(probability, 10) || 20,
        stageId,
        painPoints,
        competitorEvaluated,
        nextAction,
        notes,
      },
      include: { stage: true, company: true },
    });

    await prisma.timelineEvent.create({
      data: {
        companyId,
        opportunityId: opportunity.id,
        actorName,
        eventType: "OPPORTUNITY_CREATED",
        description: `Opportunity created: ${opportunity.name} (${opportunity.currency} ${opportunity.estimatedAcv.toLocaleString()}) - ${opportunity.stage.name}.`,
      },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error("Opportunity POST error:", error);
    return NextResponse.json({ error: "Failed to create opportunity" }, { status: 500 });
  }
}
