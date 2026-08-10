import { useState, useEffect } from "react";
import { fetchDailyChallenge, submitGuess, fetchCountries } from "@/services/gameService";
import type { DailyChallenge } from "@/models/DailyChallenge";
import type { Country } from "@/models/Country";

export function useGameState() {
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
  const [gameSeed, setGameSeed] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [data, countriesList] = await Promise.all([
          fetchDailyChallenge(gameSeed),
          fetchCountries()
        ]);

        setChallenge(data);
        setAllCountries(countriesList);
        setClues([data.first_clue]);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setErrorMsg("Erro ao carregar o desafio.");
        setLoading(false);
      }
    };
    fetchData();
  }, [gameSeed]);

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
      const data = await submitGuess(guess.trim(), clues.length, gameSeed);

      if (data.correct) {
        setGameState("won");
        setCountry(data.country);
        setCluesUsedCount(clues.length);
        setIsModalOpen(true);
        if (data.all_clues) setClues(data.all_clues);
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

  const resetGame = () => {
    setGameSeed(Math.random().toString(36).substring(7));
    setLoading(true);
    setGameState("playing");
    setIsModalOpen(false);
    setCluesUsedCount(1);
    setGuess("");
    setErrorMsg("");
    setCountry(null);
    setChallenge(null);
    setClues([]);
  };

  return {
    loading,
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
    handleInputChange,
    handleSelectCountry,
    handleGuess,
    resetGame
  };
}