import { useState, useCallback } from 'react';
import { AppEvent } from '@/lib/types/event';

interface UseEventsOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all events
  const getEvents = useCallback(async (params: {
    calendarId?: string;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params.calendarId) queryParams.append('calendar_id', params.calendarId);
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      
      const queryString = queryParams.toString();
      const url = `/api/events${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch events');
      }
      
      const data = await response.json();
      
      // Convert date strings to Date objects
      const formattedEvents: AppEvent[] = data.map((event: any) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        allDay: event.all_day || false,
        color: event.color,
        location: event.location,
        description: event.description,
      }));
      
      if (options.onSuccess) options.onSuccess(formattedEvents);
      
      return formattedEvents;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (options.onError) options.onError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  // Fetch a single event
  const getEvent = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/events/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch event');
      }
      
      const data = await response.json();
      
      // Convert date strings to Date objects
      const formattedEvent: AppEvent = {
        id: data.id,
        title: data.title,
        start: new Date(data.start_time),
        end: new Date(data.end_time),
        allDay: data.all_day || false,
        color: data.color,
        location: data.location,
        description: data.description,
      };
      
      if (options.onSuccess) options.onSuccess(formattedEvent);
      
      return formattedEvent;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (options.onError) options.onError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  // Create a new event
  const createEvent = useCallback(async (eventData: Omit<AppEvent, 'id'> & { calendar_id: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert Date objects to ISO strings
      const formattedData = {
        ...eventData,
        start_time: eventData.start.toISOString(),
        end_time: eventData.end.toISOString(),
        all_day: eventData.allDay || false,
      };
      
      // Remove properties that don't match the database schema
      const { start, end, allDay, ...dbEventData } = formattedData;
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dbEventData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
      
      const data = await response.json();
      
      // Convert to AppEvent format
      const createdEvent: AppEvent = {
        id: data.id,
        title: data.title,
        start: new Date(data.start_time),
        end: new Date(data.end_time),
        allDay: data.all_day || false,
        color: data.color,
        location: data.location,
        description: data.description,
      };
      
      if (options.onSuccess) options.onSuccess(createdEvent);
      
      return createdEvent;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (options.onError) options.onError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  // Update an existing event
  const updateEvent = useCallback(async (eventData: AppEvent) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert Date objects to ISO strings
      const formattedData = {
        id: eventData.id,
        title: eventData.title,
        start_time: eventData.start.toISOString(),
        end_time: eventData.end.toISOString(),
        all_day: eventData.allDay || false,
        color: eventData.color,
        location: eventData.location,
        description: eventData.description,
      };
      
      const response = await fetch('/api/events', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update event');
      }
      
      const data = await response.json();
      
      // Convert to AppEvent format
      const updatedEvent: AppEvent = {
        id: data.id,
        title: data.title,
        start: new Date(data.start_time),
        end: new Date(data.end_time),
        allDay: data.all_day || false,
        color: data.color,
        location: data.location,
        description: data.description,
      };
      
      if (options.onSuccess) options.onSuccess(updatedEvent);
      
      return updatedEvent;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (options.onError) options.onError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  // Delete an event
  const deleteEvent = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }
      
      if (options.onSuccess) options.onSuccess({ id });
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (options.onError) options.onError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  return {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    isLoading,
    error,
  };
} 