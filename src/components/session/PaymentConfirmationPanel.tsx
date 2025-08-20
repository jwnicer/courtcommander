
'use client';

import type { Participant } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { createIntent, getClientId } from '@/lib/clientId';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface PaymentConfirmationPanelProps {
  participants: Participant[];
  basePath: string;
}

export default function PaymentConfirmationPanel({ participants, basePath }: PaymentConfirmationPanelProps) {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const clientId = getClientId();

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
  
  return (
    <Card>
        <CardHeader>
            <CardTitle className='flex items-center gap-2'>
                <CreditCard />
                Pending Payments
            </CardTitle>
            <CardDescription>Verify payments submitted by players. Once confirmed, they will be added to the queue.</CardDescription>
        </CardHeader>
        <CardContent>
           {participants.length > 0 ? (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nickname</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {participants.map(p => (
                        <TableRow key={p.id}>
                            <TableCell className="font-semibold">{p.nickname}</TableCell>
                            <TableCell>{p.level}</TableCell>
                            <TableCell>{p.age}</TableCell>
                            <TableCell><code className="font-mono text-sm">{p.paymentRef}</code></TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" onClick={() => handleConfirmPayment(p.id)} disabled={loading[p.id]}>
                                    {loading[p.id] ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                                    Confirm
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
           ) : (
            <p className="text-muted-foreground italic text-center p-4">No pending payments.</p>
           )}
        </CardContent>
    </Card>
  );
}
