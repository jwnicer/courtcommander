'use client';
import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getClientId, createIntent } from '@/lib/clientId';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, CreditCard, Clock, ListPlus, Swords, Repeat, ListX } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type Step = 'register' | 'pay' | 'confirm' | 'queue' | 'in_match';

export default function PlayerWizard({ orgId, venueId, sessionId }: { orgId: string, venueId: string, sessionId: string }) {
  const base = `orgs/${orgId}/venues/${venueId}/sessions/${sessionId}`;
  const [clientId, setClientId] = useState<string | null>(null);

  const [cfg, setCfg] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [queueEntry, setQueueEntry] = useState<any>(null);

  // Registration form state
  const [nickname, setNick] = useState('');
  const [level, setLevel] = useState(3);
  const [age, setAge] = useState(18);
  const [refCode, setRef] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // getClientId is sync and uses localStorage, so it's safe to call here.
    setClientId(getClientId());
  }, []);

  useEffect(() => {
    if (!clientId) return;
    const unsubCfg = onSnapshot(doc(db, `orgs/${orgId}/venues/${venueId}/paymentConfig`), s => setCfg(s.data()));
    const unsubMe = onSnapshot(doc(db, `${base}/participants/${clientId}`), s => setMe(s.exists() ? { id: s.id, ...s.data() } : null));
    const unsubQueue = onSnapshot(doc(db, `${base}/queue/${clientId}`), s => setQueueEntry(s.exists() ? { id: s.id, ...s.data() } : null));
    return () => {
      unsubCfg();
      unsubMe();
      unsubQueue();
    };
  }, [base, clientId, orgId, venueId]);

  const step: Step = useMemo(() => {
    if (!me) return 'register';
    if (!me.paid) return me.paymentRef ? 'confirm' : 'pay';
    if (queueEntry?.status === 'playing') return 'in_match';
    // Any other paid state falls into the queueing logic.
    return 'queue';
  }, [me, queueEntry]);
  
  const handleAction = async (action: () => Promise<any>) => {
    setLoading(true);
    try {
      await action();
    } catch (e: any) {
      console.error("Action failed", e);
      // Optionally, add a toast notification for the user
    } finally {
      setLoading(false);
    }
  };

  const doRegister = () => handleAction(() => createIntent(base, 'register', clientId!, { nickname, level, age }));
  const submitPayment = () => handleAction(() => createIntent(base, 'submit_payment', clientId!, { refCode, amountCents: cfg?.amountCents, currency: cfg?.currency }));
  const joinQueue = () => handleAction(() => createIntent(base, 'enqueue', clientId!, {}));
  const leaveQueue = () => handleAction(() => createIntent(base, 'leave_queue', clientId!, {}));
  const requeue = () => handleAction(() => createIntent(base, 'requeue_after_match', clientId!, {}));

  if (!clientId) {
    return <Card className="w-full"><CardHeader><CardTitle>Loading...</CardTitle></CardHeader></Card>
  }
  
  return (
    <Card className="w-full animate-in fade-in-50">
      {step === 'register' && (
        <>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus /> Register for Session</CardTitle>
            <CardDescription>Enter your details to join the open play session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <label className="text-sm font-medium">Nickname</label>
                <Input placeholder="e.g., ShuttleSmasher" value={nickname} onChange={e => setNick(e.target.value)} />
            </div>
            <div>
                <label className="text-sm font-medium">Skill Level (1-7)</label>
                <Select onValueChange={(v) => setLevel(Number(v))} defaultValue={String(level)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[...Array(7)].map((_,i) => <SelectItem key={i+1} value={String(i+1)}>Level {i+1}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div>
                <label className="text-sm font-medium">Age</label>
                <Input type="number" min={8} max={99} value={age} onChange={e => setAge(Number(e.target.value))} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={doRegister} disabled={loading || !nickname}>
                {loading ? <Loader2 className="animate-spin" /> : <UserPlus />} Save & Continue
            </Button>
          </CardFooter>
        </>
      )}

      {step === 'pay' && (
         <>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard /> Complete Your Payment</CardTitle>
            <CardDescription>Use the details below to pay, then enter the reference number.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!cfg ? <Loader2 className="mx-auto animate-spin" /> : (
                <>
                    <Alert>
                        <AlertTitle>Payment Details</AlertTitle>
                        <AlertDescription className="space-y-2">
                           <p>Pay <span className="font-semibold">${((cfg.amountCents || 0) / 100).toFixed(2)}</span> via {cfg.accountLabel}</p>
                            <div className="flex items-center gap-2">
                                <code className="px-2 py-1 bg-background rounded-md text-primary font-mono">{cfg.accountNumber}</code>
                                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(cfg.accountNumber)}>Copy</Button>
                            </div>
                            {cfg.qrUrl && <img src={cfg.qrUrl} data-ai-hint="qr code" className="rounded-lg shadow-sm mx-auto max-w-[200px]" alt="Payment QR Code" />}
                        </AlertDescription>
                    </Alert>
                    
                    <div>
                        <label className="text-sm font-medium mt-4 block">Payment Reference #</label>
                        <Input placeholder="e.g., transaction ID" value={refCode} onChange={e => setRef(e.target.value)} />
                    </div>
                </>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={submitPayment} disabled={loading || !refCode || !cfg}>
                {loading ? <Loader2 className="animate-spin" /> : <CreditCard />} I Paid – Submit for Confirmation
            </Button>
          </CardFooter>
        </>
      )}

      {step === 'confirm' && (
        <CardContent className="text-center p-8 flex flex-col items-center justify-center min-h-[200px]">
            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Waiting for Confirmation</h2>
            <p className="text-muted-foreground">A coach will approve your payment of <span className='font-semibold'>${((cfg?.amountCents || 0) / 100).toFixed(2)}</span> shortly.</p>
            <p className="text-sm mt-2">Your reference: <code className='font-mono bg-muted px-1 py-0.5 rounded'>{me.paymentRef}</code></p>
        </CardContent>
      )}

      {step === 'queue' && (
        <>
            <CardHeader>
                <CardTitle>Player Actions</CardTitle>
                <CardDescription>You are paid and ready to play.</CardDescription>
            </CardHeader>
            <CardContent>
              {!queueEntry ? (
                <Button className="w-full" onClick={joinQueue} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <ListPlus />}
                    Join Queue
                </Button>
              ) : (
                <Alert variant={queueEntry.status === 'waiting' ? 'default' : 'destructive'}>
                    <AlertTitle>You're in the Queue!</AlertTitle>
                    <AlertDescription>Your position will be updated automatically. You'll be notified when your match starts.</AlertDescription>
                </Alert>
              )}
            </CardContent>
            {queueEntry?.status === 'waiting' && (
              <CardFooter>
                  <Button variant="destructive" className="w-full" onClick={leaveQueue} disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : <ListX />} Leave Queue
                  </Button>
              </CardFooter>
            )}
        </>
      )}
      
      {step === 'in_match' && (
        <CardContent className="text-center p-8 flex flex-col items-center justify-center min-h-[200px]">
            <Swords className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Match in Progress!</h2>
            <p className="text-muted-foreground">Good luck! Once your game is finished, tap the button below.</p>
            <Button className="w-full mt-6" onClick={requeue} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Repeat />} Match Over – Rejoin Queue
            </Button>
        </CardContent>
      )}
    </Card>
  );
}
