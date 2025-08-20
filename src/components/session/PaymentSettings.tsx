
'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Trash2, PlusCircle, Save } from 'lucide-react';

interface EWallet {
  accountNumber: string;
  qrUrl?: string;
}

interface PaymentConfig {
  amountCents: number;
  currency: string;
  eWallets: Record<string, EWallet>;
}

interface PaymentSettingsProps {
  basePath: string;
}

const initialConfig: PaymentConfig = {
    amountCents: 1000, // Default to 10.00
    currency: 'PHP',
    eWallets: {
        gcash: { accountNumber: '09171234567', qrUrl: '' }
    }
};

export default function PaymentSettings({ basePath }: PaymentSettingsProps) {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const { toast } = useToast();
  const settingsPath = `${basePath}/settings/payment`;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, settingsPath), (s) => {
      if (s.exists()) {
        setConfig(s.data() as PaymentConfig);
      } else {
        // If the document doesn't exist, we can initialize it with defaults
        setConfig(initialConfig);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [settingsPath]);

  const handleFieldChange = (walletName: string, field: keyof EWallet, value: string) => {
    if (!config) return;
    const newConfig = {
      ...config,
      eWallets: {
        ...config.eWallets,
        [walletName]: {
          ...config.eWallets[walletName],
          [field]: value
        }
      }
    };
    setConfig(newConfig);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!config) return;
    const value = e.target.value.trim();
    const amount = value === '' ? 0 : parseFloat(value) * 100;
    if (!isNaN(amount)) {
      setConfig({ ...config, amountCents: amount });
    }
  };

  const handleAddWallet = () => {
    if (!config || !newWalletName.trim() || config.eWallets[newWalletName.trim().toLowerCase()]) {
      toast({
        variant: 'destructive',
        title: 'Invalid Wallet Name',
        description: 'Please enter a unique, non-empty name for the new e-wallet.'
      });
      return;
    }
    const walletKey = newWalletName.trim().toLowerCase();
    const newConfig = {
      ...config,
      eWallets: {
        ...config.eWallets,
        [walletKey]: { accountNumber: '' }
      }
    };
    setConfig(newConfig);
    setNewWalletName('');
  };

  const handleRemoveWallet = (walletName: string) => {
    if (!config) return;
    const { [walletName]: _, ...remainingWallets } = config.eWallets;
    const newConfig = { ...config, eWallets: remainingWallets };
    setConfig(newConfig);
  };

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      // Use setDoc with merge: true to create or update the document.
      await setDoc(doc(db, settingsPath), config, { merge: true });
      toast({ title: 'Settings Saved', description: 'Payment configuration has been updated.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'><CreditCard/> Payment Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin text-primary" />
          <p className="ml-4">Loading payment configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'><CreditCard/> Payment Settings</CardTitle>
        <CardDescription>Configure session fee and accepted e-wallets. These settings are shown to players upon joining.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Entry Fee</Label>
                <Input 
                    id="amount" 
                    type="number"
                    value={(config?.amountCents || 0) / 100}
                    onChange={handleAmountChange}
                    placeholder="e.g. 10.00"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input 
                    id="currency" 
                    value={config?.currency || 'PHP'}
                    onChange={(e) => setConfig(config ? {...config, currency: e.target.value} : null)}
                    placeholder="e.g. PHP"
                />
            </div>
        </div>

        <div className="space-y-4">
          {config && Object.entries(config.eWallets).map(([name, details]) => (
            <div key={name} className="flex items-end gap-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex-grow space-y-2">
                <Label htmlFor={`wallet-${name}`} className="capitalize font-semibold">{name}</Label>
                <Input
                  id={`wallet-${name}`}
                  value={details.accountNumber}
                  onChange={(e) => handleFieldChange(name, 'accountNumber', e.target.value)}
                  placeholder="Account Number"
                />
              </div>
              <Button variant="destructive" size="icon" onClick={() => handleRemoveWallet(name)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-end gap-2 pt-4 border-t">
          <div className="flex-grow space-y-2">
            <Label htmlFor="new-wallet">New E-Wallet Name</Label>
            <Input
              id="new-wallet"
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
              placeholder="e.g., GoTym"
            />
          </div>
          <Button variant="outline" onClick={handleAddWallet}>
            <PlusCircle className="mr-2" /> Add
          </Button>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
          Save All Payment Settings
        </Button>
      </CardContent>
    </Card>
  );
}
