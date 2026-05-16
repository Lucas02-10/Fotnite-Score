export interface Participant {
  id: string;
  name: string;
}

export interface Team {
  id: number;
  name: string;
  color: string;
  members: Participant[];
}

export type ClassificationMode = 'by-teams' | 'by-members';
