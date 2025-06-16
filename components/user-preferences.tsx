'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, User, Bell, Eye, Palette, Globe, Clock } from 'lucide-react';
import { useUserPreferences, type UserPreferences } from '@/hooks/use-user-preferences';
import { commonTimezones, getTimezoneDisplayName, detectUserTimezone } from '@/lib/timezones';

export default function UserPreferences() {
  const { preferences, isLoading, isSaving, updatePreferences } = useUserPreferences();
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences);

  // Update local state when preferences change
  React.useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleSave = async () => {
    await updatePreferences(localPreferences);
  };

  const handleFieldChange = (field: keyof UserPreferences, value: any) => {
    setLocalPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const autoDetectTimezone = () => {
    const detected = detectUserTimezone();
    handleFieldChange('timezone', detected);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading preferences...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Clock className="mr-2 h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="localization">
            <Globe className="mr-2 h-4 w-4" />
            Localization
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Eye className="mr-2 h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and bio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={localPreferences.display_name || ''}
                  onChange={(e) => handleFieldChange('display_name', e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={localPreferences.bio || ''}
                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  value={localPreferences.avatar_url || ''}
                  onChange={(e) => handleFieldChange('avatar_url', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calendar Preferences</CardTitle>
                <CardDescription>
                  Customize how your calendar displays and behaves
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default_view">Default View</Label>
                    <Select
                      value={localPreferences.default_view}
                      onValueChange={(value) => handleFieldChange('default_view', value)}
                    >
                      <SelectTrigger id="default_view">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="agenda">Agenda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_of_week">Start of Week</Label>
                    <Select
                      value={localPreferences.start_of_week?.toString()}
                      onValueChange={(value) => handleFieldChange('start_of_week', parseInt(value))}
                    >
                      <SelectTrigger id="start_of_week">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default_event_duration">Default Event Duration (minutes)</Label>
                    <Select
                      value={localPreferences.default_event_duration?.toString()}
                      onValueChange={(value) => handleFieldChange('default_event_duration', parseInt(value))}
                    >
                      <SelectTrigger id="default_event_duration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default_event_color">Default Event Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="default_event_color"
                        type="color"
                        value={localPreferences.default_event_color}
                        onChange={(e) => handleFieldChange('default_event_color', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={localPreferences.default_event_color}
                        onChange={(e) => handleFieldChange('default_event_color', e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Display Options</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Weekends</Label>
                        <p className="text-sm text-muted-foreground">
                          Display Saturday and Sunday in calendar views
                        </p>
                      </div>
                      <Switch
                        checked={localPreferences.show_weekends}
                        onCheckedChange={(checked) => handleFieldChange('show_weekends', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Compact View</Label>
                        <p className="text-sm text-muted-foreground">
                          Use a more condensed calendar layout
                        </p>
                      </div>
                      <Switch
                        checked={localPreferences.compact_view}
                        onCheckedChange={(checked) => handleFieldChange('compact_view', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Declined Events</Label>
                        <p className="text-sm text-muted-foreground">
                          Display events you've declined
                        </p>
                      </div>
                      <Switch
                        checked={localPreferences.show_declined_events}
                        onCheckedChange={(checked) => handleFieldChange('show_declined_events', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Reminders</CardTitle>
                <CardDescription>
                  Configure default reminder settings for new events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Event Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically add reminders to new events
                    </p>
                  </div>
                  <Switch
                    checked={localPreferences.enable_event_reminders}
                    onCheckedChange={(checked) => handleFieldChange('enable_event_reminders', checked)}
                  />
                </div>

                {localPreferences.enable_event_reminders && (
                  <div className="space-y-2">
                    <Label htmlFor="default_reminder_minutes">Default Reminder Time</Label>
                    <Select
                      value={localPreferences.default_reminder_minutes?.toString()}
                      onValueChange={(value) => handleFieldChange('default_reminder_minutes', parseInt(value))}
                    >
                      <SelectTrigger id="default_reminder_minutes">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes before</SelectItem>
                        <SelectItem value="10">10 minutes before</SelectItem>
                        <SelectItem value="15">15 minutes before</SelectItem>
                        <SelectItem value="30">30 minutes before</SelectItem>
                        <SelectItem value="60">1 hour before</SelectItem>
                        <SelectItem value="120">2 hours before</SelectItem>
                        <SelectItem value="1440">1 day before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Localization Tab */}
        <TabsContent value="localization">
          <Card>
            <CardHeader>
              <CardTitle>Localization Settings</CardTitle>
              <CardDescription>
                Configure timezone, language, and formatting preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={autoDetectTimezone}
                    type="button"
                  >
                    Auto-detect
                  </Button>
                </div>
                <Select
                  value={localPreferences.timezone}
                  onValueChange={(value) => handleFieldChange('timezone', value)}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {commonTimezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {getTimezoneDisplayName(tz)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_format">Date Format</Label>
                  <Select
                    value={localPreferences.date_format}
                    onValueChange={(value) => handleFieldChange('date_format', value)}
                  >
                    <SelectTrigger id="date_format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/dd/yyyy">MM/dd/yyyy (US)</SelectItem>
                      <SelectItem value="dd/MM/yyyy">dd/MM/yyyy (EU)</SelectItem>
                      <SelectItem value="yyyy-MM-dd">yyyy-MM-dd (ISO)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time_format">Time Format</Label>
                  <Select
                    value={localPreferences.time_format}
                    onValueChange={(value) => handleFieldChange('time_format', value)}
                  >
                    <SelectTrigger id="time_format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locale">Language & Region</Label>
                <Select
                  value={localPreferences.locale}
                  onValueChange={(value) => handleFieldChange('locale', value)}
                >
                  <SelectTrigger id="locale">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                    <SelectItem value="fr-FR">Français</SelectItem>
                    <SelectItem value="de-DE">Deutsch</SelectItem>
                    <SelectItem value="it-IT">Italiano</SelectItem>
                    <SelectItem value="pt-PT">Português</SelectItem>
                    <SelectItem value="ja-JP">日本語</SelectItem>
                    <SelectItem value="ko-KR">한국어</SelectItem>
                    <SelectItem value="zh-CN">中文 (简体)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive general notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={localPreferences.email_notifications}
                    onCheckedChange={(checked) => handleFieldChange('email_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Calendar Invitations</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you receive calendar invitations
                    </p>
                  </div>
                  <Switch
                    checked={localPreferences.calendar_invitations}
                    onCheckedChange={(checked) => handleFieldChange('calendar_invitations', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Event Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminder notifications for upcoming events
                    </p>
                  </div>
                  <Switch
                    checked={localPreferences.event_reminders}
                    onCheckedChange={(checked) => handleFieldChange('event_reminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Shared Calendar Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when shared calendars are updated
                    </p>
                  </div>
                  <Switch
                    checked={localPreferences.shared_calendar_updates}
                    onCheckedChange={(checked) => handleFieldChange('shared_calendar_updates', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to see your public profile information
                    </p>
                  </div>
                  <Switch
                    checked={localPreferences.allow_public_profile}
                    onCheckedChange={(checked) => handleFieldChange('allow_public_profile', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_calendar_visibility">Default Calendar Visibility</Label>
                  <Select
                    value={localPreferences.default_calendar_visibility}
                    onValueChange={(value) => handleFieldChange('default_calendar_visibility', value)}
                  >
                    <SelectTrigger id="default_calendar_visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Default visibility setting for new calendars you create
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme & Interface</CardTitle>
                <CardDescription>
                  Customize the appearance of your calendar interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={localPreferences.theme}
                    onValueChange={(value) => handleFieldChange('theme', value)}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sidebar Collapsed</Label>
                      <p className="text-sm text-muted-foreground">
                        Start with sidebar collapsed by default
                      </p>
                    </div>
                    <Switch
                      checked={localPreferences.sidebar_collapsed}
                      onCheckedChange={(checked) => handleFieldChange('sidebar_collapsed', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Animations</Label>
                      <p className="text-sm text-muted-foreground">
                        Show smooth transitions and animations
                      </p>
                    </div>
                    <Switch
                      checked={localPreferences.enable_animations}
                      onCheckedChange={(checked) => handleFieldChange('enable_animations', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>
                  Options to improve accessibility and usability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>High Contrast</Label>
                      <p className="text-sm text-muted-foreground">
                        Use high contrast colors for better visibility
                      </p>
                    </div>
                    <Switch
                      checked={localPreferences.high_contrast}
                      onCheckedChange={(checked) => handleFieldChange('high_contrast', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Large Text</Label>
                      <p className="text-sm text-muted-foreground">
                        Use larger text sizes throughout the interface
                      </p>
                    </div>
                    <Switch
                      checked={localPreferences.large_text}
                      onCheckedChange={(checked) => handleFieldChange('large_text', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reduced Motion</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimize animations and motion effects
                      </p>
                    </div>
                    <Switch
                      checked={localPreferences.reduced_motion}
                      onCheckedChange={(checked) => handleFieldChange('reduced_motion', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 