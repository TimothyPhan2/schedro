'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ShareIcon, ClockIcon } from 'lucide-react';

interface MetricsProps {
  totalCalendars: number;
  sharedCalendars: number;
  upcomingEvents: number;
  lastWeekChange?: number;
}

export function DashboardMetrics({
  totalCalendars,
  sharedCalendars,
  upcomingEvents,
  lastWeekChange = 0
}: MetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Calendars */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Calendars</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCalendars}</div>
          <p className="text-xs text-muted-foreground">
            {totalCalendars === 0 
              ? "Create your first calendar" 
              : lastWeekChange > 0 
                ? `+${lastWeekChange} from last week` 
                : lastWeekChange < 0 
                  ? `${lastWeekChange} from last week` 
                  : "±0 from last week"}
          </p>
        </CardContent>
      </Card>
      
      {/* Shared With You */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Shared With You</CardTitle>
          <ShareIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sharedCalendars}</div>
          <p className="text-xs text-muted-foreground">
            {sharedCalendars === 0 
              ? "No calendars shared with you" 
              : "Calendars shared by others"}
          </p>
        </CardContent>
      </Card>
      
      {/* Upcoming Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          <ClockIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingEvents}</div>
          <p className="text-xs text-muted-foreground">
            {upcomingEvents === 0 
              ? "No upcoming events" 
              : "In the next 7 days"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 