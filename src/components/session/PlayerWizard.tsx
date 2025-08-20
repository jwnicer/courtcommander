
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getClientId, createIntent } from '@/lib/clientId';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, CreditCard, Clock, ListPlus, Swords, Repeat, ListX, HelpCircle, CheckCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { QUESTIONS, computeAssessment, AnswerMap, Letter } from '@/lib/badmintonSkillAssessment';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Skeleton } from '../ui/skeleton';

// ————————————————————————————————————————————————————————————————
// Bugfix summary
// 1) Replaced single boolean `loading` with per-action `busy` union to avoid sticky spinners.
// 2) Optimistic step switch on Save & Continue before awaiting network; revert on error.
// 3) Added withTimeout() to prevent infinite pending promises; clear busy on timeout.
// 4) Guarded against double-submit via ref and disabled states.
// 5) Kept smooth transitions, auto-open Terms, and robust toasts.
// 6) Handled non-existent payment config to prevent infinite loading.
// ————————————————————————————————————————————————————————————————

type Step = 'register' | 'terms' | 'pay' | 'confirm' | 'queue' | 'in_match';

type BusyKind = null | 'register' | 'agree' | 'pay' | 'enqueue' | 'leave' | 'requeue';

interface PlayerWizardProps {
  orgId: string;
  venueId: string;
  sessionId: string;
  onComplete?: () => void;
}

const skillLevels: Record<Letter, number> = { A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };

interface PaymentCfg {
  amountCents: number;
  currency: string;
  eWallets?: Record<string, { accountNumber: string; qrUrl?: string }>
}

const currency = (amountCents?: number, code: string = 'PHP') => {
  const amount = (amountCents || 0) / 100;
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(amount); }
  catch { return `${amount.toFixed(2)} ${code}`; }
};

const withTimeout = async <T,>(p: Promise<T>, ms = 15000) => {
  return await Promise.race([
    p,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Request timed out. Please try again.')), ms)),
  ]);
};

