# Atlas Design System

## 1. Filosofia del brand

**Sensazione da trasmettere**: calma, fiducia, efficienza. Atlas deve sembrare uno strumento "professionale ma leggero" — non un'app enterprise pesante, non un sito consumer chiassoso. L'utente deve percepire che risparmierà tempo e che lo strumento è affidabile.

**Pubblico di riferimento**: freelance, piccole imprese, studenti, knowledge worker che devono risolvere task concreti (convertire un PDF, leggere una fattura, generare un CV) senza competenze tecniche. Il design deve rendere il piano Premium desiderabile senza far sembrare il Free penalizzato o trascurato.

**Principi di design**:

1. Chiarezza prima di tutto — gerarchia tramite tipografia e spazio bianco, non colore o decorazione.
2. Un solo accento cromatico, usato con parsimonia (vedi §3 e §18).
3. Velocità percepita e reale — animazioni minime, componenti leggeri.
4. Coerenza sistemica assoluta — stessa struttura per card, bottoni, badge, transizioni ovunque.
5. Accessibilità di default, non ritocco finale.

---

## 2. Brand References

Prodotti a cui Atlas deve ispirarsi esplicitamente, e cosa prendere da ciascuno:

| Riferimento | Cosa prendiamo |
|---|---|
| **Apple** | Semplicità, spazio bianco generoso, gerarchia tipografica pulita, zero elementi superflui. |
| **Notion** | Modularità dei contenuti, superfici neutre, tono da "strumento di lavoro" più che prodotto consumer. |
| **Linear** | Velocità percepita, palette ridotta a un solo accento, micro-interazioni minime, iconografia stroke-based coerente. |
| **Stripe** | Autorevolezza tramite tipografia e contrasto — non colore — badge soft-fill, documentazione visiva pulita. |
| **Vercel** | Bianco/nero come base dominante, accento unico usato con parsimonia, bordi netti invece di ombre pesanti. |
| **Raycast** | Densità informativa senza disordine, coerenza assoluta di spaziature e icone in tutta l'interfaccia. |
| **Arc Browser** | Cura dei dettagli micro (angoli, transizioni), personalità sobria senza diventare giocosa o rumorosa. |

**Regola derivata**: prima di introdurre uno stile nuovo, confrontarlo mentalmente con questi sette riferimenti. Se non assomiglia a nessuno di loro, probabilmente non è coerente con Atlas.

---

## 3. Palette colori

| Ruolo | Colore | Hex | Perché |
|---|---|---|---|
| **Accent** | Indaco | `#4F46E5` (hover `#4338CA`) | Colore primario del brand e delle azioni principali (Cerca, Apri, Premium). Nel codice il token resta chiamato `accent`/`accent-hover` per continuità con le implementazioni già approvate. Usato con **parsimonia estrema — circa 2-5% della superficie visiva di ogni schermata** (vedi regola §18). Il resto dell'interfaccia resta neutro. |
| **Secondary** | Quasi-nero | `#171717` | Azioni secondarie (Login, outline) e testo ad alta enfasi. Contrasto netto senza introdurre un secondo hue. |
| **Background** | Bianco | `#FFFFFF` | Canvas dominante — coerente con Apple/Vercel. |
| **Surface** | Grigio chiarissimo | `#F9FAFB` | Distingue elementi elevati dallo sfondo tramite contrasto, non ombra. |
| **Border** | Grigio chiaro | `#E5E7EB` | Bordi puliti — il meccanismo primario di separazione visiva (vedi §9). |
| **Success** | Verde | `#16A34A` | Stato semantico standard (conversione riuscita, upload completato). |
| **Warning** | Ambra | `#D97706` | Stati del piano Free (es. limite giornaliero raggiunto). |
| **Error** | Rosso | `#DC2626` | Errori di validazione o elaborazione. |

**Regola di parsimonia sull'indaco**: in ogni schermata deve esserci **al massimo un'azione in accento pieno** (un bottone, raramente due). Tutto il resto — bordi, icone di default, badge, testo — resta in scala di grigi/nero. L'indaco deve saltare all'occhio proprio perché raro, non perché diffuso.

---

## 4. Tipografia

**Font**: Geist Sans per tutta l'interfaccia; Geist Mono per contenuti tecnici/numerici (dati, output di strumenti di analisi).

