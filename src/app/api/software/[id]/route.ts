import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.softwareRecord.update({
      where: { id },
      data: {
        category: body.category,
        productName: body.productName?.trim(),
        vendorName: body.vendorName?.trim(),
        deploymentType: body.deploymentType,
        status: body.status,
        implementationYear: body.implementationYear ? parseInt(body.implementationYear, 10) : null,
        renewalDate: body.renewalDate ? new Date(body.renewalDate) : null,
        knownIntegrations: body.knownIntegrations,
        knownLimitations: body.knownLimitations,
        evidenceUrl: body.evidenceUrl,
        evidenceDescription: body.evidenceDescription,
        confidence: body.confidence,
        lastVerifiedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Software PUT error:", error);
    return NextResponse.json({ error: "Failed to update software" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.softwareRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Software DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete software record" }, { status: 500 });
  }
}
