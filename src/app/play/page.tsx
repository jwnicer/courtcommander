
'use client';
import { Header } from "@/components/layout/Header";
import { useEffect, useState } from 'react';
import { onSnapshot, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getClientId } from '@/lib/clientId';
import LiveView from "@/components/session/LiveView";
import AdminPanel from "@/components/session/AdminPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield } from "lucide-react";
import MatchSuggester from "@/components/ai/MatchSuggester";
import PlayerWizard from "@/components/session/PlayerWizard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";


export default function PlayPage() {
  const orgId = "org_abc";
  const venueId = "downtown_gym";
  const sessionId = "session_20250820";
  const basePath = `orgs/${orgId}/venues/${venueId}/sessions/${sessionId}`;
  const clientId = getClientId();

  const [session, setSession] = useState(null);
  const [courts, setCourts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [me, setMe] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const canCoach = me?.roles?.includes('coach');
  const isAdmin = me?.roles?.includes('admin');
  const gameType = session?.gameType || 'doubles';
  const myLevel = me?.level || 3;

  useEffect(() => {
    const unsubSession = onSnapshot(doc(db, basePath), (s) => setSession(s.data() as any));
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
    // If user is not registered, open the dialog
    if (participants.length > 0 && !me) {
      setDialogOpen(true);
    }
  }, [me, participants]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Header>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus />
                    Join Session
                </Button>
            </DialogTrigger>
        </Header>
        <main className="flex-grow container mx-auto p-4 md:p-8">
            <Tabs defaultValue="player" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="player"><User className="mr-2"/>Player View</TabsTrigger>
                <TabsTrigger value="admin" disabled={!isAdmin}><Shield className="mr-2"/>Admin View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="player">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <MatchSuggester 
                        playerLevel={myLevel} 
                        availablePlayers={waitingQueue}
                        gameType={gameType}
                    />
                </div>
                <div className="lg:col-span-2">
                    <LiveView
                        basePath={basePath}
                        canCoach={canCoach}
                        courts={courts}
                        matches={matches}
                        participants={participants}
                        waitingQueue={waitingQueue}
                        gameType={gameType}
                    />
                </div>
                </div>
            </TabsContent>

            <TabsContent value="admin">
                <AdminPanel 
                session={session}
                participants={participants}
                courts={courts}
                />
            </TabsContent>
            </Tabs>
        </main>
        <DialogContent className="p-0">
          <DialogHeader>
            <DialogTitle>Join Session</DialogTitle>
          </DialogHeader>
          <PlayerWizard orgId={orgId} venueId={venueId} sessionId={sessionId} onComplete={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
