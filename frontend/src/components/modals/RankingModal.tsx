import { LeaderboardResponse } from "@/models/interfaces/LeaderboardResponse";
import { RankingModalProps } from "@/models/interfaces/RankingModalProps";
import { Trophy, X, Medal, Flame, LogIn } from "lucide-react";
import { fetchLeaderboard } from "@/services/gameService";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

export function RankingModal({ isOpen, onClose, onLoginRequest }: RankingModalProps) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"score" | "streak">("score");

  useEffect(() => {
    async function loadData() {
      if (!isOpen) return;
      setLoading(true);
      try {
        const token = session ? (session as unknown as { token: string }).token : undefined;
        const response = await fetchLeaderboard(token);
        setData(response);
      } catch (err) {
        console.error("Erro ao carregar ranking", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isOpen, session]);

  if (!isOpen) return null;

  const currentList = activeTab === "score" ? data?.by_score : data?.by_streak;

  let stickyEntry = null;
  if (status === "authenticated" && data) {
    const userEntry = activeTab === "score" ? data.user_score_entry : data.user_streak_entry;
    if (userEntry) {
      const isVisible = currentList?.some(e => e.user_name === userEntry.user_name);
      if (!isVisible) {
        stickyEntry = userEntry;
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#06180e]/90 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#0a2013] border border-emerald-900/60 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col relative z-10 shadow-2xl"
          >
            <div className="flex flex-col border-b border-emerald-900/40">
              <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                    Rankings
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-emerald-500/70 hover:text-emerald-300 transition-colors bg-emerald-950/50 p-2 rounded-xl border border-emerald-900/50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 pb-4 flex gap-2">
                <button
                  onClick={() => setActiveTab("score")}
                  className={clsx(
                    "flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 cursor-pointer",
                    activeTab === "score"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                      : "bg-emerald-950/30 text-emerald-500 hover:bg-emerald-900/40 border border-emerald-900/50"
                  )}
                >
                  <Trophy className="w-4 h-4" />
                  Maiores Pontuações
                </button>
                <button
                  onClick={() => setActiveTab("streak")}
                  className={clsx(
                    "flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 cursor-pointer",
                    activeTab === "streak"
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                      : "bg-emerald-950/30 text-emerald-500 hover:bg-emerald-900/40 border border-emerald-900/50"
                  )}
                >
                  <Flame className="w-4 h-4" />
                  Maior Sequência
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="bg-[#0a150f] border border-emerald-900/60 rounded-2xl overflow-hidden">
                <div className="bg-emerald-950/40 p-4 grid grid-cols-12 gap-2 sm:gap-4 border-b border-emerald-900/60 text-emerald-300/70 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  <div className="col-span-2 text-center">Pos.</div>
                  <div className="col-span-6">Jogador</div>
                  <div className="col-span-4 text-center">
                    {activeTab === "score" ? "Pontos / Vitórias" : "Dias Seguidos"}
                  </div>
                </div>

                <div className="flex flex-col">
                  {loading ? (
                    <div className="p-8 text-center text-emerald-500">Carregando heróis...</div>
                  ) : !currentList || currentList.length === 0 ? (
                    <div className="p-8 text-center text-emerald-500 text-sm">Nenhum jogador encontrado ainda. Seja o primeiro!</div>
                  ) : (
                    currentList.map((entry) => (
                      <div
                        key={entry.rank}
                        className={clsx(
                          "p-3 sm:p-4 grid grid-cols-12 gap-2 sm:gap-4 border-b border-emerald-900/20 items-center transition-colors hover:bg-emerald-900/20 text-sm",
                          entry.rank === 1 && (activeTab === "score" ? "bg-amber-950/20 border-l-4 border-l-amber-500" : "bg-orange-950/20 border-l-4 border-l-orange-500"),
                          entry.rank === 2 && "bg-slate-900/40 border-l-4 border-l-slate-400",
                          entry.rank === 3 && (activeTab === "score" ? "bg-emerald-950/50 border-l-4 border-l-emerald-500" : "bg-amber-950/20 border-l-4 border-l-amber-500"),
                        )}
                      >
                        <div className="col-span-2 flex justify-center">
                          {entry.rank === 1 ? <Medal className={clsx("w-5 h-5", activeTab === "score" ? "text-amber-500" : "text-orange-500")} /> :
                            entry.rank === 2 ? <Medal className="w-5 h-5 text-slate-400" /> :
                              entry.rank === 3 ? <Medal className={clsx("w-5 h-5", activeTab === "score" ? "text-emerald-500" : "text-amber-500")} /> :
                                <span className="text-emerald-500/70 font-bold">{entry.rank}º</span>}
                        </div>
                        <div className={clsx(
                          "col-span-6 font-bold truncate",
                          entry.rank === 1 ? (activeTab === "score" ? "text-amber-500" : "text-orange-400") :
                            entry.rank === 2 ? "text-slate-300" :
                              entry.rank === 3 ? (activeTab === "score" ? "text-emerald-400" : "text-amber-500") :
                                "text-emerald-100"
                        )}>
                          {entry.user_name}
                        </div>
                        <div className="col-span-4 text-center font-mono font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                          {activeTab === "score" ? (
                            <>
                              <span className="text-emerald-400">{entry.total_score.toLocaleString('pt-BR')}</span>
                              <span className="text-emerald-500/50 hidden sm:inline">|</span>
                              <span className="text-emerald-200 text-xs sm:text-sm">{entry.total_wins}V</span>
                            </>
                          ) : (
                            <div className="flex items-center gap-1 text-orange-400">
                              <Flame className="w-4 h-4" />
                              <span>{entry.max_streak}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Sticky User Row */}
                {stickyEntry && (
                  <div className="border-t-[3px] border-emerald-500/50 bg-[#0c2417] shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.5)] z-20">
                    <div className="p-3 sm:p-4 grid grid-cols-12 gap-2 sm:gap-4 items-center text-sm relative">
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500"></div>
                      <div className="col-span-2 flex justify-center">
                        <span className="text-emerald-400 font-bold">{stickyEntry.rank}º</span>
                      </div>
                      <div className="col-span-6 font-black truncate text-emerald-100">
                        {stickyEntry.user_name}
                      </div>
                      <div className="col-span-4 text-center font-mono font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                        {activeTab === "score" ? (
                          <>
                            <span className="text-emerald-400">{stickyEntry.total_score.toLocaleString('pt-BR')}</span>
                            <span className="text-emerald-500/50 hidden sm:inline">|</span>
                            <span className="text-emerald-200 text-xs sm:text-sm">{stickyEntry.total_wins}V</span>
                          </>
                        ) : (
                          <div className="flex items-center gap-1 text-orange-400">
                            <Flame className="w-4 h-4" />
                            <span>{stickyEntry.max_streak}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {status === "unauthenticated" && (
              <div className="bg-emerald-950/80 border-t border-emerald-900/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-emerald-100 text-sm text-center sm:text-left">
                  <span className="font-bold text-amber-500">Crie uma conta</span> para salvar seu progresso e participar dos rankings!
                </div>
                <button
                  onClick={onLoginRequest}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg shadow-emerald-900/20"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar / Cadastrar
                </button>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
