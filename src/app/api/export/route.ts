import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status");
    const industry = searchParams.get("industry");
    const country = searchParams.get("country");
    const sfaProvider = searchParams.get("sfaProvider");
    const companySize = searchParams.get("companySize");
    const followUpsDue = searchParams.get("followUpsDue");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { industry: { contains: search } },
        { country: { contains: search } },
        { currentSfaProvider: { contains: search } },
        { notes: { contains: search } },
        { contacts: { some: { fullName: { contains: search } } } },
        { contacts: { some: { businessEmail: { contains: search } } } },
      ];
    }

    if (status && status !== "ALL") {
      if (status === "Contacted / Awaiting Response") {
        where.prospectStatus = { in: ["Contacted", "Awaiting Response"] };
      } else if (status.includes(",")) {
        where.prospectStatus = { in: status.split(",").map((s) => s.trim()) };
      } else {
        where.prospectStatus = status;
      }
    }
    if (industry && industry !== "ALL") where.industry = { contains: industry };
    if (country && country !== "ALL") where.country = country;
    if (sfaProvider && sfaProvider !== "ALL") {
      where.OR = [
        { currentSfaProvider: { contains: sfaProvider } },
        { softwareRecords: { some: { productName: { contains: sfaProvider } } } },
      ];
    }
    if (companySize && companySize !== "ALL") {
      where.OR = [
        { sizeCategory: companySize },
        { employeeRange: { contains: companySize } },
      ];
    }
    if (followUpsDue === "true") {
      const now = new Date();
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      where.nextFollowUpDate = { lte: endOfToday };
    }

    const companies = await prisma.company.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        contacts: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    const csvData = companies.map((c) => {
      const contact = c.contacts?.[0];
      return {
        "Company Name": c.name,
        "Industry": c.industry || "",
        "Country": c.country || "",
        "Website": c.website || "",
        "Company Size": c.employeeRange || c.sizeCategory || "",
        "Current SFA Provider": c.currentSfaProvider || "",
        "Current Software Status": c.currentSfaStatus || "",
        "Decision-Maker Name": contact?.fullName || "",
        "Decision-Maker Job Title": contact?.jobTitle || "",
        "Contact Email": contact?.businessEmail || "",
        "Contact Phone": contact?.businessPhone || "",
        "Prospect Status": c.prospectStatus || "New",
        "Last Contacted": c.lastContactedAt ? c.lastContactedAt.toISOString().slice(0, 10) : "",
        "Next Follow-up": c.nextFollowUpDate ? c.nextFollowUpDate.toISOString().slice(0, 10) : "",
        "Notes": c.notes || "",
      };
    });

    const csvString = Papa.unparse(csvData);
    const filename = `vendix_prospects_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvString, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export GET error:", error);
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}
