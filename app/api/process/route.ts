import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { meetings, summaries, actionItems } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: NextRequest) {
  try {
    const { meetingId, transcript } = await request.json();

    if (!meetingId) {
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 }
      );
    }

    // Get the meeting
    const meeting = await db.query.meetings.findFirst({
      where: eq(meetings.id, meetingId),
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Update status to processing
    await db
      .update(meetings)
      .set({ status: "processing" })
      .where(eq(meetings.id, meetingId));

    try {
      // For demo purposes, use a sample transcript if none provided
      const meetingTranscript =
        transcript ||
        `This is a sample meeting transcript for "${meeting.title}".

        The team discussed several important topics including project updates, timeline adjustments, and resource allocation.

        Key discussion points:
        - Project Alpha is on track for Q2 delivery
        - Need to hire two additional developers
        - Budget review scheduled for next week
        - Client presentation moved to Friday

        Action items were assigned to various team members with specific deadlines.

        The meeting concluded with agreement on next steps and follow-up schedule.`;

      // Generate summary using OpenAI
      const { text: summaryResult } = await generateText({
        model: openai("gpt-4o-mini"),
        system: `You are a meeting summarization assistant. Analyze the meeting transcript and provide:
1. A concise summary (2-3 paragraphs)
2. Key points as a JSON array of strings
3. Decisions made as a JSON array of strings
4. Action items as a JSON array of objects with: title, description, assignee (if mentioned), priority (low/medium/high)

Respond in JSON format:
{
  "summary": "string",
  "keyPoints": ["string"],
  "decisions": ["string"],
  "actionItems": [{"title": "string", "description": "string", "assignee": "string or null", "priority": "medium"}]
}`,
        prompt: `Please analyze this meeting transcript and extract the summary, key points, decisions, and action items:\n\n${meetingTranscript}`,
      });

      // Parse the AI response
      let parsedResult;
      try {
        // Extract JSON from the response (handle markdown code blocks)
        const jsonMatch = summaryResult.match(/```json\n?([\s\S]*?)\n?```/) ||
          summaryResult.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch
          ? jsonMatch[1] || jsonMatch[0]
          : summaryResult;
        parsedResult = JSON.parse(jsonStr);
      } catch {
        // Fallback if parsing fails
        parsedResult = {
          summary: summaryResult,
          keyPoints: [],
          decisions: [],
          actionItems: [],
        };
      }

      // Create summary record
      await db.insert(summaries).values({
        meetingId,
        transcript: meetingTranscript,
        summary: parsedResult.summary,
        keyPoints: JSON.stringify(parsedResult.keyPoints || []),
        decisions: JSON.stringify(parsedResult.decisions || []),
      });

      // Create action items
      if (parsedResult.actionItems && parsedResult.actionItems.length > 0) {
        await db.insert(actionItems).values(
          parsedResult.actionItems.map(
            (item: {
              title: string;
              description?: string;
              assignee?: string;
              priority?: string;
            }) => ({
              meetingId,
              title: item.title,
              description: item.description || null,
              assignee: item.assignee || null,
              priority: item.priority || "medium",
              completed: false,
            })
          )
        );
      }

      // Estimate duration based on transcript length (rough estimate)
      const estimatedDuration = Math.max(
        15,
        Math.round(meetingTranscript.length / 500)
      );

      // Update meeting status to completed
      await db
        .update(meetings)
        .set({
          status: "completed",
          duration: estimatedDuration,
          updatedAt: new Date(),
        })
        .where(eq(meetings.id, meetingId));

      return NextResponse.json({ success: true, meetingId });
    } catch (aiError) {
      console.error("AI processing error:", aiError);

      // Update meeting status to failed
      await db
        .update(meetings)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(meetings.id, meetingId));

      return NextResponse.json(
        { error: "AI processing failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing meeting:", error);
    return NextResponse.json(
      { error: "Failed to process meeting" },
      { status: 500 }
    );
  }
}
