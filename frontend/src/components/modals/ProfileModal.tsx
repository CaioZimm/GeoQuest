import { X, User, Lock, Edit2, Save, AlertCircle, EyeOff, Eye } from "lucide-react";
import { ProfileModalProps } from "@/models/interfaces/ProfileModalProps";
import { updateProfile } from "@/services/gameService";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { data: session, update } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
    setPassword("");
    setError("");
    setSuccess("");
    setIsEditing(false);
  }, [isOpen, session]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("O nome não pode ficar vazio.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = (session as unknown as { token: string }).token;
      await updateProfile(name, password || undefined, token);
      await update({ name });

      setSuccess("Perfil atualizado com sucesso!");
      setIsEditing(false);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0a2013] rounded-2xl w-full max-w-[400px] relative shadow-2xl border border-emerald-900/60 overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-emerald-900/40">
          <button onClick={onClose} className="text-emerald-300/70 hover:text-white transition-colors cursor-pointer opacity-0 pointer-events-none">
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-wider">Meu Perfil</h2>
          </div>

          <button onClick={onClose} className="text-emerald-300/70 hover:text-white transition-colors cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-900/50 border border-emerald-500/50 text-emerald-200 p-3 rounded-lg text-sm text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase text-emerald-500 font-bold tracking-wider mb-1 block">Email</label>
              <div className="w-full bg-[#0e2a19]/50 border border-emerald-900/30 rounded-lg p-3 text-emerald-300/50">
                {session?.user?.email}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase text-emerald-500 font-bold tracking-wider mb-1 block">Nome</label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0e2a19] border border-emerald-500/50 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder="Seu Nome"
                  autoFocus
                />
              ) : (
                <div className="w-full bg-[#0e2a19] border border-emerald-900/50 rounded-lg p-3 text-white flex justify-between items-center">
                  <span>{session?.user?.name}</span>
                  <button type="button" onClick={() => setIsEditing(true)} className="text-emerald-500 hover:text-emerald-300 cursor-pointer">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {isEditing && (
              <div>
                <label className="text-xs uppercase text-emerald-500 font-bold tracking-wider mb-1 block">Nova Senha (Opcional)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600/70" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0e2a19] border border-emerald-500/50 rounded-lg p-3 pl-9 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                    placeholder="Deixe em branco para manter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600/70 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[10px] text-emerald-600 mt-1">Apenas para contas cadastradas com email.</p>
              </div>
            )}

            {isEditing && (
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
