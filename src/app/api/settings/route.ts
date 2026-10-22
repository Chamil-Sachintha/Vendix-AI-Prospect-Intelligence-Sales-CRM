import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DEFAULT_SCORING_WEIGHTS } from "@/lib/constants";
import { calculateCompanyIntentScore } from "@/lib/scoring";

export async function GET() {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key: "scoring_weights" },
    });

    const weights = setting ? JSON.parse(setting.valueJson) : DEFAULT_SCORING_WEIGHTS;

    const stages = await prisma.pipelineStage.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      weights,
      stages,
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { weights, recomputeAllScores } = body;

    if (weights) {
      await prisma.appSetting.upsert({
        where: { key: "scoring_weights" },
        update: { valueJson: JSON.stringify(weights) },
        create: { key: "scoring_weights", valueJson: JSON.stringify(weights) },
      });

      // If requested, recompute all company scores based on new weights
      if (recomputeAllScores) {
        const companies = await prisma.company.findMany({
          include: { intentSignals: true },
        });

        for (const c of companies) {
          const calc = calculateCompanyIntentScore(c.intentSignals, weights);
          await prisma.company.update({
            where: { id: c.id },
            data: { intentScore: calc.score, intentLevel: calc.level },
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully." });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
