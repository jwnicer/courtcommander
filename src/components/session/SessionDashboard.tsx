'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Sparkles, Loader2 } from 'lucide-react';
import LiveView from './LiveView';
import MatchSuggester from '../ai/MatchSuggester';
import { collection, onSnapshot, query, where, doc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Court, Match, Participant, QueueItem, Session } from '@/types';
import { Skeleton } from '../ui/skeleton';

interface SessionDashboardProps {
  orgId: string;
  venueId: string;
  sessionId: string;
  user: User;
  participant: Participant;
  canCoach: boolean;
}

export default function SessionDashboard({ orgId, venueId, sessionId, user, participant, canCoach }: SessionDashboardProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  const basePath = `orgs/${orgId}/venues/${venueId}/sessions/${sessionId}`;

  useEffect(() => {
    let active = true;
    
    const unsubscribes = [
      onSnapshot(doc(db, basePath), (doc) => {
        if(active) setSession({id: doc.id, ...doc.data()} as Session)
      }),
      onSnapshot(collection(db, `${basePath}/courts`), (snap) => {
         if(active) setCourts(snap.docs.map(d => ({id: d.id, ...d.data()})) as Court[])
      }),
      onSnapshot(query(collection(db, `${basePath}/queue`), orderBy("priority")), (snap) => {
        if(active) {
            const queueData = snap.docs.map(d => ({id: d.id, ...d.data()}) as QueueItem)
            // Denormalize participant data into queue items
            const participantMap = new Map(participants.map(p => [p.userId, p]));
            const denormalizedQueue = queueData.map(q => ({
                ...q,
                nickname: participantMap.get(q.userId)?.nickname || 'Unknown',
                level: participantMap.get(q.userId)?.level || 0,
            }));
            setQueue(denormalizedQueue);
        }
      }),
      onSnapshot(query(collection(db, `${basePath}/matches`), where("status", "in", ["active", "scheduled"])), (snap) => {
        if(active) setMatches(snap.docs.map(d => ({id: d.id, ...d.data()})) as Match[])
      }),
      onSnapshot(collection(db, `${basePath}/participants`), (snap) => {
        if(active) {
            setParticipants(snap.docs.map(d => ({id: d.id, ...d.data()})) as Participant[]);
            if(loading) setLoading(false);
        }
      })
    ];
    
    return () => {
        active = false;
        unsubscribes.forEach(unsub => unsub());
    }
  }, [basePath, loading, participants]);
  
  if (loading) return <DashboardSkeleton />;

  const waitingQueue = queue.filter(q => q.status === 'waiting');
  const availablePlayersForAI = participants.filter(p => waitingQueue.some(q => q.userId === p.userId));

  return (
    <Tabs defaultValue="live" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:w-[400px] mb-6">
        <TabsTrigger value="live"><LayoutDashboard className="mr-2 h-4 w-4" />Live View</TabsTrigger>
        <TabsTrigger value="ai"><Sparkles className="mr-2 h-4 w-4" />AI Match Maker</TabsTrigger>
      </TabsList>
      <TabsContent value="live">
        <LiveView
            basePath={basePath}
            user={user}
            canCoach={canCoach}
            courts={courts}
            matches={matches}
            participants={participants}
            waitingQueue={waitingQueue}
            gameType={session?.gameType ?? 'doubles'}
        />
      </TabsContent>
      <TabsContent value="ai">
        <MatchSuggester
          playerLevel={participant.level}
          availablePlayers={availablePlayersForAI}
          gameType={session?.gameType ?? 'doubles'}
        />
      </TabsContent>
    </Tabs>
  );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="w-full md:w-[400px]">
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-60 w-full rounded-xl" />
                    <Skeleton className="h-60 w-full rounded-xl" />
                    <Skeleton className="h-60 w-full rounded-xl" />
                    <Skeleton className="h-60 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
