"use client";

import { StatisticsModal } from "../modals/StatisticsModal";
import { AutocompleteInput } from "./AutocompleteInput";
import { useSession, signOut } from "next-auth/react";
import { ProfileModal } from "../modals/ProfileModal";
import { RankingModal } from "../modals/RankingModal";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, Trophy } from "lucide-react";
import { useGameState } from "@/hooks/useGameState";
import { AdExtraHint } from "../modals/AdExtraHint";
import { AuthModal } from "../modals/AuthModal";
import { GameResult } from "./GameResult";
import { ClueList } from "./ClueList";
import { clsx } from "clsx";

export default function Game() {
  const {
    loading,
    gameMode,
    startInfiniteMode,
    startDailyMode,
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
    extraHint,
    isWatchingAd,
    setShowAutocomplete,
    handleInputChange,
    handleSelectCountry,
    handleGuess,
    requestExtraHint
  } = useGameState();

  const { data: session } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto flex justify-center p-10">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  const totalClues = challenge?.total_clues || 6;

  return (
    <div className="w-full max-w-[500px] flex flex-col mx-auto px-4">
      <header className="flex items-center justify-between py-3 border-b border-emerald-900/40 mb-6 relative">
        <div className="w-12 flex justify-start relative" ref={dropdownRef}>
          <button
            onClick={() => session ? setIsDropdownOpen(!isDropdownOpen) : setIsAuthModalOpen(true)}
            className="text-emerald-500 hover:text-emerald-300 transition-colors cursor-pointer bg-emerald-950/50 p-2 rounded-xl border border-emerald-900/50 shadow-sm"
            title={session ? "Menu do Usuário" : "Entrar"}
          >
            <User className="w-6 h-6" />
          </button>

          {isDropdownOpen && session && (
            <div className="absolute top-12 left-0 bg-[#0a2013] border border-emerald-900/60 rounded-xl shadow-2xl py-2 w-48 z-40 flex flex-col overflow-hidden">
              <button
                onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }}
                className="text-left px-4 py-3 text-emerald-100 hover:bg-emerald-900/40 hover:text-white transition-colors cursor-pointer text-sm font-bold border-b border-emerald-900/40"
              >
                Meu Perfil
              </button>
              <button
                onClick={() => { setIsStatsModalOpen(true); setIsDropdownOpen(false); }}
                className="text-left px-4 py-3 text-emerald-100 hover:bg-emerald-900/40 hover:text-white transition-colors cursor-pointer text-sm font-bold border-b border-emerald-900/40"
              >
                Estatísticas
              </button>
              <button
                onClick={() => {
                  gameMode === "daily" ? startInfiniteMode() : startDailyMode();
                  setIsDropdownOpen(false);
                }}
                className="text-left px-4 py-3 text-amber-400 hover:bg-amber-900/20 hover:text-amber-300 transition-colors cursor-pointer text-sm font-bold border-b border-emerald-900/40"
              >
                {gameMode === "daily" ? "Modo Infinito" : "Desafio Diário"}
              </button>
              <button
                onClick={() => { signOut(); setIsDropdownOpen(false); }}
                className="text-left px-4 py-3 text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors cursor-pointer text-sm font-bold flex items-center justify-between"
              >
                Sair
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-wider uppercase text-white text-center">
            GEOQUEST
          </h1>
          {gameMode === "infinite" && (
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mt-1">
              Modo Ilimitado
            </span>
          )}
        </div>

        <div className="w-12 flex justify-end">
          {gameMode === "daily" && (
            <button
              onClick={() => setIsRankingModalOpen(true)}
              className="text-amber-500 hover:text-amber-300 transition-colors cursor-pointer bg-emerald-950/50 p-2 rounded-xl border border-emerald-900/50 shadow-sm"
              title="Rankings"
            >
              <Trophy className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <StatisticsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <RankingModal
        isOpen={isRankingModalOpen}
        onClose={() => setIsRankingModalOpen(false)}
        onLoginRequest={() => {
          setIsRankingModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Input Area */}
      {gameState === "playing" && (
        <AutocompleteInput
          guess={guess}
          guessing={guessing}
          errorMsg={errorMsg}
          filteredCountries={filteredCountries}
          showAutocomplete={showAutocomplete}
          cluesLength={clues.length}
          totalClues={totalClues}
          setShowAutocomplete={setShowAutocomplete}
          handleInputChange={handleInputChange}
          handleSelectCountry={handleSelectCountry}
          handleGuess={handleGuess}
        />
      )}

      <AdExtraHint
        gameState={gameState}
        cluesLength={clues.length}
        extraHint={extraHint}
        isWatchingAd={isWatchingAd}
        requestExtraHint={requestExtraHint}
      />

      {gameState !== "playing" && !isModalOpen && (
        <div className="mb-6 flex flex-col gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg uppercase tracking-wide transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer shadow-emerald-900/20"
          >
            📊 Ver Estatísticas
          </button>
        </div>
      )}

      {/* Result Modal Area */}
      {gameState !== "playing" && country && isModalOpen && (
        <GameResult
          gameState={gameState}
          country={country}
          cluesUsed={cluesUsedCount}
          totalClues={totalClues}
          gameMode={gameMode}
          onPlayAgain={startInfiniteMode}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <ClueList clues={clues} totalClues={totalClues} />

      <footer className="mt-12 text-center text-xs text-emerald-300/50 pb-8 border-t border-emerald-900/40 pt-4">
        GEOQUEST - Jogo de geografia diário
        <br />Teste seus conhecimentos com este jogo.
      </footer>
    </div>
  );
}