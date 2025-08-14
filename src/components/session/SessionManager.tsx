
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
    // This setup now correctly simulates the entire flow from the beginning for a new player.
    const mockUser = getMockUser();
    setUser(mockUser);
    
    // The original Firestore listener is used to reflect real-time changes,
    // such as a coach approving a payment.
    // For demonstration, you would manually change the 'paid' status in your Firestore DB.
    const participantRef = doc(db, `orgs/${orgId}/venues/${venueId}/sessions/${sessionId}/participants/${mockUser.uid}`);
    const unsubscribeParticipant = onSnapshot(participantRef, (docSnap) => {
      if (docSnap.exists()) {
        setParticipant({ id: docSnap.id, ...docSnap.data() } as Participant);
      } else {
        setParticipant(null); // No participant document found, start with registration.
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching participant data:", error);
        setParticipant(null);
        setLoading(false);
    });
    
    return () => unsubscribeParticipant();
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

  // Step 1: User is not registered yet. Show the registration form.
  if (!participant) {
    return <RegistrationForm orgId={orgId} venueId={venueId} sessionId={sessionId} />;
  }

  // Step 2: User is registered but hasn't paid. Show the payment card.
  if (!participant.paid) {
    return <PaymentCard orgId={orgId} venueId={venueId} sessionId={sessionId} />;
  }

  // Step 3: User is registered and paid. Show the main dashboard.
  // The Admin/Coach status is hardcoded here for demonstration.
  const isAdmin = true; 
  const canCoach = isAdmin; 

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
