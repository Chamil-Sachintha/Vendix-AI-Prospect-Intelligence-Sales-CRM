import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query || query.length < 2) {
      return NextResponse.json({
        companies: [],
        contacts: [],
        software: [],
        opportunities: [],
      });
    }

    const [companies, contacts, software, opportunities] = await Promise.all([
      prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { tradingName: { contains: query } },
            { industry: { contains: query } },
            { city: { contains: query } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          tradingName: true,
          industry: true,
          country: true,
          intentScore: true,
          intentLevel: true,
        },
      }),

      prisma.contact.findMany({
        where: {
          OR: [
            { fullName: { contains: query } },
            { jobTitle: { contains: query } },
            { businessEmail: { contains: query } },
          ],
        },
        take: 5,
        select: {
          id: true,
          fullName: true,
          jobTitle: true,
          companyId: true,
          company: { select: { id: true, name: true } },
        },
      }),

      prisma.softwareRecord.findMany({
        where: {
          OR: [
            { productName: { contains: query } },
            { vendorName: { contains: query } },
          ],
        },
        take: 5,
        select: {
          id: true,
          productName: true,
          vendorName: true,
          category: true,
          status: true,
          companyId: true,
          company: { select: { id: true, name: true } },
        },
      }),

      prisma.opportunity.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { productInterest: { contains: query } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          estimatedAcv: true,
          currency: true,
          companyId: true,
          stage: { select: { name: true, color: true } },
          company: { select: { id: true, name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      companies,
      contacts,
      software,
      opportunities,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
