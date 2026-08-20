import AdSenseBanner from "@/components/ads/AdSenseBanner";
import Game from "@/components/game/Game";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#101c0f] w-full relative">
      <div className="max-w-[1400px] mx-auto w-full flex flex-row justify-center lg:justify-between px-4">

        <aside className="hidden lg:flex w-[300px] h-screen sticky top-0 py-8 flex-col items-center justify-start gap-6">
          {/* <AdSenseBanner dataAdSlot="2591121818" /> */}
          {/* <AdSenseBanner dataAdSlot="6014577687" /> */}
        </aside>

        <div className="flex-1 max-w-lg flex flex-col items-center w-full">
          <Game />
        </div>
        <aside className="hidden lg:block w-[300px] shrink-0"></aside>

      </div>
    </main>
  );
}