
'use client';

import type { Session, Participant, Court } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Settings, BarChart } from 'lucide-react';
import { RacketIcon } from '@/components/icons/badminton';
import { Skeleton } from '../ui/skeleton';

interface AdminPanelProps {
  session: Session | null;
  participants: Participant[];
  courts: Court[];
  basePath: string;
}

export default function AdminPanel({ session, participants, courts, basePath }: AdminPanelProps) {

  if (!session) {
    return (
      <Card>
        <CardHeader>
           <CardTitle className="flex items-center gap-2">
                <RacketIcon className="h-6 w-6" />
                <Skeleton className="h-8 w-48" />
            </CardTitle>
            <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const paidParticipants = participants.filter(p => p.paid).length;
  const revenue = ((session.entryFeeCents || 0) * paidParticipants) / 100;
  
  return (
    <div className="grid gap-6 animate-in fade-in-50">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <RacketIcon className="h-5 w-5" />
                    Admin Overview
                </CardTitle>
                <CardDescription>High-level statistics and controls for this session.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-muted rounded-lg">
                        <Users className="mx-auto mb-2 h-6 w-6 text-primary" />
                        <p className="text-2xl font-bold">{participants.length}</p>
                        <p className="text-sm text-muted-foreground">Total Participants</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <BarChart className="mx-auto mb-2 h-6 w-6 text-primary" />
                        <p className="text-2xl font-bold">${revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Est. Revenue</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <Settings className="mx-auto mb-2 h-6 w-6 text-primary" />
                        <p className="text-2xl font-bold capitalize">{session.gameType}</p>
                        <p className="text-sm text-muted-foreground">Game Type</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
