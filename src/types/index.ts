import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  nickname: string;
  level: number; // 1-7
  orgIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  roles: { [orgId: string]: ('player' | 'coach' | 'admin')[] };
  entitlements: { passesRemaining: number };
}

export interface Session {
  id: string;
  date: string;
  status: 'open' | 'closed' | 'archived';
  queueMode: 'auto' | 'manual';
  maxCourts: number;
  gameType: 'singles' | 'doubles';
  cooldownGames: number;
  maxConsecutive: number;
  entryFeeCents: number;
  currency: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface Court {
  id: string;
  name: string;
  status: 'idle' | 'playing' | 'down';
  currentMatchId: string | null;
}

export interface Participant {
  id: string; // This will be the userId
  userId: string;
  nickname: string;
  level: number;
  age: number;
  checkedIn: boolean;
  cooldown: number;
  lastMatchEndedAt: Timestamp | null;
  paid: boolean;
  paymentRef?: string;
}

export interface QueueItem {
  id: string; // This will be the userId
  userId: string;
  status: 'waiting' | 'assigned' | 'playing' | 'done';
  priority: number;
  requestedWith: string[];
  createdAt: Timestamp;
  nickname: string; // denormalized for easy display from participant document
  level: number; // denormalized for easy display from participant document
}

export interface Match {
  id: string;
  courtId: string;
  players: string[]; // array of userIds
  playerDetails?: Participant[]; // This can be populated client-side for display
  status: 'scheduled' | 'active' | 'completed' | 'canceled';
  startedAt: Timestamp;
  endedAt: Timestamp | null;
  createdBy: string; // 'system:auto' or userId of coach
  policy: {
    gameType: 'singles' | 'doubles';
    scoreTo: number;
  };
}
