import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { meetings } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckSquare,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MeetingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const meeting = await db.query.meetings.findFirst({
    where: and(eq(meetings.id, id), eq(meetings.userId, session.user.id)),
    with: {
      summary: true,
      actionItems: true,
    },
  });

  if (!meeting) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const keyPoints = meeting.summary?.keyPoints
    ? JSON.parse(meeting.summary.keyPoints)
    : [];
  const decisions = meeting.summary?.decisions
    ? JSON.parse(meeting.summary.decisions)
    : [];
  const participants = meeting.participants
    ? JSON.parse(meeting.participants)
    : [];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/meetings">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meetings
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{meeting.title}</h1>
            <Badge
              variant="secondary"
              className={getStatusColor(meeting.status)}
            >
              {meeting.status}
            </Badge>
          </div>
          {meeting.description && (
            <p className="text-muted-foreground">{meeting.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(meeting.date, "MMMM d, yyyy")}
            </span>
            {meeting.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {meeting.duration} minutes
              </span>
            )}
            {participants.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {participants.length} participants
              </span>
            )}
          </div>
        </div>
        {meeting.status === "processing" && (
          <Button disabled>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </Button>
        )}
      </div>

      {/* Processing State */}
      {meeting.status === "processing" && (
        <Card>
          <CardContent className="text-center py-12">
            <RefreshCw className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Processing your meeting</h3>
            <p className="text-muted-foreground">
              We&apos;re transcribing and analyzing your audio. This may take a few minutes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Failed State */}
      {meeting.status === "failed" && (
        <Card className="border-red-200">
          <CardContent className="text-center py-12">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">!</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Processing failed</h3>
            <p className="text-muted-foreground mb-4">
              There was an error processing your meeting. Please try uploading again.
            </p>
            <Link href="/upload">
              <Button>Try Again</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Completed State */}
      {meeting.status === "completed" && meeting.summary && (
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList>
            <TabsTrigger value="summary">
              <FileText className="mr-2 h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="actions">
              <CheckSquare className="mr-2 h-4 w-4" />
              Action Items ({meeting.actionItems?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="transcript">
              <FileText className="mr-2 h-4 w-4" />
              Transcript
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{meeting.summary.summary}</p>
              </CardContent>
            </Card>

            {keyPoints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Key Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {keyPoints.map((point: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {decisions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Decisions Made</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {decisions.map((decision: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckSquare className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Action Items Tab */}
          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle>Action Items</CardTitle>
                <CardDescription>
                  Tasks and follow-ups from this meeting
                </CardDescription>
              </CardHeader>
              <CardContent>
                {meeting.actionItems && meeting.actionItems.length > 0 ? (
                  <div className="space-y-4">
                    {meeting.actionItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 p-4 border rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed || false}
                          readOnly
                          className="mt-1 h-4 w-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`font-medium ${
                                item.completed
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {item.title}
                            </span>
                            <Badge
                              variant="secondary"
                              className={getPriorityColor(item.priority)}
                            >
                              {item.priority}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {item.assignee && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {item.assignee}
                              </span>
                            )}
                            {item.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due {format(item.dueDate, "MMM d")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No action items found for this meeting
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transcript Tab */}
          <TabsContent value="transcript">
            <Card>
              <CardHeader>
                <CardTitle>Transcript</CardTitle>
                <CardDescription>
                  Full transcription of the meeting audio
                </CardDescription>
              </CardHeader>
              <CardContent>
                {meeting.summary.transcript ? (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                      {meeting.summary.transcript}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Transcript not available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Pending State */}
      {meeting.status === "pending" && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Waiting to process</h3>
            <p className="text-muted-foreground">
              This meeting is queued for processing and will be analyzed shortly.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
