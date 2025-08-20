
'use client';

import { Suspense, useEffect, useState } from 'react';
import { onSnapshot, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminPanel from "@/components/session/AdminPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Palette, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const themes = [
    { name: 'Default', primary: '45 100% 52%', background: '60 56% 91%', accent: '36 100% 50%' },
    { name: 'Forest', primary: '142 76% 36%', background: '120 10% 95%', accent: '142 66% 46%' },
    { name: 'Ocean', primary: '217 91% 60%', background: '210 40% 98%', accent: '217 81% 70%' },
    { name: 'Sunset', primary: '24 96% 53%', background: '20 20% 96%', accent: '14 90% 60%' },
    { name: 'Minimalist', primary: '0 0% 15%', background: '0 0% 100%', accent: '0 0% 40%' }
];

function AdminPageContent() {
  const orgId = "org_abc";
  const venueId = "downtown_gym";
  const sessionId = "session_20250820";
  const basePath = `orgs/${orgId}/venues/${venueId}/sessions/${sessionId}`;

  const [session, setSession] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);

  // Theme state
  const [selectedTheme, setSelectedTheme] = useState(themes[0].name);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // This could be extended to load the saved theme name from a database
    // For now, it just initializes based on the default theme constant
    const currentTheme = themes.find(t => t.name === selectedTheme);
    if(currentTheme) {
        document.documentElement.style.setProperty('--primary', currentTheme.primary);
        document.documentElement.style.setProperty('--background', currentTheme.background);
        document.documentElement.style.setProperty('--accent', currentTheme.accent);
    }
    
    const unsubSession = onSnapshot(doc(db, basePath), (s) => setSession(s.data() as any));
    const unsubParticipants = onSnapshot(collection(db, `${basePath}/participants`), (s) => setParticipants(s.docs.map(d => ({ id: d.id, ...d.data() })) as any));
    const unsubCourts = onSnapshot(collection(db, `${basePath}/courts`), (s) => setCourts(s.docs.map(d => ({ id: d.id, ...d.data() })) as any));

    return () => {
      unsubSession();
      unsubParticipants();
      unsubCourts();
    };
  }, [basePath, selectedTheme]);

  const handleThemeUpdate = () => {
    setIsSaving(true);
    try {
        const theme = themes.find(t => t.name === selectedTheme);
        if (!theme) {
            throw new Error("Selected theme not found.");
        }
        
        // This is a simplified approach. A real implementation would save this to a database
        // and have a mechanism to load it globally. For this demo, we just update the live styles.
        document.documentElement.style.setProperty('--primary', theme.primary);
        document.documentElement.style.setProperty('--background', theme.background);
        document.documentElement.style.setProperty('--accent', theme.accent);
        
        toast({
            title: 'Theme Updated!',
            description: `The '${theme.name}' theme has been applied.`,
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
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
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
                        Select a pre-defined color scheme to apply to the entire site.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="theme-select">Theme</Label>
                        <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                            <SelectTrigger id="theme-select">
                                <SelectValue placeholder="Select a theme" />
                            </SelectTrigger>
                            <SelectContent>
                                {themes.map(theme => (
                                    <SelectItem key={theme.name} value={theme.name}>
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.primary})` }} />
                                            {theme.name}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleThemeUpdate} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                        Save Theme
                    </Button>
                </CardContent>
            </Card>
        </div>
    </main>
  );
}


export default function AdminPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminPageContent />
        </Suspense>
    )
}
