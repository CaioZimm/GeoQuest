import { useEffect } from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { X } from "lucide-react";
import { GameResultProps } from "@/models/interfaces/GameResultProps";

export function GameResult({ gameState, country, cluesUsed, totalClues, resetGame, onClose }: GameResultProps) {

  useEffect(() => {
    if (gameState === "won") {
      const duration = 0.2 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [gameState]);

  const maxPoints = 1000;
  const deductionPerClue = Math.floor(maxPoints / totalClues);
  const earnedPoints = gameState === "won" ? Math.max(100, maxPoints - ((cluesUsed - 1) * deductionPerClue)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm bg-[#272729] p-6 rounded-xl border border-gray-600 shadow-2xl flex flex-col items-center text-center"
      >
        {/* Botão Fechar Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/50 transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className={clsx("text-3xl font-black uppercase mb-2", gameState === "won" ? "text-green-500" : "text-red-500")}>
          {gameState === "won" ? "Você Acertou!" : "Fim de Jogo"}
        </h2>

        <p className="text-lg text-gray-300 mb-6">
          O país era: <br /><span className="text-2xl font-black text-white">{country.name}</span>
        </p>

        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#121213] p-3 rounded-lg border border-gray-700 flex flex-col items-center">
            <span className="text-xs text-gray-400 font-bold uppercase mb-1">Pontos</span>
            <span className={clsx("text-2xl font-black", gameState === "won" ? "text-green-400" : "text-gray-500")}>
              {earnedPoints}
            </span>
          </div>
          <div className="bg-[#121213] p-3 rounded-lg border border-gray-700 flex flex-col items-center">
            <span className="text-xs text-gray-400 font-bold uppercase mb-1">Pistas</span>
            <span className="text-2xl font-black text-white">{cluesUsed}/{totalClues}</span>
          </div>

          {/* Informações detalhadas do país */}
          <div className="col-span-2 bg-[#121213] p-3.5 rounded-lg border border-gray-700 text-sm text-left flex flex-col gap-1.5">
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Capital:</span>
              <span className="font-semibold text-white">{country.capital || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Continente:</span>
              <span className="font-semibold text-white">{country.continent || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">População:</span>
              <span className="font-semibold text-white">
                {country.population ? country.population.toLocaleString("pt-BR") : "N/A"}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Área:</span>
              <span className="font-semibold text-white">
                {country.area ? `${country.area.toLocaleString("pt-BR")} km²` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Código ISO:</span>
              <span className="font-semibold text-white uppercase">{country.code || "N/A"}</span>
            </div>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="w-full bg-[#3a3a3c] hover:bg-white hover:text-black border border-gray-600 text-white px-4 py-4 rounded-lg uppercase font-black tracking-wider transition-all cursor-pointer"
        >
          Jogar Novamente
        </button>
      </motion.div>
    </div>
  );
}
