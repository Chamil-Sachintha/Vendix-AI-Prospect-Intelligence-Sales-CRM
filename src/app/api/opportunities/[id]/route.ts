import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        name: body.name?.trim(),
        primaryContactId: body.primaryContactId !== undefined ? (body.primaryContactId || null) : undefined,
        productInterest: body.productInterest,
        potentialUsers: body.potentialUsers ? parseInt(body.potentialUsers, 10) : undefined,
        estimatedAcv: body.estimatedAcv !== undefined ? parseFloat(body.estimatedAcv) : undefined,
        currency: body.currency,
        ownerId: body.ownerId !== undefined ? (body.ownerId || null) : undefined,
        expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : undefined,
        probability: body.probability !== undefined ? parseInt(body.probability, 10) : undefined,
        stageId: body.stageId,
        painPoints: body.painPoints,
        competitorEvaluated: body.competitorEvaluated,
        nextAction: body.nextAction,
        lostReason: body.lostReason,
        notes: body.notes,
      },
      include: { stage: true, company: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Opportunity PUT error:", error);
    return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.opportunity.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Opportunity DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete opportunity" }, { status: 500 });
  }
}
