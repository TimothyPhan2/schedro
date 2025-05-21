'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export function NavLinks() {
  return (
    <nav className="flex gap-4 sm:gap-6 items-center">
      <Link 
        className="text-sm font-medium text-muted-foreground hover:text-primary underline-offset-4"
        href="/login"
      >
        Sign In
      </Link>
      <Link
        className="text-sm font-medium text-muted-foreground hover:text-primary underline-offset-4"
        href="/register"
      >
        Sign Up
      </Link>
      <ThemeToggle />
    </nav>
  );
} 