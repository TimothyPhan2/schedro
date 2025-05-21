'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function HomeClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <>
      <div className="space-x-4">
        <Button
          size="lg"
          onClick={() => router.push('/register')}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Get Started
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push('/login')}
          className="border-primary text-primary hover:bg-primary/10"
        >
          Sign In
        </Button>
      </div>
    </>
  );
} 