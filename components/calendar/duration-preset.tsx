"use client";

import { Button } from "@/components/ui/button";
import { FormLabel, FormDescription } from "@/components/ui/form";
import { format } from "date-fns";

interface DurationPresetProps {
  /** Called when a duration preset is selected */
  onDurationSelect: (durationMinutes: number) => void;
  /** Whether to show the component (typically hidden for all-day events) */
  show?: boolean;
  /** Custom preset options - defaults to common meeting durations */
  presets?: ReadonlyArray<{
    label: string;
    minutes: number;
  }>;
  /** Custom label for the preset section */
  label?: string;
  /** Custom description text */
  description?: string;
  /** Additional CSS classes */
  className?: string;
  /** Size variant for the buttons */
  buttonSize?: "sm" | "default" | "lg";
  /** Button variant */
  buttonVariant?: "default" | "outline" | "secondary" | "ghost";
}

const DEFAULT_PRESETS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
] as const;

export function DurationPreset({
  onDurationSelect,
  show = true,
  presets = DEFAULT_PRESETS,
  label = "Quick Duration",
  description = "Click to set duration from start time",
  className = "",
  buttonSize = "sm",
  buttonVariant = "outline",
}: DurationPresetProps) {
  if (!show) {
    return null;
  }

  const handlePresetClick = (minutes: number) => {
    onDurationSelect(minutes);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <FormLabel className="text-sm font-medium">{label}</FormLabel>
      <div 
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Duration presets"
      >
        {presets.map((preset) => (
          <Button
            key={preset.minutes}
            type="button"
            variant={buttonVariant}
            size={buttonSize}
            onClick={() => handlePresetClick(preset.minutes)}
            className="text-xs hover:scale-105 transition-transform duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={`Set duration to ${preset.label}`}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      {description && (
        <FormDescription className="text-xs">
          {description}
        </FormDescription>
      )}
    </div>
  );
}

// Helper function to format duration in a user-friendly way
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// Preset configurations for common use cases
export const MEETING_PRESETS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '1.5 hours', minutes: 90 },
  { label: '2 hours', minutes: 120 },
] as const;

export const FOCUS_PRESETS = [
  { label: '25 min', minutes: 25 }, // Pomodoro
  { label: '50 min', minutes: 50 }, // Focus block
  { label: '90 min', minutes: 90 }, // Deep work
  { label: '2 hours', minutes: 120 },
] as const;

export const BREAK_PRESETS = [
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
] as const; 