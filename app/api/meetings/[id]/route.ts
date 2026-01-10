import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { meetings, summaries, actionItems } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meeting = await db.query.meetings.findFirst({
      where: and(eq(meetings.id, id), eq(meetings.userId, session.user.id)),
      with: {
        summary: true,
        actionItems: true,
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, date, participants } = body;

    // Verify ownership
    const existingMeeting = await db.query.meetings.findFirst({
      where: and(eq(meetings.id, id), eq(meetings.userId, session.user.id)),
    });

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(meetings)
      .set({
        title: title || existingMeeting.title,
        description: description ?? existingMeeting.description,
        date: date ? new Date(date) : existingMeeting.date,
        participants: participants
          ? JSON.stringify(participants)
          : existingMeeting.participants,
        updatedAt: new Date(),
      })
      .where(eq(meetings.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating meeting:", error);
    return NextResponse.json(
      { error: "Failed to update meeting" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existingMeeting = await db.query.meetings.findFirst({
      where: and(eq(meetings.id, id), eq(meetings.userId, session.user.id)),
    });

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Delete related records first (cascade should handle this, but being explicit)
    await db.delete(actionItems).where(eq(actionItems.meetingId, id));
    await db.delete(summaries).where(eq(summaries.meetingId, id));
    await db.delete(meetings).where(eq(meetings.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    );
  }
}
