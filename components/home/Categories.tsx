import { Briefcase, BarChart3, FileText, Image, Sparkles } from "lucide-react";
import { categoryColors, type CategoryName } from "@/lib/category-colors";

const categories = [
  {
    name: "Documenti",
    icon: FileText,
    description: "Modifica, converti e gestisci i tuoi file.",
  },
  {
    name: "Immagini",
    icon: Image,
    description: "Ritocca, converti e ottimizza le tue immagini.",
  },
  {
    name: "Intelligenza Artificiale",
    icon: Sparkles,
    description: "Automatizza attività con strumenti AI.",
  },
  {
    name: "Dati",
    icon: BarChart3,
    description: "Analizza ed estrai valore dai tuoi dati.",
  },
  {
    name: "Business",
    icon: Briefcase,
    description: "Strumenti per gestire il tuo lavoro.",
  },
];

export default function Categories() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
        Categorie
      </h2>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
        {categories.map((category) => {
          const colors = categoryColors[category.name as CategoryName];

          return (
            <div
              key={category.name}
              className={`flex flex-col items-center gap-3 rounded-2xl border ${colors.border} bg-surface p-9 text-center transition-all duration-[180ms] ease-out hover:-translate-y-0.5 ${colors.borderHover}`}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
                <category.icon size={24} strokeWidth={1.75} className={colors.icon} />
              </span>
              <span className="text-sm font-semibold text-gray-950">
                {category.name}
              </span>
              <span className="text-xs text-gray-950">
                {category.description}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
