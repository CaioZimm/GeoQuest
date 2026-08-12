import { fetchDailyChallenge, submitGuess, fetchCountries, fetchTodayProgress } from "@/services/gameService";
import type { DailyChallenge } from "@/models/DailyChallenge";
import { useState, useEffect, useRef } from "react";
import type { Country } from "@/models/Country";
import { useSession } from "next-auth/react";

export function useGameState() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [clues, setClues] = useState<string[]>([]);
  const [guess, setGuess] = useState("");
  const [guessing, setGuessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [country, setCountry] = useState<Country | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cluesUsedCount, setCluesUsedCount] = useState<number>(1);

  const [allCountries, setAllCountries] = useState<string[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [playedToday, setPlayedToday] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (status === "loading") return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = session ? (session as unknown as { token: string }).token : null;

        let hasPlayed = false;
        let savedResult: { state: "won" | "lost", country: Country, cluesUsed: number, clues: string[] } | null = null;

        try {
          const localData = localStorage.getItem("geoquest_last_played_result");
          if (localData) {
            const parsed = JSON.parse(localData);
            const todayStr = new Date().toISOString().split("T")[0];
            if (parsed.date === todayStr) {
              savedResult = parsed;
              if (!token) hasPlayed = true;
            }
          }
        } catch (e) { }

        if (token) {
          const progress = await fetchTodayProgress(token);
          hasPlayed = progress.played_today;
          if (hasPlayed && progress.country) {
            savedResult = {
              state: progress.won ? "won" : "lost",
              country: progress.country,
              cluesUsed: progress.clues_used,
              clues: progress.all_clues
            };
          }
        } else if (!hasPlayed) {
          const localDate = localStorage.getItem("geoquest_last_played");
          const todayStr = new Date().toISOString().split("T")[0];
          if (localDate === todayStr) hasPlayed = true;
        }

        setPlayedToday(hasPlayed);

        if (hasPlayed && savedResult) {
          setGameState(savedResult.state);
          setCountry(savedResult.country);
          setCluesUsedCount(savedResult.cluesUsed);
          if (savedResult.clues) setClues(savedResult.clues);
          if (!hasInitialized.current) setIsModalOpen(true);
        } else if (hasPlayed && !savedResult) {
          setGameState("won");
          if (!hasInitialized.current) setIsModalOpen(true);
        }

        const [data, countriesList] = await Promise.all([
          fetchDailyChallenge(null),
          fetchCountries()
        ]);

        setChallenge(data);
        setAllCountries(countriesList);

        if (!hasPlayed || !savedResult?.clues) {
          setClues([data.first_clue]);
        }

        setLoading(false);
        hasInitialized.current = true;
      } catch (err) {
        console.error(err);
        setErrorMsg("Erro ao carregar o desafio.");
        setLoading(false);
      }
    };
    fetchData();
  }, [session, status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuess(val);
    setErrorMsg("");
    if (val.trim().length > 0) {
      const normalizedVal = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const filtered = allCountries.filter(c =>
        c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedVal)
      );
      setFilteredCountries(filtered);
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

  const handleSelectCountry = (selected: string) => {
    setGuess(selected);
    setShowAutocomplete(false);
  };

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || guessing || gameState !== "playing" || !challenge) return;

    const normalizedGuess = guess.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const isValidCountry = allCountries.some(c =>
      c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalizedGuess
    );

    if (!isValidCountry) {
      setErrorMsg("Por favor, selecione um país válido da lista.");
      return;
    }

    setGuessing(true);
    setErrorMsg("");

    try {
      const token = session ? (session as any).token : null;
      const data = await submitGuess(guess.trim(), clues.length, null, token);

      const markPlayed = (finalState: "won" | "lost", finalCountry: Country, finalCluesUsed: number, finalClues: string[]) => {
        const todayStr = new Date().toISOString().split("T")[0];
        const resultData = {
          date: todayStr,
          state: finalState,
          country: finalCountry,
          cluesUsed: finalCluesUsed,
          clues: finalClues
        };
        localStorage.setItem("geoquest_last_played_result", JSON.stringify(resultData));
        if (!token) {
          localStorage.setItem("geoquest_last_played", todayStr);
        }
        setPlayedToday(true);
      };

      if (data.correct) {
        setGameState("won");
        setCountry(data.country);
        setCluesUsedCount(clues.length);
        setIsModalOpen(true);
        if (data.all_clues) setClues(data.all_clues);
        markPlayed("won", data.country, clues.length, data.all_clues || clues);
      } else {
        if (data.next_clue) {
          setClues([...clues, data.next_clue]);
          setCluesUsedCount(clues.length + 1);
          setErrorMsg(data.message);
        } else {
          setGameState("lost");
          setCountry(data.country);
          setCluesUsedCount(clues.length);
          setIsModalOpen(true);
          if (data.all_clues) setClues(data.all_clues);
          markPlayed("lost", data.country, clues.length, data.all_clues || clues);
        }
      }
      setGuess("");
    } catch (err) {
      console.error(err);
      setErrorMsg("Erro ao enviar resposta.");
    } finally {
      setGuessing(false);
    }
  };

  return {
    loading: loading || status === "loading",
    challenge,
    clues,
    cluesUsedCount,
    guess,
    guessing,
    errorMsg,
    gameState,
    country,
    isModalOpen,
    setIsModalOpen,
    filteredCountries,
    showAutocomplete,
    setShowAutocomplete,
    playedToday,
    handleInputChange,
    handleSelectCountry,
    handleGuess
  };
}