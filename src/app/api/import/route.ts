import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, records, duplicateStrategy = "skip" } = body;
    // mode: "preview" or "execute"
    // duplicateStrategy: "skip" | "update"

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "No records supplied for import" }, { status: 400 });
    }

    // Validation & Duplicate Checking
    const validatedRecords: any[] = [];
    let duplicatesFound = 0;
    let errorsFound = 0;

    const existingCompanies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    const companyNameMap = new Map(
      existingCompanies.map((c) => [c.name.toLowerCase().trim(), c.id])
    );

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const errors: string[] = [];

      const name = (row.name || row["Company Name"] || row.company || "").toString().trim();
      if (!name) {
        errors.push("Missing company name");
      }

      const existingId = companyNameMap.get(name.toLowerCase());
      const isDuplicate = Boolean(existingId);
      if (isDuplicate) duplicatesFound++;
      if (errors.length > 0) errorsFound++;

      validatedRecords.push({
        index: i + 1,
        name,
        tradingName: (row.tradingName || row["Trading Name"] || "").toString().trim(),
        industry: (row.industry || row["Industry"] || "FMCG & Retail").toString().trim(),
        country: (row.country || row["Country"] || "Sri Lanka").toString().trim(),
        city: (row.city || row["City"] || "").toString().trim(),
        website: (row.website || row["Website"] || "").toString().trim(),
        employeeCount: parseInt(row.employeeCount || row["Employee Count"] || "0", 10) || null,
        fieldSalesRepsCount: parseInt(row.fieldSalesRepsCount || row["Field Sales Reps"] || "0", 10) || null,
        distributionModel: (row.distributionModel || row["Distribution Model"] || "").toString().trim(),
        slraMember: row.slraMember === true || row["SLRA Member"] === "Yes",
        competitorSfa: (row.competitorSfa || row["Current SFA Product"] || "").toString().trim(),
        competitorVendor: (row.competitorVendor || row["Current SFA Vendor"] || "").toString().trim(),
        contactName: (row.contactName || row["Primary Contact"] || "").toString().trim(),
        contactEmail: (row.contactEmail || row["Primary Email"] || "").toString().trim(),
        isDuplicate,
        existingId,
        errors,
      });
    }

    if (mode === "preview") {
      return NextResponse.json({
        totalRecords: records.length,
        duplicatesFound,
        errorsFound,
        preview: validatedRecords.slice(0, 20),
      });
    }

    // Execute Import
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const rec of validatedRecords) {
      if (rec.errors.length > 0) {
        skippedCount++;
        continue;
      }

      if (rec.isDuplicate) {
        if (duplicateStrategy === "skip") {
          skippedCount++;
          continue;
        } else if (duplicateStrategy === "update" && rec.existingId) {
          await prisma.company.update({
            where: { id: rec.existingId },
            data: {
              tradingName: rec.tradingName || undefined,
              industry: rec.industry || undefined,
              country: rec.country || undefined,
              city: rec.city || undefined,
              website: rec.website || undefined,
              employeeCount: rec.employeeCount || undefined,
              fieldSalesRepsCount: rec.fieldSalesRepsCount || undefined,
              distributionModel: rec.distributionModel || undefined,
              slraMember: rec.slraMember,
              lastVerifiedDate: new Date(),
            },
          });
          updatedCount++;
          continue;
        }
      }

      // Create new company
      const company = await prisma.company.create({
        data: {
          name: rec.name,
          tradingName: rec.tradingName || null,
          industry: rec.industry,
          country: rec.country,
          city: rec.city || null,
          website: rec.website || null,
          employeeCount: rec.employeeCount,
          fieldSalesRepsCount: rec.fieldSalesRepsCount,
          distributionModel: rec.distributionModel || null,
          slraMember: rec.slraMember,
          source: "CSV Import",
          lastVerifiedDate: new Date(),
          qualification: {
            create: {
              potentialUsers: rec.fieldSalesRepsCount,
            },
          },
        },
      });

      // If competitor SFA provided, add software record
      if (rec.competitorSfa) {
        await prisma.softwareRecord.create({
          data: {
            companyId: company.id,
            category: "SFA",
            productName: rec.competitorSfa,
            vendorName: rec.competitorVendor || rec.competitorSfa,
            deploymentType: "CLOUD",
            status: "CURRENTLY_USING",
            confidence: "UNVERIFIED",
            evidenceDescription: "Logged from bulk CSV import",
          },
        });
      }

      // If contact provided, add contact
      if (rec.contactName) {
        await prisma.contact.create({
          data: {
            companyId: company.id,
            fullName: rec.contactName,
            jobTitle: "Sales Leader / Contact",
            businessEmail: rec.contactEmail || null,
            isPrimary: true,
            source: "CSV Import",
          },
        });
      }

      await prisma.timelineEvent.create({
        data: {
          companyId: company.id,
          actorName: "Import System",
          eventType: "COMPANY_CREATED",
          description: `Company imported via CSV.`,
        },
      });

      importedCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      updatedCount,
      skippedCount,
      totalProcessed: validatedRecords.length,
    });
  } catch (error) {
    console.error("Import POST error:", error);
    return NextResponse.json({ error: "Failed to process import" }, { status: 500 });
  }
}
