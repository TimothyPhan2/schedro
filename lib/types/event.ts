export interface AppEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: unknown; // For resource views, if needed later
  // Extended properties
  color?: string; // CSS color for event background
  location?: string; // Location of the event
  description?: string; // Detailed description of the event
  // We can add more properties from our database schema here as needed
} 