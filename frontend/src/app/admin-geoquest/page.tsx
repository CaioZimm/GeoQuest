"use client";

import { Plus, Edit2, Trash2, ShieldAlert, Globe, Users, TrendingUp, Target, Activity, Map, UserCheck, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import { fetchAdminCountries, fetchAdminUsers, fetchAdminDashboard, saveAdminCountry, deleteAdminCountry } from "@/services/adminService";
import { CountryEditorModal } from "@/components/modals/CountryEditorModal";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { clsx } from "clsx";

type Tab = "dashboard" | "countries" | "users";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const [countries, setCountries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<any | null>(null);

  const [searchCountry, setSearchCountry] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [countryPage, setCountryPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !(session as any)?.token) {
      router.push("/");
      return;
    }

    loadData((session as any).token as string);
  }, [status, session, router]);

  const loadData = async (token: string) => {
    try {
      setLoading(true);
      const [countriesData, usersData, dashboardData] = await Promise.all([
        fetchAdminCountries(token),
        fetchAdminUsers(token),
        fetchAdminDashboard(token)
      ]);
      setCountries(countriesData);
      setUsers(usersData);
      setDashboard(dashboardData);
    } catch (err: any) {
      setError(err.message || "Acesso Negado");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    if (!(session as any)?.token) return;
    try {
      await saveAdminCountry((session as any).token as string, data, data.id);
      setIsModalOpen(false);
      toast.success(data.id ? "País atualizado!" : "País adicionado!");
      loadData((session as any).token as string);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar país");
    }
  };

  const handleDelete = async (id: number) => {
    if (!(session as any)?.token) return;
    if (!confirm("Tem certeza que deseja apagar este país?")) return;
    try {
      await deleteAdminCountry((session as any).token as string, id);
      toast.success("País removido com sucesso!");
      loadData((session as any).token as string);
    } catch (err: any) {
      toast.error(err.message || "Erro ao deletar país");
    }
  };

  // Sorting Logic
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortData = (data: any[]) => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Derived State for Tables
  const filteredCountries = sortData(countries.filter(c => c.name.toLowerCase().includes(searchCountry.toLowerCase())));
  const totalCountryPages = Math.max(1, Math.ceil(filteredCountries.length / ITEMS_PER_PAGE));
  const paginatedCountries = filteredCountries.slice((countryPage - 1) * ITEMS_PER_PAGE, countryPage * ITEMS_PER_PAGE);

  const filteredUsers = sortData(users.filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase())));
  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice((userPage - 1) * ITEMS_PER_PAGE, userPage * ITEMS_PER_PAGE);

  // Reset pages when searching
  useEffect(() => { setCountryPage(1); }, [searchCountry]);
  useEffect(() => { setUserPage(1); }, [searchUser]);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 inline ml-1" /> : <ArrowDown className="w-3 h-3 inline ml-1" />;
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen bg-[#05100a] text-emerald-500 flex items-center justify-center font-bold">Autenticando...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#05100a] flex flex-col items-center justify-center p-4">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
        <p className="text-emerald-500/70 mb-6">{error}</p>
        <Link href="/" className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold">Voltar para o jogo</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05100a] text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">

        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">
              Painel de Administrador
            </h1>
            <p className="text-emerald-500/70 text-sm">Gerenciamento Geral do GeoQuest</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                loadData((session as any).token as string);
                toast.success("Dados atualizados!");
              }}
              className="bg-emerald-950/50 text-emerald-400 border border-emerald-900/50 px-4 py-2 rounded-xl font-bold hover:bg-emerald-900/50 transition-colors flex items-center gap-2"
              title="Atualizar dados"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <Link href="/" className="bg-emerald-950/50 text-emerald-400 border border-emerald-900/50 px-4 py-2 rounded-xl font-bold hover:bg-emerald-900/50 transition-colors hidden sm:inline-block">
              Voltar
            </Link>
            {activeTab === "countries" && (
              <button
                onClick={() => { setEditingCountry(null); setIsModalOpen(true); }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
              >
                <Plus className="w-5 h-5" /> País
              </button>
            )}
          </div>
        </header>

        <div className="flex gap-2 mb-6 border-b border-emerald-900/50 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={clsx(
              "px-4 py-2 font-bold rounded-t-xl transition-colors flex items-center gap-2",
              activeTab === "dashboard"
                ? "bg-emerald-900/40 text-emerald-300 border-b-2 border-emerald-400"
                : "text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-900/20"
            )}
          >
            <Activity className="w-4 h-4" /> Visão Geral
          </button>
          <button
            onClick={() => setActiveTab("countries")}
            className={clsx(
              "px-4 py-2 font-bold rounded-t-xl transition-colors flex items-center gap-2",
              activeTab === "countries"
                ? "bg-emerald-900/40 text-emerald-300 border-b-2 border-emerald-400"
                : "text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-900/20"
            )}
          >
            <Globe className="w-4 h-4" /> Países
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={clsx(
              "px-4 py-2 font-bold rounded-t-xl transition-colors flex items-center gap-2",
              activeTab === "users"
                ? "bg-emerald-900/40 text-emerald-300 border-b-2 border-emerald-400"
                : "text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-900/20"
            )}
          >
            <Users className="w-4 h-4" /> Jogadores
          </button>
        </div>

        {activeTab === "dashboard" && dashboard && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#0a150f] border border-emerald-900/60 p-6 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="p-4 bg-emerald-900/30 rounded-xl text-emerald-400">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-emerald-500/70 text-sm font-bold uppercase tracking-wider">Usuários Totais</p>
                <p className="text-3xl font-black text-white">{dashboard.total_users}</p>
              </div>
            </div>

            <div className="bg-[#0a150f] border border-emerald-900/60 p-6 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="p-4 bg-blue-900/30 rounded-xl text-blue-400">
                <Map className="w-8 h-8" />
              </div>
              <div>
                <p className="text-blue-500/70 text-sm font-bold uppercase tracking-wider">Países Cadastrados</p>
                <p className="text-3xl font-black text-white">{dashboard.total_countries}</p>
              </div>
            </div>

            <div className="bg-[#0a150f] border border-emerald-900/60 p-6 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="p-4 bg-amber-900/30 rounded-xl text-amber-400">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-amber-500/70 text-sm font-bold uppercase tracking-wider">Jogos (Histórico)</p>
                <p className="text-3xl font-black text-white">{dashboard.total_matches}</p>
              </div>
            </div>

            <div className="bg-[#0a150f] border border-emerald-900/60 p-6 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="p-4 bg-purple-900/30 rounded-xl text-purple-400">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <p className="text-purple-500/70 text-sm font-bold uppercase tracking-wider">Jogaram Hoje</p>
                <p className="text-3xl font-black text-white">{dashboard.matches_today}</p>
              </div>
            </div>

            <div className="bg-[#0a150f] border border-emerald-900/60 p-6 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="p-4 bg-green-900/30 rounded-xl text-green-400">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <p className="text-green-500/70 text-sm font-bold uppercase tracking-wider">Win Rate Global</p>
                <p className="text-3xl font-black text-white">{dashboard.global_win_rate}%</p>
              </div>
            </div>

            <div className="bg-[#0a150f] border border-emerald-900/60 p-6 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="p-4 bg-rose-900/30 rounded-xl text-rose-400">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <p className="text-rose-500/70 text-sm font-bold uppercase tracking-wider">Média Palpites</p>
                <p className="text-3xl font-black text-white">{dashboard.global_avg_guesses.toFixed(1)} / 6</p>
              </div>
            </div>
          </div>
        )}

        {activeTab !== "dashboard" && (
          <div className="bg-[#0a150f] border border-emerald-900/60 rounded-2xl overflow-hidden shadow-2xl">
            {activeTab === "countries" && (
              <div className="p-4 border-b border-emerald-900/60">
                <input
                  type="text"
                  placeholder="Buscar país por nome..."
                  value={searchCountry}
                  onChange={(e) => setSearchCountry(e.target.value)}
                  className="w-full sm:w-1/2 bg-emerald-950/40 border border-emerald-900/50 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            )}
            {activeTab === "users" && (
              <div className="p-4 border-b border-emerald-900/60">
                <input
                  type="text"
                  placeholder="Buscar jogador por nome ou email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full sm:w-1/2 bg-emerald-950/40 border border-emerald-900/50 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            )}

            <div className="overflow-x-auto">
              {activeTab === "countries" ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-emerald-950/40 border-b border-emerald-900/60 text-emerald-300/70 text-xs font-bold uppercase tracking-wider">
                      <th className="p-4 cursor-pointer hover:text-emerald-100 transition-colors" onClick={() => handleSort('id')}>ID <SortIcon columnKey="id" /></th>
                      <th className="p-4 cursor-pointer hover:text-emerald-100 transition-colors" onClick={() => handleSort('name')}>País <SortIcon columnKey="name" /></th>
                      <th className="p-4 cursor-pointer hover:text-emerald-100 transition-colors" onClick={() => handleSort('continent')}>Continente <SortIcon columnKey="continent" /></th>
                      <th className="p-4 text-center">Pistas</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/20">
                    {paginatedCountries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-emerald-500/50">Nenhum país encontrado.</td>
                      </tr>
                    ) : (
                      paginatedCountries.map(c => (
                        <tr key={c.id} className="hover:bg-emerald-900/10 transition-colors">
                          <td className="p-4 font-mono text-emerald-500/70">#{c.id}</td>
                          <td className="p-4 font-bold text-emerald-100 flex items-center gap-2">
                            {c.name} <span className="text-xs text-emerald-500/50 bg-emerald-950/50 px-2 py-0.5 rounded-full">{c.code}</span>
                          </td>
                          <td className="p-4 text-emerald-300/70">{c.continent}</td>
                          <td className="p-4 text-center">
                            <span className="bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 text-xs px-2 py-1 rounded-lg font-mono">
                              {c.clues?.length || 0}/6
                            </span>
                          </td>
                          <td className="p-4 flex justify-end gap-2">
                            <button
                              onClick={() => { setEditingCountry(c); setIsModalOpen(true); }}
                              className="p-2 text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="p-2 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-emerald-950/40 border-b border-emerald-900/60 text-emerald-300/70 text-xs font-bold uppercase tracking-wider">
                      <th className="p-4 cursor-pointer hover:text-emerald-100 transition-colors" onClick={() => handleSort('name')}>Usuário <SortIcon columnKey="name" /></th>
                      <th className="p-4 text-center cursor-pointer hover:text-emerald-100 transition-colors" onClick={() => handleSort('played')}>Partidas <SortIcon columnKey="played" /></th>
                      <th className="p-4 text-center cursor-pointer hover:text-emerald-100 transition-colors" onClick={() => handleSort('win_rate')}>Taxa Vitória <SortIcon columnKey="win_rate" /></th>
                      <th className="p-4 text-center cursor-pointer hover:text-emerald-100 transition-colors" onClick={() => handleSort('current_streak')}>Atual Streak <SortIcon columnKey="current_streak" /></th>
                      <th className="p-4 text-center cursor-pointer hover:text-emerald-100 transition-colors" onClick={() => handleSort('max_streak')}>Max. Streak <SortIcon columnKey="max_streak" /></th>
                      <th className="p-4 text-center cursor-pointer hover:text-emerald-100 transition-colors" onClick={() => handleSort('avg_guesses')} title="Média de Palpites p/ Vitória">Média Palpites <SortIcon columnKey="avg_guesses" /></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/20">
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-emerald-500/50">Nenhum jogador encontrado.</td>
                      </tr>
                    ) : (
                      paginatedUsers.map(u => (
                        <tr key={u.id} className="hover:bg-emerald-900/10 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-emerald-100 flex items-center gap-2">
                              {u.name}
                              {u.provider === "google" && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">Google</span>}
                            </div>
                            <div className="text-xs text-emerald-500/50 mt-1">{u.email}</div>
                          </td>
                          <td className="p-4 text-center font-mono text-emerald-300/80">{u.played}</td>
                          <td className="p-4 text-center font-mono">
                            <span className={clsx(
                              "px-2 py-1 rounded-lg text-xs font-bold",
                              u.win_rate >= 80 ? "bg-emerald-900/40 text-emerald-400" :
                                u.win_rate >= 50 ? "bg-amber-900/30 text-amber-400" : "bg-red-900/30 text-red-400"
                            )}>
                              {u.win_rate}%
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono text-emerald-300/80">{u.current_streak}🔥</td>
                          <td className="p-4 text-center font-mono font-bold text-amber-400">{u.max_streak}🔥</td>
                          <td className="p-4 text-center font-mono text-emerald-300/80">{u.avg_guesses.toFixed(1)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {activeTab === "countries" && totalCountryPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t border-emerald-900/60 bg-emerald-950/20">
                <span className="text-emerald-500/70 text-sm">
                  Página {countryPage} de {totalCountryPages} ({filteredCountries.length} resultados)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={countryPage === 1}
                    onClick={() => setCountryPage(p => p - 1)}
                    className="px-3 py-1 bg-emerald-900/50 rounded text-emerald-400 disabled:opacity-50 hover:bg-emerald-800/50 transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={countryPage === totalCountryPages}
                    onClick={() => setCountryPage(p => p + 1)}
                    className="px-3 py-1 bg-emerald-900/50 rounded text-emerald-400 disabled:opacity-50 hover:bg-emerald-800/50 transition-colors"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
            {activeTab === "users" && totalUserPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t border-emerald-900/60 bg-emerald-950/20">
                <span className="text-emerald-500/70 text-sm">
                  Página {userPage} de {totalUserPages} ({filteredUsers.length} resultados)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={userPage === 1}
                    onClick={() => setUserPage(p => p - 1)}
                    className="px-3 py-1 bg-emerald-900/50 rounded text-emerald-400 disabled:opacity-50 hover:bg-emerald-800/50 transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={userPage === totalUserPages}
                    onClick={() => setUserPage(p => p + 1)}
                    className="px-3 py-1 bg-emerald-900/50 rounded text-emerald-400 disabled:opacity-50 hover:bg-emerald-800/50 transition-colors"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <CountryEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        country={editingCountry}
        onSave={handleSave}
      />
    </div>
  );
}
