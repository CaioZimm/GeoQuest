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
            className="w-full min-h-[48px] bg-[#3a3a3c] border border-gray-600 rounded flex items-center px-4 py-2"
          >
            <span className="text-gray-400 font-bold mr-3">{idx + 1}.</span>
            <p className="text-white text-sm md:text-base leading-snug">{clue}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty Slots */}
      {dummySlots.map((_, idx) => (
        <div
          key={`dummy-${idx}`}
          className="w-full h-[48px] bg-[#121213] border border-gray-700 rounded flex items-center px-4 opacity-50"
        >
        </div>
      ))}
    </div>
  );
}
