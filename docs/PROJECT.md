# Atlas

## Cos'è Atlas

Atlas è una piattaforma web che raccoglie decine di strumenti online in un unico posto.

L'obiettivo è permettere agli utenti di trovare rapidamente lo strumento di cui hanno bisogno, senza dover cercare su decine di siti diversi.

---

## Categorie principali

- Documenti
- Immagini
- Intelligenza Artificiale
- Dati
- Business

---

## Funzionalità principali

Atlas offrirà strumenti come:

- Modifica PDF
- Conversione PDF
- Rimozione sfondo immagini
- Generatore di Curriculum Vitae
- Analisi file Excel con AI
- Lettura fatture
- Molti altri strumenti

---

## Core Apps vs Tool

La piattaforma distingue due livelli di funzionalità:

- **Tool**: uno strumento singolo e mirato (es. Rimozione sfondo). Vive su `/tools/<slug>`.
- **Core App**: un'applicazione completa che integra più funzioni correlate in un'unica esperienza (es. Modifica PDF: clicca sul testo per sostituirlo, unisci, riordina, ruota, elimina pagine — in futuro anche testo libero, immagini, firma, redazione). Vive su `/apps/<slug>` ed è evidenziata in home. È la principale differenza rispetto ai competitor, che offrono quasi sempre singole utility scollegate tra loro.

Core App previste: Modifica PDF (Documenti), Image Studio (Immagini), AI Workspace (Intelligenza Artificiale), Data Studio (Dati), Business Hub (Business). Vengono costruite incrementalmente: si parte da un sottoinsieme di funzioni reali e si espandono nel tempo, non si aspetta di averle complete per essere utili.

**Nota tecnica su "modificare il testo":** i PDF non salvano il testo in modo riscrivibile come un documento Word. Modifica PDF non riscrive il testo originale: lo rileva, lo copre con un rettangolo e disegna sopra il nuovo testo — la stessa tecnica usata da iLovePDF, Adobe e dagli altri editor PDF seri. Per l'utente il risultato è identico a una modifica vera.

---

## Strategia di lancio

Login, Dashboard utente e piano Premium (autenticazione, pagamenti) sono un passo successivo alla disponibilità dei primi Tool e Core App gratuiti. Il sito può e deve andare online pubblicamente prima di avere account e monetizzazione: gli strumenti gratuiti, funzionanti e senza attrito, sono il modo più veloce per validare che le persone li usino davvero.

---

## Modello di business

Atlas utilizza un modello Freemium.

### Free

- Accesso a tutti gli strumenti
- Numero limitato di utilizzi giornalieri
- Alcune funzionalità avanzate non disponibili

### Premium

- Utilizzo illimitato
- Funzionalità avanzate
- Nessuna limitazione
- Accesso prioritario alle nuove funzionalità

---

## Obiettivo

Creare la migliore piattaforma online per la produttività, semplice da usare, veloce e professionale.

Ogni nuova funzionalità dovrà aiutare l'utente a risolvere un problema nel minor tempo possibile.