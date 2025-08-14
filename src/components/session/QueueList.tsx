'use client'

import { useState } from 'react';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { QueueItem } from '@/types';
import { api } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Users, Loader2, ListPlus } from 'lucide-react';

interface QueueListProps {
  basePath: string;
  waitingQueue: QueueItem[];
  user: User;
}

export default function QueueList({ basePath, waitingQueue, user }: QueueListProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [orgId, venueId, sessionId] = basePath.split('/').slice(1, 4);

  const isUserInQueue = waitingQueue.some(p => p.userId === user.uid);

  const handleJoinQueue = async () => {
    setLoading(true);
    try {
      await api.enqueue({ orgId, venueId, sessionId });
      toast({
        title: "Success!",
        description: "You have joined the queue.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to join queue",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="text-primary" />
          Player Queue
        </CardTitle>
        <CardDescription>{waitingQueue.length} player(s) waiting</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {waitingQueue.length > 0 ? (
            <ul className="space-y-3">
              {waitingQueue.map((player, index) => (
                <li key={player.id} className="flex items-center justify-between p-2 rounded-lg bg-background hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://placehold.co/40x40.png?text=${player.nickname.charAt(0)}`} />
                      <AvatarFallback>{player.nickname.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{player.nickname}</p>
                      <p className="text-sm text-muted-foreground">Level {player.level}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-mono">#{index + 1}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <p className="font-semibold">The queue is empty!</p>
                <p className="text-sm">Be the first to join.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleJoinQueue} disabled={isUserInQueue || loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListPlus className="mr-2 h-4 w-4" />}
          {isUserInQueue ? "You're in the Queue" : "Join Queue"}
        </Button>
      </CardFooter>
    </Card>
  );
}
