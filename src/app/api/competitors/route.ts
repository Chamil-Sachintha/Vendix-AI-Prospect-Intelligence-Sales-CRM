import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const competitors = await prisma.competitor.findMany({
      orderBy: { vendorName: "asc" },
    });

    // Also compute prospect count using each competitor from SoftwareRecords
    const softwareRecords = await prisma.softwareRecord.findMany({
      where: { category: "SFA" },
      select: { productName: true, vendorName: true, status: true, company: { select: { id: true, name: true } } },
    });

    const competitorsWithUsage = competitors.map((comp) => {
      const matching = softwareRecords.filter(
        (sr) =>
          sr.productName.toLowerCase().includes(comp.productName.toLowerCase()) ||
          sr.vendorName.toLowerCase().includes(comp.vendorName.toLowerCase()) ||
          comp.productName.toLowerCase().includes(sr.productName.toLowerCase())
      );

      const usingCount = matching.filter((m) => m.status === "CURRENTLY_USING").length;
      const replacingCount = matching.filter((m) => ["REPLACING", "EVALUATING"].includes(m.status)).length;

      return {
        ...comp,
        prospectsUsingCount: usingCount,
        prospectsReplacingCount: replacingCount,
        accounts: matching.map((m) => ({ id: m.company.id, name: m.company.name, status: m.status })),
      };
    });

    return NextResponse.json(competitorsWithUsage);
  } catch (error) {
    console.error("Competitors GET error:", error);
    return NextResponse.json({ error: "Failed to fetch competitors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      vendorName,
      productName,
      website,
      targetIndustries,
      positioning,
      knownFeatures,
      customerReferences,
      caseStudies,
      notes,
    } = body;

    if (!vendorName || !productName) {
      return NextResponse.json(
        { error: "Vendor name and product name are required" },
        { status: 400 }
      );
    }

    const comp = await prisma.competitor.create({
      data: {
        vendorName: vendorName.trim(),
        productName: productName.trim(),
        website,
        targetIndustries,
        positioning,
        knownFeatures,
        customerReferences,
        caseStudies,
        notes,
      },
    });

    return NextResponse.json(comp, { status: 201 });
  } catch (error) {
    console.error("Competitor POST error:", error);
    return NextResponse.json({ error: "Failed to create competitor" }, { status: 500 });
  }
}
