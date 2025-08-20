
'use client';
import { useEffect, useMemo, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getClientId, createIntent } from '@/lib/clientId';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, CreditCard, Clock, ListPlus, Swords, Repeat, ListX, HelpCircle, CheckCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { QUESTIONS, computeAssessment, AnswerMap, Letter } from '@/lib/badmintonSkillAssessment';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '../ui/scroll-area';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type Step = 'register' | 'terms' | 'pay' | 'confirm' | 'queue' | 'in_match';
type EWallet = 'gcash' | 'maya' | 'gotym';

interface PlayerWizardProps {
    orgId: string;
    venueId: string;
    sessionId: string;
    onComplete?: () => void;
}

const skillLevels: Record<Letter, number> = {
    'A': 6, 'B': 5, 'C': 4, 'D': 3, 'E': 2, 'F': 1
};
const reverseSkillLevels: Record<number, Letter> = {
    6: 'A', 5: 'B', 4: 'C', 3: 'D', 2: 'E', 1: 'F'
};

const SkillAssessmentForm = ({ onComplete }: { onComplete: (level: Letter) => void }) => {
    const [answers, setAnswers] = useState<AnswerMap>({});
    const canSubmit = Object.keys(answers).length === QUESTIONS.length;

    const handleAnswerChange = (questionId: string, value: Letter) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = () => {
        const result = computeAssessment(answers);
        onComplete(result.finalLevel);
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><HelpCircle/> Skill Level Assessment</DialogTitle>
                <DialogDescription>
                    Answer these 10 questions to get an estimated skill level. Be honest for the best results.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-6">
                <div className="space-y-6">
                    {QUESTIONS.map((q, index) => (
                        <Card key={q.id}>
                            <CardHeader>
                                <CardTitle className="text-lg">#{index + 1}: {q.topic}</CardTitle>
                                <CardDescription>{q.prompt}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup onValueChange={(v: Letter) => handleAnswerChange(q.id, v)}>
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
                <Button onClick={handleSubmit} disabled={!canSubmit}>
                    <CheckCircle className="mr-2" />
                    Calculate My Level
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

const TermsAndConditionsDialog = ({ onAgree, onOpenChange, open }: { onAgree: () => void; onOpenChange: (open: boolean) => void; open: boolean; }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><FileText /> Terms & Conditions</DialogTitle>
                    <DialogDescription>Please read and agree to the terms before participating.</DialogDescription>
                </DialogHeader>
                <div className="prose prose-stone dark:prose-invert max-w-none space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-4">
                    <p>By clicking "I Agree," you acknowledge you have read, understood, and agree to the full <Link href="/terms" target="_blank" className="text-primary hover:underline">Terms & Conditions</Link>, including the following key points:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Assumption of Risk:</strong> You voluntarily assume all risks associated with badminton, including injury.</li>
                        <li><strong>Release of Liability:</strong> You release CourtCommander and its affiliates from any claims arising from your participation.</li>
                        <li><strong>Code of Conduct:</strong> You agree to maintain a respectful and safe environment, with zero tolerance for profanity or harassment.</li>
                        <li><strong>QM Authority:</strong> You agree that the Queue Master (QM) has final authority on all session-related matters.</li>
                    </ul>
                    <p>For the complete details, please review the <Link href="/terms" target="_blank" className="text-primary hover:underline">full Terms & Conditions page</Link>.</p>
                </div>
                <DialogFooter>
                    <Button onClick={onAgree}><CheckCircle className="mr-2"/> I Agree</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function PlayerWizard({ orgId, venueId, sessionId, onComplete }: PlayerWizardProps) {
  const [clientId, setClientId] = useState<string | null>(null);

  const [cfg, setCfg] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [queueEntry, setQueueEntry] = useState<any>(null);

  // Registration form state
  const [nickname, setNick] = useState('');
  const [level, setLevel] = useState(3);
  const [age, setAge] = useState(18);
  const [loading, setLoading] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [selectedEWallet, setSelectedEWallet] = useState<EWallet>('gcash');
  const { toast } = useToast();


  const base = `orgs/${orgId}/venues/${venueId}/sessions/${sessionId}`;

  useEffect(() => {
    setClientId(getClientId());
  }, []);

  useEffect(() => {
    if (!clientId) return;
    const unsubMe = onSnapshot(doc(db, `${base}/participants/${clientId}`), s => setMe(s.exists() ? { id: s.id, ...s.data() } : null));
    const unsubQueue = onSnapshot(doc(db, `${base}/queue/${clientId}`), s => setQueueEntry(s.exists() ? { id: s.id, ...s.data() } : null));
    return () => {
      unsubMe();
      unsubQueue();
    };
  }, [base, clientId]);

  useEffect(() => {
    if (!orgId || !venueId || !sessionId) return;
    
    const sessionPayDoc = doc(db, `orgs/${orgId}/venues/${venueId}/sessions/${sessionId}/settings/payment`);

    const unsub = onSnapshot(sessionPayDoc, (s) => {
        if (s.exists()) {
            setCfg(s.data());
        } else {
            // Fallback or default config if session-specific one doesn't exist
            setCfg({ amountCents: 1000, currency: 'PHP' }); // Example default
        }
    });
    return () => unsub();

  }, [orgId, venueId, sessionId]);


  const step: Step = useMemo(() => {
    if (!me) return 'register';
    if (!me.agreedToTerms) return 'terms';
    if (cfg?.amountCents > 0 && !me.paid) return me.paymentRef ? 'confirm' : 'pay';
    if (queueEntry?.status === 'playing') return 'in_match';
    return 'queue';
  }, [me, queueEntry, cfg]);

  useEffect(() => {
    if (step === 'queue' || step === 'in_match') {
        onComplete?.();
    }
  }, [step, onComplete]);
  
  const handleAction = async (action: () => Promise<any>) => {
    setLoading(true);
    try {
      await action();
    } catch (e: any) {
      console.error("Action failed", e);
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: e.message || "An unexpected error occurred."
      })
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = () => handleAction(async () => {
      if (!clientId) throw new Error("Client ID not available.");
      await createIntent(base, 'register', clientId, { nickname, level, age });
      // The useEffect for 'me' will pick up the change and move to the 'terms' step.
  });

  const handleAgreeToTerms = () => handleAction(async () => {
    await createIntent(base, 'agree_to_terms', clientId!, {});
    setTermsOpen(false);
  });

  const submitPayment = () => handleAction(() => createIntent(base, 'submit_payment', clientId!, {
     amountCents: cfg?.amountCents,
     currency: cfg?.currency,
     method: selectedEWallet 
    }));
  const joinQueue = () => handleAction(() => createIntent(base, 'enqueue', clientId!, {}));
  const leaveQueue = () => handleAction(() => createIntent(base, 'leave_queue', clientId!, {}));
  const requeue = () => handleAction(() => createIntent(base, 'requeue_after_match', clientId!, {}));

  const handleAssessmentComplete = (calculatedLevel: Letter) => {
    setLevel(skillLevels[calculatedLevel]);
    setAssessmentOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Account number copied to clipboard." });
  }
  
  // Open terms dialog when user is created but hasn't agreed to terms
  useEffect(() => {
    if(me && !me.agreedToTerms) {
      setTermsOpen(true);
    }
  }, [me]);

  const currentPaymentDetails = cfg?.eWallets?.[selectedEWallet];

  if (!clientId) {
    return <Card className="w-full border-none shadow-none"><CardHeader><CardTitle>Loading...</CardTitle></CardHeader></Card>
  }
  
  const renderHeader = () => {
    switch (step) {
      case 'register':
        return <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus /> Register for Session</DialogTitle><DialogDescription>Enter your details to join the open play session.</DialogDescription></DialogHeader>;
      case 'terms':
        return <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText /> Terms & Conditions</DialogTitle><DialogDescription>Please read and agree to the terms before participating.</DialogDescription></DialogHeader>;
      case 'pay':
        return <DialogHeader><DialogTitle className="flex items-center gap-2"><CreditCard /> Complete Your Payment</DialogTitle><DialogDescription>Select an e-wallet, pay the fee, then submit for confirmation.</DialogDescription></DialogHeader>;
      case 'confirm':
        return <DialogHeader><DialogTitle className="flex items-center gap-2"><Clock /> Waiting for Confirmation</DialogTitle><DialogDescription>An admin will verify your payment shortly.</DialogDescription></DialogHeader>;
      case 'queue':
        return <DialogHeader><DialogTitle className="flex items-center gap-2"><CheckCircle /> You're All Set!</DialogTitle><DialogDescription>You are paid and ready to play.</DialogDescription></DialogHeader>;
      case 'in_match':
        return <DialogHeader><DialogTitle className="flex items-center gap-2"><Swords /> Match in Progress</DialogTitle><DialogDescription>Good luck! Re-queue when you're done.</DialogDescription></DialogHeader>;
      default:
        return null;
    }
  };

  return (
    <>
        <Dialog open={assessmentOpen} onOpenChange={setAssessmentOpen}>
            <SkillAssessmentForm onComplete={handleAssessmentComplete} />
        </Dialog>
        <TermsAndConditionsDialog open={termsOpen} onOpenChange={setTermsOpen} onAgree={handleAgreeToTerms} />

        <Card className="w-full border-none shadow-none rounded-t-lg">
        <div className="p-6">
            {renderHeader()}
        </div>
        
        {step === 'register' && (
            <>
            <CardContent className="space-y-4 pt-0 px-6">
                <div>
                    <Label htmlFor='nickname'>Nickname</Label>
                    <Input id='nickname' placeholder="e.g., ShuttleSmasher" value={nickname} onChange={e => setNick(e.target.value)} />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <Label>Skill Level</Label>
                        <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setAssessmentOpen(true)}>Don't know your level? Take a test.</Button>
                    </div>
                    <Select onValueChange={(v) => setLevel(Number(v))} value={String(level)}>
                        <SelectTrigger><SelectValue placeholder="Select your skill level" /></SelectTrigger>
                        <SelectContent>
                            {Object.entries(skillLevels).map(([grade, value]) => 
                                <SelectItem key={grade} value={String(value)}>Level {grade}</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor='age'>Age</Label>
                    <Input id='age' type="number" min={8} max={99} value={age} onChange={e => setAge(Number(e.target.value))} />
                </div>
            </CardContent>
            <CardFooter className="px-6 pb-6">
                <Button className="w-full" onClick={handleRegistrationSubmit} disabled={loading || !nickname}>
                    {loading ? <Loader2 className="animate-spin" /> : <UserPlus />} Save & Continue
                </Button>
            </CardFooter>
            </>
        )}

        {step === 'terms' && (
            <CardContent className="px-6 pb-6 text-center">
                 <p className='text-muted-foreground mb-4'>You must agree to the terms to continue.</p>
                 <Button onClick={() => setTermsOpen(true)} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : null}
                    View Terms & Conditions
                 </Button>
            </CardContent>
        )}

        {step === 'pay' && (
            <>
            <CardContent className="space-y-4 pt-0 px-6">
                {!cfg ? <Loader2 className="mx-auto animate-spin" /> : (
                    <div className='space-y-4'>
                        <Alert>
                            <AlertTitle>Payment Required</AlertTitle>
                            <AlertDescription>
                            Please pay <span className="font-semibold">${((cfg.amountCents || 0) / 100).toFixed(2)} {cfg.currency}</span> to join the session.
                            </AlertDescription>
                        </Alert>
                         <Select onValueChange={(v: EWallet) => setSelectedEWallet(v)} defaultValue={selectedEWallet}>
                            <SelectTrigger><SelectValue placeholder="Select e-wallet" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gcash">Gcash</SelectItem>
                                <SelectItem value="maya">Maya</SelectItem>
                                <SelectItem value="gotym">GoTym</SelectItem>
                            </SelectContent>
                        </Select>

                        {currentPaymentDetails && (
                            <div className="p-4 bg-muted rounded-lg text-center space-y-3">
                                 {currentPaymentDetails.qrUrl && <img src={currentPaymentDetails.qrUrl} data-ai-hint="qr code" className="rounded-lg shadow-sm mx-auto max-w-[200px]" alt={`${selectedEWallet} QR Code`} />}
                                 <p className='text-sm text-muted-foreground'>Or send to:</p>
                                <div className="flex items-center justify-center gap-2">
                                    <code className="px-2 py-1 bg-background rounded-md text-primary font-mono">{currentPaymentDetails.accountNumber}</code>
                                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(currentPaymentDetails.accountNumber)}>Copy</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="px-6 pb-6">
                <Button className="w-full" onClick={submitPayment} disabled={loading || !cfg || !currentPaymentDetails}>
                    {loading ? <Loader2 className="animate-spin" /> : <CreditCard />} I Paid – Submit for Confirmation
                </Button>
            </CardFooter>
            </>
        )}

        {step === 'confirm' && (
            <>
                <CardContent className="text-center p-8 flex flex-col items-center justify-center min-h-[200px]">
                    <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">Confirmation Pending</h2>
                    <p className="text-muted-foreground">An admin will approve your payment of <span className='font-semibold'>${((cfg?.amountCents || 0) / 100).toFixed(2)}</span> shortly.</p>
                    <p className="text-sm mt-2">Your reference: <code className='font-mono bg-muted px-1 py-0.5 rounded'>{me.paymentRef}</code></p>
                </CardContent>
            </>
        )}

        {step === 'queue' && (
            <>
                <CardContent className="pt-0 px-6 pb-6">
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
                {queueEntry?.status === 'waiting' && (
                    <Button variant="destructive" className="w-full mt-4" onClick={leaveQueue} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <ListX />} Leave Queue
                    </Button>
                )}
                </CardContent>
            </>
        )}
        
        {step === 'in_match' && (
            <>
                <CardContent className="text-center p-8 flex flex-col items-center justify-center min-h-[200px]">
                    <Swords className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">Good Luck!</h2>
                    <p className="text-muted-foreground">Once your game is finished, tap the button below.</p>
                    <Button className="w-full mt-6" onClick={requeue} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <Repeat />} Match Over – Rejoin Queue
                    </Button>
                </CardContent>
            </>
        )}
        </Card>
    </>
  );
}

    