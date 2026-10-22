import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateCompanyIntentScore } from "@/lib/scoring";
import { DEFAULT_SCORING_WEIGHTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const category = searchParams.get("category");
    const strength = searchParams.get("strength");
    const verificationStatus = searchParams.get("verificationStatus");

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (category && category !== "ALL") where.category = category;
    if (strength && strength !== "ALL") where.strength = strength;
    if (verificationStatus && verificationStatus !== "ALL") {
      where.verificationStatus = verificationStatus;
    }

    const signals = await prisma.intentSignal.findMany({
      where,
      orderBy: { dateObserved: "desc" },
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
      },
    });

    return NextResponse.json(signals);
  } catch (error) {
    console.error("Intent GET error:", error);
    return NextResponse.json({ error: "Failed to fetch intent signals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyId,
      category,
      description,
      dateObserved,
      sourceUrl,
      sourceType = "Direct Observation",
      relevance = "High",
      strength = "HIGH",
      confidence = "CONFIRMED",
      recencyMonths = 1,
      assignedReviewerId,
      verificationStatus = "VERIFIED",
      followUpRecommendation,
      actorName = "User",
    } = body;

    if (!companyId || !category || !description) {
      return NextResponse.json(
        { error: "Company, signal category, and description are required" },
        { status: 400 }
      );
    }

    // 1. Create the signal
    const signal = await prisma.intentSignal.create({
      data: {
        companyId,
        category,
        description: description.trim(),
        dateObserved: dateObserved ? new Date(dateObserved) : new Date(),
        sourceUrl,
        sourceType,
        relevance,
        strength,
        confidence,
        recencyMonths: parseInt(recencyMonths, 10) || 1,
        assignedReviewerId: assignedReviewerId || null,
        verificationStatus,
        followUpRecommendation,
      },
    });

    // 2. Fetch all signals for this company to recalculate score
    const allSignals = await prisma.intentSignal.findMany({
      where: { companyId },
    });

    // Fetch custom weights from settings if available
    const setting = await prisma.appSetting.findUnique({
      where: { key: "scoring_weights" },
    });
    const weights = setting ? JSON.parse(setting.valueJson) : DEFAULT_SCORING_WEIGHTS;

    const calc = calculateCompanyIntentScore(allSignals, weights);

    // 3. Update company score and intent level
    await prisma.company.update({
      where: { id: companyId },
      data: {
        intentScore: calc.score,
        intentLevel: calc.level,
      },
    });

    // 4. Log timeline event
    await prisma.timelineEvent.create({
      data: {
        companyId,
        actorName,
        eventType: "INTENT_SIGNAL_LOGGED",
        description: `Intent signal logged: [${category}] ${description.slice(0, 80)}. New Intent Score: ${calc.score} (${calc.level}).`,
      },
    });

    return NextResponse.json({ signal, newScore: calc.score, newLevel: calc.level }, { status: 201 });
  } catch (error) {
    console.error("Intent POST error:", error);
    return NextResponse.json({ error: "Failed to record intent signal" }, { status: 500 });
  }
}
