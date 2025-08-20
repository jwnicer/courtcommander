
'use client';

import { Suspense, useEffect, useState } from 'react';
import { onSnapshot, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminPanel from "@/components/session/AdminPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Palette, Loader2 } from 'lucide-react';
import { update } from 'firebase/database';

function AdminPageContent() {
  const orgId = "org_abc";
  const venueId = "downtown_gym";
  const sessionId = "session_20250820";
  const basePath = `orgs/${orgId}/venues/${venueId}/sessions/${sessionId}`;

  const [session, setSession] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);

  // Theme state
  const [primaryColor, setPrimaryColor] = useState('45 100% 52%');
  const [backgroundColor, setBackgroundColor] = useState('60 56% 91%');
  const [accentColor, setAccentColor] = useState('36 100% 50%');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial theme from CSS variables
    if (typeof window !== 'undefined') {
        const rootStyles = getComputedStyle(document.documentElement);
        setPrimaryColor(rootStyles.getPropertyValue('--primary').trim());
        setBackgroundColor(rootStyles.getPropertyValue('--background').trim());
        setAccentColor(rootStyles.getPropertyValue('--accent').trim());
    }
    
    const unsubSession = onSnapshot(doc(db, basePath), (s) => setSession(s.data() as any));
    const unsubParticipants = onSnapshot(collection(db, `${basePath}/participants`), (s) => setParticipants(s.docs.map(d => ({ id: d.id, ...d.data() })) as any));
    const unsubCourts = onSnapshot(collection(db, `${basePath}/courts`), (s) => setCourts(s.docs.map(d => ({ id: d.id, ...d.data() })) as any));

    return () => {
      unsubSession();
      unsubParticipants();
      unsubCourts();
    };
  }, [basePath]);

  const handleThemeUpdate = () => {
    setIsSaving(true);
    try {
        // This is a simplified approach. A real implementation would save this to a database
        // and have a mechanism to load it globally. For this demo, we just update the live styles.
        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty('--background', backgroundColor);
        document.documentElement.style.setProperty('--accent', accentColor);
        
        toast({
            title: 'Theme Updated!',
            description: 'The new color scheme has been applied.',
        });
    } catch(e: any) {
        toast({
            variant: 'destructive',
            title: 'Failed to update theme',
            description: e.message,
        })
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <div className="space-y-8">
        <AdminPanel 
            session={session}
            participants={participants}
            courts={courts}
            basePath={basePath}
        />

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette />
                    Theme Customizer
                </CardTitle>
                <CardDescription>
                    Adjust the site-wide color scheme. Enter colors as HSL values (e.g., '240 10% 3.9%').
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <Input id="primaryColor" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="backgroundColor">Background Color</Label>
                        <Input id="backgroundColor" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="accentColor">Accent Color</Label>
                        <Input id="accentColor" value={accentColor} onChange={e => setAccentColor(e.target.value)} />
                    </div>
                </div>
                 <Button onClick={handleThemeUpdate} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                    Save Theme
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}


export default function AdminPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminPageContent />
        </Suspense>
    )
}
