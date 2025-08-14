'use client';

import { useState } from 'react';
import { api } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, PartyPopper, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PaymentCard({ orgId, venueId, sessionId }: { orgId: string, venueId: string, sessionId: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handlePayment = async () => {
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
        <Button size="lg" className="w-full" onClick={handlePayment} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <CreditCard className="mr-2 h-5 w-5" />
          {loading ? 'Redirecting to Payment...' : 'Pay Entry Fee'}
        </Button>
      </CardContent>
    </Card>
  );
}
