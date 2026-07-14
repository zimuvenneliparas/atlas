import dynamic from "next/dynamic";
import { Eraser, FileEdit } from "lucide-react";
import type { Tool } from "@/types/tool";

/**
 * Registro centrale degli strumenti e delle Core App implementate e
 * funzionanti.
 *
 * Aggiungere un nuovo strumento = aggiungere una voce qui + creare la
 * cartella features/<slug>/. Non serve toccare altro: app/tools/[slug],
 * app/apps/[slug] e le card in home leggono tutte da questo array.
 *
 * Il component è sempre caricato con next/dynamic: il codice del tool
 * (es. pdf-lib, @imgly/background-removal) entra nel bundle del browser
 * solo quando l'utente apre quella pagina, non nel bundle iniziale del sito.
 */
export const tools: Tool[] = [
  {
    slug: "modifica-pdf",
    name: "Modifica PDF",
    category: "Documenti",
    icon: FileEdit,
    kind: "core-app",
    description:
      "Clicca su un testo per sostituirlo, unisci più PDF, riordina, ruota ed elimina pagine. Tutto avviene nel tuo browser: i file non vengono mai caricati su un server.",
    component: dynamic(() => import("@/features/edit-pdf/EditPdfTool")),
  },
  {
    slug: "rimuovi-sfondo",
    name: "Rimuovi sfondo",
    category: "Immagini",
    icon: Eraser,
    kind: "tool",
    description:
      "Rimuovi automaticamente lo sfondo da una foto in pochi secondi. L'elaborazione avviene nel tuo browser: l'immagine non lascia mai il tuo dispositivo.",
    component: dynamic(() => import("@/features/remove-background/RemoveBackgroundTool")),
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getCoreApps(): Tool[] {
  return tools.filter((tool) => tool.kind === "core-app");
}

export function getSimpleTools(): Tool[] {
  return tools.filter((tool) => tool.kind === "tool");
}
