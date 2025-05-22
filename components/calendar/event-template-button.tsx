"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EventTemplate {
  name: string;
  color: string;
  duration: number; // in minutes
}

interface EventTemplateButtonProps {
  template: EventTemplate;
  onClick: () => void;
  className?: string;
}

export function EventTemplateButton({ 
  template, 
  onClick, 
  className 
}: EventTemplateButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 text-xs h-8 px-3 transition-all duration-200",
        "hover:scale-105 hover:shadow-sm",
        "border-2 hover:border-current",
        className
      )}
      style={{
        borderColor: template.color + "40", // 25% opacity
        backgroundColor: template.color + "10", // 6% opacity
        color: template.color,
      }}
    >
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: template.color }}
      />
      <span className="font-medium">{template.name}</span>
      <span className="text-xs opacity-70">{template.duration}m</span>
    </Button>
  );
} 