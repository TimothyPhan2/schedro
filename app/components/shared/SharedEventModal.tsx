'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { CalendarIcon, Clock, MapPin, FileText, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface SharedEventModalProps {
  isOpen: boolean
  onClose: () => void
  calendarId: string
  token: string
  selectedDate?: Date
  selectedEvent?: {
    id: string
    title: string
    description: string
    location: string
    start_time: string
    end_time: string
    all_day: boolean
    color?: string
  }
}

export function SharedEventModal({
  isOpen,
  onClose,
  calendarId,
  token,
  selectedDate,
  selectedEvent
}: SharedEventModalProps) {
  const [title, setTitle] = useState(selectedEvent?.title || '')
  const [description, setDescription] = useState(selectedEvent?.description || '')
  const [location, setLocation] = useState(selectedEvent?.location || '')
  const [allDay, setAllDay] = useState(selectedEvent?.all_day || false)
  const [startDate, setStartDate] = useState(
    selectedEvent ? selectedEvent.start_time.split('T')[0] : 
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  )
  const [startTime, setStartTime] = useState(
    selectedEvent ? selectedEvent.start_time.split('T')[1]?.substring(0, 5) : '09:00'
  )
  const [endDate, setEndDate] = useState(
    selectedEvent ? selectedEvent.end_time.split('T')[0] : 
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  )
  const [endTime, setEndTime] = useState(
    selectedEvent ? selectedEvent.end_time.split('T')[1]?.substring(0, 5) : '10:00'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!selectedEvent

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const startDateTime = allDay ? 
        `${startDate}T00:00:00.000Z` : 
        `${startDate}T${startTime}:00.000Z`
      
      const endDateTime = allDay ? 
        `${endDate}T23:59:59.999Z` : 
        `${endDate}T${endTime}:00.000Z`

      const eventData = {
        title,
        description,
        location,
        start_time: startDateTime,
        end_time: endDateTime,
        all_day: allDay,
        calendar_id: calendarId
      }

      // Build URL with password if needed (same logic as SharedCalendarView)
      const url = new URL(
        isEditing ? `/api/shared/${token}/events/${selectedEvent.id}` : `/api/shared/${token}/events`,
        window.location.origin
      )
      
      // Check if password is in URL params and add it to API call
      const urlParams = new URLSearchParams(window.location.search)
      const password = urlParams.get('password')
      if (password) {
        url.searchParams.set('password', password)
      }
      
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to save event')
      }

      onClose()
      // Refresh the page to show updated events
      window.location.reload()
    } catch (err) {
      console.error('Error saving event:', err)
      setError(err instanceof Error ? err.message : 'Failed to save event')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedEvent) return
    
    setLoading(true)
    setError(null)

    try {
      // Build URL with password if needed
      const url = new URL(`/api/shared/${token}/events/${selectedEvent.id}`, window.location.origin)
      
      // Check if password is in URL params and add it to API call
      const urlParams = new URLSearchParams(window.location.search)
      const password = urlParams.get('password')
      if (password) {
        url.searchParams.set('password', password)
      }

      const response = await fetch(url.toString(), {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete event')
      }

      onClose()
      // Refresh the page to show updated events
      window.location.reload()
    } catch (err) {
      console.error('Error deleting event:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {isEditing ? 'Edit Event' : 'Create Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="all-day"
              checked={allDay}
              onCheckedChange={setAllDay}
            />
            <Label htmlFor="all-day">All day event</Label>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {!allDay && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location (optional)"
                className="pl-10"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter event description (optional)"
                className="pl-10 min-h-[100px]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {isEditing && (
                <Button 
                  type="button"
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Event'}
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !title.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  isEditing ? 'Update Event' : 'Create Event'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 