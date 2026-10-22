import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.competitor.update({
      where: { id },
      data: {
        vendorName: body.vendorName?.trim(),
        productName: body.productName?.trim(),
        website: body.website,
        targetIndustries: body.targetIndustries,
        positioning: body.positioning,
        knownFeatures: body.knownFeatures,
        customerReferences: body.customerReferences,
        caseStudies: body.caseStudies,
        notes: body.notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Competitor PUT error:", error);
    return NextResponse.json({ error: "Failed to update competitor" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.competitor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Competitor DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete competitor" }, { status: 500 });
  }
}
