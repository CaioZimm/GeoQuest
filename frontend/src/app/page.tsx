import Game from "@/components/game/Game";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#101c0f] w-full relative">
      <div className="max-w-[1400px] mx-auto w-full flex flex-row justify-center lg:justify-between px-4">

        <aside className="hidden lg:flex w-[300px] h-screen sticky top-0 py-8 flex-col items-center justify-start gap-6">

          <div className="w-full h-[250px] bg-gradient-to-b from-[#0a2013]/80 to-transparent border border-emerald-900/40 rounded-xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden group">
            <span className="text-emerald-700/60 text-[9px] font-bold tracking-[0.2em] mb-2 uppercase">Publicidade</span>
            <div className="w-[280px] h-[200px] border border-dashed border-emerald-800/30 rounded-lg flex items-center justify-center group-hover:border-emerald-600/50 transition-colors">
              <span className="text-emerald-800/40 text-xs text-center px-4">Espaço para<br />Banner 300x250</span>
            </div>
          </div>

          <div className="w-full h-[250px] bg-gradient-to-b from-[#0a2013]/80 to-transparent border border-emerald-900/40 rounded-xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden group">
            <span className="text-emerald-700/60 text-[9px] font-bold tracking-[0.2em] mb-2 uppercase">Publicidade</span>
            <div className="w-[280px] h-[200px] border border-dashed border-emerald-800/30 rounded-lg flex items-center justify-center group-hover:border-emerald-600/50 transition-colors">
              <span className="text-emerald-800/40 text-xs text-center px-4">Espaço para<br />Banner 300x250</span>
            </div>
          </div>
        </aside>

        <div className="flex-1 max-w-lg flex flex-col items-center w-full">
          <Game />
        </div>
        <aside className="hidden lg:block w-[300px] shrink-0"></aside>

      </div>
    </main>
  );
}