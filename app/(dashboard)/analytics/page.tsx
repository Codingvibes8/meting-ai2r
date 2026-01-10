import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { meetings, actionItems } from "@/lib/schema";
import { eq, desc, and, count, sql, gte } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, CheckSquare, TrendingUp } from "lucide-react";
import { AnalyticsCharts } from "@/components/analytics-charts";

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Get all meetings for the user
  const allMeetings = await db.query.meetings.findMany({
    where: eq(meetings.userId, session.user.id),
    orderBy: [desc(meetings.date)],
  });

  // Calculate stats
  const totalMeetings = allMeetings.length;
  const completedMeetings = allMeetings.filter(
    (m) => m.status === "completed"
  ).length;
  const totalDuration = allMeetings.reduce(
    (acc, m) => acc + (m.duration || 0),
    0
  );
  const avgDuration =
    completedMeetings > 0 ? Math.round(totalDuration / completedMeetings) : 0;

  // Get action items stats
  const allActionItems = await db
    .select()
    .from(actionItems)
    .innerJoin(meetings, eq(actionItems.meetingId, meetings.id))
    .where(eq(meetings.userId, session.user.id));

  const completedActions = allActionItems.filter(
    (a) => a.action_items.completed
  ).length;
  const totalActions = allActionItems.length;
  const completionRate =
    totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // Meetings by month for chart
  const meetingsByMonth = allMeetings.reduce(
    (acc, meeting) => {
      const month = new Date(meeting.date).toLocaleString("default", {
        month: "short",
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const monthlyData = Object.entries(meetingsByMonth)
    .slice(-6)
    .map(([month, count]) => ({
      month,
      meetings: count,
    }));

  // Duration trend
  const durationByMonth = allMeetings.reduce(
    (acc, meeting) => {
      const month = new Date(meeting.date).toLocaleString("default", {
        month: "short",
      });
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0 };
      }
      acc[month].total += meeting.duration || 0;
      acc[month].count += 1;
      return acc;
    },
    {} as Record<string, { total: number; count: number }>
  );

  const durationData = Object.entries(durationByMonth)
    .slice(-6)
    .map(([month, data]) => ({
      month,
      avgDuration: Math.round(data.total / data.count) || 0,
    }));

  const stats = [
    {
      title: "Total Meetings",
      value: totalMeetings,
      icon: Calendar,
      description: `${completedMeetings} completed`,
      color: "text-blue-600",
    },
    {
      title: "Total Duration",
      value: `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`,
      icon: Clock,
      description: `${avgDuration} min average`,
      color: "text-green-600",
    },
    {
      title: "Action Items",
      value: totalActions,
      icon: CheckSquare,
      description: `${completedActions} completed`,
      color: "text-orange-600",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      description: "Action items done",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Insights and trends from your meeting data
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <AnalyticsCharts monthlyData={monthlyData} durationData={durationData} />
    </div>
  );
}
