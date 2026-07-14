import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { CategoryName } from "@/lib/category-colors";

/**
 * Descrive uno strumento di Atlas: i metadati alimentano le card in home
 * (Categories, PopularTools, SearchBar) e le pagine dinamiche
 * app/tools/[slug] (tool singoli) e app/apps/[slug] (Core Apps).
 *
 * `component` è sempre un import dinamico (next/dynamic) nel registro,
 * cosi' ogni tool viene caricato nel browser solo quando l'utente lo apre.
 *
 * `kind` distingue:
 * - "tool": funzione singola e mirata (es. Rimuovi sfondo), vive su /tools/<slug>.
 * - "core-app": applicazione completa che integra più funzioni correlate
 *   (es. Modifica PDF), vive su /apps/<slug> ed è evidenziata in home.
 */
export interface Tool {
  slug: string;
  name: string;
  category: CategoryName;
  icon: LucideIcon;
  description: string;
  kind: "tool" | "core-app";
  component: ComponentType;
}
