import { StatisticsModalProps } from "@/models/interfaces/StatisticsModalProps";
import { X, Share2, BarChart3, HelpCircle } from "lucide-react";
import { UserStats } from "@/models/interfaces/UserStats";
import { fetchUserStats } from "@/services/gameService";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function StatisticsModal({ isOpen, onClose }: StatisticsModalProps) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleShare = () => {
    if (!stats) return;
    const shareText = `GeoQuest - Estatísticas\n🎮 Jogados: ${stats.played}\n🏆 Vitórias: ${stats.win_rate}%\n🔥 Sequência Atual: ${stats.current_streak}\n💯 Maior Sequência: ${stats.max_streak}\n🔢 Média de Dicas: ${stats.avg_guesses}\n${window.location.origin}`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (isOpen && session) {
      setLoading(true);
      const token = (session as unknown as { token: string }).token;
      fetchUserStats(token)
        .then(data => setStats(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      {copied && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-900 px-6 py-3 rounded-xl font-bold shadow-2xl z-[60] flex items-center gap-2">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          Texto copiado para a área de transferência
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0a2013] rounded-2xl w-full max-w-[480px] relative shadow-2xl border border-emerald-900/60 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-emerald-900/40">
          <button onClick={onClose} className="text-emerald-300/70 hover:text-white transition-colors cursor-pointer opacity-0 pointer-events-none">
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-wider">Estatísticas</h2>
          </div>

          <button onClick={onClose} className="text-emerald-300/70 hover:text-white transition-colors cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Top Panel - Intro */}
          <div className="bg-emerald-950/40 rounded-xl p-5 border border-emerald-900/30">
            <h3 className="text-white font-bold mb-2">Suas Estatísticas do GeoQuest</h3>
            <p className="text-emerald-300/70 text-sm">
              Acompanhe sua taxa de vitórias, distribuição de palpites, calendário de sequências e resultados diários.
            </p>
          </div>

          {/* Stats Main Panel */}
          <div className="bg-[#0c1a12] rounded-xl border border-emerald-900/40 relative">
            <div className="flex items-center justify-between p-4 border-b border-emerald-900/40">
              <h3 className="text-white font-bold">Estatísticas</h3>
              <button
                onClick={handleShare}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition-colors cursor-pointer"
                title="Compartilhar"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <p className="text-emerald-400 animate-pulse">Carregando...</p>
                </div>
              ) : stats ? (
                <div className="flex flex-col gap-6">
                  {/* Grid 1: Main numbers */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-white">{stats.played}</span>
                      <span className="text-[10px] uppercase text-emerald-400/60 font-bold mt-1 tracking-wider">Jogados</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-white">{stats.win_rate}%</span>
                      <span className="text-[10px] uppercase text-emerald-400/60 font-bold mt-1 tracking-wider">Vitórias</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-white">{stats.current_streak}</span>
                      <span className="text-[10px] uppercase text-emerald-400/60 font-bold mt-1 tracking-wider">Atual</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-emerald-400">{stats.avg_guesses > 0 ? stats.avg_guesses : '-'}</span>
                      <span className="text-[10px] uppercase text-emerald-400/60 font-bold mt-1 tracking-wider">Média Dicas</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-emerald-900/40"></div>

                  {/* Grid 2: Streaks */}
                  <div className="grid grid-cols-2 gap-4 text-center pb-2">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-white">{stats.current_streak}</span>
                      <span className="text-xs uppercase text-emerald-400/60 font-bold mt-1">Sequência Atual</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-white">{stats.max_streak}</span>
                      <span className="text-xs uppercase text-emerald-400/60 font-bold mt-1">Maior Sequência</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-10">
                  <p className="text-red-400 text-sm">Erro ao carregar estatísticas.</p>
                </div>
              )}
            </div>

            <div
              className="absolute bottom-3 right-3 text-emerald-700 hover:text-emerald-500 cursor-pointer transition-colors"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <HelpCircle className="w-5 h-5" />
              {showTooltip && (
                <div className="absolute bottom-8 right-0 w-64 bg-black border border-emerald-900/60 p-4 rounded-xl text-xs text-emerald-100/90 shadow-xl z-10 leading-relaxed pointer-events-none">
                  Acompanhe sua evolução. Jogar de forma consistente aprimora seus conhecimentos de geografia. <b>&apos;Jogados&apos;</b> mostra o total de jogos concluídos, <b>&apos;Vitórias&apos;</b> é a sua porcentagem de acertos, <b>&apos;Sequência Atual&apos;</b> rastreia suas vitórias consecutivas recentes, <b>&apos;Maior Sequência&apos;</b> é a sua melhor sequência histórica e <b>&apos;Média Dicas&apos;</b> é a quantidade de dicas usadas até acertar.
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
