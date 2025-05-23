'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden z-50 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add Event</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Add Event</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 