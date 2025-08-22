import type { Participant, QueueItem } from '@/types';

/**
 * Selects a balanced set of players for a match based on skill (80%) and age (20%).
 * Players are chosen such that the range of the weighted score within the group is minimal,
 * promoting matches with similar skill and age profiles.
 */
export function selectBalancedPlayers(
  waitingQueue: QueueItem[],
  participants: Participant[],
  playersPerMatch: number
): Participant[] {
  // Build candidate list with full participant details
  const candidates = waitingQueue
    .map(q => participants.find(p => p.userId === q.userId || p.id === q.userId))
    .filter(Boolean) as Participant[];

  if (candidates.length < playersPerMatch) return [];

  const maxLevel = Math.max(...candidates.map(p => p.level), 1);
  const maxAge = Math.max(...candidates.map(p => p.age), 1);

  const scored = candidates.map(p => {
    const levelNorm = p.level / maxLevel;
    const ageNorm = p.age / maxAge; // older => higher value
    // Younger and higher skill gets higher score
    const score = 0.8 * levelNorm + 0.2 * (1 - ageNorm);
    return { ...p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  let bestGroup = scored.slice(0, playersPerMatch);
  let minRange = bestGroup[0].score - bestGroup[bestGroup.length - 1].score;

  for (let i = 1; i <= scored.length - playersPerMatch; i++) {
    const group = scored.slice(i, i + playersPerMatch);
    const range = group[0].score - group[group.length - 1].score;
    if (range < minRange) {
      minRange = range;
      bestGroup = group;
    }
  }

  return bestGroup;
}
