import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { meetings } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Search,
  Calendar,
  Clock,
  CheckSquare,
  ArrowRight,
  Mic,
} from "lucide-react";
import { format } from "date-fns";

export default async function MeetingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return null;
  }

  const allMeetings = await db.query.meetings.findMany({
    where: eq(meetings.userId, user.id),
    orderBy: [desc(meetings.date)],
    with: {
      actionItems: true,
    },
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage all your meeting recordings
          </p>
        </div>
        <Link href="/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Meeting
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search meetings..." className="pl-9" />
      </div>

      {/* Meetings List */}
      {allMeetings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
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
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {allMeetings.map((meeting) => (
            <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate">
                          {meeting.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(meeting.status)}
                        >
                          {meeting.status}
                        </Badge>
                      </div>
                      {meeting.description && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {meeting.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(meeting.date, "MMM d, yyyy")}
                        </span>
                        {meeting.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {meeting.duration} min
                          </span>
                        )}
                        {meeting.actionItems && meeting.actionItems.length > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckSquare className="h-4 w-4" />
                            {meeting.actionItems.length} action items
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
