import Link from "next/link";
import { HomeClient } from "./components/home-client";
import { NavLinks } from "./components/nav-links";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-center border-b border-border">
        <div className="flex w-full max-w-7xl justify-between items-center">
          <Link className="flex items-center justify-center" href="/">
            <span className="text-xl font-bold text-primary">Schedro</span>
          </Link>
          <NavLinks />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Schedro: Simplify Your Scheduling
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Powerful calendar management with sharing capabilities, group organization, and intuitive scheduling.
                </p>
              </div>
              <HomeClient />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-foreground">
                  Features
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Discover what makes Schedro the perfect calendar solution for you.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 w-full mt-8">
                <div className="space-y-2 p-6 rounded-lg bg-card shadow-sm">
                  <h3 className="text-xl font-bold text-card-foreground">Group Management</h3>
                  <p className="text-muted-foreground">
                    Create and manage groups with color-coded events for better organization.
                  </p>
                </div>
                <div className="space-y-2 p-6 rounded-lg bg-card shadow-sm">
                  <h3 className="text-xl font-bold text-card-foreground">Shareable Links</h3>
                  <p className="text-muted-foreground">
                    Generate unique links to share your calendar with anyone, with or without edit permissions.
                  </p>
                </div>
                <div className="space-y-2 p-6 rounded-lg bg-card shadow-sm">
                  <h3 className="text-xl font-bold text-card-foreground">Multiple Views</h3>
                  <p className="text-muted-foreground">
                    Switch between day, week, and month views to see your schedule exactly how you need it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-border justify-center">
        <div className="flex flex-col sm:flex-row w-full max-w-7xl gap-2 items-center">
          <p className="text-xs text-muted-foreground">© 2025 Schedro. All rights reserved.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link className="text-xs text-muted-foreground hover:text-primary underline-offset-4" href="#">
              Terms of Service
            </Link>
            <Link className="text-xs text-muted-foreground hover:text-primary underline-offset-4" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
