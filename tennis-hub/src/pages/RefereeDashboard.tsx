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

const RefereeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    fetchTournaments();
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Referee Dashboard</h1>
        
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
                <p className="text-sm text-gray-600">Court Type: {tournament.court_type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefereeDashboard; 