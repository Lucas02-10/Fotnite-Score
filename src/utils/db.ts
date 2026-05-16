import { User, Competition, Season, Team, PositionIndicator, CompetitionBracket } from '../types/fortnite';

/**
 * STRUCTURED DATABASE SCHEMA
 * 
 * users: User[]
 * competitions: Competition[]
 * seasons: Season[]
 * sectionsData: {
 *   [sectionId: string]: {
 *     teams: Team[];
 *     indicators: PositionIndicator[];
 *     bracket: CompetitionBracket;
 *   }
 * }
 */

const STORAGE_KEY = 'fortnitescore_db';

interface DatabaseSchema {
  users: User[];
  competitions: Competition[];
  seasons: Season[];
  sectionsData: Record<string, {
    teams: Team[];
    indicators: PositionIndicator[];
    bracket: CompetitionBracket;
  }>;
}

const getDB = (): DatabaseSchema => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return { users: [], competitions: [], seasons: [], sectionsData: {} };
  }
  return JSON.parse(data);
};

const saveDB = (db: DatabaseSchema) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const db = {
  // --- USER OPERATIONS ---
  users: {
    register: (user: User): boolean => {
      const store = getDB();
      if (store.users.find(u => u.email === user.email)) return false;
      store.users.push(user);
      saveDB(store);
      return true;
    },
    login: (email: string, password?: string): User | null => {
      const store = getDB();
      const user = store.users.find(u => u.email === email && (!password || u.password === password));
      if (!user) return null;
      const { password: _, ...safeUser } = user;
      return safeUser as User;
    }
  },

  // --- COMPETITION OPERATIONS ---
  competitions: {
    getForUser: (userEmail: string) => {
      const store = getDB();
      return store.competitions.filter(c => c.ownerEmail === userEmail);
    },
    create: (comp: Competition) => {
      const store = getDB();
      store.competitions.push(comp);
      saveDB(store);
    },
    update: (updated: Competition[]) => {
      const store = getDB();
      const otherUsersComps = store.competitions.filter(c => c.ownerEmail !== updated[0]?.ownerEmail);
      store.competitions = [...otherUsersComps, ...updated];
      saveDB(store);
    }
  },

  // --- SEASON OPERATIONS ---
  seasons: {
    getForCompetition: (compId: string) => {
      const store = getDB();
      return store.seasons.filter(s => {
        // Since original types don't have compId in Season, 
        // we'll use a naming convention for the ID or add a hidden link
        return s.id.startsWith(compId);
      });
    },
    saveAll: (compId: string, seasons: Season[]) => {
      const store = getDB();
      // Remove old seasons for this competition
      const otherSeasons = store.seasons.filter(s => !s.id.startsWith(compId));
      store.seasons = [...otherSeasons, ...seasons];
      saveDB(store);
    }
  },

  // --- DATA OPERATIONS (TEAMS, BRACKETS, INDICATORS) ---
  data: {
    get: (seasonId: string, sectionId: string) => {
      const store = getDB();
      const key = `${seasonId}_${sectionId}`;
      return store.sectionsData[key] || { teams: [], indicators: [], bracket: {} };
    },
    saveTeams: (seasonId: string, sectionId: string, teams: Team[]) => {
      const store = getDB();
      const key = `${seasonId}_${sectionId}`;
      if (!store.sectionsData[key]) store.sectionsData[key] = { teams: [], indicators: [], bracket: {} };
      store.sectionsData[key].teams = teams;
      saveDB(store);
    },
    saveIndicators: (seasonId: string, sectionId: string, indicators: PositionIndicator[]) => {
      const store = getDB();
      const key = `${seasonId}_${sectionId}`;
      if (!store.sectionsData[key]) store.sectionsData[key] = { teams: [], indicators: [], bracket: {} };
      store.sectionsData[key].indicators = indicators;
      saveDB(store);
    },
    saveBracket: (seasonId: string, sectionId: string, bracket: CompetitionBracket) => {
      const store = getDB();
      const key = `${seasonId}_${sectionId}`;
      if (!store.sectionsData[key]) store.sectionsData[key] = { teams: [], indicators: [], bracket: {} };
      store.sectionsData[key].bracket = bracket;
      saveDB(store);
    }
  }
};
