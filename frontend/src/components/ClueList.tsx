import { ClueListProps } from "@/models/interfaces/ClueListProps";
import { motion, AnimatePresence } from "framer-motion";

export function ClueList({ clues, totalClues }: ClueListProps) {
  const dummySlots = Array.from({ length: Math.max(0, totalClues - clues.length) });

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {clues.map((clue, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0e2a19] border border-emerald-800/50 rounded-xl p-4 flex gap-4 text-sm font-medium text-emerald-50 shadow-md"
          >
            <span className="text-emerald-400 font-black">{idx + 1}.</span>
            <p className="text-white text-sm md:text-base leading-snug">{clue}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty Slots */}
      {dummySlots.map((_, idx) => (
        <div
          key={`dummy-${idx}`}
          className="bg-[#0c1f12] border border-dashed border-emerald-900/60 rounded-xl p-4 flex items-center justify-center text-emerald-800/60 text-sm font-bold min-h-[72px]"
        >
          ?
        </div>
      ))}
    </div>
  );
}
