import React, { createContext, useContext, useState, useEffect } from 'react';
import { Team, Player, Referee, Tournament, Match } from '../types/interfaces';

interface ApiContextType {
  // State
  players: Player[];
  teams: Team[];
  referees: Referee[];
  tournaments: Tournament[];
  loading: boolean;
  error: string | null;

  // Team functions
  registerTeam: (data: { name: string; email: string; password: string }) => Promise<void>;
  blockTeam: (teamId: number) => Promise<void>;
  unblockTeam: (teamId: number) => Promise<void>;
  fetchTeams: () => Promise<void>;

  // Player functions
  registerPlayer: (data: { name: string; level: number }) => Promise<void>;
  fetchPlayers: (withRanking?: boolean) => Promise<void>;

  // Referee functions
  registerReferee: (data: { name: string; last_name: string; email: string; password: string; fiscal_code: string; level: number }) => Promise<void>;
  fetchReferees: () => Promise<void>;
  setRefereeAvailability: (tournamentId: number) => Promise<void>;

  // Tournament functions
  createTournament: (data: { name: string; edition: string; start_date: string; end_date: string; min_level: number; min_referee_level: number; court_type: string }) => Promise<void>;
  fetchTournaments: () => Promise<void>;
  registerForTournament: (tournamentId: number, playerId: number) => Promise<void>;
  assignRefereeToTournament: (tournamentId: number, refereeId: number) => Promise<void>;
  updateMatch: (matchId: number, data: { score: string; winner: string }) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async (withRanking = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/players${withRanking ? '?with_ranking=true' : ''}`);
      if (!response.ok) throw new Error('Failed to fetch players');
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/referees');
      if (!response.ok) throw new Error('Failed to fetch referees');
      const data = await response.json();
      setReferees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tournaments');
      if (!response.ok) throw new Error('Failed to fetch tournaments');
      const data = await response.json();
      setTournaments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const value: ApiContextType = {
    // State
    players,
    teams,
    referees,
    tournaments,
    loading,
    error,

    // Team functions
    registerTeam: async (data) => {
      try {
        setLoading(true);
        const response = await fetch('/api/teams/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to register team');
        await fetchTeams();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },

    blockTeam: async (teamId) => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teams/${teamId}/block`, {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to block team');
        await fetchTeams();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },

    unblockTeam: async (teamId) => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teams/${teamId}/unblock`, {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to unblock team');
        await fetchTeams();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },

    fetchTeams,

    // Player functions
    registerPlayer: async (data) => {
      try {
        setLoading(true);
        const response = await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to register player');
        await fetchPlayers();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },

    fetchPlayers,

    // Referee functions
    registerReferee: async (data) => {
      try {
        setLoading(true);
        const response = await fetch('/api/referees/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to register referee');
        await fetchReferees();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },

    fetchReferees,

    setRefereeAvailability: async (tournamentId) => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tournaments/${tournamentId}/referee-availability`, {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to set referee availability');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },

    // Tournament functions
    createTournament: async (data) => {
      try {
        setLoading(true);
        const response = await fetch('/api/tournaments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create tournament');
        await fetchTournaments();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },

    fetchTournaments,

    registerForTournament: async (tournamentId, playerId) => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player_id: playerId }),
        });
        if (!response.ok) throw new Error('Failed to register for tournament');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },

    assignRefereeToTournament: async (tournamentId, refereeId) => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tournaments/${tournamentId}/referees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referee_id: refereeId }),
        });
        if (!response.ok) throw new Error('Failed to assign referee to tournament');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },

    updateMatch: async (matchId, data) => {
      try {
        setLoading(true);
        const response = await fetch(`/api/matches/${matchId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update match');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}; 