import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useRef } from "react";

import { AutocompleteInputProps } from "@/models/interfaces/AutocompleteInputProps";
import { Globe2 } from "lucide-react";

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

  useEffect(() => {
    setSelectedIndex(-1);
  }, [guess, filteredCountries]);

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
        <strong className="text-white font-black underline decoration-blue-500/50">{matched}</strong>
        <span className="text-gray-300 font-medium">{after}</span>
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
            type="text"
            value={guess}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (guess) setShowAutocomplete(true); }}
            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            placeholder="Digite o nome do país..."
            className="w-full bg-[#272729] border border-gray-600 rounded-lg p-3.5 text-white focus:outline-none focus:border-green-900 uppercase font-bold text-sm tracking-wide transition-colors"
            disabled={guessing}
            autoFocus
            autoComplete="off"
          />

          {/* Menu Autocomplete */}
          {showAutocomplete && filteredCountries.length > 0 && (
            <ul
              ref={listRef}
              className="absolute z-20 w-full bg-[#272729] border border-gray-600 mt-1 max-h-52 overflow-y-auto rounded-lg shadow-2xl divide-y divide-gray-700/50"
            >
              {filteredCountries.map((c, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <li
                    key={c}
                    onMouseDown={() => handleSelectCountry(c)}
                    className={`px-4 py-3 cursor-pointer text-sm transition-colors flex items-center justify-between ${isSelected ? "bg-[#444446] text-white border-l-4 border-blue-500 font-bold" : "hover:bg-[#3a3a3c] text-gray-200"
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
          className="bg-[#3a3a3c] hover:bg-[#565758] active:scale-95 border border-gray-600 text-white px-5 py-3.5 rounded-lg uppercase font-black text-sm tracking-wide transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          <Globe2 className="w-5 h-5 text-blue-400" /> Adivinhar
        </button>
      </div>

      <div className="text-center mt-3 text-xs text-gray-400 font-bold tracking-wider">
        ADIVINHAR {cluesLength} / {totalClues}
      </div>
    </motion.form>
  );
}