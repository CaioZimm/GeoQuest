"use client";

import { useGameState } from "@/hooks/useGameState";
import { AutocompleteInput } from "./AutocompleteInput";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut } from "lucide-react";
import { GameResult } from "./GameResult";
import { AuthModal } from "./AuthModal";
import { ClueList } from "./ClueList";
import { useState } from "react";

export default function Game() {
  const {
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
    handleGuess
  } = useGameState();

  const { data: session } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
        <div className="w-8"></div>
        <h1 className="text-3xl font-bold tracking-wider uppercase text-white text-center">
          GEOQUEST
        </h1>
        <div className="w-8 flex justify-end">
          {session ? (
            <button onClick={() => signOut()} className="text-gray-400 hover:text-white transition-colors" title="Sair">
              <LogOut className="w-6 h-6" />
            </button>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="text-gray-400 hover:text-white transition-colors cursor-pointer" title="Entrar">
              <User className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

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

      {/* Floating Reopen Button if modal was closed */}
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
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Clues List */}
      <ClueList clues={clues} totalClues={totalClues} />

      <footer className="mt-12 text-center text-xs text-emerald-300/50 pb-8 border-t border-emerald-900/40 pt-4">
        GEOQUEST - Jogo de geografia diário
        <br />Teste seus conhecimentos com este jogo.
      </footer>
    </div>
  );
}