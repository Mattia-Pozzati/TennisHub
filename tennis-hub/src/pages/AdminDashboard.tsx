import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

interface Tournament {
  id: number;
  name: string;
  edition: string;
  start_date: string;
  end_date: string;
  court_type: string;
}

interface Team {
  id: number;
  name: string;
  email: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTournament, setNewTournament] = useState({
    name: '',
    edition: '',
    start_date: '',
    end_date: '',
    min_level: 1,
    court_type: 'clay'
  });

  useEffect(() => {
    fetchTournaments();
    fetchTeams();
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

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_URL}/api/teams`);
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTournament)
      });

      if (response.ok) {
        setNewTournament({
          name: '',
          edition: '',
          start_date: '',
          end_date: '',
          min_level: 1,
          court_type: 'clay'
        });
        fetchTournaments();
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Create Tournament Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Tournament</h2>
          <form onSubmit={handleCreateTournament} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Tournament Name"
                className="w-full px-3 py-2 border rounded-md"
                value={newTournament.name}
                onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Edition"
                className="w-full px-3 py-2 border rounded-md"
                value={newTournament.edition}
                onChange={(e) => setNewTournament({ ...newTournament, edition: e.target.value })}
                required
              />
            </div>
            <div>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md"
                value={newTournament.start_date}
                onChange={(e) => setNewTournament({ ...newTournament, start_date: e.target.value })}
                required
              />
            </div>
            <div>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md"
                value={newTournament.end_date}
                onChange={(e) => setNewTournament({ ...newTournament, end_date: e.target.value })}
                required
              />
            </div>
            <div>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={newTournament.court_type}
                onChange={(e) => setNewTournament({ ...newTournament, court_type: e.target.value })}
                required
              >
                <option value="clay">Clay</option>
                <option value="hard">Hard</option>
                <option value="grass">Grass</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Tournament
            </button>
          </form>
        </div>

        {/* Tournaments List */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Tournaments</h2>
          <div className="space-y-4">
            {tournaments.map(tournament => (
              <div key={tournament.id} className="p-4 border rounded-md">
                <h3 className="font-medium">{tournament.name}</h3>
                <p className="text-sm text-gray-600">Edition: {tournament.edition}</p>
                <p className="text-sm text-gray-600">
                  {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">Court Type: {tournament.court_type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Teams List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Teams</h2>
          <div className="space-y-4">
            {teams.map(team => (
              <div key={team.id} className="p-4 border rounded-md">
                <h3 className="font-medium">{team.name}</h3>
                <p className="text-sm text-gray-600">{team.email}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 