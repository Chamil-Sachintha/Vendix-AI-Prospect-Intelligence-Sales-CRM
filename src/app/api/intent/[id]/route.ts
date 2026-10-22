import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateCompanyIntentScore } from "@/lib/scoring";
import { DEFAULT_SCORING_WEIGHTS } from "@/lib/constants";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.intentSignal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    const updated = await prisma.intentSignal.update({
      where: { id },
      data: {
        category: body.category || existing.category,
        description: body.description || existing.description,
        sourceUrl: body.sourceUrl !== undefined ? body.sourceUrl : existing.sourceUrl,
        sourceType: body.sourceType || existing.sourceType,
        relevance: body.relevance || existing.relevance,
        strength: body.strength || existing.strength,
        confidence: body.confidence || existing.confidence,
        recencyMonths: body.recencyMonths !== undefined ? parseInt(body.recencyMonths, 10) : existing.recencyMonths,
        verificationStatus: body.verificationStatus || existing.verificationStatus,
        followUpRecommendation: body.followUpRecommendation !== undefined ? body.followUpRecommendation : existing.followUpRecommendation,
      },
    });

    // Recalculate score
    const allSignals = await prisma.intentSignal.findMany({
      where: { companyId: existing.companyId },
    });
    const setting = await prisma.appSetting.findUnique({
      where: { key: "scoring_weights" },
    });
    const weights = setting ? JSON.parse(setting.valueJson) : DEFAULT_SCORING_WEIGHTS;
    const calc = calculateCompanyIntentScore(allSignals, weights);

    await prisma.company.update({
      where: { id: existing.companyId },
      data: {
        intentScore: calc.score,
        intentLevel: calc.level,
      },
    });

    return NextResponse.json({ signal: updated, newScore: calc.score, newLevel: calc.level });
  } catch (error) {
    console.error("Intent PUT error:", error);
    return NextResponse.json({ error: "Failed to update intent signal" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.intentSignal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    await prisma.intentSignal.delete({ where: { id } });

    // Recalculate score
    const allSignals = await prisma.intentSignal.findMany({
      where: { companyId: existing.companyId },
    });
    const setting = await prisma.appSetting.findUnique({
      where: { key: "scoring_weights" },
    });
    const weights = setting ? JSON.parse(setting.valueJson) : DEFAULT_SCORING_WEIGHTS;
    const calc = calculateCompanyIntentScore(allSignals, weights);

    await prisma.company.update({
      where: { id: existing.companyId },
      data: {
        intentScore: calc.score,
        intentLevel: calc.level,
      },
    });

    return NextResponse.json({ success: true, newScore: calc.score, newLevel: calc.level });
  } catch (error) {
    console.error("Intent DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete intent signal" }, { status: 500 });
  }
}
