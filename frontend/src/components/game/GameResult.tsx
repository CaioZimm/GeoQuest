import { GameResultProps } from "@/models/interfaces/GameResultProps";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { clsx } from "clsx";

export function GameResult({ gameState, country, cluesUsed, totalClues, onClose }: GameResultProps) {

  const [timeUntilNext, setTimeUntilNext] = useState<string>("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow.getTime() - now.getTime();

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeUntilNext(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

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
        className="relative w-full max-w-sm bg-[#0a2013] p-6 rounded-xl border border-emerald-800/60 shadow-2xl flex flex-col items-center text-center"
      >
        {/* Botão Fechar Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-emerald-300/70 hover:text-white p-1 rounded-full hover:bg-emerald-900/50 transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className={clsx("text-3xl font-black uppercase mb-2", gameState === "won" ? "text-emerald-400" : "text-red-500")}>
          {gameState === "won" ? "Você Acertou!" : "Fim de Jogo"}
        </h2>

        <p className="text-lg text-emerald-100 mb-6">
          O país era: <br /><span className="text-2xl font-black text-white">{country.name}</span>
        </p>

        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#06180e] p-3 rounded-lg border border-emerald-900/60 flex flex-col items-center">
            <span className="text-xs text-emerald-300/70 font-bold uppercase mb-1">Pontos</span>
            <span className={clsx("text-2xl font-black", gameState === "won" ? "text-emerald-400" : "text-emerald-600/70")}>
              {earnedPoints}
            </span>
          </div>
          <div className="bg-[#06180e] p-3 rounded-lg border border-emerald-900/60 flex flex-col items-center">
            <span className="text-xs text-emerald-300/70 font-bold uppercase mb-1">Pistas</span>
            <span className="text-2xl font-black text-white">{cluesUsed}/{totalClues}</span>
          </div>

          {/* Informações detalhadas do país */}
          <div className="col-span-2 bg-[#06180e] p-3.5 rounded-lg border border-emerald-900/60 text-sm text-left flex flex-col gap-1.5">
            <div className="flex justify-between border-b border-emerald-900/40 pb-1">
              <span className="text-emerald-300/70">Capital:</span>
              <span className="font-semibold text-white">{country.capital || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-emerald-900/40 pb-1">
              <span className="text-emerald-300/70">Continente:</span>
              <span className="font-semibold text-white">{country.continent || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-emerald-900/40 pb-1">
              <span className="text-emerald-300/70">População:</span>
              <span className="font-semibold text-white">
                {country.population ? country.population.toLocaleString("pt-BR") : "N/A"}
              </span>
            </div>
            <div className="flex justify-between border-b border-emerald-900/40 pb-1">
              <span className="text-emerald-300/70">Área:</span>
              <span className="font-semibold text-white">
                {country.area ? `${country.area.toLocaleString("pt-BR")} km²` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-300/70">Código ISO:</span>
              <span className="font-semibold text-white uppercase">{country.code || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-[#06180e] border border-emerald-900/60 rounded-lg p-4 mt-2">
          <p className="text-emerald-300/70 text-xs font-bold uppercase mb-1">Próximo país em</p>
          <p className="text-white text-2xl font-black">{timeUntilNext}</p>
        </div>
      </motion.div>
    </div>
  );
}
