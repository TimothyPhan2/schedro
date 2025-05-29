import { NextResponse } from 'next/server';
import { z } from 'zod';
import { formatValidationErrors } from './schemas';

/**
 * Simple validation helper for API routes
 * Does not use Edge Runtime incompatible features
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        response: NextResponse.json({
          error: 'Validation failed',
          details: formatValidationErrors(error)
        }, { status: 400 })
      };
    }
    
    return {
      success: false,
      response: NextResponse.json({
        error: 'Invalid JSON format'
      }, { status: 400 })
    };
  }
}

export function validateQueryParams<T>(
  request: Request,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const validatedData = schema.parse(params);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        response: NextResponse.json({
          error: 'Invalid query parameters',
          details: formatValidationErrors(error)
        }, { status: 400 })
      };
    }
    
    return {
      success: false,
      response: NextResponse.json({
        error: 'Invalid query parameters'
      }, { status: 400 })
    };
  }
} 