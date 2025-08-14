'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Court, Match, Participant, QueueItem } from '@/types';
import { api } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, User, Users, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';

interface CourtCardProps {
  basePath: string;
  court: Court;
  match?: Match;
  players: Participant[];
  canCoach: boolean;
  waitingQueue: QueueItem[];
  gameType: 'singles' | 'doubles';
}

export default function CourtCard({ basePath, court, match, players, canCoach, waitingQueue, gameType }: CourtCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [orgId, venueId, sessionId] = basePath.split('/').slice(1, 4);

  const handleCoachAssign = async () => {
    setLoading(true);
    const playersNeeded = gameType === 'doubles' ? 4 : 2;
    const playerIds = waitingQueue.slice(0, playersNeeded).map(p => p.userId);

    if (playerIds.length < playersNeeded) {
      toast({
        variant: 'destructive',
        title: 'Not enough players',
        description: `Need ${playersNeeded} players in the queue to start a ${gameType} match.`,
      });
      setLoading(false);
      return;
    }

    try {
      await api.coachOverrideAssign({ orgId, venueId, sessionId, courtId: court.id, playerIds });
      toast({ title: 'Success', description: `Match assigned to ${court.name}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Assignment Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMatch = async () => {
    if (!match) return;
    setLoading(true);
    try {
      await api.completeMatch({ orgId, venueId, sessionId, matchId: match.id });
      toast({ title: 'Match Completed', description: `Match on ${court.name} is finished.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to complete match', description: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const statusColor =
    court.status === 'playing'
      ? 'bg-destructive/10 border-destructive/30'
      : court.status === 'down'
      ? 'bg-muted border-border text-muted-foreground'
      : 'bg-primary/10 border-primary/30';

  return (
    <Card className={cn("flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-300", statusColor)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{court.name}</CardTitle>
          <Badge variant={court.status === 'playing' ? 'destructive' : court.status === 'down' ? 'outline' : 'secondary'} className="capitalize">{court.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow min-h-[90px] flex items-center justify-center">
        {court.status === 'playing' && match ? (
          <div className="w-full space-y-3">
             <div className="flex flex-wrap gap-2">
              {players.map(p => (
                 <TooltipProvider key={p.id}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Avatar className="h-9 w-9 border-2 border-background">
                            <AvatarFallback>{p.nickname.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{p.nickname} (Level {p.level})</p>
                      </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
              ))}
            </div>
             <p className="text-xs text-muted-foreground">Match in progress...</p>
          </div>
        ) : court.status === 'idle' ? (
          <div className="text-center text-primary/90">
            <CheckCircle className="mx-auto h-8 w-8 mb-2" />
            <p className="font-semibold">Available</p>
          </div>
        ) : ( // 'down' status
          <div className="text-center">
            <XCircle className="mx-auto h-8 w-8 mb-2" />
            <p className="font-semibold">Unavailable</p>
          </div>
        )}
      </CardContent>
      {canCoach && (
        <CardFooter>
          {court.status === 'playing' && match ? (
            <Button variant="outline" className="w-full" onClick={handleCompleteMatch} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Complete Match
            </Button>
          ) : (
            <Button variant="secondary" className="w-full" onClick={handleCoachAssign} disabled={loading || court.status !== 'idle'}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (gameType === 'doubles' ? <Users className="mr-2 h-4 w-4" /> : <User className="mr-2 h-4 w-4" />)}
              Coach Assign Next
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
