import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // today, overdue, week, upcoming, completed, my
    const ownerId = searchParams.get("ownerId");
    const companyId = searchParams.get("companyId");
    const type = searchParams.get("type"); // task or outreach

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const endOfWeek = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

    const taskWhere: any = {};
    if (companyId) taskWhere.companyId = companyId;
    if (ownerId && ownerId !== "ALL") taskWhere.assignedOwnerId = ownerId;

    if (filter === "today") {
      taskWhere.dueDate = { gte: startOfToday, lte: endOfToday };
      taskWhere.isCompleted = false;
    } else if (filter === "overdue") {
      taskWhere.dueDate = { lt: startOfToday };
      taskWhere.isCompleted = false;
    } else if (filter === "week") {
      taskWhere.dueDate = { gte: startOfToday, lte: endOfWeek };
      taskWhere.isCompleted = false;
    } else if (filter === "upcoming") {
      taskWhere.dueDate = { gt: endOfToday };
      taskWhere.isCompleted = false;
    } else if (filter === "completed") {
      taskWhere.isCompleted = true;
    }

    const tasks = await prisma.taskFollowUp.findMany({
      where: taskWhere,
      orderBy: [{ isCompleted: "asc" }, { dueDate: "asc" }],
      include: {
        company: { select: { id: true, name: true, industry: true } },
        contact: { select: { id: true, fullName: true, jobTitle: true, businessPhone: true } },
        opportunity: { select: { id: true, name: true } },
        assignedOwner: { select: { id: true, name: true, avatar: true } },
      },
    });

    const outreachWhere: any = {};
    if (companyId) outreachWhere.companyId = companyId;
    if (ownerId && ownerId !== "ALL") outreachWhere.ownerId = ownerId;

    const outreaches = await prisma.outreachActivity.findMany({
      where: outreachWhere,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        company: { select: { id: true, name: true, industry: true } },
        contact: { select: { id: true, fullName: true, jobTitle: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ tasks, outreaches });
  } catch (error) {
    console.error("Activities GET error:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { actionType } = body; // "outreach" or "task"

    if (actionType === "task") {
      const {
        title,
        type = "TASK",
        dueDate,
        priority = "MEDIUM",
        notes,
        companyId,
        contactId,
        opportunityId,
        assignedOwnerId,
        actorName = "User",
      } = body;

      if (!title || !dueDate) {
        return NextResponse.json(
          { error: "Title and due date are required" },
          { status: 400 }
        );
      }

      const task = await prisma.taskFollowUp.create({
        data: {
          title: title.trim(),
          type,
          dueDate: new Date(dueDate),
          priority,
          notes,
          companyId: companyId || null,
          contactId: contactId || null,
          opportunityId: opportunityId || null,
          assignedOwnerId: assignedOwnerId || null,
        },
        include: {
          company: true,
          contact: true,
          assignedOwner: true,
        },
      });

      if (companyId) {
        await prisma.timelineEvent.create({
          data: {
            companyId,
            contactId: contactId || null,
            opportunityId: opportunityId || null,
            actorName,
            eventType: "TASK_CREATED",
            description: `Follow-up created: [${type}] ${title}. Due: ${new Date(dueDate).toLocaleDateString()}.`,
          },
        });
      }

      return NextResponse.json(task, { status: 201 });
    } else {
      // Outreach activity
      const {
        companyId,
        contactId,
        opportunityId,
        channel = "EMAIL",
        campaign,
        messageSummary,
        outcome,
        responseReceived = false,
        outreachStatus = "CONTACTED",
        nextAction,
        nextFollowUpDate,
        ownerId,
        createFollowUpTask = false,
        actorName = "User",
      } = body;

      if (!companyId || !messageSummary) {
        return NextResponse.json(
          { error: "Company and message summary are required" },
          { status: 400 }
        );
      }

      const outreach = await prisma.outreachActivity.create({
        data: {
          companyId,
          contactId: contactId || null,
          opportunityId: opportunityId || null,
          channel,
          campaign,
          messageSummary: messageSummary.trim(),
          outcome,
          responseReceived: Boolean(responseReceived),
          outreachStatus,
          nextAction,
          nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
          ownerId: ownerId || null,
        },
        include: { company: true, contact: true },
      });

      // If user wanted an immediate follow-up task created
      if (createFollowUpTask && nextFollowUpDate) {
        await prisma.taskFollowUp.create({
          data: {
            title: nextAction || `Follow-up on ${channel.toLowerCase()} outreach`,
            type: channel === "MEETING" ? "MEETING" : channel === "PHONE" ? "CALL" : "FOLLOW_UP",
            dueDate: new Date(nextFollowUpDate),
            priority: outreachStatus === "POSITIVE_RESPONSE" ? "HIGH" : "MEDIUM",
            notes: `Auto-created from outreach: ${messageSummary.slice(0, 100)}`,
            companyId,
            contactId: contactId || null,
            opportunityId: opportunityId || null,
            assignedOwnerId: ownerId || null,
          },
        });
      }

      await prisma.timelineEvent.create({
        data: {
          companyId,
          contactId: contactId || null,
          opportunityId: opportunityId || null,
          actorName,
          eventType: "OUTREACH_LOGGED",
          description: `Outreach via ${channel}: ${outreachStatus}. ${messageSummary.slice(0, 100)}.`,
        },
      });

      return NextResponse.json(outreach, { status: 201 });
    }
  } catch (error) {
    console.error("Activity POST error:", error);
    return NextResponse.json({ error: "Failed to record activity" }, { status: 500 });
  }
}
