'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { suggestMatches, SuggestMatchesOutput } from '@/ai/flows/suggest-matches';
import type { Participant } from '@/types';
import { Loader2, Sparkles, Users, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MatchSuggesterProps {
  playerLevel: number;
  availablePlayers: Participant[];
  gameType: 'singles' | 'doubles';
}

export default function MatchSuggester({ playerLevel, availablePlayers, gameType }: MatchSuggesterProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestMatchesOutput | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSuggest = async () => {
    const playersNeeded = gameType === 'doubles' ? 4 : 2;
    if (availablePlayers.length < playersNeeded) {
        toast({
            variant: "destructive",
            title: "Not enough players",
            description: `The AI needs at least ${playersNeeded} players in the queue to suggest a ${gameType} match.`
        });
        return;
    }

    setLoading(true);
    setSuggestions(null);
    try {
      const result = await suggestMatches({
        playerLevel,
        availablePlayers: availablePlayers.map(({ userId, nickname, level }) => ({ userId, nickname, level })),
        gameType,
      });
      setSuggestions(result);
      setDialogOpen(true);
    } catch (e: any) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'AI Suggestion Failed',
        description: e.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI Match Maker
          </CardTitle>
          <CardDescription>Get AI-powered suggestions for balanced matches based on the current queue.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Current Context</h4>
            <p className="text-sm">
              <span className="font-medium text-foreground">{availablePlayers.length} players</span> are currently available in the queue.
            </p>
            <p className="text-sm">
                Your skill level is <span className="font-medium text-foreground">{playerLevel}</span>.
            </p>
            <p className="text-sm">
                Game type is set to <span className="font-medium text-foreground capitalize">{gameType}</span>.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSuggest} disabled={loading} className="w-full md:w-auto">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {loading ? 'AI is Thinking...' : 'Suggest Balanced Matches'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="text-primary" />AI Match Suggestions</DialogTitle>
            {suggestions?.reasoning && (
                <DialogDescription className="pt-2 italic text-foreground/80">
                    "{suggestions.reasoning}"
                </DialogDescription>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {suggestions?.suggestedMatches.map((match, i) => (
              <Card key={i} className="bg-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {match.length > 2 ? <Users /> : <User />}
                    Suggested Match {i + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {match.map(player => (
                      <div key={player.userId} className="p-3 rounded-md bg-muted flex justify-between items-center">
                        <span className="font-medium">{player.nickname}</span>
                        <Badge variant="secondary">Lvl {player.level}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
