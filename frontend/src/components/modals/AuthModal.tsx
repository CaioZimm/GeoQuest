"use client";

import { X, Mail, BarChart3, Smartphone, Eye, EyeOff, Repeat } from "lucide-react";
import { FeatureItem } from "./FeatureItem";
import { useAuth } from "@/hooks/useAuth";
import { signIn } from "next-auth/react";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    isLoginMode, setIsLoginMode,
    isEmailView, setIsEmailView,
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    name, setName,
    error, loading, handleEmailAuth
  } = useAuth(onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#0a2013] rounded-2xl w-full max-w-[440px] relative shadow-2xl border border-emerald-900/60 p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-emerald-300/70 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {!isEmailView ? (
          <>
            <div className="text-center mb-6">
              <span className="bg-emerald-900/50 text-emerald-200 text-xs font-black uppercase tracking-wider py-1 px-3 rounded-lg border border-emerald-600 mb-4 inline-block">
                Crie sua conta grátis
              </span>
              <h2 className="text-2xl font-black text-white mb-1">Eleve o Seu Jogo de Geografia</h2>
              <p className="text-emerald-300/70 text-sm">
                Acesse suas estatísticas diárias em qualquer dispositivo.
              </p>
            </div>

            <div className="mb-6">
              <FeatureItem
                icon={BarChart3}
                title="Salve Seu Progresso"
                desc="Nunca perca suas estatísticas ou sequências de vitórias"
              />
              <FeatureItem
                icon={Smartphone}
                title="Jogue em Qualquer Lugar"
                desc="Sincronize entre celular, tablet e computador"
              />
              <FeatureItem
                icon={Repeat}
                title="Modo Infinito"
                desc="Jogue quantas vezes quiser sem limites"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsEmailView(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors cursor-pointer"
              >
                <Mail className="w-5 h-5" /> Login com Email
              </button>

              <button
                onClick={() => signIn("google")}
                className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue com o Google
              </button>
            </div>

            <p className="text-xs text-emerald-300/50 text-center mt-6">
              Ao continuar, você concorda com nossos <br />Termos de Serviço e Política de Privacidade.
            </p>
          </>
        ) : (
          <div className="w-full flex flex-col h-full justify-center">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white mb-1">{isLoginMode ? "Entrar" : "Criar Conta"}</h2>
              <p className="text-emerald-300/70 text-sm">Use seu email e senha para acessar.</p>
            </div>

            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              {!isLoginMode && (
                <input
                  type="text"
                  placeholder="Seu Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0e2a19] border border-emerald-800/50 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              )}

              <input
                type="email"
                placeholder="Seu Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0e2a19] border border-emerald-800/50 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
                required
              />

              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0e2a19] border border-emerald-800/50 rounded-lg p-3 pr-12 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600/70 hover:text-emerald-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? "Aguarde..." : (isLoginMode ? "Entrar" : "Criar Conta")}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-emerald-300/70">
                {isLoginMode ? "Não tem uma conta?" : "Já tem uma conta?"}
              </span>{" "}
              <button
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
              >
                {isLoginMode ? "Cadastre-se" : "Entre aqui"}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button onClick={() => setIsEmailView(false)} className="text-emerald-600/70 hover:text-white text-sm cursor-pointer">
                &larr; Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
