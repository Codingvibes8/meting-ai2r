import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { meetings, actionItems } from "@/lib/schema";
import { eq, desc, and, count } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Calendar,
  CheckSquare,
  Clock,
  ArrowRight,
  Mic,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const recentMeetings = await db.query.meetings.findMany({
    where: eq(meetings.userId, session.user.id),
    orderBy: [desc(meetings.createdAt)],
    limit: 5,
    with: {
      summary: true,
      actionItems: true,
    },
  });

  const totalMeetings = await db
    .select({ count: count() })
    .from(meetings)
    .where(eq(meetings.userId, session.user.id));

  const pendingActions = await db
    .select({ count: count() })
    .from(actionItems)
    .innerJoin(meetings, eq(actionItems.meetingId, meetings.id))
    .where(
      and(
        eq(meetings.userId, session.user.id),
        eq(actionItems.completed, false)
      )
    );

  const stats = [
    {
      title: "Total Meetings",
      value: totalMeetings[0]?.count || 0,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Pending Actions",
      value: pendingActions[0]?.count || 0,
      icon: CheckSquare,
      color: "text-orange-600",
    },
    {
      title: "This Week",
      value: recentMeetings.filter(
        (m) =>
          m.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      icon: Clock,
      color: "text-green-600",
    },
  ];

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

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {session.user.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your meeting summaries
          </p>
        </div>
        <Link href="/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Meeting
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Meetings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Meetings</CardTitle>
            <CardDescription>
              Your latest meeting summaries
            </CardDescription>
          </div>
          <Link href="/meetings">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentMeetings.length === 0 ? (
            <div className="text-center py-12">
              <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No meetings yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first meeting recording to get started
              </p>
              <Link href="/upload">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Meeting
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMeetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/meetings/${meeting.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">
                          {meeting.title}
                        </h4>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(meeting.status)}
                        >
                          {meeting.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDistanceToNow(meeting.createdAt, {
                          addSuffix: true,
                        })}
                        {meeting.duration && ` · ${meeting.duration} min`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {meeting.actionItems && meeting.actionItems.length > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckSquare className="h-4 w-4" />
                          {meeting.actionItems.length}
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
