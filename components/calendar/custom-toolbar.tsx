'use client';

import { Navigate, Views, type View, type ToolbarProps } from 'react-big-calendar';
import type { AppEvent } from '@/lib/types/event';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon, // For Month View
  ViewIcon,         // For Week View (generic, could be more specific)
  ListIcon,         // For Agenda View
  RectangleVerticalIcon, // For Day view (using a more abstract icon)
} from 'lucide-react';

interface CustomToolbarProps extends ToolbarProps<AppEvent, object> {}

export const CustomToolbar = (props: CustomToolbarProps) => {
  const { label, onNavigate, onView, view, views: availableViewsObject } = props;
  const isMobile = useMediaQuery("(max-width: 640px)");

  const navigate = (action: typeof Navigate.PREVIOUS | typeof Navigate.NEXT | typeof Navigate.TODAY | typeof Navigate.DATE) => {
    onNavigate(action);
  };

  const viewNamesGroup = (
    <ToggleGroup 
      type="single" 
      value={view} 
      onValueChange={(selectedView) => {
        if (selectedView) {
          onView(selectedView as View);
        }
      }}
      aria-label="Calendar View"
      className="flex flex-wrap justify-center gap-1"
    >
      {Array.isArray(availableViewsObject) && availableViewsObject.includes(Views.MONTH) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value={Views.MONTH} aria-label="Month view">
              <CalendarDaysIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Month View</p>
          </TooltipContent>
        </Tooltip>
      )}
      {Array.isArray(availableViewsObject) && availableViewsObject.includes(Views.WEEK) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value={Views.WEEK} aria-label="Week view">
              <ViewIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Week View</p>
          </TooltipContent>
        </Tooltip>
      )}
      {Array.isArray(availableViewsObject) && availableViewsObject.includes(Views.DAY) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value={Views.DAY} aria-label="Day view">
              <RectangleVerticalIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Day View</p>
          </TooltipContent>
        </Tooltip>
      )}
      {Array.isArray(availableViewsObject) && availableViewsObject.includes(Views.AGENDA) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value={Views.AGENDA} aria-label="Agenda view">
              <ListIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Agenda View</p>
          </TooltipContent>
        </Tooltip>
      )}
    </ToggleGroup>
  );

  return (
    <div className="rbc-toolbar mb-4 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="rbc-btn-group mb-2 sm:mb-0 flex flex-wrap justify-center w-full sm:w-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => navigate(Navigate.PREVIOUS)} aria-label="Previous Period" size={isMobile ? "sm" : "default"}>
              <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Previous {view}</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => navigate(Navigate.TODAY)} aria-label="Today" className="mx-1" size={isMobile ? "sm" : "default"}>
              Today
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go to today</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => navigate(Navigate.NEXT)} aria-label="Next Period" size={isMobile ? "sm" : "default"}>
              <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Next {view}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="rbc-toolbar-label text-base sm:text-lg font-semibold mb-2 sm:mb-0 sm:mx-4 text-center">
        {label}
      </div>
      <div className="rbc-btn-group w-full sm:w-auto flex justify-center">
        {viewNamesGroup}
      </div>
    </div>
  );
}; 