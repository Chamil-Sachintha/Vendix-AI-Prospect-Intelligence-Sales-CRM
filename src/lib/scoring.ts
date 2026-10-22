import { DEFAULT_SCORING_WEIGHTS } from "./constants";

export interface IntentSignalItem {
  id?: string;
  category: string;
  strength?: string;
  confidence?: string;
  recencyMonths?: number;
  verificationStatus?: string;
  scoreContribution?: number;
  dateObserved?: Date | string;
}

export interface ScoreBreakdownItem {
  category: string;
  signalDescription?: string;
  points: number;
  decayed: boolean;
  notes: string;
}

export interface CalculationResult {
  score: number;
  level: "HIGH" | "MEDIUM" | "LOW";
  breakdown: ScoreBreakdownItem[];
}

export function calculateCompanyIntentScore(
  signals: IntentSignalItem[],
  customWeights = DEFAULT_SCORING_WEIGHTS
): CalculationResult {
  let rawScore = 0;
  const breakdown: ScoreBreakdownItem[] = [];
  const countedCategories = new Set<string>();

  for (const signal of signals) {
    if (signal.verificationStatus === "DISQUALIFIED") {
      continue;
    }

    let basePoints = 0;
    const cat = signal.category;

    switch (cat) {
      case "DEMO_PRICING_REQUEST":
      case "INBOUND_ENQUIRY":
        basePoints = customWeights.demoOrPricingRequest;
        break;
      case "SFA_REPLACEMENT_UPGRADE":
      case "NEW_SFA_PROJECT":
        basePoints = customWeights.sfaReplacementProject;
        break;
      case "OPERATIONAL_CHALLENGES":
        basePoints = customWeights.softwareDissatisfaction;
        break;
      case "COMPETITOR_SFA_IMPL":
      case "ERP_MIGRATION":
        basePoints = customWeights.competitorImplementationOrEval;
        break;
      case "FIELD_SALES_HIRING":
      case "DISTRIBUTION_EXPANSION":
      case "SALES_OPS_HIRING":
      case "PRODUCT_GEO_LAUNCH":
        basePoints = customWeights.fieldSalesExpansion;
        break;
      case "WEBSITE_ENGAGEMENT":
      case "INDUSTRY_EVENT":
        basePoints = customWeights.contentEngagement;
        break;
      case "DIGITAL_TRANSFORMATION":
        basePoints = customWeights.targetProfileFit;
        break;
      default:
        basePoints = 10;
    }

    // Confidence adjustment
    if (signal.confidence === "UNVERIFIED" || signal.confidence === "SPECULATIVE") {
      basePoints = Math.round(basePoints * 0.7);
    }

    // Recency decay: if older than threshold months
    const recency = signal.recencyMonths ?? 1;
    let decayed = false;
    if (recency > customWeights.decayMonthsThreshold) {
      basePoints = Math.round(basePoints * 0.5);
      decayed = true;
    }

    // Avoid multiple exact duplicates inflating the score arbitrarily
    const categoryKey = `${cat}_${signal.confidence}`;
    if (countedCategories.has(categoryKey)) {
      basePoints = Math.round(basePoints * 0.3); // diminishing returns for repeated signals
    } else {
      countedCategories.add(categoryKey);
    }

    rawScore += basePoints;
    breakdown.push({
      category: cat,
      points: basePoints,
      decayed,
      notes: `${signal.confidence || "CONFIRMED"} confidence, ${recency}m old${decayed ? " (decay applied)" : ""}`,
    });
  }

  // Normalise score between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, rawScore));

  let level: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (normalizedScore >= customWeights.highIntentThreshold) {
    level = "HIGH";
  } else if (normalizedScore >= customWeights.mediumIntentThreshold) {
    level = "MEDIUM";
  }

  return {
    score: normalizedScore,
    level,
    breakdown,
  };
}
