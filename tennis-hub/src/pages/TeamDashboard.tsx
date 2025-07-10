import React, { useState, useEffect } from 'react';
import { Player, Tournament, TournamentMatchesResponse, MatchResponse, PlayerRanking } from '../types/interfaces';

const API_URL = 'http://localhost:8000';

const TeamDashboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [newPlayer, setNewPlayer] = useState<{ name: string; level: number }>({ name: '', level: 1 });
  const [registering, setRegistering] = useState<number | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [tournamentMatches, setTournamentMatches] = useState<{ [tournamentId: number]: TournamentMatchesResponse }>({});
  const [playerRankings, setPlayerRankings] = useState<PlayerRanking[]>([]);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [selectedPlayers, setSelectedPlayers] = useState<{ [tournamentId: number]: number[] }>({});

  useEffect(() => {
    fetchPlayers();
    fetchTournaments();
    fetchPlayerRankings();
    fetchTeamStatus();
  }, []);

  const fetchPlayers = async () => {
    try {
      const teamId = localStorage.getItem('team_id');
      if (!teamId) return;
      const response = await fetch(`${API_URL}/api/teams/${teamId}/players`);
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tournaments`);
      const data = await response.json();
      setTournaments(data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchTournamentMatches = async (tournamentId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/matches`);
      const data = await response.json();
      setTournamentMatches(prev => ({ ...prev, [tournamentId]: data }));
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const teamId = localStorage.getItem('team_id');
      if (!teamId) return;
      const response = await fetch(`${API_URL}/api/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPlayer, team_id: parseInt(teamId) }),
      });
      if (response.ok) {
        setNewPlayer({ name: '', level: 1 });
        fetchPlayers();
      }
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const handlePlayerCheckbox = (tournamentId: number, playerId: number) => {
    setSelectedPlayers(prev => {
      const current = prev[tournamentId] || [];
      if (current.includes(playerId)) {
        return { ...prev, [tournamentId]: current.filter(id => id !== playerId) };
      } else {
        return { ...prev, [tournamentId]: [...current, playerId] };
      }
    });
  };

  const handleRegisterTournament = async (tournamentId: number) => {
    setRegistering(tournamentId);
    setRegisterError(null);
    try {
      const teamId = localStorage.getItem('team_id');
      if (!teamId) throw new Error('Nessun team_id trovato');
      const playerIds = selectedPlayers[tournamentId] || [];
      if (playerIds.length === 0) throw new Error('Seleziona almeno un giocatore da iscrivere');
      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/register-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: parseInt(teamId), player_ids: playerIds }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Errore durante la registrazione');
      }
      fetchTournaments();
    } catch (error: any) {
      setRegisterError(error.message);
    } finally {
      setRegistering(null);
    }
  };

  const fetchPlayerRankings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/players/rankings`);
      const data = await response.json();
      setPlayerRankings(data);
    } catch (error) {
      console.error('Error fetching player rankings:', error);
    }
  };

  const fetchTeamStatus = async () => {
    const teamId = localStorage.getItem('team_id');
    if (!teamId) return;
    try {
      const response = await fetch(`${API_URL}/api/teams`);
      const data = await response.json();
      const team = data.find((t: any) => t.id === parseInt(teamId));
      if (team) setIsBlocked(team.is_blocked);
    } catch (error) {
      console.error('Error fetching team status:', error);
    }
  };

  // Divisione tornei
  const upcomingTournaments = tournaments.filter(t => t.status !== 'completed');
  const pastTournaments = tournaments.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Team Dashboard</h1>
        {/* Add Player Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Player</h2>
          <form onSubmit={handleAddPlayer} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Player Name"
                className="w-full px-3 py-2 border rounded-md"
                value={newPlayer.name}
                onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })}
                required
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Level (1-10)"
                className="w-full px-3 py-2 border rounded-md"
                value={newPlayer.level}
                onChange={e => setNewPlayer({ ...newPlayer, level: parseInt(e.target.value) })}
                min={1}
                max={10}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Player
            </button>
          </form>
        </div>
        {/* Players List */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Players</h2>
          <div className="space-y-4">
            {players.length === 0 && <div className="text-gray-500">Nessun giocatore trovato.</div>}
            {players.map(player => (
              <div key={player.id} className="flex justify-between items-center p-4 border rounded-md">
                <div>
                  <p className="font-medium">{player.name}</p>
                  <p className="text-sm text-gray-600">Level: {player.level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Upcoming Tournaments */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Prossimi Tornei</h2>
          {isBlocked && (
            <div className="text-red-600 mb-2">Il tuo team è bloccato e non può iscriversi a nuovi tornei.</div>
          )}
          <div className="space-y-4">
            {upcomingTournaments.length === 0 && <div className="text-gray-500">Nessun torneo disponibile.</div>}
            {upcomingTournaments.map(tournament => (
              <div key={tournament.id} className="p-4 border rounded-md flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-medium">{tournament.name}</h3>
                  <p className="text-sm text-gray-600">Edition: {tournament.edition}</p>
                  <p className="text-sm text-gray-600">{new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}</p>
                  <div className="mt-2">
                    <span className="font-semibold">Seleziona giocatori da iscrivere:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {players.map(player => (
                        <label key={player.id} className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={selectedPlayers[tournament.id]?.includes(player.id) || false}
                            onChange={() => handlePlayerCheckbox(tournament.id, player.id)}
                            disabled={isBlocked}
                          />
                          <span>{player.name} (Livello: {player.level})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRegisterTournament(tournament.id)}
                  disabled={registering === tournament.id || isBlocked}
                  className="mt-4 md:mt-0 ml-0 md:ml-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {registering === tournament.id ? 'Iscrizione...' : 'Iscriviti'}
                </button>
              </div>
            ))}
            {registerError && <div className="text-red-600 mt-2">{registerError}</div>}
          </div>
        </div>
        {/* Past Tournaments (albero) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Tornei Precedenti</h2>
          <div className="space-y-2">
            {pastTournaments.length === 0 && <div className="text-gray-500">Nessun torneo precedente.</div>}
            {pastTournaments.map(tournament => (
              <details key={tournament.id} className="mb-2">
                <summary>{tournament.name} ({tournament.edition})</summary>
                <div className="ml-4 text-sm text-gray-700">
                  <div>Periodo: {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}</div>
                  <div>Court: {tournament.court_type}</div>
                  <button onClick={() => fetchTournamentMatches(tournament.id)}>Mostra partite</button>
                  {tournamentMatches[tournament.id] && (
                    <div>
                      {Object.entries(tournamentMatches[tournament.id].matches).map(([phase, matches]) => (
                        <div key={phase} className="mb-2">
                          <strong>{phase}</strong>
                          <ul className="ml-4">
                            {matches.map(match => (
                              <li key={match.id}>
                                {match.match_date.slice(0, 10)} | {match.status} | {match.score || '-'} | Winner: {match.winner_id || '-'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
        {/* Classifica generale */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Classifica Generale</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Livello</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Punti</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {playerRankings.map((player) => {
                  const isMyTeam = players.some(p => p.id === player.id);
                  return (
                    <tr key={player.id} className={isMyTeam ? 'bg-yellow-100 font-bold' : ''}>
                      <td className="px-4 py-2">{player.ranking}</td>
                      <td className="px-4 py-2">{player.name}</td>
                      <td className="px-4 py-2">{player.team_name || '-'}</td>
                      <td className="px-4 py-2">{player.level}</td>
                      <td className="px-4 py-2">{player.score}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard; 