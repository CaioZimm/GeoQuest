import { AdExtraHintProps } from "@/models/interfaces/AdExtraHintProps";
import { Loader2, Play } from "lucide-react";

export function AdExtraHint({
  gameState,
  cluesLength,
  extraHint,
  isWatchingAd,
  requestExtraHint
}: AdExtraHintProps) {
  return (
    <>
      {gameState === "playing" && cluesLength >= 5 && !extraHint && (
        <div className="mb-6 flex flex-col items-center">
          <button
            onClick={requestExtraHint}
            disabled={isWatchingAd}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl uppercase tracking-wide transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isWatchingAd ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Carregando Anúncio...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                Dica Bônus (Assistir Vídeo)
              </>
            )}
          </button>
          <span className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-semibold">
            Ad Recompensado
          </span>
        </div>
      )}

      {gameState === "playing" && extraHint && (
        <div className="mb-6 p-4 rounded-xl bg-blue-900/40 border border-blue-500/30 text-center shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <span className="text-xs uppercase tracking-widest font-bold text-blue-400">Dica Bônus Desbloqueada</span>
          <p className="text-white font-bold text-lg">{extraHint}</p>
        </div>
      )}

      {isWatchingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-[#0a2013] border border-emerald-900/50 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Anúncio</h2>
            <p className="text-emerald-100/80 text-sm mb-6">
              Assista a este vídeo para desbloquear a primeira letra do país.
            </p>
            <div className="w-full bg-black/50 h-32 rounded-lg flex items-center justify-center border border-emerald-900/30 mb-2">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Vídeo Simulador (5s)</span>
            </div>
            <p className="text-xs text-blue-400 font-bold mt-2 animate-pulse">Aguarde a recompensa...</p>
          </div>
        </div>
      )}
    </>
  );
}
