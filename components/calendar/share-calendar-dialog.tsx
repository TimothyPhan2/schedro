'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Copy, Eye, Edit, Shield, Clock, ExternalLink, Loader2 } from 'lucide-react'

interface ShareCalendarDialogProps {
  isOpen: boolean
  onClose: () => void
  calendarId: string
  calendarName: string
}

interface SharedLink {
  token: string
  shareUrl: string
  permissions: 'view' | 'edit'
  passwordProtected: boolean
  expiresAt: string | null
}

export function ShareCalendarDialog({ 
  isOpen, 
  onClose, 
  calendarId, 
  calendarName 
}: ShareCalendarDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [sharedLink, setSharedLink] = useState<SharedLink | null>(null)
  const [permissions, setPermissions] = useState<'view' | 'edit'>('view')
  const [password, setPassword] = useState('')
  const [usePassword, setUsePassword] = useState(false)
  const [expiresIn, setExpiresIn] = useState<string>('7')

  const createSharedLink = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/calendars/${calendarId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permissions,
          password: usePassword ? password : undefined,
          expiresIn: expiresIn === 'never' ? undefined : parseInt(expiresIn)
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSharedLink(result)
        toast.success('Shared link created successfully!')
      } else {
        toast.error(`Failed to create shared link: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating shared link:', error)
      toast.error('Failed to create shared link')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleClose = () => {
    setSharedLink(null)
    setPassword('')
    setUsePassword(false)
    setPermissions('view')
    setExpiresIn('7')
    onClose()
  }

  const formatExpiryDate = (expiresAt: string | null) => {
    if (!expiresAt) return 'Never'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(expiresAt))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Share Calendar
          </DialogTitle>
          <DialogDescription>
            Create a secure shareable link for &quot;{calendarName}&quot;
          </DialogDescription>
        </DialogHeader>

        {!sharedLink ? (
          <div className="space-y-6">
            {/* Permissions */}
            <div className="space-y-2">
              <Label>Permissions</Label>
              <Select value={permissions} onValueChange={(value: 'view' | 'edit') => setPermissions(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Only - Can see events but not modify
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Full Access - Can view and edit events
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password Protection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-password">Password Protection</Label>
                <Switch
                  id="use-password"
                  checked={usePassword}
                  onCheckedChange={setUsePassword}
                />
              </div>
              {usePassword && (
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Recipients will need this password to access the calendar
                  </p>
                </div>
              )}
            </div>

            {/* Expiry */}
            <div className="space-y-2">
              <Label>Link Expiry</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never expires</SelectItem>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">1 week</SelectItem>
                  <SelectItem value="30">1 month</SelectItem>
                  <SelectItem value="90">3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Success message */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✅ Shared link created successfully!
              </p>
            </div>

            {/* Link details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={sharedLink.permissions === 'edit' ? 'default' : 'secondary'}>
                  {sharedLink.permissions === 'edit' ? (
                    <>
                      <Edit className="h-3 w-3 mr-1" />
                      Full Access
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      View Only
                    </>
                  )}
                </Badge>

                {sharedLink.passwordProtected && (
                  <Badge variant="outline">
                    <Shield className="h-3 w-3 mr-1" />
                    Password Protected
                  </Badge>
                )}

                {sharedLink.expiresAt && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    Expires {formatExpiryDate(sharedLink.expiresAt)}
                  </Badge>
                )}
              </div>

              {/* Share URL */}
              <div className="space-y-2">
                <Label>Share URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={sharedLink.shareUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(sharedLink.shareUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openLink(sharedLink.shareUrl)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Password info */}
              {sharedLink.passwordProtected && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    🔐 This link is password protected. Share the password separately for security.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {!sharedLink ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={createSharedLink} 
                disabled={isLoading || (usePassword && !password.trim())}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Share Link
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 