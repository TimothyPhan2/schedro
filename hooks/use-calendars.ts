import { useState, useCallback } from 'react';
import { Database } from '@/lib/database.types';

type Calendar = Database['public']['Tables']['calendars']['Row'];

interface UseCalendarsOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useCalendars(options: UseCalendarsOptions = {}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all calendars
  const getCalendars = useCallback(async (params: {
    isPrimary?: boolean;
  } = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params.isPrimary) queryParams.append('is_primary', 'true');
      
      const queryString = queryParams.toString();
      const url = `/api/calendars${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch calendars');
      }
      
      const data = await response.json();
      
      if (options.onSuccess) options.onSuccess(data);
      
      return data as Calendar[];
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (options.onError) options.onError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  // Fetch a single calendar
  const getCalendar = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/calendars/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch calendar');
      }
      
      const data = await response.json();
      
      if (options.onSuccess) options.onSuccess(data);
      
      return data as Calendar;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (options.onError) options.onError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  // Create a new calendar
  const createCalendar = useCallback(async (calendarData: {
    name: string;
    description?: string;
    default_view?: string;
    is_primary?: boolean;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/calendars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create calendar');
      }
      
      const data = await response.json();
      
      if (options.onSuccess) options.onSuccess(data);
      
      return data as Calendar;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (options.onError) options.onError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  // Update an existing calendar
  const updateCalendar = useCallback(async (calendarData: Partial<Calendar> & { id: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/calendars', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update calendar');
      }
      
      const data = await response.json();
      
      if (options.onSuccess) options.onSuccess(data);
      
      return data as Calendar;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (options.onError) options.onError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  // Delete a calendar
  const deleteCalendar = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/calendars?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete calendar');
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
    getCalendars,
    getCalendar,
    createCalendar,
    updateCalendar,
    deleteCalendar,
    isLoading,
    error,
  };
} 