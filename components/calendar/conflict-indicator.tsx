"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ConflictIndicatorProps {
  /** Custom message to display */
  message?: string;
  /** Number of conflicting events */
  conflictCount?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the conflict count */
  showCount?: boolean;
}

export function ConflictIndicator({ 
  message = "This event overlaps with existing events", 
  conflictCount = 0,
  className,
  showCount = true
}: ConflictIndicatorProps) {
  // Format conflict count message
  const getConflictMessage = () => {
    if (!showCount || conflictCount <= 0) return message;
    
    const countText = conflictCount === 1 
      ? "1 conflict" 
      : `${conflictCount} conflicts`;
    
    return `${message} (${countText})`;
  };

  return (
    <Alert 
      className={cn(
        "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/50",
        "transition-all duration-200 ease-in-out",
        "shadow-sm border-l-4",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-amber-800 dark:text-amber-200 font-medium text-sm">
        {getConflictMessage()}
      </AlertDescription>
    </Alert>
  );
} 