> Nota tecnica: `app/globals.css` imposta oggi `font-family: Arial, Helvetica, sans-serif` sul `body`, sovrascrivendo la variabile Geist. Da correggere in implementazione (`font-family: var(--font-sans)`).

| Livello | Dimensione | Peso | Uso |
|---|---|---|---|
| H1 / Display | `text-6xl` | `font-bold`, `tracking-tight` | Titolo Hero |
| H2 | `text-2xl`/`text-3xl` | `font-bold` | Titoli di sezione |
| H3 | `text-lg` | `font-semibold` | Titoli card |
| H4 | `text-base` | `font-semibold` | Sotto-sezioni (pagine future) |
| H5 | `text-sm` | `font-semibold` | Etichette di gruppo |
| H6 | `text-xs` | `font-semibold`, uppercase | Etichette tecniche minime |
| Testo normale | `text-base`/`text-sm` | `font-normal` | `text-gray-600` secondario, `text-gray-900` primario |
| Caption | `text-xs` | `font-medium` | Badge, descrizioni, metadati (`text-gray-500`) |

---

## 5. Grid System

- **Container esterno** (header, footer): `max-w-7xl` (1280px), centrato (`mx-auto`), padding orizzontale costante `px-6` a tutti i breakpoint.
- **Container di contenuto** (griglie di card — categorie, strumenti): `max-w-6xl` (1152px), per righe leggibili fino a un massimo di 5 colonne.
- **Container testuale** (Hero, testi lunghi): `max-w-3xl`/`max-w-4xl` (768-896px), per una lunghezza di riga ottimale.
- **Griglie**: CSS Grid con gap standard `gap-6` (24px); colonne responsive per contesto (categorie 2→3→5, strumenti 1→2→3 — vedi §16 Responsive).
- **Allineamento**: contenuto sempre centrato orizzontalmente nella pagina; testo centrato solo nell'Hero e nei titoli di sezione, sinistrorso ovunque altro (card, liste). Mai allineamenti misti nella stessa sezione.
- **Gerarchia dei container**: Pagina (full width) → Container esterno (`max-w-7xl`) → Sezione (padding verticale `py-16`/`py-20`) → Container di contenuto (`max-w-6xl`/`max-w-3xl`) → Griglia/elementi.

---

## 6. Spaziature

- **Micro** (`gap-2`–`gap-3`, 8-12px): tra icona e testo, elementi inline.
- **Componente** (`p-6`–`p-9`, `gap-4`–`gap-5`): padding interno di card e bottoni.
- **Sezione** (`py-16`/`py-20`, 64-80px): ritmo verticale tra i blocchi della homepage.

---

## 7. Border Radius

| Token | Valore | Uso |
|---|---|---|
| `sm` | `rounded-lg` (8px) | Elementi piccoli |
| `md` | `rounded-xl` (12px) | Input, mark del logo |
| `lg` | `rounded-2xl` (16px) | Card |
| `full` | `rounded-full` | Bottoni, badge, barra di ricerca |

---

## 8. Ombre (importanza ridotta)

Le ombre **non sono il meccanismo primario di elevazione**. Bordi puliti (`Border`) e contrasto di sfondo (`Surface` vs `Background`) comunicano gerarchia e interattività prima delle ombre.

- Le card usano **bordo come stato di riposo di default, senza ombra**.
- Su hover, la profondità si esprime prima con un cambio di bordo (verso `Secondary` o `Accent`) o di sfondo; l'ombra è un rinforzo secondario, non l'effetto principale.
- Ombra ammessa solo come `sm`, leggerissima, e riservata a livelli sovrapposti reali (dropdown, popover, modali) — mai su elementi statici della pagina.

> Nota: questo è un cambio rispetto a quanto implementato finora (le card oggi usano `shadow-sm` di default + `hover:shadow-md/lg`). Da rivedere in fase di implementazione del sistema.

---

## 9. Component Architecture

**Organizzazione per dominio, non per tipo** (coerente con `docs/ARCHITECTURE.md`):

