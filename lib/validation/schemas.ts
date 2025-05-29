import { z } from 'zod';

// Calendar validation schemas
export const createCalendarSchema = z.object({
  name: z.string()
    .min(1, 'Calendar name is required')
    .max(100, 'Calendar name must be 100 characters or less')
    .trim(),
  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .nullable(),
  default_view: z.enum(['day', 'week', 'month', 'agenda'])
    .default('week'),
  is_primary: z.boolean()
    .default(false)
});

export const updateCalendarSchema = createCalendarSchema.partial();

// Base event schema without refinements
const baseEventSchema = z.object({
  title: z.string()
    .min(1, 'Event title is required')
    .max(200, 'Event title must be 200 characters or less')
    .trim(),
  description: z.string()
    .max(2000, 'Description must be 2000 characters or less')
    .optional()
    .nullable(),
  start_time: z.string()
    .datetime('Invalid start time format'),
  end_time: z.string()
    .datetime('Invalid end time format'),
  location: z.string()
    .max(200, 'Location must be 200 characters or less')
    .optional()
    .nullable(),
  all_day: z.boolean()
    .default(false),
  calendar_id: z.string()
    .uuid('Invalid calendar ID format'),
  calendarId: z.string()
    .uuid('Invalid calendar ID format')
    .optional(), // Allow both field names for compatibility
  group_id: z.string()
    .uuid('Invalid group ID format')
    .optional()
    .nullable(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .optional()
    .nullable()
});

// Event validation schemas with refinements
export const createEventSchema = baseEventSchema.refine((data) => {
  // Ensure end time is after start time
  const startTime = new Date(data.start_time);
  const endTime = new Date(data.end_time);
  return endTime > startTime;
}, {
  message: 'End time must be after start time',
  path: ['end_time']
});

// Update schema using the base schema for partial functionality
export const updateEventSchema = baseEventSchema.partial().extend({
  id: z.string().uuid('Invalid event ID format')
}).refine((data) => {
  // Only validate dates if both are provided
  if (data.start_time && data.end_time) {
    const startTime = new Date(data.start_time);
    const endTime = new Date(data.end_time);
    return endTime > startTime;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['end_time']
});

// Group validation schemas
export const createGroupSchema = z.object({
  name: z.string()
    .min(1, 'Group name is required')
    .max(100, 'Group name must be 100 characters or less')
    .trim(),
  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .nullable(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .default('#3366FF')
});

export const updateGroupSchema = createGroupSchema.partial();

// Query parameter validation schemas
export const calendarQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  isPrimary: z.enum(['true', 'false']).optional()
});

export const eventQuerySchema = z.object({
  calendarId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  id: z.string().uuid().optional()
});

// Path parameter validation schemas
export const idParamsSchema = z.object({
  id: z.string().uuid('Invalid ID format')
});

// Generic validation utilities
export const uuidSchema = z.string().uuid('Invalid ID format');
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

// Validation error handler
export interface ValidationError {
  field: string;
  message: string;
}

export function formatValidationErrors(error: z.ZodError): ValidationError[] {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));
} 