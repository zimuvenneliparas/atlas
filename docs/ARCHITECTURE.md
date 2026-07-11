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
Funzionalità principali della piattaforma.

lib/
Funzioni di supporto.

types/
Tipi condivisi.

public/
Immagini, icone e file statici.

docs/
Documentazione del progetto.

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