- `components/ui/` — componenti generici, privi di logica di business, riutilizzabili ovunque (es. SearchBar, futuri Button/Badge/Modal). Non conoscono il contesto in cui vengono usati.
- `components/layout/` — struttura/chrome del sito, presenti su ogni pagina (Header, Footer).
- `components/home/` — componenti specifici della homepage (Hero, Categories, PopularTools). Non riutilizzabili altrove per definizione.
- `features/` — moduli funzionali completi (es. un futuro `features/pdf-editor/`), che possono contenere propri componenti, logica e stato, isolati dal resto del progetto. Un tool complesso vive qui, non in `components/`.

**Regola di singola responsabilità**: ogni componente fa una cosa sola e la fa bene. Se un componente inizia a gestire più concetti (es. un "Hero" che reimplementa anche la logica di ricerca) va scomposto — il Hero compone SearchBar, non la reimplementa.

**Convenzioni di naming**:

- PascalCase per nome file e nome componente (`Header.tsx`, `export default function Header()`).
- Un componente per file; il nome del file coincide col nome del componente esportato.
- Nomi descrittivi del "cosa", non del "dove" (`PopularTools`, non `HomeSection3`).
- I componenti generici in `ui/` non devono avere nomi legati a un dominio specifico (`SearchBar`, non `HeroSearchBar`).

**Regola di promozione**: se un componente in `home/` (o altra cartella di dominio) inizia a essere riutilizzato in una seconda pagina, va spostato in `ui/` o `layout/` a seconda della natura, non duplicato.

---

## 10. Bottoni

- **Primary** (azione principale): `bg-accent text-white rounded-full`, hover `bg-accent-hover` — un solo bottone Primary per schermata (regola di parsimonia, §3).
- **Secondary/Outline**: `border border-gray-300 text-gray-700 rounded-full`, hover bordo/testo neri.
- **Ghost**: solo testo, cambio colore in hover — link di navigazione.

Dimensioni: `sm` (`px-4 py-2`), `md` (`px-6 py-3`, default), `lg` (`px-8 py-3.5`).
Stati: default → hover → focus (ring visibile) → disabled (`opacity-50`).

---

## 11. Card

Schema unico: `bg-white border border-gray-200 rounded-2xl p-8` (nessuna ombra di riposo, vedi §8) → hover con cambio di bordo/leggero sollevamento (`-translate-y-0.5`).

Struttura interna fissa: **header** (icona + badge opzionale) → **titolo** → **descrizione** → **azione ancorata in fondo** (separata da bordo superiore quando presente un bottone).

---

## 12. Input

Pattern principale (SearchBar): contenitore pillola `bg-surface border-2 border-border`, focus tramite `focus-within` (bordo `Accent` + sfondo bianco), mai outline di default del browser.

Input di form standalone (futuri): `rounded-xl border border-border p-3/p-4`, focus con bordo `Accent`.

---

## 13. Badge

Default: `rounded-full bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1` — **neutro**, mai indaco di default (coerente con la parsimonia cromatica).

Varianti semantiche (soft-fill): success (`bg-green-50 text-green-700`), warning (`bg-amber-50 text-amber-700`), error (`bg-red-50 text-red-700`). Variante premium (`bg-indigo-50 text-accent`) riservata a un solo badge per schermata, tipicamente legato al piano Premium.

---

## 14. Icone

Le emoji sono sostituite integralmente da **Lucide React** (`lucide-react`), la libreria di icone attualmente adottata dal progetto — SVG stroke-based, tree-shakeable, coerente con l'estetica Linear/Vercel/Raycast citata in §2. Non è un vincolo permanente: se in futuro emergesse un'esigenza diversa, la scelta potrà essere rivista, mantenendo però i principi di coerenza (stroke, dimensioni, colore) definiti qui sotto.

**Regole d'uso**:

- Import nominale per icona (`import { Search, FileText } from "lucide-react"`), mai import massivi.
- **Dimensione e stroke uniformi in tutta l'app**: ogni icona Lucide usa sempre `size={24}` e `strokeWidth={1.75}`, indipendentemente dal contesto (search bar, card categoria, card strumento). Nessuna variante di dimensione/stroke per componente — stessa logica di coerenza assoluta già applicata alle animazioni (§15). Il contenitore che ospita l'icona (es. cerchio `Surface` nelle card categoria) può variare dimensione per motivi di layout, ma l'icona al suo interno resta sempre `24px`.
- Colore sempre `currentColor`/grigio neutro (eredita dal testo circostante) — mai indaco di default, solo nei rari stati attivi/selezionati.

