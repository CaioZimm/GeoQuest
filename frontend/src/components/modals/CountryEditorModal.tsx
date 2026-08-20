import { CountryEditorModalProps } from "@/models/interfaces/CountryEditorModalProps";
import { CountryData } from "@/models/interfaces/CountryData";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

export function CountryEditorModal({ isOpen, onClose, country, onSave }: CountryEditorModalProps) {
  const defaultClues = [
    { order: 1, text: "", difficulty: "Fácil" },
    { order: 2, text: "", difficulty: "Fácil" },
    { order: 3, text: "", difficulty: "Médio" },
    { order: 4, text: "", difficulty: "Médio" },
    { order: 5, text: "", difficulty: "Difícil" },
    { order: 6, text: "", difficulty: "Difícil" },
  ];

  const [formData, setFormData] = useState<CountryData>({
    name: "", code: "", continent: "", capital: "", population: 0, area: 0,
    clues: defaultClues
  });

  useEffect(() => {
    if (country) {
      setFormData(country);
    } else {
      setFormData({
        name: "", code: "", continent: "", capital: "", population: 0, area: 0,
        clues: defaultClues
      });
    }
  }, [country, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof CountryData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClueChange = (index: number, value: string) => {
    const newClues = [...formData.clues];
    newClues[index].text = value;
    setFormData(prev => ({ ...prev, clues: newClues }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0a2013] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-emerald-900/60 overflow-hidden"
          >
            <div className="p-4 sm:p-6 border-b border-emerald-900/60 flex items-center justify-between bg-[#08180e]">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                {country ? "Editar País" : "Novo País"}
              </h2>
              <button onClick={onClose} className="text-emerald-500/70 hover:text-emerald-300 transition-colors p-2 rounded-xl border border-emerald-900/50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <form id="country-form" onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-emerald-400 text-xs font-bold mb-1">Nome do País</label>
                    <input type="text" required value={formData.name} onChange={e => handleChange("name", e.target.value)}
                      className="w-full bg-[#0e2a19] border border-emerald-800/50 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-emerald-400 text-xs font-bold mb-1">Código ISO (ex: BR, US)</label>
                    <input type="text" required value={formData.code} onChange={e => handleChange("code", e.target.value.toUpperCase())}
                      className="w-full bg-[#0e2a19] border border-emerald-800/50 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-emerald-400 text-xs font-bold mb-1">Continente</label>
                    <input type="text" required value={formData.continent} onChange={e => handleChange("continent", e.target.value)}
                      className="w-full bg-[#0e2a19] border border-emerald-800/50 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-emerald-400 text-xs font-bold mb-1">Capital</label>
                    <input type="text" required value={formData.capital} onChange={e => handleChange("capital", e.target.value)}
                      className="w-full bg-[#0e2a19] border border-emerald-800/50 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-emerald-400 text-xs font-bold mb-1">População</label>
                    <input type="number" required value={formData.population} onChange={e => handleChange("population", Number(e.target.value))}
                      className="w-full bg-[#0e2a19] border border-emerald-800/50 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-emerald-400 text-xs font-bold mb-1">Área (km²)</label>
                    <input type="number" required value={formData.area} onChange={e => handleChange("area", Number(e.target.value))}
                      className="w-full bg-[#0e2a19] border border-emerald-800/50 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>

                <hr className="border-emerald-900/40" />
                <h3 className="text-emerald-300 font-bold uppercase tracking-wider text-sm">Pistas</h3>

                <div className="space-y-3">
                  {formData.clues.map((clue, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/30">
                      <div className="w-full sm:w-24 text-emerald-400 font-mono text-xs uppercase text-center sm:text-left">
                        {clue.order}º - {clue.difficulty}
                      </div>
                      <input
                        type="text" required placeholder={`Digite a pista ${clue.order}...`}
                        value={clue.text} onChange={e => handleClueChange(idx, e.target.value)}
                        className="w-full flex-1 bg-[#0e2a19] border border-emerald-800/50 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                      />
                    </div>
                  ))}
                </div>

              </form>
            </div>

            <div className="p-4 sm:p-6 border-t border-emerald-900/60 bg-[#08180e] flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
                Cancelar
              </button>
              <button type="submit" form="country-form" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold transition-colors flex items-center gap-2">
                <Save className="w-5 h-5" /> Salvar País
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
