'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface CalendarThemeProps {
  className?: string;
}

export function CalendarThemeConfig({ className }: CalendarThemeProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setTheme('light')}
              aria-label="Light mode"
              className="size-8"
            >
              <SunIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Light mode</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setTheme('dark')}
              aria-label="Dark mode"
              className="size-8"
            >
              <MoonIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Dark mode</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setTheme('system')}
              aria-label="System theme"
              className="size-8"
            >
              <MonitorIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>System theme</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
} 