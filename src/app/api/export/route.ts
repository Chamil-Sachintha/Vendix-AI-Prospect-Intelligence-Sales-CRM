import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get("entity") || "companies"; // companies, contacts, software, intent, opportunities, activities

    let csvData: any[] = [];
    let filename = `vendix_${entity}_${new Date().toISOString().slice(0, 10)}.csv`;

    switch (entity) {
      case "companies": {
        const companies = await prisma.company.findMany({
          orderBy: { name: "asc" },
          include: {
            assignedOwner: { select: { name: true } },
            contacts: { where: { isPrimary: true }, select: { fullName: true, businessEmail: true } },
            softwareRecords: { where: { category: "SFA" }, select: { productName: true, vendorName: true, status: true } },
          },
        });

        csvData = companies.map((c) => ({
          "Company Name": c.name,
          "Trading Name": c.tradingName || "",
          "Industry": c.industry,
          "Sub-Industry": c.subIndustry || "",
          "Country": c.country,
          "City": c.city || "",
          "Website": c.website || "",
          "Employee Count": c.employeeCount || "",
          "Field Sales Reps": c.fieldSalesRepsCount || "",
          "Distribution Model": c.distributionModel || "",
          "SLRA Member": c.slraMember ? "Yes" : "No",
          "Current SFA Product": c.softwareRecords[0]?.productName || "",
          "Current SFA Vendor": c.softwareRecords[0]?.vendorName || "",
          "SFA Status": c.softwareRecords[0]?.status || "",
          "Intent Score": c.intentScore,
          "Intent Level": c.intentLevel,
          "Qualification Status": c.qualificationStatus,
          "Primary Contact": c.contacts[0]?.fullName || "",
          "Primary Email": c.contacts[0]?.businessEmail || "",
          "Owner": c.assignedOwner?.name || "",
        }));
        break;
      }

      case "contacts": {
        const contacts = await prisma.contact.findMany({
          orderBy: { fullName: "asc" },
          include: { company: { select: { name: true } } },
        });

        csvData = contacts.map((ct) => ({
          "Full Name": ct.fullName,
          "Job Title": ct.jobTitle,
          "Department": ct.department || "",
          "Seniority": ct.seniorityLevel || "",
          "Purchasing Role": ct.roleInPurchasing,
          "Company": ct.company.name,
          "Business Email": ct.businessEmail || "",
          "Business Phone": ct.businessPhone || "",
          "LinkedIn URL": ct.linkedinUrl || "",
          "Verified": ct.isVerified ? "Yes" : "No",
          "Primary Contact": ct.isPrimary ? "Yes" : "No",
        }));
        break;
      }

      case "software": {
        const records = await prisma.softwareRecord.findMany({
          include: { company: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        });

        csvData = records.map((s) => ({
          "Company": s.company.name,
          "Category": s.category,
          "Product Name": s.productName,
          "Vendor Name": s.vendorName,
          "Deployment Type": s.deploymentType,
          "Status": s.status,
          "Implementation Year": s.implementationYear || "",
          "Confidence": s.confidence,
          "Evidence Source URL": s.evidenceUrl || "",
          "Evidence Description": s.evidenceDescription || "",
        }));
        break;
      }

      case "intent": {
        const signals = await prisma.intentSignal.findMany({
          include: { company: { select: { name: true } } },
          orderBy: { dateObserved: "desc" },
        });

        csvData = signals.map((sig) => ({
          "Company": sig.company.name,
          "Category": sig.category,
          "Description": sig.description,
          "Date Observed": sig.dateObserved.toISOString().slice(0, 10),
          "Source Type": sig.sourceType || "",
          "Strength": sig.strength,
          "Confidence": sig.confidence,
          "Score Contribution": sig.scoreContribution,
          "Verification Status": sig.verificationStatus,
        }));
        break;
      }

      case "opportunities": {
        const opps = await prisma.opportunity.findMany({
          include: {
            company: { select: { name: true } },
            stage: { select: { name: true } },
            owner: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        csvData = opps.map((o) => ({
          "Opportunity Name": o.name,
          "Company": o.company.name,
          "Sales Stage": o.stage.name,
          "Estimated ACV": o.estimatedAcv,
          "Currency": o.currency,
          "Probability (%)": o.probability,
          "Potential Users": o.potentialUsers || "",
          "Expected Close Date": o.expectedCloseDate ? o.expectedCloseDate.toISOString().slice(0, 10) : "",
          "Competitor Evaluated": o.competitorEvaluated || "",
          "Owner": o.owner?.name || "",
        }));
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
    }

    const csvString = Papa.unparse(csvData);

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
