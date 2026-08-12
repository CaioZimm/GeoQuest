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
  const headers: Record<string, string> = { "Content-Type": "application/json" };
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
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}/api/progress/today`, { headers });
  if (!res.ok) {
    return { played_today: false };
  }
  return res.json();
};

export const fetchUserStats = async (token: string) => {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api/progress/stats`, {
    headers: headers
  });
  
  if (!res.ok) {
    throw new Error("Erro ao buscar estatísticas");
  }
  return res.json();
};

export const updateProfile = async (name: string, password?: string, token?: string) => {
  if (!token) throw new Error("Não autorizado");
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };

  const body: Record<string, string> = { name };
  if (password) {
    body.password = password;
  }

  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Erro ao atualizar perfil");
  }

  return res.json();
};