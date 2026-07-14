# Architettura Atlas

## Tecnologie

- Next.js
- React
- TypeScript
- Tailwind CSS

---

## Struttura del progetto

app/
Contiene le pagine del sito.

components/
Contiene tutti i componenti riutilizzabili.

components/layout/
Header, Footer e componenti comuni del layout.

components/home/
Componenti della Homepage.

components/ui/
Componenti riutilizzabili come pulsanti, card, modali e barra di ricerca.

features/
Funzionalità principali della piattaforma. Ogni Tool o Core App vive nella
propria cartella (es. `features/edit-pdf/`, `features/remove-background/`),
con la propria logica e i propri componenti, isolata dal resto.

lib/
Funzioni di supporto. `lib/tools.ts` è il registro centrale: elenca ogni
Tool/Core App con i suoi metadati (slug, nome, categoria, icona,
descrizione, kind) e il componente caricato via `next/dynamic`. Aggiungere
un nuovo strumento significa aggiungere una voce qui + una cartella in
`features/`, senza toccare altro.

types/
Tipi condivisi. `types/tool.ts` definisce l'interfaccia `Tool`, incluso il
campo `kind: "tool" | "core-app"` che determina su quale route vive lo
strumento (vedi sotto).

public/
Immagini, icone e file statici.

docs/
Documentazione del progetto.

---

## Route degli strumenti

- `app/tools/[slug]/page.tsx` — pagine dei Tool singoli (`kind: "tool"`).
- `app/apps/[slug]/page.tsx` — pagine delle Core App (`kind: "core-app"`),
  con badge "Core App" in evidenza tramite `components/ui/ToolHeader.tsx`.

Entrambe le pagine leggono dallo stesso registro (`lib/tools.ts`) e
condividono lo stesso layout di intestazione (icona, badge opzionale,
titolo, descrizione) tramite `ToolHeader`, per evitare duplicazione tra le
due route.

---

## Regole

Ogni componente deve avere un solo compito.

Esempio:

- Header
- Hero
- PopularTools
- Categories
- Footer

Mai creare file molto grandi con centinaia di righe di codice.

Ogni componente deve essere piccolo, semplice e riutilizzabile.