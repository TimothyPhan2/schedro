'use client';

import { useState, useEffect } from 'react';

export type EventColorScheme = 
  | 'default'  // Primary color from theme
  | 'blue'     // Blue theme
  | 'green'    // Green theme
  | 'amber'    // Amber theme
  | 'red'      // Red theme
  | 'purple';  // Purple theme

interface EventTheme {
  name: string;
  eventBg: string;
  eventText: string;
}

// Define the themes with their properties
const eventThemes: Record<EventColorScheme, EventTheme> = {
  default: {
    name: 'Default',
    eventBg: 'var(--primary)',
    eventText: 'var(--primary-foreground)',
  },
  blue: {
    name: 'Blue',
    eventBg: '#3b82f6',
    eventText: 'white',
  },
  green: {
    name: 'Green',
    eventBg: '#10b981',
    eventText: 'white',
  },
  amber: {
    name: 'Amber',
    eventBg: '#f59e0b',
    eventText: 'white',
  },
  red: {
    name: 'Red',
    eventBg: '#ef4444',
    eventText: 'white',
  },
  purple: {
    name: 'Purple',
    eventBg: '#8b5cf6',
    eventText: 'white',
  },
};

// Hook for managing calendar theme
export function useCalendarTheme(initialTheme: EventColorScheme = 'default') {
  const [colorScheme, setColorScheme] = useState<EventColorScheme>(initialTheme);
  
  // Apply the theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const theme = eventThemes[colorScheme];
    
    if (theme) {
      // Apply CSS variables to the document root
      root.style.setProperty('--calendar-event-bg', theme.eventBg);
      root.style.setProperty('--calendar-event-text', theme.eventText);
      root.style.setProperty('--calendar-event-border', theme.eventBg);
      
      // Force refresh of event styles by adding and removing a class
      document.body.classList.add('theme-update');
      setTimeout(() => {
        document.body.classList.remove('theme-update');
      }, 10);
    }
    
    return () => {
      // Just reset the variables to default on unmount
      const defaultTheme = eventThemes['default'];
      root.style.setProperty('--calendar-event-bg', defaultTheme.eventBg);
      root.style.setProperty('--calendar-event-text', defaultTheme.eventText);
      root.style.setProperty('--calendar-event-border', defaultTheme.eventBg);
    };
  }, [colorScheme]);
  
  // Function to get inline style for specific event with optional override
  const getEventStyle = (overrideColor?: string) => {
    if (overrideColor) {
      return {
        backgroundColor: overrideColor,
        color: getContrastColor(overrideColor),
        borderColor: overrideColor,
      };
    }
    
    // If no override color, return the current theme colors
    // This ensures inline styles take precedence over CSS variables
    const theme = eventThemes[colorScheme];
    return {
      backgroundColor: theme.eventBg,
      color: theme.eventText,
      borderColor: theme.eventBg,
    };
  };
  
  // Helper to get contrasting text color based on background
  const getContrastColor = (hexColor: string): string => {
    // Convert hex to RGB
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    
    // Calculate brightness - higher values are brighter
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return white for dark backgrounds, black for light backgrounds
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };
  
  return {
    colorScheme,
    setColorScheme,
    getEventStyle,
    availableThemes: eventThemes,
  };
} 