"use client";

import { useGameState } from "@/hooks/useGameState";
import { AutocompleteInput } from "./AutocompleteInput";
import { GameResult } from "./GameResult";
import { ClueList } from "./ClueList";

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
    handleGuess,
    resetGame
  } = useGameState();

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
      <header className="flex items-center justify-between py-3 border-b border-gray-700 mb-6">
        <div className="w-8"></div>
        <h1 className="text-3xl font-bold tracking-wider uppercase text-white flex items-center gap-2 mt-2">
          GEOQUEST
        </h1>
        <div className="w-8"></div>
      </header>

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
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg uppercase tracking-wide transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            📊 Ver Estatísticas
          </button>
          <button
            onClick={resetGame}
            className="w-full bg-[#3a3a3c] hover:bg-gray-600 text-white font-bold py-2.5 px-4 rounded-lg uppercase text-sm tracking-wide transition-colors cursor-pointer"
          >
            Jogar Novamente
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
          resetGame={resetGame}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Clues List */}
      <ClueList clues={clues} totalClues={totalClues} />

      <footer className="mt-12 text-center text-xs text-gray-500 pb-8 border-t border-gray-800 pt-4">
        GEOQUEST - Jogo de geografia diário
        <br />Teste seus conhecimentos com este jogo.
      </footer>
    </div>
  );
}