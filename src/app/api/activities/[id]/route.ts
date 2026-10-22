import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const isCompleted = body.isCompleted !== undefined ? Boolean(body.isCompleted) : undefined;

    const task = await prisma.taskFollowUp.update({
      where: { id },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : (isCompleted === false ? null : undefined),
        title: body.title?.trim(),
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        priority: body.priority,
        notes: body.notes,
      },
    });

    if (task.companyId && isCompleted) {
      await prisma.timelineEvent.create({
        data: {
          companyId: task.companyId,
          contactId: task.contactId,
          opportunityId: task.opportunityId,
          actorName: body.actorName || "User",
          eventType: "TASK_COMPLETED",
          description: `Follow-up completed: ${task.title}.`,
        },
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Activity PUT error:", error);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.taskFollowUp.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activity DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
