
'use client';
import { Suspense, useEffect, useState } from 'react';
import { onSnapshot, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LiveView from "@/components/session/LiveView";
import MatchSuggester from "@/components/ai/MatchSuggester";

function QmPageContent() {
  const orgId = "org_abc";
  const venueId = "downtown_gym";
  const sessionId = "session_20250820";
  const basePath = `orgs/${orgId}/venues/${venueId}/sessions/${sessionId}`;

  const [session, setSession] = useState<any>(null);
  const [courts, setCourts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [waitingQueue, setWaitingQueue] = useState([]);
  
  const gameType = session?.gameType || 'doubles';

  useEffect(() => {
    const unsubSession = onSnapshot(doc(db, basePath), (s) => setSession(s.data() as any));
    const unsubCourts = onSnapshot(collection(db, `${basePath}/courts`), (s) => setCourts(s.docs.map(d => ({ id: d.id, ...d.data() })) as any));
    const unsubMatches = onSnapshot(collection(db, `${basePath}/matches`), (s) => setMatches(s.docs.map(d => ({ id: d.id, ...d.data() })) as any));
    const unsubParticipants = onSnapshot(collection(db, `${basePath}/participants`), (s) => setParticipants(s.docs.map(d => ({ id: d.id, ...d.data() })) as any));
    const unsubQueue = onSnapshot(collection(db, `${basePath}/queue`), (s) => setWaitingQueue(s.docs.map(d => ({ id: d.id, ...d.data() })) as any));
    
    return () => {
      unsubSession();
      unsubCourts();
      unsubMatches();
      unsubParticipants();
      unsubQueue();
    };
  }, [basePath]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <MatchSuggester 
                playerLevel={3} // QM doesn't have a level, so using default
                availablePlayers={waitingQueue}
                gameType={gameType}
            />
        </div>
        <div className="lg:col-span-2">
            <LiveView
                basePath={basePath}
                canCoach={true} // QM has coach privileges
                courts={courts}
                matches={matches}
                participants={participants}
                waitingQueue={waitingQueue}
                gameType={gameType}
            />
        </div>
    </div>
  );
}

export default function QmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QmPageContent />
    </Suspense>
  );
}
