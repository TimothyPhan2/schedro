import { NextResponse } from 'next/server'

export async function POST() {
  console.log('🔥 MINIMAL API ROUTE IS WORKING!')
  
  return NextResponse.json({
    message: 'API route is accessible',
    timestamp: new Date().toISOString()
  })
} 