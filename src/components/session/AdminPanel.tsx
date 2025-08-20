
'use client';

import type { Session, Participant, Court } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Settings, BarChart, CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { createIntent } from '@/lib/clientId';
import { getClientId } from '@/lib/clientId';

interface AdminPanelProps {
  session: Session | null;
  participants: Participant[];
  courts: Court[];
  basePath: string;
}

export default function AdminPanel({ session, participants, courts, basePath }: AdminPanelProps) {
  const [pendingPayments, setPendingPayments] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const clientId = getClientId();

  useEffect(() => {
    const unconfirmed = participants.filter(p => p.paymentRef && !p.paid);
    setPendingPayments(unconfirmed);
  }, [participants]);


  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Session Info...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while the session data is being fetched.</p>
        </CardContent>
      </Card>
    );
  }

  const handleConfirmPayment = async (participantId: string) => {
    setLoading(prev => ({...prev, [participantId]: true}));
    try {
        await createIntent(basePath, 'confirm_payment', clientId, { targetParticipantId: participantId });
        toast({ title: 'Payment Confirmed!', description: `Participant ${participantId.substring(0,6)} has been marked as paid.`});
    } catch(e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
        setLoading(prev => ({...prev, [participantId]: false}));
    }
  }

  const paidParticipants = participants.filter(p => p.paid).length;
  const revenue = ((session.entryFeeCents || 0) * paidParticipants) / 100;
  
  return (
    <div className="grid gap-6 animate-in fade-in-50">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield />
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

        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <CreditCard />
                    Pending Payments
                </CardTitle>
                <CardDescription>Verify payments submitted by players. Once confirmed, they will be added to the queue.</CardDescription>
            </CardHeader>
            <CardContent>
               {pendingPayments.length > 0 ? (
                 <div className="space-y-4">
                    {pendingPayments.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                                <p className="font-semibold">{p.nickname}</p>
                                <p className="text-sm text-muted-foreground">Ref: <code className="font-mono">{p.paymentRef}</code></p>
                            </div>
                            <Button size="sm" onClick={() => handleConfirmPayment(p.id)} disabled={loading[p.id]}>
                                {loading[p.id] ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                                Confirm
                            </Button>
                        </div>
                    ))}
                 </div>
               ) : (
                <p className="text-muted-foreground italic text-center">No pending payments.</p>
               )}
            </CardContent>
        </Card>
    </div>
  );
}
