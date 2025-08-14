'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { Participant } from '@/types';
import RegistrationForm from './RegistrationForm';
import PaymentCard from './PaymentCard';
import SessionDashboard from './SessionDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';

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
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        const participantRef = doc(db, `orgs/${orgId}/venues/${venueId}/sessions/${sessionId}/participants/${currentUser.uid}`);
        const unsubscribeParticipant = onSnapshot(participantRef, (docSnap) => {
          if (docSnap.exists()) {
            setParticipant({ id: docSnap.id, ...docSnap.data() } as Participant);
          } else {
            setParticipant(null);
          }
        }, (error) => {
            console.error("Error fetching participant data:", error);
            setParticipant(null);
        });
        
        return () => unsubscribeParticipant();
      } else {
        setParticipant(null);
      }
    });

    return () => unsubscribeAuth();
  }, [orgId, venueId, sessionId]);

  if (loading || participant === undefined) {
    return <SessionManagerSkeleton />;
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-10 shadow-lg animate-in fade-in-50">
        <CardHeader className="text-center">
          <Info className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4">Welcome to Court Commander</CardTitle>
          <CardDescription>Please sign in to join the session.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">Sign in with your account to register, pay, and get on the court!</p>
        </CardContent>
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
  // Example: const canCoach = user.claims.roles?.includes('coach');
  const canCoach = true; // Hardcoded to true for demonstration purposes

  return <SessionDashboard orgId={orgId} venueId={venueId} sessionId={sessionId} user={user} participant={participant} canCoach={canCoach} />;
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
