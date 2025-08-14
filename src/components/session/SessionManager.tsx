
'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { db, getMockUser } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { Participant } from '@/types';
import RegistrationForm from './RegistrationForm';
import PaymentCard from './PaymentCard';
import SessionDashboard from './SessionDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Info, Loader2 } from 'lucide-react';

interface SessionManagerProps {
  orgId: string;
  venueId: string;
  sessionId: string;
}

export default function SessionManager({ orgId, venueId, sessionId }: SessionManagerProps) {
  const [user, setUser] = useState<User | null>(null);
  const [participant, setParticipant] = useState<Participant | null | undefined>(undefined); // undefined: loading, null: not found
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockUser = getMockUser();
    setUser(mockUser);
    
    // Simulate a registered AND paid user to show the dashboard directly.
    setParticipant({
      id: mockUser.uid,
      userId: mockUser.uid,
      nickname: 'MockPlayer',
      level: 4,
      age: 25,
      paid: true, // This is now true to simulate payment confirmation
      checkedIn: false,
      cooldown: 0,
      lastMatchEndedAt: null,
    });
    setLoading(false);

    // The original Firestore listener is commented out to force the mock state.
    // To restore original behavior, uncomment the following block and remove the mock code above.
    /*
    const participantRef = doc(db, `orgs/${orgId}/venues/${venueId}/sessions/${sessionId}/participants/${mockUser.uid}`);
    const unsubscribeParticipant = onSnapshot(participantRef, (docSnap) => {
      if (docSnap.exists()) {
        setParticipant({ id: docSnap.id, ...docSnap.data() } as Participant);
      } else {
        setParticipant(null);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching participant data:", error);
        setParticipant(null);
        setLoading(false);
    });
    
    return () => unsubscribeParticipant();
    */
  }, [orgId, venueId, sessionId]);

  if (loading || participant === undefined) {
    return <SessionManagerSkeleton />;
  }
  
  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-10 shadow-lg animate-in fade-in-50">
        <CardHeader className="text-center">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
          <CardTitle className="mt-4">Connecting...</CardTitle>
          <CardDescription>Establishing a secure session...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!participant) {
    return <RegistrationForm orgId={orgId} venueId={venueId} sessionId={sessionId} />;
  }

  if (!participant.paid) {
    return <PaymentCard orgId={orgId} venueId={venueId} sessionId={sessionId} />;
  }

  // Role checking would happen here. For now, we assume a player role.
  // Example: const isAdmin = user.claims.roles?.includes('admin');
  const isAdmin = true; // Hardcoded to true for demonstration purposes
  const canCoach = isAdmin; // Admins can do everything a coach can

  return <SessionDashboard orgId={orgId} venueId={venueId} sessionId={sessionId} user={user} participant={participant} canCoach={canCoach} isAdmin={isAdmin} />;
}


function SessionManagerSkeleton() {
    return (
        <div className="space-y-8">
            <div className="w-full md:w-[400px]">
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    );
}
