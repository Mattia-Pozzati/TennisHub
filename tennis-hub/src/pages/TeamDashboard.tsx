import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

interface Tournament {
  id: number;
  name: string;
  edition: string;
  start_date: string;
  end_date: string;
}

interface Player {
  id: number;
  name: string;
  level: number;
}

const TeamDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState({ name: '', level: 1 });

  useEffect(() => {
    fetchTournaments();
    fetchPlayers();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tournaments`);
      if (response.ok) {
        const data = await response.json();
        setTournaments(data);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/teams/1/players`); // Using team_id 1 for simplicity
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer)
      });

      if (response.ok) {
        setNewPlayer({ name: '', level: 1 });
        fetchPlayers();
      }
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

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
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                required
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Level (1-10)"
                className="w-full px-3 py-2 border rounded-md"
                value={newPlayer.level}
                onChange={(e) => setNewPlayer({ ...newPlayer, level: parseInt(e.target.value) })}
                min="1"
                max="10"
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

        {/* Tournaments List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Available Tournaments</h2>
          <div className="space-y-4">
            {tournaments.map(tournament => (
              <div key={tournament.id} className="p-4 border rounded-md">
                <h3 className="font-medium">{tournament.name}</h3>
                <p className="text-sm text-gray-600">Edition: {tournament.edition}</p>
                <p className="text-sm text-gray-600">
                  {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard; 