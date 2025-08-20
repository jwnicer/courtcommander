
'use client';
import { Header } from "@/components/layout/Header";
import { Suspense, useEffect, useState } from 'react';
import { onSnapshot, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getClientId } from '@/lib/clientId';
import LiveView from "@/components/session/LiveView";
import { Shield, UserPlus, ClipboardList, Loader2 } from "lucide-react";
import MatchSuggester from "@/components/ai/MatchSuggester";
import PlayerWizard from "@/components/session/PlayerWizard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';


function PlayPageContent() {
  const orgId = "org_abc";
  const venueId = "downtown_gym";
  const sessionId = "session_20250820";
  const basePath = `orgs/${orgId}/venues/${venueId}/sessions/${sessionId}`;
  const clientId = getClientId();

  const [session, setSession] = useState<any>(null);
  const [courts, setCourts] = useState<any[] | undefined>(undefined);
  const [matches, setMatches] = useState<any[] | undefined>(undefined);
  const [participants, setParticipants] = useState<any[] | undefined>(undefined);
  const [waitingQueue, setWaitingQueue] = useState<any[] | undefined>(undefined);
  const [me, setMe] = useState<any>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const searchParams = useSearchParams();

  const canCoach = me?.roles?.includes('coach');
  const gameType = session?.gameType || 'doubles';
  const myLevel = me?.level || 3;
  const isLoading = session === null;


  useEffect(() => {
    const unsubSession = onSnapshot(doc(db, basePath), (s) => setSession(s.data() || null));
    const unsubCourts = onSnapshot(collection(db, `${basePath}/courts`), (s) => setCourts(s.docs.map(d => ({ id: d.id, ...d.data() })) as any));
    const unsubMatches = onSnapshot(collection(db, `${basePath}/matches`), (s) => setMatches(s.docs.map(d => ({ id: d.id, ...d.data() })) as any));
    const unsubParticipants = onSnapshot(collection(db, `${basePath}/participants`), (s) => setParticipants(s.docs.map(d => ({ id: d.id, ...d.data() })) as any));
    const unsubQueue = onSnapshot(collection(db, `${basePath}/queue`), (s) => setWaitingQueue(s.docs.map(d => ({ id: d.id, ...d.data() })) as any));
    const unsubMe = onSnapshot(doc(db, `${basePath}/participants/${clientId}`), s => setMe(s.exists() ? { id: s.id, ...s.data() } : null));

    return () => {
      unsubSession();
      unsubCourts();
      unsubMatches();
      unsubParticipants();
      unsubQueue();
      unsubMe();
    };
  }, [basePath, clientId]);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'join' && me === null) { // only trigger if me is loaded and is null
      setDialogOpen(true);
    }
  }, [me, searchParams]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Header>
            <div className="flex items-center gap-2">
                {!me && me !== undefined && (
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus />
                            Join Session
                        </Button>
                    </DialogTrigger>
                )}
                 {me === undefined && <Skeleton className="h-10 w-32" />}
            </div>
        </Header>
        <main className="flex-grow container mx-auto p-4 md:p-8">
            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-4">
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <MatchSuggester 
                            playerLevel={myLevel} 
                            availablePlayers={waitingQueue || []}
                            gameType={gameType}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <LiveView
                            basePath={basePath}
                            canCoach={!!canCoach}
                            courts={courts || []}
                            matches={matches || []}
                            participants={participants || []}
                            waitingQueue={waitingQueue || []}
                            gameType={gameType}
                        />
                    </div>
                </div>
            )}
        </main>
        <DialogContent className="p-0">
            <DialogHeader className="p-6 pb-0">
                <DialogTitle>Join Session</DialogTitle>
            </DialogHeader>
            <PlayerWizard orgId={orgId} venueId={venueId} sessionId={sessionId} onComplete={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <TooltipProvider>
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="secondary" size="icon" className="rounded-full shadow-lg">
                        <Link href="/qm">
                            <ClipboardList />
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
                            <Shield />
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

export default function PlayPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-background text-foreground flex flex-col">
             <Header>
                <Skeleton className="h-10 w-32" />
             </Header>
             <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-4">
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
             </main>
        </div>
    }>
      <PlayPageContent />
    </Suspense>
  );
}
