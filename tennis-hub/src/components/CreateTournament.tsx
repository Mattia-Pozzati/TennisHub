import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { Tournament, Player } from '../types/interfaces';

const CreateTournament: React.FC = () => {
  const { tournaments, loading, error, createTournament, fetchPlayers } = useApi();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [formData, setFormData] = useState<Partial<Tournament>>({
    name: '',
    edition: '',
    start_date: '',
    end_date: '',
    min_level: 1,
    min_referee_level: 1,
    court_type: '',
    status: 'upcoming'
  });

  useEffect(() => {
    fetchPlayers(true);
  }, [fetchPlayers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.edition || !formData.start_date || !formData.end_date || !formData.court_type) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      await createTournament(formData as Required<Tournament>);
      alert('Tournament created successfully!');
      setFormData({
        name: '',
        edition: '',
        start_date: '',
        end_date: '',
        min_level: 1,
        min_referee_level: 1,
        court_type: '',
        status: 'upcoming'
      });
      setSelectedPlayers([]);
    } catch (err) {
      alert('Failed to create tournament');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'min_level' || name === 'min_referee_level' ? parseInt(value) : value
    }));
  };

  const handlePlayerSelect = (playerId: number) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      return [...prev, playerId];
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create New Tournament</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tournament Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Edition</label>
          <input
            type="text"
            name="edition"
            value={formData.edition}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Minimum Player Level</label>
          <input
            type="number"
            name="min_level"
            value={formData.min_level}
            onChange={handleChange}
            min="1"
            max="10"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Minimum Referee Level</label>
          <input
            type="number"
            name="min_referee_level"
            value={formData.min_referee_level}
            onChange={handleChange}
            min="1"
            max="10"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Court Type</label>
          <select
            name="court_type"
            value={formData.court_type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select a court type</option>
            <option value="hard">Hard Court</option>
            <option value="clay">Clay Court</option>
            <option value="grass">Grass Court</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Select Players</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {players.map((player) => (
              <div key={player.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`player-${player.id}`}
                  checked={selectedPlayers.includes(player.id)}
                  onChange={() => handlePlayerSelect(player.id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={`player-${player.id}`} className="ml-2 block text-sm text-gray-900">
                  {player.name} (Level {player.level})
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Tournament
        </button>
      </form>
    </div>
  );
};

export default CreateTournament; 