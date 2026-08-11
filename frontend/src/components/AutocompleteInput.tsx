import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useRef } from "react";

import { AutocompleteInputProps } from "@/models/interfaces/AutocompleteInputProps";
import { Search, Globe2 } from "lucide-react";

export function AutocompleteInput({
  guess,
  guessing,
  errorMsg,
  filteredCountries,
  showAutocomplete,
  cluesLength,
  totalClues,
  setShowAutocomplete,
  handleInputChange,
  handleSelectCountry,
  handleGuess
}: AutocompleteInputProps) {
  const controls = useAnimation();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!guessing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [guessing]);



  useEffect(() => {
    if (errorMsg) {
      controls.start({
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      });
    }
  }, [errorMsg, controls]);

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete || filteredCountries.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredCountries.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCountries.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < filteredCountries.length) {
      e.preventDefault();
      handleSelectCountry(filteredCountries[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowAutocomplete(false);
    }
  };

  const renderHighlightedName = (name: string, query: string) => {
    if (!query.trim()) return <span>{name}</span>;

    const normName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const matchIndex = normName.indexOf(normQuery);

    if (matchIndex === -1) {
      return <span>{name}</span>;
    }

    const before = name.substring(0, matchIndex);
    const matched = name.substring(matchIndex, matchIndex + query.length);
    const after = name.substring(matchIndex + query.length);

    return (
      <span>
        {before}
        <strong className="text-white font-black underline decoration-emerald-500/50">{matched}</strong>
        <span className="text-emerald-100 font-medium">{after}</span>
      </span>
    );
  };

  return (
    <motion.form animate={controls} onSubmit={handleGuess} className="mb-6">
      {errorMsg && (
        <div className="bg-red-900/50 text-red-200 border border-red-500/30 p-3 mb-3 rounded-lg text-sm text-center font-semibold">
          {errorMsg}
        </div>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={guess}
            onChange={(e) => {
              setSelectedIndex(-1);
              handleInputChange(e);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (guess) setShowAutocomplete(true); }}
            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            placeholder="Digite o nome do país..."
            className="w-full bg-[#0a1a10] border border-emerald-800/60 rounded-xl p-4 pl-12 text-white shadow-xl shadow-black/50 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
            disabled={guessing}
            autoComplete="off"
          />
          <Search className="w-5 h-5 text-emerald-500/70 absolute left-4 top-4" />

          {/* Menu Autocomplete */}
          {showAutocomplete && filteredCountries.length > 0 && (
            <ul
              ref={listRef}
              className="absolute w-full mt-2 bg-[#0c2214] border border-emerald-800/60 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 py-2 custom-scrollbar"
            >
              {filteredCountries.map((c, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <li
                    key={c}
                    onMouseDown={() => handleSelectCountry(c)}
                    className={`px-4 py-3 cursor-pointer text-sm transition-colors flex items-center justify-between ${isSelected ? "bg-[#10301d] text-white border-l-4 border-emerald-500 font-bold" : "hover:bg-[#0f2818] text-emerald-100/80"
                      }`}
                  >
                    {renderHighlightedName(c, guess)}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={guessing || !guess.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#0c2214] disabled:text-emerald-700/50 disabled:border-emerald-900/50 disabled:border text-white px-6 rounded-xl font-bold uppercase tracking-wide transition-colors flex items-center gap-2 shadow-lg"
        >
          {guessing ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Globe2 className="w-5 h-5 text-emerald-300" /> Adivinhar
            </>
          )}
        </button>
      </div>

      <div className="text-center mt-3 text-xs text-gray-400 font-bold tracking-wider">
        ADIVINHAR {cluesLength} / {totalClues}
      </div>
    </motion.form>
  );
}