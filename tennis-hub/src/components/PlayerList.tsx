import React, { useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { Player } from '../types/interfaces';

const PlayerList: React.FC = () => {
  const { players, loading, error, fetchPlayers } = useApi();

  useEffect(() => {
    fetchPlayers(true); // Fetch players with ranking
  }, [fetchPlayers]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ranking</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {players.map((player) => (
            <tr key={player.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.ranking}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.level}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerList; 