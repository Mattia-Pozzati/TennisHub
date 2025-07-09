import axios from 'axios';
import { Player, Tournament } from '../types/interfaces';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Players API calls
export const getPlayers = async (ranking: boolean = false): Promise<Player[]> => {
  const response = await api.get(`/giocatori/?ranking=${ranking}`);
  return response.data;
};

export const createPlayer = async (playerData: Player): Promise<Player> => {
  const response = await api.post('/giocatori/', playerData);
  return response.data;
};

export const updatePlayerPoints = async (playerId: number, points: number): Promise<void> => {
  await api.put(`/giocatori/${playerId}/punti/`, { punti: points });
};

// Tournament API calls
export const createTournament = async (tournamentData: any): Promise<{ message: string; torneo_id: number }> => {
  const response = await api.post('/tornei/', tournamentData);
  return response.data;
};

// Match API calls
export const updateMatchResult = async (matchId: number, score: string, winner: string): Promise<void> => {
  await api.put(`/partite/${matchId}/risultato/`, {
    punteggio: score,
    vincitore: winner,
  });
};

export default api; 