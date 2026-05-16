import { Participant, Team } from '../types';
import { TEAM_COLORS, TEAM_EMOJIS } from './teamColors';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateTeams(
  participants: Participant[],
  numberOfTeams: number,
  teamNames?: string[]
): Team[] {
  const shuffled = shuffleArray(participants);
  const teams: Team[] = [];

  for (let i = 0; i < numberOfTeams; i++) {
    const colorIndex = i % TEAM_COLORS.length;
    teams.push({
      id: i + 1,
      name: teamNames?.[i] || `Equipo ${i + 1}`,
      color: TEAM_COLORS[colorIndex].bg,
      members: [],
    });
  }

  shuffled.forEach((participant, index) => {
    const teamIndex = index % numberOfTeams;
    teams[teamIndex].members.push(participant);
  });

  return teams;
}

export function generateTeamsByMembers(
  participants: Participant[],
  membersPerTeam: number,
  teamNames?: string[]
): Team[] {
  const numberOfTeams = Math.ceil(participants.length / membersPerTeam);
  return generateTeams(participants, numberOfTeams, teamNames);
}

export function getTeamColor(index: number) {
  return TEAM_COLORS[index % TEAM_COLORS.length];
}

export function getTeamEmoji(index: number) {
  return TEAM_EMOJIS[index % TEAM_EMOJIS.length];
}
