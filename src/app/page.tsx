
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ShuttlecockIcon, RacketIcon, CourtIcon, ScoreboardIcon } from '@/components/icons/badminton';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <ShuttlecockIcon className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Court<span className="text-primary">Commander</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="lg" className="px-6 py-3 text-lg font-medium rounded-full">
                <Link href="/play?action=join">
                Join the Queue <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative overflow-hidden py-24 md:py-32 bg-gradient-to-b from-primary/5 via-background to-background">
          <ShuttlecockIcon className="absolute left-8 top-8 h-32 w-32 text-primary/10 -rotate-12" />
          <ShuttlecockIcon className="absolute right-8 bottom-8 h-40 w-40 text-primary/10 rotate-12" />
          <div className="container mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
              The Ultimate Badminton
            </h1>
            <h2 className="text-5xl md:text-7xl font-extrabold text-primary mb-8">
              Open Play Manager
            </h2>
            <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-10 mx-auto">
              Stop the wait, start the rally. Our AI-powered system creates balanced matches, manages court queues, and maximizes playtime for everyone.
            </p>
            <Button asChild size="lg" className="shadow-lg shadow-primary/30">
              <Link href="/play?action=join">
                Join the Queue <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="bg-muted/50 py-20">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Why You'll Love CourtCommander</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">From fair matchmaking to seamless organization, we've got your session covered.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center border-2 border-transparent bg-background hover:border-primary hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-2">
                    <RacketIcon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-medium">AI-Powered Matchmaking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Our intelligent system analyzes player skill levels to suggest the most balanced and competitive games, ensuring everyone has a great time.</p>
                </CardContent>
              </Card>
              <Card className="text-center border-2 border-transparent bg-background hover:border-primary hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-2">
                    <CourtIcon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-medium">Automated Queue & Courts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">A fair, transparent queue that automatically assigns players to the next available court. Less waiting, more playing.</p>
                </CardContent>
              </Card>
              <Card className="text-center border-2 border-transparent bg-background hover:border-primary hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-2">
                    <ScoreboardIcon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-medium">Live Session Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">See real-time court status, who's playing, and who's next in line from any device. Stay informed and ready for your next match.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t bg-muted/50">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex justify-center items-center gap-2 mb-2">
            <ShuttlecockIcon className="h-6 w-6 text-primary" />
            <p className="font-semibold text-foreground">CourtCommander</p>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} - The smartest way to play.</p>
          <div className="mt-4 text-sm">
            <Link href="/terms" className="text-primary hover:underline">
                Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
      
      <TooltipProvider>
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="secondary" size="icon" className="rounded-full shadow-lg">
                        <Link href="/qm">
                            <CourtIcon />
                            <span className="sr-only">Queue Master</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Queue Master</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="secondary" size="icon" className="rounded-full shadow-lg">
                        <Link href="/admin">
                            <RacketIcon />
                            <span className="sr-only">Admin Panel</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Admin Panel</p>
                </TooltipContent>
            </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
