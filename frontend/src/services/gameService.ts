import { API_URL } from "../utils/ApiConfig";

export const fetchDailyChallenge = async (gameSeed: string | null) => {
  const url = gameSeed ? `${API_URL}/api/daily-challenge?seed=${gameSeed}` : `${API_URL}/api/daily-challenge`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Erro ao buscar desafio");
  }
  return res.json();
};

export const submitGuess = async (guess: string, currentClueIndex: number, gameSeed: string | null, token: string | null = null) => {
  const headers: any = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api/daily-challenge/guess`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      guess: guess,
      current_clue_index: currentClueIndex,
      seed: gameSeed
    })
  });
  if (!res.ok) {
    throw new Error("Erro ao enviar palpite");
  }
  return res.json();
};

export const fetchCountries = async (): Promise<string[]> => {
  const res = await fetch(`${API_URL}/api/countries`);
  if (!res.ok) {
    throw new Error("Erro ao buscar países");
  }
  return res.json();
};

export const fetchTodayProgress = async (token: string | null = null) => {
  const headers: any = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}/api/progress/today`, { headers });
  if (!res.ok) {
    return { played_today: false };
  }
  return res.json();
};