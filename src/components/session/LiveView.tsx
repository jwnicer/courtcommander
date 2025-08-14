import type { Court, Match, Participant, QueueItem } from '@/types';
import CourtGrid from './CourtGrid';
import QueueList from './QueueList';

interface LiveViewProps {
  basePath: string;
  canCoach: boolean;
  courts: Court[];
  matches: Match[];
  participants: Participant[];
  waitingQueue: QueueItem[];
  gameType: 'singles' | 'doubles';
}

export default function LiveView({
  basePath,
  canCoach,
  courts,
  matches,
  participants,
  waitingQueue,
  gameType
}: LiveViewProps) {
  return (
    <div className="space-y-8">
      <CourtGrid
        basePath={basePath}
        courts={courts}
        matches={matches}
        participants={participants}
        canCoach={canCoach}
        waitingQueue={waitingQueue}
        gameType={gameType}
      />
      <QueueList waitingQueue={waitingQueue} />
    </div>
  );
}
