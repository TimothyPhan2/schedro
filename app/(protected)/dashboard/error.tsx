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
        <h3 className="text-xl font-medium mb-2">Something went wrong</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {error.message || 'Failed to load dashboard data'}
        </p>
        <div className="flex gap-2">
          <Button onClick={reset}>Try again</Button>
          <Link href="/" passHref>
            <Button variant="outline">Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
