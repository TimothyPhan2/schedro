'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar } from '@/lib/calendars';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, EyeIcon, PencilIcon, TrashIcon, UsersIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CalendarListProps {
  calendars: Array<Calendar & { eventCount?: number }>;
  onDelete?: (calendarId: string) => void;
}

export function CalendarList({ calendars, onDelete }: CalendarListProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleExpand = (calendarId: string) => {
    setExpandedCard(expandedCard === calendarId ? null : calendarId);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {calendars.map((calendar) => (
        <Card key={calendar.id} className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg font-bold truncate pr-2">
                {calendar.name}
              </CardTitle>
              {calendar.is_primary && (
                <Badge variant="secondary" className="mt-1 text-xs">Primary</Badge>
              )}
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{calendar.eventCount || 0}</span>
            </div>
          </CardHeader>
          
          <CardContent className="flex-grow pb-3">
            {calendar.description ? (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {calendar.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description</p>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0 pt-2">
            <Link href={`/calendar/${calendar.id}`} passHref prefetch={true} className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto flex items-center justify-center gap-1">
                <EyeIcon className="h-3 w-3" />
                View
              </Button>
            </Link>
            
            <div className="flex space-x-2 w-full sm:w-auto">
              <Link href={`/calendar/${calendar.id}/edit`} passHref className="flex-1 sm:flex-initial">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto flex items-center justify-center gap-1">
                  <PencilIcon className="h-3 w-3" />
                  <span className="hidden sm:inline">Edit</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              </Link>
              
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 sm:flex-initial w-full sm:w-auto flex items-center justify-center gap-1 text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(calendar.id)}
                >
                  <TrashIcon className="h-3 w-3" />
                  <span className="hidden sm:inline">Delete</span>
                  <span className="sm:hidden">Delete</span>
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
      
      <Card className="flex flex-col items-center justify-center p-4 sm:p-6 border-dashed">
        <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-muted-foreground" />
        <h3 className="text-base sm:text-lg font-medium mb-1 text-center">Create New Calendar</h3>
        <p className="text-xs sm:text-sm text-muted-foreground text-center mb-3 sm:mb-4 px-2">
          Add a new calendar for work, personal events, or any category
        </p>
        <Link href="/calendar/new" passHref className="w-full sm:w-auto">
          <Button size="sm" className="w-full sm:w-auto">Create Calendar</Button>
        </Link>
      </Card>
    </div>
  );
} 