import type { User } from 'firebase/auth';
import type { Court, Match, Participant, QueueItem } from '@/types';
import CourtGrid from './CourtGrid';
import QueueList from './QueueList';

interface LiveViewProps {
  basePath: string;
  user: User;
  canCoach: boolean;
  courts: Court[];
  matches: Match[];
  participants: Participant[];
  waitingQueue: QueueItem[];
  gameType: 'singles' | 'doubles';
}

export default function LiveView({
  basePath,
  user,
  canCoach,
  courts,
  matches,
  participants,
  waitingQueue,
  gameType
}: LiveViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in-50">
      <div className="lg:col-span-1">
        <QueueList basePath={basePath} waitingQueue={waitingQueue} user={user} />
      </div>
      <div className="lg:col-span-2">
        <CourtGrid
          basePath={basePath}
          courts={courts}
          matches={matches}
          participants={participants}
          canCoach={canCoach}
          waitingQueue={waitingQueue}
          gameType={gameType}
        />
      </div>
    </div>
  );
}
