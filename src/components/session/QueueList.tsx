'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { QueueItem } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Users } from 'lucide-react';

interface QueueListProps {
  waitingQueue: QueueItem[];
}

export default function QueueList({ waitingQueue }: QueueListProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="text-primary" />
          Player Queue
        </CardTitle>
        <CardDescription>{waitingQueue.length} player(s) waiting for a match</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {waitingQueue.length > 0 ? (
            <ul className="space-y-3">
              {waitingQueue.map((player, index) => (
                <li key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-in fade-in-50">
                  <div className="flex items-center gap-4">
                     <Badge variant="secondary" className="text-lg font-bold">#{index + 1}</Badge>
                    <Avatar>
                      <AvatarImage src={`https://placehold.co/40x40.png?text=${player.nickname.charAt(0)}`} />
                      <AvatarFallback>{player.nickname.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{player.nickname}</p>
                      <p className="text-sm text-muted-foreground">Level {player.level}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <p className="font-semibold text-lg">The queue is empty!</p>
                <p className="text-sm">Players who join will appear here.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
