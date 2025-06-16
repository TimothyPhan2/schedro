import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface UserPreferences {
  id?: string;
  user_id?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  timezone: string;
  locale: string;
  date_format: string;
  time_format: string;
  default_view: string;
  start_of_week: number;
  show_weekends: boolean;
  show_declined_events: boolean;
  compact_view: boolean;
  default_event_duration: number;
  default_event_color: string;
  enable_event_reminders: boolean;
  default_reminder_minutes: number;
  email_notifications: boolean;
  calendar_invitations: boolean;
  event_reminders: boolean;
  shared_calendar_updates: boolean;
  allow_public_profile: boolean;
  default_calendar_visibility: string;
  theme: string;
  sidebar_collapsed: boolean;
  enable_animations: boolean;
  high_contrast: boolean;
  large_text: boolean;
  reduced_motion: boolean;
  created_at?: string;
  updated_at?: string;
}

export const defaultPreferences: Partial<UserPreferences> = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  locale: 'en-US',
  date_format: 'MM/dd/yyyy',
  time_format: '12h',
  default_view: 'week',
  start_of_week: 1, // Monday
  show_weekends: true,
  show_declined_events: false,
  compact_view: false,
  default_event_duration: 60,
  default_event_color: '#3b82f6',
  enable_event_reminders: true,
  default_reminder_minutes: 15,
  email_notifications: true,
  calendar_invitations: true,
  event_reminders: true,
  shared_calendar_updates: true,
  allow_public_profile: false,
  default_calendar_visibility: 'private',
  theme: 'system',
  sidebar_collapsed: false,
  enable_animations: true,
  high_contrast: false,
  large_text: false,
  reduced_motion: false,
};

interface UseUserPreferencesReturn {
  preferences: UserPreferences;
  isLoading: boolean;
  isSaving: boolean;
  hasPreferences: boolean;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useUserPreferences(): UseUserPreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences>({
    ...defaultPreferences,
  } as UserPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(false);

  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/preferences');
      
      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }
      
      const data = await response.json();
      
      if (data.hasPreferences && data.preferences) {
        setPreferences({
          ...defaultPreferences,
          ...data.preferences,
        } as UserPreferences);
        setHasPreferences(true);
      } else {
        // No preferences found, use defaults
        setPreferences({ ...defaultPreferences } as UserPreferences);
        setHasPreferences(false);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      toast.error('Failed to load user preferences');
      // Use defaults on error
      setPreferences({ ...defaultPreferences } as UserPreferences);
      setHasPreferences(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    try {
      setIsSaving(true);
      
      const updatedPreferences = {
        ...preferences,
        ...updates,
      };

      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPreferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const data = await response.json();
      
      setPreferences({
        ...defaultPreferences,
        ...data.preferences,
      } as UserPreferences);
      setHasPreferences(true);

      toast.success('Preferences updated successfully');

    } catch (error) {
      console.error('Error updating user preferences:', error);
      toast.error('Failed to update preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [preferences]);

  const refresh = useCallback(() => {
    return fetchPreferences();
  }, [fetchPreferences]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    isSaving,
    hasPreferences,
    updatePreferences,
    refresh,
  };
} 