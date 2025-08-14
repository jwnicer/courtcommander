'use client';

import { useState } from 'react';
import { api } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, PartyPopper, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

// In a real app, this would be a more robust QR/manual payment component
// For this prototype, we are simulating the modal experience.
function ManualPaymentWidget({ orgId, venueId, sessionId, onClose }: { orgId: string, venueId: string, sessionId: string, onClose: () => void }) {
  const { toast } = useToast();
  
  const handleSimulatePayment = () => {
    toast({
      title: "Payment Submitted",
      description: "A coach will verify your payment shortly.",
    });
    onClose();
  };

  return (
    <div className="grid gap-4">
      <div className='text-center'>
        <p className="text-sm text-muted-foreground">In a real app, a QR code or payment instructions would appear here.</p>
        <img src="https://placehold.co/200x200.png" data-ai-hint="qr code" alt="QR Code Placeholder" className="mx-auto my-4 rounded-md" />
        <p className='font-semibold'>Scan to Pay</p>
      </div>
      <Button onClick={handleSimulatePayment}>I Have Paid</Button>
    </div>
  )
}


function PaymentModal({ orgId, venueId, sessionId, open, onOpenChange }: { orgId: string, venueId: string, sessionId: string, open: boolean, onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay to Join Session</DialogTitle>
          <DialogDescription>
            Follow the instructions to complete your payment. A coach will verify it to add you to the queue.
          </DialogDescription>
        </DialogHeader>
        <ManualPaymentWidget orgId={orgId} venueId={venueId} sessionId={sessionId} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}


export default function PaymentCard({ orgId, venueId, sessionId }: { orgId: string, venueId: string, sessionId: string }) {
  const [loading, setLoading] = useState(false);
  const [showStripe, setShowStripe] = useState(false);
  const [showManualPay, setShowManualPay] = useState(false);
  const { toast } = useToast();
  
  const handleStripePayment = async () => {
    setLoading(true);
    try {
      const successUrl = window.location.href;
      const cancelUrl = window.location.href;
      const { data }: any = await api.createCheckoutSession({ orgId, venueId, sessionId, successUrl, cancelUrl });
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Could not retrieve payment URL.");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Could not initiate payment. Please try again.",
      });
      setLoading(false);
    }
  };

  if (showStripe) {
    // This part remains for Stripe, but the main flow will use the manual/QR modal
    return (
        <Card className="max-w-lg mx-auto text-center animate-in fade-in-50">
        <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <PartyPopper className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="mt-4">You're Registered!</CardTitle>
            <CardDescription>Just one more step. Please complete your payment to join the queue.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button size="lg" className="w-full" onClick={handleStripePayment} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <CreditCard className="mr-2 h-5 w-5" />
            {loading ? 'Redirecting to Payment...' : 'Pay Entry Fee with Stripe'}
            </Button>
        </CardContent>
        </Card>
    );
  }

  return (
    <>
      <Card className="max-w-lg mx-auto text-center animate-in fade-in-50">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <PartyPopper className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="mt-4">You're Registered!</CardTitle>
          <CardDescription>Just one more step. Please complete your payment to join the queue.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button size="lg" className="w-full" onClick={() => setShowManualPay(true)} disabled={loading}>
              <CreditCard className="mr-2 h-5 w-5" />
              Continue to Payment
            </Button>
        </CardContent>
        <CardFooter className='flex-col gap-2 text-sm text-muted-foreground'>
            <p>You will be added to the queue once a coach verifies your payment.</p>
        </CardFooter>
      </Card>
      <PaymentModal open={showManualPay} onOpenChange={setShowManualPay} orgId={orgId} venueId={venueId} sessionId={sessionId} />
    </>
  );
}
