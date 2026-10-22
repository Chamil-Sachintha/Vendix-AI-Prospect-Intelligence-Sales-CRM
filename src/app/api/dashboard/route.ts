import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      totalProspects,
      newProspects,
      contactedAwaiting,
      interestedProspects,
      meetingsDemos,
      proposalsSent,
      wonProspects,
      followUpsDue,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { prospectStatus: "New" } }),
      prisma.company.count({
        where: { prospectStatus: { in: ["Contacted", "Awaiting Response"] } },
      }),
      prisma.company.count({ where: { prospectStatus: "Interested" } }),
      prisma.company.count({ where: { prospectStatus: "Meeting / Demo" } }),
      prisma.company.count({ where: { prospectStatus: "Proposal Sent" } }),
      prisma.company.count({ where: { prospectStatus: "Won" } }),
      prisma.company.count({
        where: {
          nextFollowUpDate: { lte: endOfToday },
          prospectStatus: { notIn: ["Won", "Lost", "Do Not Contact"] },
        },
      }),
    ]);

    return NextResponse.json({
      totalProspects,
      newProspects,
      contactedAwaiting,
      interestedProspects,
      meetingsDemos,
      proposalsSent,
      wonProspects,
      followUpsDue,
    });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json({ error: "Failed to load dashboard metrics" }, { status: 500 });
  }
}
