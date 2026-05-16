export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
}

export interface Competition {
  id: string;
  ownerEmail: string;
  name: string;
  description: string;
  logoUrl: string;
}

export interface Team {
  id: string;
  name: string;
  logoUrl: string;
  eliminations: number;
  victories: number;
  rounds: number;
}

export interface PositionIndicator {
  id: string;
  name: string;
  color: string;
  positions: string; // e.g. "1-2" or "1,2,5"
}

export type SectionType = 'leaderboard' | 'playoffs' | 'eliminatorias';

export interface CompetitionSection {
  id: string;
  type: SectionType;
  name: string;
}

export interface Season {
  id: string;
  year: string;
  name: string;
  championName?: string;
  championLogo?: string;
  isFinished: boolean;
  sections: CompetitionSection[];
}

export interface BracketParticipant {
  name: string;
  logoUrl: string;
  isGolden?: boolean;
  eliminations?: number;
  victories?: number;
  rounds?: number;
}

export interface MatchData {
  participants: BracketParticipant[];
}

export interface CompetitionBracket {
  [key: string]: MatchData;
}
