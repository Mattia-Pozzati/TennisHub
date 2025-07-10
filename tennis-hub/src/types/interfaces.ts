export type UserType = 'team' | 'referee' | 'admin';

export interface Player {
  id: number;
  name: string;
  level: number;
  score?: number;
  teamId?: number;
  ranking?: number;
}

export interface Team {
  id: number;
  name: string;
  email: string;
  is_blocked: boolean;
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
  min_level?: number;
  min_referee_level?: number;
  status?: 'upcoming' | 'active' | 'completed';
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

export interface FormData {
  name?: string;
  email: string;
  password: string;
  userType?: 'team' | 'referee' | 'admin';
}

export interface NewPlayer {
  name: string;
  level: number;
}

export interface MatchResponse {
  id: number;
  tournament_id: number;
  player1_id: number;
  player2_id: number;
  referee_id: number;
  phase_id: number;
  phase_name: string;
  winner_id?: number;
  match_date: string;
  court_number: number;
  score?: string;
  status: string;
}

export interface TournamentMatchesResponse {
  tournament_id: number;
  tournament_name: string;
  matches: {
    [phase: string]: MatchResponse[];
  };
}

export interface PlayerRanking {
  id: number;
  name: string;
  level: number;
  score: number;
  team_id: number;
  team_name?: string;
  ranking: number;
}

export interface Phase {
  id: number;
  tournament_id: number;
  name: string;
  start_date: string;
  end_date: string;
} 