import React, { useState, useEffect } from 'react';
import { Tournament, Team, TournamentMatchesResponse, MatchResponse, Phase, Player, Referee } from '../types/interfaces';

const API_URL = 'http://localhost:8000';

const AdminDashboard: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTournament, setNewTournament] = useState({
    name: '',
    edition: '',
    start_date: '',
    end_date: '',
    min_level: 1,
    min_referee_level: 1,
    court_type: '',
  });
  const [tournamentMatches, setTournamentMatches] = useState<{ [tournamentId: number]: TournamentMatchesResponse }>({});
  const [phases, setPhases] = useState<{ [tournamentId: number]: Phase[] }>({});
  const [players, setPlayers] = useState<Player[]>([]);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [showAddMatch, setShowAddMatch] = useState<{ [tournamentId: number]: boolean }>({});
  const [newMatch, setNewMatch] = useState<Record<number, any>>({});
  const [tournamentPlayers, setTournamentPlayers] = useState<{ [tournamentId: number]: Player[] }>({});

  useEffect(() => {
    fetchTournaments();
    fetchTeams();
    fetchPlayers();
    fetchReferees();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tournaments`);
      const data = await response.json();
      setTournaments(data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_URL}/api/teams`);
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
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

  const fetchPhases = async (tournamentId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/phases`);
      const data = await response.json();
      setPhases(prev => ({ ...prev, [tournamentId]: data }));
    } catch (error) {
      console.error('Error fetching phases:', error);
    }
  };
  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/players/rankings`);
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };
  const fetchReferees = async () => {
    try {
      const response = await fetch(`${API_URL}/api/referees`);
      const data = await response.json();
      setReferees(data);
    } catch (error) {
      console.error('Error fetching referees:', error);
    }
  };

  const fetchTournamentPlayers = async (tournamentId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/players`);
      const data = await response.json();
      setTournamentPlayers(prev => ({ ...prev, [tournamentId]: data }));
    } catch (error) {
      console.error('Error fetching tournament players:', error);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validazione campi obbligatori
    if (!newTournament.name || !newTournament.edition || !newTournament.start_date || !newTournament.end_date || !newTournament.court_type) {
      alert('Compila tutti i campi obbligatori');
      return;
    }
    try {
      // Converto le date in formato ISO completo
      const startDateISO = new Date(newTournament.start_date).toISOString();
      const endDateISO = new Date(newTournament.end_date).toISOString();
      const tournamentData = {
        ...newTournament,
        start_date: startDateISO,
        end_date: endDateISO,
      };
      const response = await fetch(`${API_URL}/api/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tournamentData),
      });
      if (response.ok) {
        setNewTournament({
          name: '',
          edition: '',
          start_date: '',
          end_date: '',
          min_level: 1,
          min_referee_level: 1,
          court_type: '',
        });
        fetchTournaments();
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  const handleRemoveLastPlayer = async (tournamentId: number, playerId: number) => {
    try {
      await fetch(`${API_URL}/api/tournaments/${tournamentId}/players/${playerId}`, { method: 'DELETE' });
      fetchTournamentPlayers(tournamentId);
    } catch (error) {
      alert('Errore durante la rimozione del giocatore');
    }
  };

  const handleBlockTeam = async (teamId: number) => {
    try {
      await fetch(`${API_URL}/api/teams/${teamId}/block`, { method: 'POST' });
      fetchTeams();
    } catch (error) {
      alert('Errore durante il blocco del team');
    }
  };

  const handleUnblockTeam = async (teamId: number) => {
    try {
      await fetch(`${API_URL}/api/teams/${teamId}/unblock`, { method: 'POST' });
      fetchTeams();
    } catch (error) {
      alert('Errore durante lo sblocco del team');
    }
  };

  const handleDeleteReferee = async (refereeId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo arbitro?')) return;
    try {
      await fetch(`${API_URL}/api/referees/${refereeId}`, { method: 'DELETE' });
      fetchReferees();
    } catch (error) {
      alert('Errore durante l\'eliminazione dell\'arbitro');
    }
  };

  const [editingScore, setEditingScore] = useState<{ [refereeId: number]: number }>({});

  const handleScoreChange = (refereeId: number, value: number) => {
    setEditingScore(prev => ({ ...prev, [refereeId]: value }));
  };

  const handleSaveScore = async (refereeId: number) => {
    try {
      await fetch(`${API_URL}/api/referees/${refereeId}/score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: editingScore[refereeId] })
      });
      fetchReferees();
    } catch (error) {
      alert('Errore durante la modifica del punteggio');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        {/* Create Tournament Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Create Tournament</h2>
          <form onSubmit={handleCreateTournament} className="space-y-4">
            <input type="text" placeholder="Name" className="w-full px-3 py-2 border rounded-md" value={newTournament.name} onChange={e => setNewTournament({ ...newTournament, name: e.target.value })} required />
            <input type="text" placeholder="Edition" className="w-full px-3 py-2 border rounded-md" value={newTournament.edition} onChange={e => setNewTournament({ ...newTournament, edition: e.target.value })} required />
            <input type="date" placeholder="Start Date" className="w-full px-3 py-2 border rounded-md" value={newTournament.start_date} onChange={e => setNewTournament({ ...newTournament, start_date: e.target.value })} required />
            <input type="date" placeholder="End Date" className="w-full px-3 py-2 border rounded-md" value={newTournament.end_date} onChange={e => setNewTournament({ ...newTournament, end_date: e.target.value })} required />
            <input type="number" placeholder="Min Level" className="w-full px-3 py-2 border rounded-md" value={newTournament.min_level} onChange={e => setNewTournament({ ...newTournament, min_level: parseInt(e.target.value) })} min={1} max={10} required />
            <input type="number" placeholder="Min Referee Level" className="w-full px-3 py-2 border rounded-md" value={newTournament.min_referee_level} onChange={e => setNewTournament({ ...newTournament, min_referee_level: parseInt(e.target.value) })} min={1} max={10} required />
            <input type="text" placeholder="Court Type" className="w-full px-3 py-2 border rounded-md" value={newTournament.court_type} onChange={e => setNewTournament({ ...newTournament, court_type: e.target.value })} required />
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create</button>
          </form>
        </div>
        {/* Tournaments List */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Tournaments</h2>
          <div className="space-y-4">
            {tournaments.map(tournament => {
              const playersForTournament = tournamentPlayers[tournament.id] || [];
              return (
                <div key={tournament.id} className="p-4 border rounded-md">
                  <h3 className="font-medium">{tournament.name}</h3>
                  <p className="text-sm text-gray-600">Edition: {tournament.edition}</p>
                  <p className="text-sm text-gray-600">{new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}</p>
                  <button onClick={() => fetchTournamentMatches(tournament.id)} className="mt-2 px-2 py-1 bg-blue-500 text-white rounded">Mostra partite</button>
                  <button onClick={() => fetchTournamentPlayers(tournament.id)} className="ml-2 px-2 py-1 bg-gray-400 text-white rounded">Aggiorna iscritti</button>
                  {tournament.status !== 'completed' && playersForTournament.length === 16 && (
                    <button onClick={() => { fetchPhases(tournament.id); setShowAddMatch((prev: { [tournamentId: number]: boolean }) => ({ ...prev, [tournament.id]: !prev[tournament.id] })); }} className="ml-2 px-2 py-1 bg-green-600 text-white rounded">Aggiungi partita</button>
                  )}
                  {tournament.status !== 'completed' && playersForTournament.length !== 16 && (
                    <span className="ml-2 text-red-600">Iscritti: {playersForTournament.length}/16 (devi raggiungere 16 per aggiungere partite)</span>
                  )}
                  {playersForTournament.length > 16 && (
                    <div className="mt-2 text-red-600">
                      Troppi iscritti! Ultimo iscritto: {playersForTournament[playersForTournament.length - 1]?.name}
                      <button onClick={() => handleRemoveLastPlayer(tournament.id, playersForTournament[playersForTournament.length - 1]?.id)} className="ml-2 px-2 py-1 bg-red-600 text-white rounded">Rimuovi ultimo</button>
                    </div>
                  )}
                  {showAddMatch[tournament.id] && phases[tournament.id] && (
                    <form className="mt-4 space-y-2 bg-gray-50 p-4 rounded" onSubmit={async e => {
                      e.preventDefault();
                      const matchData = { ...newMatch[tournament.id], match_date: newMatch[tournament.id]?.match_date || new Date().toISOString(), status: 'completed' };
                      const res = await fetch(`${API_URL}/api/tournaments/${tournament.id}/matches`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(matchData),
                      });
                      if (res.ok) {
                        setShowAddMatch((prev: { [tournamentId: number]: boolean }) => ({ ...prev, [tournament.id]: false }));
                        setNewMatch((prev: Record<number, any>) => ({ ...prev, [tournament.id]: {} }));
                        fetchTournamentMatches(tournament.id);
                      } else {
                        alert('Errore durante la creazione della partita');
                      }
                    }}>
                      <select required className="w-full border rounded" value={newMatch[tournament.id]?.phase_id || ''} onChange={e => setNewMatch((prev: Record<number, any>) => ({ ...prev, [tournament.id]: { ...prev[tournament.id], phase_id: parseInt(e.target.value) } }))}>
                        <option value="">Seleziona fase</option>
                        {phases[tournament.id].map(phase => <option key={phase.id} value={phase.id}>{phase.name}</option>)}
                      </select>
                      <select required className="w-full border rounded" value={newMatch[tournament.id]?.player1_id || ''} onChange={e => setNewMatch((prev: Record<number, any>) => ({ ...prev, [tournament.id]: { ...prev[tournament.id], player1_id: parseInt(e.target.value) } }))}>
                        <option value="">Seleziona giocatore 1</option>
                        {playersForTournament.map(player => <option key={player.id} value={player.id}>{player.name}</option>)}
                      </select>
                      <select required className="w-full border rounded" value={newMatch[tournament.id]?.player2_id || ''} onChange={e => setNewMatch((prev: Record<number, any>) => ({ ...prev, [tournament.id]: { ...prev[tournament.id], player2_id: parseInt(e.target.value) } }))}>
                        <option value="">Seleziona giocatore 2</option>
                        {playersForTournament.map(player => <option key={player.id} value={player.id}>{player.name}</option>)}
                      </select>
                      <select required className="w-full border rounded" value={newMatch[tournament.id]?.referee_id || ''} onChange={e => setNewMatch((prev: Record<number, any>) => ({ ...prev, [tournament.id]: { ...prev[tournament.id], referee_id: parseInt(e.target.value) } }))}>
                        <option value="">Seleziona arbitro</option>
                        {referees.map(ref => <option key={ref.id} value={ref.id}>{ref.name} {ref.last_name}</option>)}
                      </select>
                      <input type="date" className="w-full border rounded" value={newMatch[tournament.id]?.match_date?.slice(0,10) || ''} onChange={e => setNewMatch((prev: Record<number, any>) => ({ ...prev, [tournament.id]: { ...prev[tournament.id], match_date: e.target.value } }))} required />
                      <input type="number" className="w-full border rounded" placeholder="Campo" value={newMatch[tournament.id]?.court_number || ''} onChange={e => setNewMatch((prev: Record<number, any>) => ({ ...prev, [tournament.id]: { ...prev[tournament.id], court_number: parseInt(e.target.value) } }))} required />
                      <input type="text" className="w-full border rounded" placeholder="Risultato (es: 6-4, 6-3)" value={newMatch[tournament.id]?.score || ''} onChange={e => setNewMatch((prev: Record<number, any>) => ({ ...prev, [tournament.id]: { ...prev[tournament.id], score: e.target.value } }))} required />
                      <select required className="w-full border rounded" value={newMatch[tournament.id]?.winner_id || ''} onChange={e => setNewMatch((prev: Record<number, any>) => ({ ...prev, [tournament.id]: { ...prev[tournament.id], winner_id: parseInt(e.target.value) } }))}>
                        <option value="">Seleziona vincitore</option>
                        {[newMatch[tournament.id]?.player1_id, newMatch[tournament.id]?.player2_id].filter(Boolean).map(pid => {
                          const player = playersForTournament.find(p => p.id === pid);
                          return player ? <option key={player.id} value={player.id}>{player.name}</option> : null;
                        })}
                      </select>
                      <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded">Crea partita</button>
                    </form>
                  )}
                  {tournamentMatches[tournament.id] && (
                    <div className="mt-2">
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
              );
            })}
          </div>
        </div>
        {/* Teams List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Teams</h2>
          <div className="space-y-4">
            {teams.map(team => (
              <div key={team.id} className="p-4 border rounded-md flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{team.name}</h3>
                  <p className="text-sm text-gray-600">{team.email}</p>
                  <p className="text-sm text-gray-600">{team.isBlocked ? 'Bloccato' : 'Attivo'}</p>
                </div>
                <div>
                  {team.isBlocked ? (
                    <button onClick={() => handleUnblockTeam(team.id)} className="px-2 py-1 bg-green-600 text-white rounded">Sblocca</button>
                  ) : (
                    <button onClick={() => handleBlockTeam(team.id)} className="px-2 py-1 bg-red-600 text-white rounded">Blocca</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Referees List */}
        <div className="bg-white p-6 rounded-lg shadow mt-8">
          <h2 className="text-xl font-semibold mb-4">Arbitri</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cognome</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Livello</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Punti</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Codice Fiscale</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referees.map((ref) => (
                  <tr key={ref.id}>
                    <td className="px-4 py-2">{ref.name}</td>
                    <td className="px-4 py-2">{ref.last_name}</td>
                    <td className="px-4 py-2">{ref.level}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20"
                        value={editingScore[ref.id] !== undefined ? editingScore[ref.id] : ref.score}
                        onChange={e => handleScoreChange(ref.id, parseInt(e.target.value))}
                      />
                      <button onClick={() => handleSaveScore(ref.id)} className="ml-2 px-2 py-1 bg-blue-600 text-white rounded">Salva</button>
                    </td>
                    <td className="px-4 py-2">{ref.fiscal_code}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => handleDeleteReferee(ref.id)} className="px-2 py-1 bg-red-600 text-white rounded">Elimina</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 