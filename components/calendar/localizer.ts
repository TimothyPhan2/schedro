import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { enUS } from 'date-fns/locale';

const locales = {
  'en-US': enUS,
};

// Default to browser's timezone if not specified
const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Custom format function that respects timezone
const formatWithTimeZone = (date: Date, formatStr: string, timeZone = defaultTimeZone) => {
  return formatInTimeZone(date, timeZone, formatStr);
};

// Convert a date to the specified timezone
export const toTimeZone = (date: Date, timeZone = defaultTimeZone) => {
  return toZonedTime(date, timeZone);
};

// Convert a date from a specific timezone to UTC
export const fromTimeZone = (date: Date, timeZone = defaultTimeZone) => {
  // We need to preserve the exact date and time that was selected in the calendar
  // without any timezone adjustments
  return new Date(date);
};

export const getDefaultTimeZone = () => defaultTimeZone;

export const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string) => formatWithTimeZone(date, formatStr, defaultTimeZone),
  parse,
  startOfWeek,
  getDay,
  locales,
}); 