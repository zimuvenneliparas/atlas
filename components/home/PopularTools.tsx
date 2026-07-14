import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { FileUser, Receipt, RefreshCw, Table } from "lucide-react";
import { categoryColors, type CategoryName } from "@/lib/category-colors";
import { tools as implementedTools } from "@/lib/tools";

interface ShowcaseTool {
  slug?: string;
  kind?: "tool" | "core-app";
  name: string;
  category: CategoryName;
  icon: LucideIcon;
  description: string;
}

// Strumenti non ancora implementati: restano visibili in home (il sito non
// sembra vuoto) ma con azione disabilitata, per non promettere all'utente
// qualcosa che non funziona ancora davvero.
const comingSoon: ShowcaseTool[] = [
  {
    name: "Conversione PDF",
    category: "Documenti",
    icon: RefreshCw,
    description: "Converti PDF in Word, Excel e altri formati.",
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

const showcase: ShowcaseTool[] = [
  ...implementedTools.map(
    (tool): ShowcaseTool => ({
      slug: tool.slug,
      kind: tool.kind,
      name: tool.name,
      category: tool.category,
      icon: tool.icon,
      description: tool.description,
    })
  ),
  ...comingSoon,
];

export default function PopularTools() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
        Strumenti popolari
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {showcase.map((tool) => {
          const colors = categoryColors[tool.category];
          const isAvailable = Boolean(tool.slug);

          return (
            <div
              key={tool.name}
              className={`flex flex-col gap-5 rounded-2xl border ${colors.border} bg-surface p-8 transition-all duration-[180ms] ease-out hover:-translate-y-0.5 ${colors.borderHover}`}
            >
              <div className="flex items-center justify-between">
                <tool.icon
                  size={24}
                  strokeWidth={1.75}
                  className={colors.icon}
                />
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
                {isAvailable ? (
                  <Link
                    href={`${tool.kind === "core-app" ? "/apps" : "/tools"}/${tool.slug}`}
                    className={`block w-full rounded-full border ${colors.borderStrong} bg-white py-3 text-center text-sm font-semibold text-gray-950 transition-colors duration-[180ms] ease-out ${colors.borderHover} focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none`}
                  >
                    Apri
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-full border border-border bg-white py-3 text-sm font-semibold text-gray-400"
                  >
                    Prossimamente
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