**Mappatura icone attuali → Lucide** (indicativa, da verificare in implementazione):

| Uso | Prima | Ora |
|---|---|---|
| Ricerca | 🔍 | `Search` |
| Documenti | 📄 | `FileText` |
| Immagini | 🖼️ | `Image` |
| Intelligenza Artificiale | 🤖 | `Sparkles` |
| Dati | 📊 | `BarChart3` |
| Business | 💼 | `Briefcase` |
| Modifica PDF | 📝 | `FileEdit` |
| Conversione PDF | 🔄 | `RefreshCw` |
| Rimozione sfondo immagini | 🖼️ | `Eraser` |
| Generatore CV | 🧑‍💼 | `FileUser` |
| Analisi Excel con AI | 📊 | `Table` |
| Lettura fatture | 🧾 | `Receipt` |

Il mark del logo nell'Header **resta il quadrato geometrico CSS** già definito — è un brand mark, non un'icona funzionale, quindi non passa a Lucide.

**Accessibilità**: icone puramente decorative → `aria-hidden="true"`; icone che sono l'unico contenuto di un bottone → `aria-label` obbligatorio.

---

## 15. Animazioni

- **Un'unica durata/easing per tutta l'app**: `180ms`, `ease-out` — nessuna eccezione locale, nessun componente definisce timing proprio.
- Movimenti ammessi: cambio colore (`transition-colors`), leggero sollevamento (`-translate-y-0.5`/`-1` massimo), fade di opacità.
- Vietati: scale/bounce, rotazioni, animazioni in loop, autoplay.
- Deve rispettare `prefers-reduced-motion`: quando attivo, transizioni e traslazioni si disabilitano, resta solo il cambio di stato immediato.

---

## 16. Responsive

Mobile-first con i breakpoint Tailwind (`sm`, `md`). Griglie standard: categorie `grid-cols-2 → sm:3 → md:5`, strumenti `grid-cols-1 → sm:2 → md:3`. Padding orizzontale costante (`px-6`). Target di tocco minimo 40px su mobile.

---

## 17. Accessibilità

- Contrasto minimo AA: `text-gray-600` (non `gray-500`) per testo piccolo su bianco.
- HTML semantico (`header`, `nav`, `main`, `section`, `footer`).
- Stato di focus visibile su tutti gli elementi interattivi (`focus-visible:ring-2`) — oggi mancante sui bottoni pieni, da introdurre.
- Icone Lucide decorative sempre `aria-hidden`; icone-bottone sempre con `aria-label`.
- Navigabilità da tastiera garantita da `<button>`/`<a>` nativi.

---

## 18. Regole per lo sviluppo futuro

1. Un solo hue per il colore Accent — nessuna nuova famiglia di colori senza approvazione esplicita.
2. Lucide React è la libreria di icone attualmente adottata dal progetto — niente emoji, nessun mix con altri set nello stesso momento; un eventuale cambio di libreria va valutato e documentato qui, non introdotto localmente in un componente.
3. **Tutte le icone Lucide usano la stessa dimensione (`24px`) e lo stesso `strokeWidth` (`1.75`)** — nessuna eccezione per contesto (§14).
4. **L'indaco (`accent`) copre al massimo il 2-5% di ogni schermata**: un solo bottone Primary pieno per vista, tutto il resto neutro.
5. **Le ombre sono l'eccezione, non la regola**: bordo + contrasto di sfondo prima delle shadow; shadow solo per livelli sovrapposti reali (dropdown/modali).
6. **Coerenza assoluta di animazioni**: un solo token di durata/easing (`180ms ease-out`) per tutta l'app, mai valori definiti localmente.
7. Ogni componente ha una sola responsabilità ed è organizzato per dominio (`ui/`, `layout/`, `home/`, `features/`), come da §9.
8. Ogni card segue lo schema fisso: header → titolo → descrizione → azione in fondo.
9. Spaziature e radius sempre dai token definiti — mai valori arbitrari (es. `rounded-[13px]`).
10. I colori semantici (success/warning/error) si usano solo per stati reali, mai come decorazione.
11. Prima di introdurre uno stile nuovo, confrontarlo con i Brand References (§2).
12. Il `font-family` del `body` deriva sempre dal token `--font-sans` (Geist) — mai hardcoded.
