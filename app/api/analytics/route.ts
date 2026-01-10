import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { meetings, actionItems } from "@/lib/schema";
import { eq, count, sql } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Total meetings
    const totalMeetings = await db
      .select({ count: count() })
      .from(meetings)
      .where(eq(meetings.userId, session.user.id));

    // Completed meetings
    const completedMeetings = await db
      .select({ count: count() })
      .from(meetings)
      .where(
        sql`${meetings.userId} = ${session.user.id} AND ${meetings.status} = 'completed'`
      );

    // Total duration
    const totalDuration = await db
      .select({ total: sql<number>`COALESCE(SUM(${meetings.duration}), 0)` })
      .from(meetings)
      .where(eq(meetings.userId, session.user.id));

    // Action items stats
    const totalActions = await db
      .select({ count: count() })
      .from(actionItems)
      .innerJoin(meetings, eq(actionItems.meetingId, meetings.id))
      .where(eq(meetings.userId, session.user.id));

    const completedActions = await db
      .select({ count: count() })
      .from(actionItems)
      .innerJoin(meetings, eq(actionItems.meetingId, meetings.id))
      .where(
        sql`${meetings.userId} = ${session.user.id} AND ${actionItems.completed} = true`
      );

    return NextResponse.json({
      totalMeetings: totalMeetings[0]?.count || 0,
      completedMeetings: completedMeetings[0]?.count || 0,
      totalDuration: totalDuration[0]?.total || 0,
      totalActionItems: totalActions[0]?.count || 0,
      completedActionItems: completedActions[0]?.count || 0,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
