import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { meetings } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userMeetings = await db.query.meetings.findMany({
      where: eq(meetings.userId, user.id),
      orderBy: [desc(meetings.createdAt)],
      with: {
        summary: true,
        actionItems: true,
      },
    });

    return NextResponse.json(userMeetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const participants = formData.get("participants") as string | null;
    const date = formData.get("date") as string;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Parse participants into JSON array
    const participantsArray = participants
      ? participants.split(",").map((p) => p.trim()).filter(Boolean)
      : [];

    // Create meeting record
    const [meeting] = await db
      .insert(meetings)
      .values({
        userId: user.id,
        title,
        description: description || null,
        participants: JSON.stringify(participantsArray),
        date: new Date(date),
        status: file ? "processing" : "pending",
        audioFileName: file?.name || null,
      })
      .returning();

    // If file is uploaded, trigger processing
    if (file) {
      // In production, you would upload the file to cloud storage
      // and trigger async processing here
      // For now, we'll simulate by calling the process endpoint
      const processUrl = new URL("/api/process", request.url);
      fetch(processUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meetingId: meeting.id }),
      }).catch(console.error);
    }

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}
