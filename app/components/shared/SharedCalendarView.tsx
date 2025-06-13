'use client'

import { useState, useEffect, useCallback } from 'react'
import { CalendarView } from '@/components/calendar/calendar-view'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Share, Shield, Eye, Edit, Clock } from 'lucide-react'
import { SharedEventModal } from './SharedEventModal'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import type { AppEvent } from '@/lib/types/event'
import type { SharedLinkPermission } from '@/lib/permissions/types'

interface SharedCalendarViewProps {
  permission: SharedLinkPermission
  token: string
}

interface SharedCalendarData {
  events: AppEvent[]
  calendarId: string
  permissions: 'view' | 'edit'
  isPasswordProtected: boolean
  expiresAt: string | null
}

interface SelectedEventData {
  id: string
  title: string
  description: string
  location: string
  start_time: string
  end_time: string
  all_day: boolean
  color?: string
}

export function SharedCalendarView({ permission, token }: SharedCalendarViewProps) {
  const [data, setData] = useState<SharedCalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedEvent, setSelectedEvent] = useState<SelectedEventData | undefined>(undefined)

  const fetchCalendarData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      // Build URL with password if needed
      const url = new URL(`/api/shared/${token}/events`, window.location.origin)
      if (permission.isPasswordProtected) {
        const urlParams = new URLSearchParams(window.location.search)
        const password = urlParams.get('password')
        if (password) {
          url.searchParams.set('password', password)
        }
      }

      const response = await fetch(url.toString())
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch calendar data')
      }

      setData(result)
    } catch (err) {
      console.error('Error fetching shared calendar data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load calendar')
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [token, permission.isPasswordProtected])

  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  const formatExpiryDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const isExpiringSoon = (dateStr: string | null) => {
    if (!dateStr) return false
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (data?.permissions === 'edit') {
      setSelectedDate(slotInfo.start)
      setSelectedEvent(undefined)
      setIsEventModalOpen(true)
    }
  }

  const handleSelectEvent = (event: AppEvent) => {
    if (data?.permissions === 'edit') {
      // Convert AppEvent to SelectedEventData format
      const eventData: SelectedEventData = {
        id: String(event.id),
        title: event.title,
        description: event.description || '',
        location: event.location || '',
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        all_day: event.allDay || false,
        color: event.color
      }
      setSelectedEvent(eventData)
      setSelectedDate(undefined)
      setIsEventModalOpen(true)
    }
  }

  const handleCloseModal = async () => {
    setIsEventModalOpen(false)
    setSelectedDate(undefined)
    setSelectedEvent(undefined)
    
    // Refresh events data without showing loading spinner
    await fetchCalendarData(false)
  }

  const handleFabClick = () => {
    if (data?.permissions === 'edit') {
      // Create event with current date pre-selected
      const today = new Date()
      setSelectedDate(today)
      setSelectedEvent(undefined)
      setIsEventModalOpen(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading shared calendar...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertDescription>No calendar data available.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Share className="h-6 w-6 text-muted-foreground" />
              <div>
                <h1 className="text-2xl font-bold">Shared Calendar</h1>
                <p className="text-sm text-muted-foreground">
                  Calendar ID: {data.calendarId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Permission Badge */}
              <Badge variant={data.permissions === 'edit' ? 'default' : 'secondary'}>
                {data.permissions === 'edit' ? (
                  <>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit Access
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    View Only
                  </>
                )}
              </Badge>

              {/* Password Protection Badge */}
              {data.isPasswordProtected && (
                <Badge variant="outline">
                  <Shield className="h-3 w-3 mr-1" />
                  Protected
                </Badge>
              )}

              {/* Expiry Badge */}
              {data.expiresAt && (
                <Badge 
                  variant={isExpiringSoon(data.expiresAt) ? 'destructive' : 'outline'}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Expires {formatExpiryDate(data.expiresAt)}
                </Badge>
              )}
            </div>
          </div>

          {/* Expiry Warning */}
          {data.expiresAt && isExpiringSoon(data.expiresAt) && (
            <Alert className="mt-4" variant="destructive">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                This shared calendar link will expire on {formatExpiryDate(data.expiresAt)}. 
                Contact the calendar owner for an updated link.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="container mx-auto px-4 py-6">
        <CalendarView
          events={data.events}
          calendarId={data.calendarId}
          // Set readOnly based on permissions - view permissions get read-only calendar
          readOnly={data.permissions === 'view'}
          // Custom event handlers for shared calendars with edit permissions
          onSelectSlot={data.permissions === 'edit' ? handleSelectSlot : undefined}
          onSelectEvent={data.permissions === 'edit' ? handleSelectEvent : undefined}
          // Show theme controls for better UX but hide timezone selector for simplicity
          showThemeControls={true}
          showTimezoneSelector={false}
        />
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/50 py-4 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Shared calendar • {data.events.length} events
            </div>
            <div>
              {data.permissions === 'view' ? 'Read-only access' : 'Full access'}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for mobile event creation */}
      {data.permissions === 'edit' && (
        <FloatingActionButton onClick={handleFabClick} />
      )}

      {/* Shared Event Modal */}
      {data.permissions === 'edit' && (
        <SharedEventModal
          isOpen={isEventModalOpen}
          onClose={handleCloseModal}
          token={token}
          selectedDate={selectedDate}
          selectedEvent={selectedEvent}
        />
      )}
    </div>
  )
} 