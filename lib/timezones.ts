// Common timezone list for user selection
export const commonTimezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Moscow',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Pacific/Auckland',
  'America/Toronto',
  'America/Vancouver',
  'America/Sao_Paulo',
  'America/Mexico_City',
  'America/Argentina/Buenos_Aires',
  'Africa/Cairo',
  'Africa/Johannesburg',
];

// Get display name for timezone
export function getTimezoneDisplayName(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'long',
    });
    
    const parts = formatter.formatToParts(now);
    const timezoneName = parts.find(part => part.type === 'timeZoneName')?.value || timezone;
    
    // Get offset
    const offset = getTimezoneOffset(timezone);
    
    return `(GMT${offset}) ${timezoneName}`;
  } catch (error) {
    return timezone;
  }
}

// Get timezone offset string (e.g., "+05:30", "-08:00")
export function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
    
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.round((Math.abs(offset) - hours) * 60);
    
    const sign = offset >= 0 ? '+' : '-';
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${sign}${formattedHours}:${formattedMinutes}`;
  } catch (error) {
    return '+00:00';
  }
}

// Get all available timezones (full list)
export function getAllTimezones(): string[] {
  return Intl.supportedValuesOf('timeZone');
}

// Auto-detect user's timezone
export function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return 'UTC';
  }
}

// Group timezones by region
export function groupTimezonesByRegion(timezones: string[] = commonTimezones) {
  const groups: Record<string, string[]> = {};
  
  timezones.forEach(tz => {
    const parts = tz.split('/');
    const region = parts[0];
    
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(tz);
  });
  
  return groups;
} 