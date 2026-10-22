import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const category = searchParams.get("category");

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (category && category !== "ALL") where.category = category;

    const records = await prisma.softwareRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { id: true, name: true, industry: true } },
      },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Software GET error:", error);
    return NextResponse.json({ error: "Failed to fetch software records" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyId,
      category = "SFA",
      productName,
      vendorName,
      deploymentType = "CLOUD",
      status = "CURRENTLY_USING",
      implementationYear,
      renewalDate,
      knownIntegrations,
      knownLimitations,
      evidenceUrl,
      evidenceDescription,
      confidence = "CONFIRMED",
      actorName = "User",
    } = body;

    if (!companyId || !productName || !vendorName) {
      return NextResponse.json(
        { error: "Company, product name, and vendor name are required" },
        { status: 400 }
      );
    }

    const software = await prisma.softwareRecord.create({
      data: {
        companyId,
        category,
        productName: productName.trim(),
        vendorName: vendorName.trim(),
        deploymentType,
        status,
        implementationYear: implementationYear ? parseInt(implementationYear, 10) : null,
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        knownIntegrations,
        knownLimitations,
        evidenceUrl,
        evidenceDescription,
        lastVerifiedAt: new Date(),
        confidence,
      },
    });

    await prisma.timelineEvent.create({
      data: {
        companyId,
        actorName,
        eventType: "SOFTWARE_ADDED",
        description: `Software record logged: ${category} - ${productName} (${vendorName}) [${status}]. Evidence: ${confidence}.`,
      },
    });

    return NextResponse.json(software, { status: 201 });
  } catch (error) {
    console.error("Software POST error:", error);
    return NextResponse.json({ error: "Failed to create software record" }, { status: 500 });
  }
}
