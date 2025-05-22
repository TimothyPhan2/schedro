'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-destructive/10">
        <h3 className="text-xl font-medium mb-2">Failed to load calendar</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {error.message || 'There was an error loading this calendar'}
        </p>
        <div className="flex gap-2">
          <Button onClick={reset}>Try again</Button>
          <Link href="/dashboard" passHref>
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
