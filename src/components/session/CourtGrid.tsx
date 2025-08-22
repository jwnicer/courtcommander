import CourtCard from './CourtCard';
import type { Court, Match, Participant, QueueItem } from '@/types';

interface CourtGridProps {
  basePath: string;
  courts: Court[];
  matches: Match[];
  participants: Participant[];
  canCoach: boolean;
  waitingQueue: QueueItem[];
  gameType: 'singles' | 'doubles';
}

export default function CourtGrid({
  basePath,
  courts,
  matches,
  participants,
  canCoach,
  waitingQueue,
  gameType,
}: CourtGridProps) {
  const participantMap = new Map(participants.map(p => [p.userId, p]));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {courts.map(court => {
        const match = matches.find(m => m.id === court.currentMatchId);
        const players = match?.players.map(pId => participantMap.get(pId)).filter(Boolean) as Participant[] || [];
        
        return (
          <CourtCard
            key={court.id}
            basePath={basePath}
            court={court}
            match={match}
            players={players}
            participants={participants}
            canCoach={canCoach}
            waitingQueue={waitingQueue}
            gameType={gameType}
          />
        );
      })}
    </div>
  );
}