const SkillAssessmentForm = ({ onComplete }: { onComplete: (level: Letter) => void }) => {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const canSubmit = Object.keys(answers).length === QUESTIONS.length;
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><HelpCircle/> Skill Level Assessment</DialogTitle>
        <DialogDescription>Answer these 10 questions to get an estimated skill level. Be honest for best results.</DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[60vh] pr-6">
        <div className="space-y-6">
          {QUESTIONS.map((q, idx) => (
            <Card key={q.id}>
              <CardHeader>
                <CardTitle className="text-lg">#{idx + 1}: {q.topic}</CardTitle>
                <CardDescription>{q.prompt}</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup onValueChange={(v: Letter) => setAnswers(prev => ({ ...prev, [q.id]: v }))}>
                  <div className="space-y-2">
                    {Object.entries(q.options).map(([letter, description]) => (
                      <Label key={letter} className="flex items-start gap-3 p-3 rounded-md border has-[:checked]:bg-accent has-[:checked]:text-accent-foreground">
                        <RadioGroupItem value={letter} id={`${q.id}-${letter}`} className="mt-1" />
                        <div className="grid gap-1.5 leading-normal">
                          <span className="font-semibold">Level {letter}</span>
                          <span className="text-sm font-normal">{description}</span>
                        </div>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      <DialogFooter>
        <Button
          onClick={() => {
            const result = computeAssessment(answers);
            onComplete(result.finalLevel);
          }}
          disabled={!canSubmit}
        >
          <CheckCircle className="mr-2" /> Calculate My Level
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const TermsAndConditionsDialog = ({ onAgree, onOpenChange, open, busy }: { onAgree: () => void; onOpenChange: (open: boolean) => void; open: boolean; busy: boolean; }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><FileText /> Terms & Conditions</DialogTitle>
        <DialogDescription>Please read and agree to continue.</DialogDescription>
      </DialogHeader>
      <div className="prose prose-stone dark:prose-invert max-w-none space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-4">
        <p>By clicking "I Agree," you acknowledge you have read, understood, and agree to the full <Link href="/terms" target="_blank" className="text-primary hover:underline">Terms & Conditions</Link>.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Assumption of Risk</strong> in badminton activities.</li>
          <li><strong>Release of Liability</strong> for organizers.</li>
          <li><strong>Code of Conduct</strong> (respectful environment).</li>
          <li><strong>Queue Master Authority</strong> on session matters.</li>
        </ul>
      </div>
      <DialogFooter>
        <Button onClick={onAgree} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <CheckCircle className="mr-2"/>}
            I Agree
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default function PlayerWizard({ orgId, venueId, sessionId, onComplete }: PlayerWizardProps) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [cfg, setCfg] = useState<PaymentCfg | null>(null);
  const [me, setMe] = useState<any>(null);
  const [queueEntry, setQueueEntry] = useState<any>(null);

  // Form
  const [nickname, setNick] = useState('');
  const [level, setLevel] = useState(3);
  const [age, setAge] = useState(18);

  // UI state
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [selectedEWallet, setSelectedEWallet] = useState<string>('gcash');
  const [busy, setBusy] = useState<BusyKind>(null);
  const submittedRef = useRef(false);
  const { toast } = useToast();

  const base = `orgs/${orgId}/venues/${venueId}/sessions/${sessionId}`;

  // Client ID
  useEffect(() => { setClientId(getClientId()); }, []);

  // Subscriptions
  useEffect(() => {
    if (!clientId) return;
    const unsubMe = onSnapshot(doc(db, `${base}/participants/${clientId}`), s => setMe(s.exists() ? { id: s.id, ...s.data() } : null));
    const unsubQueue = onSnapshot(doc(db, `${base}/queue/${clientId}`), s => setQueueEntry(s.exists() ? { id: s.id, ...s.data() } : null));
    return () => { unsubMe(); unsubQueue(); };
  }, [base, clientId]);

  useEffect(() => {
    if (!orgId || !venueId || !sessionId) return;
    const sessionPayDoc = doc(db, `orgs/${orgId}/venues/${venueId}/sessions/${sessionId}/settings/payment`);
    const unsub = onSnapshot(sessionPayDoc, (s) => {
      if (s.exists()) {
        const data = s.data() as PaymentCfg;
        setCfg(data);
      } else {
        // If no payment config exists, assume it's free.
        setCfg({ amountCents: 0, currency: 'PHP', eWallets: {} });
      }
    });
    return () => unsub();
  }, [orgId, venueId, sessionId]);

  // Compute step from server state
  const remoteStep: Step | 'loading' = useMemo(() => {
    if (!clientId || me === undefined || cfg === null) return 'loading';
    if (!me) return 'register';
    if (!me.agreedToTerms) return 'terms';
    if ((cfg?.amountCents || 0) > 0 && !me.paid) return me.paymentRef ? 'confirm' : 'pay';
    if (queueEntry?.status === 'playing') return 'in_match';
    return 'queue';
  }, [me, queueEntry, cfg, clientId]);

  // Optimistic step
  const [optimistic, setOptimistic] = useState<Step | null>(null);
  const uiStep: Step | 'loading' = optimistic ?? remoteStep;

  // Sync optimism → server state. Clear optimistic state once remote state catches up.
  useEffect(() => {
    if (!optimistic) return;
    if (optimistic === 'terms' && me?.agreedToTerms) setOptimistic(null);
    if (optimistic === 'pay' && me?.paymentRef) setOptimistic(null);
    if (optimistic === 'confirm' && me?.paid) setOptimistic(null);
    if (optimistic === 'queue' && queueEntry) setOptimistic(null);
  }, [optimistic, me, queueEntry]);


  // Auto-open Terms dialog when on the 'terms' step.
  useEffect(() => { setTermsOpen(uiStep === 'terms'); }, [uiStep]);

  // Notify parent component when wizard is complete (player is in queue or match).
  useEffect(() => { if (uiStep === 'queue' || uiStep === 'in_match') onComplete?.(); }, [uiStep, onComplete]);

  // Actions
  const handleRegistrationSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!clientId) { toast({ title: 'Missing client ID', variant: 'destructive' }); return; }
    if (submittedRef.current) return; // double-click guard
    submittedRef.current = true;
    setBusy('register');

    // Optimistic UI first — switch to Terms immediately
    setOptimistic('terms');
    
    try {
      await withTimeout(createIntent(base, 'register', clientId, { nickname, level, age }), 120000);
      toast({ title: 'Saved', description: 'Proceed to Terms & Conditions.' });
    } catch (e: any) {
      // Revert optimism on failure
      setOptimistic(null);
      toast({ title: 'Registration failed', description: e?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setBusy(null);
      submittedRef.current = false;
    }
  };

  const handleAgreeToTerms = async () => {
    setBusy('agree');
    // If free, skip to queue, otherwise go to payment.
    const nextStep = (cfg?.amountCents || 0) > 0 ? 'pay' : 'queue';
    setOptimistic(nextStep);
    setTermsOpen(false); // Close dialog immediately

    try {
      await withTimeout(createIntent(base, 'agree_to_terms', clientId!, {}), 120000);
      toast({ title: 'Thanks!', description: 'Terms accepted.' });
    } catch (e: any) {
      setOptimistic('terms'); // Revert on failure
      setTermsOpen(true);
      toast({ title: 'Could not record agreement', description: e?.message ?? 'Please try again.', variant: 'destructive' });
    } finally { 
        setBusy(null); 
    }
  };

  const submitPayment = async () => {
    if (!cfg || !clientId) return;
    setBusy('pay');
    setOptimistic('confirm');

    // Generate a simple 6-digit alphanumeric reference code.
    const paymentRef = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      await createIntent(base, 'submit_payment', clientId, {
        amountCents: cfg.amountCents,
        currency: cfg.currency,
        method: selectedEWallet,
        paymentRef,
      });
      toast({ title: 'Payment submitted', description: `Your reference code is ${paymentRef}. Please await confirmation.` });
    } catch (e: any) {
      setOptimistic('pay'); // Revert on failure
      toast({ title: 'Payment submission failed', description: e?.message ?? 'Please try again.', variant: 'destructive' });
    } finally { 
        setBusy(null); 
    }
  };

  const joinQueue = async () => { setBusy('enqueue'); try { await withTimeout(createIntent(base, 'enqueue', clientId!, {}), 10000); } catch(e) { console.error(e); } finally { setBusy(null); } };
  const leaveQueue = async () => { setBusy('leave'); try { await withTimeout(createIntent(base, 'leave_queue', clientId!, {}), 10000); } catch(e) { console.error(e); } finally { setBusy(null); } };
  const requeue = async () => { setBusy('requeue'); try { await withTimeout(createIntent(base, 'requeue_after_match', clientId!, {}), 10000); } catch(e) { console.error(e); } finally { setBusy(null); } };

  const handleAssessmentComplete = (calculatedLevel: Letter) => { setLevel(skillLevels[calculatedLevel]); setAssessmentOpen(false); };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else { const area = document.createElement('textarea'); area.value = text; document.body.appendChild(area); area.select(); document.execCommand('copy'); document.body.removeChild(area); }
      toast({ title: 'Copied!', description: 'Account number copied.' });
    } catch { toast({ title: 'Copy failed', description: 'Please copy manually.', variant: 'destructive' }); }
  };

  const currentPaymentDetails = cfg?.eWallets?.[selectedEWallet];

  const renderHeader = () => {
    switch (uiStep) {
      case 'register':
        return <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus /> Register for Session</DialogTitle><DialogDescription>Enter your details to join the open play session.</DialogDescription></DialogHeader>;
      case 'terms':
        return <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText /> Terms & Conditions</DialogTitle><DialogDescription>Please agree to continue.</DialogDescription></DialogHeader>;
      case 'pay':
        return <DialogHeader><DialogTitle className="flex items-center gap-2"><CreditCard /> Complete Your Payment</DialogTitle><DialogDescription>Select an e-wallet, pay the fee, then submit for confirmation.</DialogDescription></DialogHeader>;
      case 'confirm':
        return <DialogHeader><DialogTitle className="flex items-center gap-2"><Clock /> Waiting for Confirmation</DialogTitle><DialogDescription>A Queue Master will verify your payment shortly.</DialogDescription></DialogHeader>;
      case 'queue':
        return <DialogHeader><DialogTitle className="flex items-center gap-2"><CheckCircle /> You're All Set!</DialogTitle><DialogDescription>You are paid and ready to play.</DialogDescription></DialogHeader>;
      case 'in_match':
        return <DialogHeader><DialogTitle className="flex items-center gap-2"><Swords /> Match in Progress</DialogTitle><DialogDescription>Good luck! Re-queue when you're done.</DialogDescription></DialogHeader>;
      case 'loading':
        return <DialogHeader><DialogTitle className="flex items-center gap-2"><Loader2 className="animate-spin" /> Initializing...</DialogTitle><DialogDescription>Getting your session details ready.</DialogDescription></DialogHeader>;
    }
  };

  const Stepper = () => {
    if (uiStep === 'loading') return null;
    const steps: Array<{ id: Step; label: string }> = [
      { id: 'register', label: 'Register' },
      { id: 'terms', label: 'Terms' },
      { id: 'pay', label: 'Pay' },
      { id: 'confirm', label: 'Confirm' },
    ];
    const idx = steps.findIndex(s => s.id === uiStep);
    const activeIdx = idx === -1 ? steps.length - 1 : idx;
    return (
      <div className="px-6 pt-6">
        <ol className="grid grid-cols-4 gap-2 text-xs">
          {steps.map((s, i) => (
            <li key={s.id} className={`flex items-center gap-2 p-2 rounded-xl border ${i <= activeIdx ? 'bg-accent text-accent-foreground' : 'opacity-70'}`}>
              <span className="h-5 w-5 inline-flex items-center justify-center rounded-full border">{i + 1}</span>
              <span className="font-medium">{s.label}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  };

  if (!clientId) {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
           <Skeleton className="h-10 w-full" />
           <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Overlays */}
      <Dialog open={assessmentOpen} onOpenChange={setAssessmentOpen}>
        <SkillAssessmentForm onComplete={handleAssessmentComplete} />
      </Dialog>
      <TermsAndConditionsDialog open={termsOpen} onOpenChange={setTermsOpen} onAgree={handleAgreeToTerms} busy={busy === 'agree'} />

      <Card className="w-full border-none shadow-none rounded-t-lg">
        <Stepper />
        <div className="p-6">{renderHeader()}</div>

        <AnimatePresence mode="wait">
          <motion.div key={uiStep} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

            {uiStep === 'loading' && (
                <CardContent>
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                </CardContent>
            )}

            {uiStep === 'register' && (
              <form onSubmit={handleRegistrationSubmit}>
                <CardContent className="space-y-4 pt-0 px-6">
                  <div>
                    <Label htmlFor='nickname'>Nickname</Label>
                    <Input id='nickname' placeholder="e.g., ShuttleSmasher" value={nickname} onChange={e => setNick(e.target.value)} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label>Skill Level</Label>
                      <Button type="button" variant="link" size="sm" className="p-0 h-auto" onClick={() => setAssessmentOpen(true)}>Don't know your level? Take a test.</Button>
                    </div>
                    <Select onValueChange={(v) => setLevel(Number(v))} value={String(level)}>
                      <SelectTrigger><SelectValue placeholder="Select your skill level" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(skillLevels).map(([grade, value]) => (
                          <SelectItem key={grade} value={String(value)}>Level {grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='age'>Age</Label>
                    <Input id='age' type="number" min={8} max={99} value={age} onChange={e => setAge(Number(e.target.value))} />
                  </div>
                </CardContent>
                <CardFooter className="px-6 pb-6">
                  <Button className="w-full" type="submit" disabled={busy !== null || !nickname.trim()}>
                    {busy === 'register' ? <Loader2 className="animate-spin" /> : <UserPlus />} Save & Continue
                  </Button>
                </CardFooter>
              </form>
            )}

            {uiStep === 'terms' && (
              <CardContent className="px-6 pb-6 text-center">
                <p className='text-muted-foreground mb-4'>You must agree to the terms to continue.</p>
                <Button onClick={() => setTermsOpen(true)} disabled={busy === 'agree'}>
                  {busy === 'agree' ? <Loader2 className="animate-spin" /> : <FileText />} View Terms & Conditions
                </Button>
              </CardContent>
            )}

            {uiStep === 'pay' && (
              <>
                <CardContent className="space-y-4 pt-0 px-6">
                    <div className='space-y-4'>
                      <Alert>
                        <AlertTitle>Payment Required</AlertTitle>
                        <AlertDescription>
                          Please pay <span className="font-semibold">{currency(cfg?.amountCents, cfg?.currency)}</span> to join the session.
                        </AlertDescription>
                      </Alert>
                      <Select onValueChange={(v: string) => setSelectedEWallet(v)} defaultValue={selectedEWallet}>
                        <SelectTrigger><SelectValue placeholder="Select e-wallet" /></SelectTrigger>
                        <SelectContent>
                          {cfg?.eWallets && Object.keys(cfg.eWallets).map(wallet => (
                            <SelectItem key={wallet} value={wallet} className="capitalize">{wallet}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {cfg ? (
                        currentPaymentDetails ? (
                            <div className="p-4 bg-muted rounded-lg text-center space-y-3">
                              <p className='text-sm text-muted-foreground'>Send payment to:</p>
                              <div className="flex items-center justify-center gap-2">
                                <code className="px-2 py-1 bg-background rounded-md text-primary font-mono">{currentPaymentDetails.accountNumber}</code>
                                <Button variant="outline" size="sm" onClick={() => copyToClipboard(currentPaymentDetails.accountNumber)}>Copy</Button>
                              </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-muted rounded-lg text-center space-y-3">
                                <p className="text-sm text-muted-foreground">Payment details for <span className="font-semibold capitalize">{selectedEWallet}</span> are not configured. Please select another or contact an admin.</p>
                            </div>
                        )
                      ) : (
                         <div className="p-4 bg-muted rounded-lg text-center space-y-3">
                            <Loader2 className="animate-spin mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Loading payment details...</p>
                         </div>
                      )}
                    </div>
                </CardContent>
                <CardFooter className="px-6 pb-6">
                  <Button className="w-full" onClick={submitPayment} disabled={busy !== null || !cfg}>
                    {busy === 'pay' ? <Loader2 className="animate-spin" /> : <CreditCard />} I Paid – Submit for Confirmation
                  </Button>
                </CardFooter>
              </>
            )}

            {uiStep === 'confirm' && (
              <CardContent className="text-center p-8 flex flex-col items-center justify-center min-h-[200px]">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold">Confirmation Pending</h2>
                <p className="text-muted-foreground">A Queue Master will approve your payment of <span className='font-semibold'>{currency(cfg?.amountCents, cfg?.currency)}</span> shortly.</p>
                {me?.paymentRef && (
                  <p className="text-sm mt-2">Your reference: <code className='font-mono bg-muted px-1 py-0.5 rounded'>{me.paymentRef}</code></p>
                )}
              </CardContent>
            )}

            {uiStep === 'queue' && (
              <CardContent className="pt-0 px-6 pb-6">
                {!queueEntry ? (
                  <Button className="w-full" onClick={joinQueue} disabled={busy !== null}>
                    {busy === 'enqueue' ? <Loader2 className="animate-spin" /> : <ListPlus />} Join Queue
                  </Button>
                ) : (
                  <Alert variant={queueEntry.status === 'waiting' ? 'default' : 'destructive'}>
                    <AlertTitle>You're in the Queue!</AlertTitle>
                    <AlertDescription>Your position will be updated automatically. You'll be notified when your match starts.</AlertDescription>
                  </Alert>
                )}
                {queueEntry?.status === 'waiting' && (
                  <Button variant="destructive" className="w-full mt-4" onClick={leaveQueue} disabled={busy !== null}>
                    {busy === 'leave' ? <Loader2 className="animate-spin" /> : <ListX />} Leave Queue
                  </Button>
                )}
              </CardContent>
            )}

            {uiStep === 'in_match' && (
              <CardContent className="text-center p-8 flex flex-col items-center justify-center min-h-[200px]">
                <Swords className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold">Good Luck!</h2>
                <p className="text-muted-foreground">Once your game is finished, tap the button below.</p>
                <Button className="w-full mt-6" onClick={requeue} disabled={busy !== null}>
                  {busy === 'requeue' ? <Loader2 className="animate-spin" /> : <Repeat />} Match Over – Rejoin Queue
                </Button>
              </CardContent>
            )}

          </motion.div>
        </AnimatePresence>
      </Card>
    </>
  );
}

    