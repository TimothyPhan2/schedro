'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, CalendarDays, LayoutDashboard, LogOut } from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays },
];

export function ProtectedNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">Schedro</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 transition-colors hover:text-foreground/80 ${
                  isActive(item.href)
                    ? 'text-foreground'
                    : 'text-foreground/60'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-sm text-muted-foreground truncate max-w-48">
            {user?.email}
          </span>
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-2 ml-auto">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="text-left">
                <SheetTitle>Schedro</SheetTitle>
                <SheetDescription className="truncate">
                  {user?.email}
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                        isActive(item.href)
                          ? 'bg-accent text-accent-foreground'
                          : 'text-foreground/60'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
} 