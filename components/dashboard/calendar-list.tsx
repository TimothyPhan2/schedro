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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {calendars.map((calendar) => (
        <Card key={calendar.id} className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold">{calendar.name}</CardTitle>
              {calendar.is_primary && (
                <Badge variant="secondary" className="mt-1">Primary</Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{calendar.eventCount || 0}</span>
            </div>
          </CardHeader>
          
          <CardContent className="flex-grow">
            {calendar.description ? (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {calendar.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description</p>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between pt-2">
            <Link href={`/calendar/${calendar.id}`} passHref>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <EyeIcon className="h-3 w-3" />
                View
              </Button>
            </Link>
            
            <div className="flex space-x-2">
              <Link href={`/calendar/${calendar.id}/edit`} passHref>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <PencilIcon className="h-3 w-3" />
                  Edit
                </Button>
              </Link>
              
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(calendar.id)}
                >
                  <TrashIcon className="h-3 w-3" />
                  Delete
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
      
      <Card className="flex flex-col items-center justify-center p-6 border-dashed">
        <CalendarIcon className="h-8 w-8 mb-2 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-1">Create New Calendar</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Add a new calendar for work, personal events, or any category
        </p>
        <Link href="/calendar/new" passHref>
          <Button>Create Calendar</Button>
        </Link>
      </Card>
    </div>
  );
} 