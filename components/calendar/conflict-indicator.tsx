"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConflictIndicatorProps {
  message?: string;
  conflictCount?: number;
}

export function ConflictIndicator({ 
  message = "This event overlaps with existing events", 
  conflictCount 
}: ConflictIndicatorProps) {
  return (
    <Alert variant="destructive" className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        {message}
        {conflictCount && conflictCount > 1 && (
          <span className="font-medium ml-1">
            ({conflictCount} conflicts)
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
} 