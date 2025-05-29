export interface Team {
  id: number;
  name: string;
  email: string;
  isBlocked: boolean;
}

export interface Player {
  id: number;
  name: string;
  level: number;
  score: number;
  teamId: number;
  ranking?: number;
}

export interface Referee {
  id: number;
  name: string;
  last_name: string;
  level: number;
  score: number;
  fiscal_code: string;
}

export interface Tournament {
  id: number;
  name: string;
  edition: string;
  start_date: string;
  end_date: string;
  min_level: number;
  min_referee_level: number;
  status: 'upcoming' | 'active' | 'completed';
  court_type: string;
}

export interface Match {
  id: number;
  tournament_id: number;
  player1_id: number;
  player2_id: number;
  referee_id: number;
  score?: string;
  winner?: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  date: string;
}

export interface TournamentRegistration {
  id: number;
  tournament_id: number;
  player_id: number;
  registration_date: string;
}

export interface RefereeAvailability {
  id: number;
  tournament_id: number;
  referee_id: number;
  is_available: boolean;
}

export interface ApiContextType {
  api: {
    getTournaments: () => Promise<Tournament[]>;
    getTeams: () => Promise<Team[]>;
    getReferees: () => Promise<Referee[]>;
    getTeamPlayer: () => Promise<Player>;
    getRefereeInfo: () => Promise<Referee>;
    createTournament: (data: Partial<Tournament>) => Promise<Tournament>;
    registerPlayer: (data: Partial<Player>) => Promise<Player>;
    registerForTournament: (tournamentId: number, playerId: number) => Promise<void>;
    setRefereeAvailability: (tournamentId: number) => Promise<void>;
    blockTeam: (teamId: number) => Promise<void>;
    unblockTeam: (teamId: number) => Promise<void>;
    assignRefereeToTournament: (tournamentId: number, refereeId: number) => Promise<void>;
  };
} 