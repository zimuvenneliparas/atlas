import {
  Eraser,
  FileEdit,
  FileUser,
  Receipt,
  RefreshCw,
  Table,
} from "lucide-react";
import { categoryColors, type CategoryName } from "@/lib/category-colors";

const tools = [
  {
    name: "Modifica PDF",
    category: "Documenti",
    icon: FileEdit,
    description: "Modifica testo, pagine e contenuti dei tuoi PDF.",
  },
  {
    name: "Conversione PDF",
    category: "Documenti",
    icon: RefreshCw,
    description: "Converti PDF in Word, Excel e altri formati.",
  },
  {
    name: "Rimozione sfondo immagini",
    category: "Immagini",
    icon: Eraser,
    description: "Rimuovi lo sfondo dalle tue immagini in un click.",
  },
  {
    name: "Generatore CV",
    category: "Documenti",
    icon: FileUser,
    description: "Crea un curriculum professionale in pochi minuti.",
  },
  {
    name: "Analisi Excel con AI",
    category: "Dati",
    icon: Table,
    description:
      "Analizza fogli Excel con l'aiuto dell'intelligenza artificiale.",
  },
  {
    name: "Lettura fatture",
    category: "Business",
    icon: Receipt,
    description: "Estrai automaticamente i dati dalle tue fatture.",
  },
];

export default function PopularTools() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
        Strumenti popolari
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {tools.map((tool) => {
          const colors = categoryColors[tool.category as CategoryName];

          return (
            <div
              key={tool.name}
              className={`flex flex-col gap-5 rounded-2xl border ${colors.border} bg-surface p-8 transition-all duration-[180ms] ease-out hover:-translate-y-0.5 ${colors.borderHover}`}
            >
              <div className="flex items-center justify-between">
                <tool.icon size={24} strokeWidth={1.75} className={colors.icon} />
                <span
                  className={`rounded-full border ${colors.borderStrong} bg-white px-3 py-1 text-xs font-medium text-gray-950`}
                >
                  {tool.category}
                </span>
              </div>

              <div className="flex-1">
                <p className="mb-1 text-lg font-semibold text-gray-950">
                  {tool.name}
                </p>
                <p className="text-sm text-gray-950">{tool.description}</p>
              </div>

              <div className="mt-auto border-t border-border pt-4">
                <button
                  className={`w-full rounded-full border ${colors.borderStrong} bg-white py-3 text-sm font-semibold text-gray-950 transition-colors duration-[180ms] ease-out ${colors.borderHover} focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none`}
                >
                  Apri
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
