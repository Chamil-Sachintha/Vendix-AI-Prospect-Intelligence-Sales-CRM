import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stages = await prisma.pipelineStage.findMany({
      orderBy: { order: "asc" },
      include: {
        opportunities: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                industry: true,
                country: true,
                intentScore: true,
                intentLevel: true,
              },
            },
            primaryContact: {
              select: {
                id: true,
                fullName: true,
                jobTitle: true,
                businessEmail: true,
                businessPhone: true,
              },
            },
            owner: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    return NextResponse.json(stages);
  } catch (error) {
    console.error("Pipeline GET error:", error);
    return NextResponse.json({ error: "Failed to fetch pipeline stages" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { opportunityId, newStageId, lostReason, actorName = "User" } = body;

    if (!opportunityId || !newStageId) {
      return NextResponse.json(
        { error: "Opportunity ID and new Stage ID are required" },
        { status: 400 }
      );
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { stage: true, company: { select: { name: true } } },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    const newStage = await prisma.pipelineStage.findUnique({
      where: { id: newStageId },
    });

    if (!newStage) {
      return NextResponse.json({ error: "Target stage not found" }, { status: 404 });
    }

    const isWon = newStage.isWon;
    const isLost = newStage.isLost;

    const updated = await prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        stageId: newStageId,
        wonDate: isWon ? new Date() : (isLost ? null : opportunity.wonDate),
        lostReason: isLost ? (lostReason || opportunity.lostReason || "Not specified") : null,
        probability: isWon ? 100 : (isLost ? 0 : opportunity.probability),
      },
      include: { stage: true, company: true },
    });

    // Record timeline audit event
    await prisma.timelineEvent.create({
      data: {
        companyId: opportunity.companyId,
        opportunityId: opportunity.id,
        actorName,
        eventType: "STAGE_CHANGED",
        description: `Stage moved from "${opportunity.stage.name}" to "${newStage.name}".`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Pipeline PUT error:", error);
    return NextResponse.json({ error: "Failed to update pipeline stage" }, { status: 500 });
  }
}
