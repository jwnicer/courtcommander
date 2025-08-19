
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Bot, Users, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

const BadmintonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-16 w-16 text-primary"
    data-ai-hint="badminton shuttlecock"
  >
    <path d="m15.18 2-6.25 6.25" />
    <path d="M12.53 3.47 5.28 10.72" />
    <path d="M10.72 5.28 3.47 12.53" />
    <path d="M9.75 6.25 2 14" />
    <path d="M14 22 8.5 16.5" />
    <path d="m20.5 17.5-5-5" />
    <path d="m17.5 20.5-5-5" />
    <path d="M14.5 21.5-9 7" />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-4">
            <BadmintonIcon />
            <h1 className="text-2xl font-bold">
              <span className="text-primary">Court</span>
              <span className="text-foreground">Commander</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col items-center justify-center text-center py-20 md:py-32">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            The Smartest Way to Manage
          </h2>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-8">
            Badminton Open Play
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-10">
            Eliminate guesswork and waiting time. Our AI-powered system creates balanced matches, manages queues, and keeps everyone playing.
          </p>
          <Button asChild size="lg">
            <Link href="/play">
              Join the Queue <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </section>

        {/* Features Section */}
        <section className="bg-muted py-20">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <Card className="bg-background">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <Bot className="h-8 w-8 text-primary"/>
                </div>
                <CardTitle>AI Matchmaking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Our intelligent agent suggests balanced matches based on player skill levels to ensure fair and competitive games for everyone.</p>
              </CardContent>
            </Card>
            <Card className="bg-background">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <Users className="h-8 w-8 text-primary"/>
                </div>
                <CardTitle>Automated Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">A fair and transparent queue system that automatically assigns players to the next available court, minimizing downtime.</p>
              </CardContent>
            </Card>
            <Card className="bg-background">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <Gamepad2 className="h-8 w-8 text-primary"/>
                </div>
                <CardTitle>Live Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">See real-time court status, who's playing, and who's next in line from any device, keeping everyone informed.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="py-6 border-t border-border/40">
          <div className="container mx-auto text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} Court Commander. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}
