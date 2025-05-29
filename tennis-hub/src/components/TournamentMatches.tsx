import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { Match } from '../types';

interface TournamentMatchesProps {
  tournamentId: number;
  matches: Match[];
  onMatchUpdate: () => void;
}

const TournamentMatches: React.FC<TournamentMatchesProps> = ({ tournamentId, matches, onMatchUpdate }) => {
  const { updateMatch, loading, error } = useApi();
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [score, setScore] = useState('');
  const [winner, setWinner] = useState('');

  const handleUpdateMatch = async (matchId: number) => {
    if (!score || !winner) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await updateMatch(matchId, { score, winner });
      setEditingMatch(null);
      setScore('');
      setWinner('');
      onMatchUpdate();
    } catch (err) {
      alert('Failed to update match');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winner</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {matches.map((match) => (
            <tr key={match.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{match.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{match.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{match.score || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{match.winner || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {editingMatch?.id === match.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="Score"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={winner}
                      onChange={(e) => setWinner(e.target.value)}
                      placeholder="Winner"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateMatch(match.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingMatch(null)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingMatch(match)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Update
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TournamentMatches; 