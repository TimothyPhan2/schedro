'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

export interface CalendarThemeProps {
  className?: string;
}

export function CalendarThemeConfig({ className }: CalendarThemeProps) {
  const { theme, setTheme } = useTheme();

  return (
    <TooltipProvider delayDuration={300}>
      <div className={`flex gap-2 items-center ${className}`}>
        <div className="flex items-center gap-2" role="group" aria-label="Theme selection">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setTheme('light')}
                aria-label="Light mode"
                aria-pressed={theme === 'light'}
                className="size-8"
              >
                <SunIcon className="size-4" />
                <span className="sr-only">Light mode</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Light Mode</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setTheme('dark')}
                aria-label="Dark mode"
                aria-pressed={theme === 'dark'}
                className="size-8"
              >
                <MoonIcon className="size-4" />
                <span className="sr-only">Dark mode</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dark Mode</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setTheme('system')}
                aria-label="System theme"
                aria-pressed={theme === 'system'}
                className="size-8"
              >
                <MonitorIcon className="size-4" />
                <span className="sr-only">System theme</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>System</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
} 