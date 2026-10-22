import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { records, duplicateStrategy = "skip" } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "No records supplied for import" }, { status: 400 });
    }

    const existingCompanies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    const companyNameMap = new Map(
      existingCompanies.map((c) => [c.name.toLowerCase().trim(), c.id])
    );

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const row of records) {
      const name = (row.name || row["Company Name"] || row.company || "").toString().trim();
      if (!name) {
        skippedCount++;
        continue;
      }

      const existingId = companyNameMap.get(name.toLowerCase());
      const website = (row.website || row["Website"] || "").toString().trim();
      const industry = (row.industry || row["Industry"] || "FMCG & Retail").toString().trim();
      const country = (row.country || row["Country"] || "Sri Lanka").toString().trim();
      const companySize = (row.companySize || row["Company Size"] || "").toString().trim();
      const currentSfaProvider = (row.currentSfaProvider || row["Current SFA Provider"] || row["Current SFA"] || "").toString().trim();
      const currentSfaStatus = (row.currentSfaStatus || row["Current Software Status"] || "Confirmed").toString().trim();
      const prospectStatus = (row.prospectStatus || row["Prospect Status"] || "New").toString().trim();
      const notes = (row.notes || row["Notes"] || "").toString().trim();
      const nextFollowUpDate = row["Next Follow-up"] ? new Date(row["Next Follow-up"]) : null;
      const lastContactedAt = row["Last Contacted"] ? new Date(row["Last Contacted"]) : null;

      const contactName = (row.contactName || row["Decision-Maker Name"] || row["Contact Name"] || "").toString().trim();
      const contactTitle = (row.contactTitle || row["Decision-Maker Job Title"] || row["Job Title"] || "Decision-Maker").toString().trim();
      const contactEmail = (row.contactEmail || row["Contact Email"] || row["Email"] || "").toString().trim();
      const contactPhone = (row.contactPhone || row["Contact Phone"] || row["Phone"] || "").toString().trim();

      if (existingId) {
        if (duplicateStrategy === "skip") {
          skippedCount++;
          continue;
        } else if (duplicateStrategy === "update") {
          await prisma.company.update({
            where: { id: existingId },
            data: {
              website: website || undefined,
              industry: industry || undefined,
              country: country || undefined,
              employeeRange: companySize || undefined,
              currentSfaProvider: currentSfaProvider || undefined,
              currentSfaStatus: currentSfaStatus || undefined,
              prospectStatus: prospectStatus || undefined,
              notes: notes || undefined,
              nextFollowUpDate: nextFollowUpDate || undefined,
              lastContactedAt: lastContactedAt || undefined,
            },
          });
          updatedCount++;
          continue;
        }
      }

      const company = await prisma.company.create({
        data: {
          name,
          website: website || null,
          industry,
          country,
          employeeRange: companySize || null,
          sizeCategory: companySize || "MEDIUM",
          currentSfaProvider: currentSfaProvider || null,
          currentSfaStatus: currentSfaStatus || "Confirmed",
          prospectStatus: prospectStatus || "New",
          notes: notes || null,
          nextFollowUpDate,
          lastContactedAt,
          source: "CSV Import",
        },
      });

      if (contactName) {
        await prisma.contact.create({
          data: {
            companyId: company.id,
            fullName: contactName,
            jobTitle: contactTitle,
            businessEmail: contactEmail || null,
            businessPhone: contactPhone || null,
            isPrimary: true,
            isVerified: true,
          },
        });
      }

      companyNameMap.set(name.toLowerCase(), company.id);
      importedCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      updatedCount,
      skippedCount,
      totalProcessed: records.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to process CSV import" }, { status: 500 });
  }
}
