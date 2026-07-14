// Copia il worker di pdfjs-dist in public/ dopo ogni "npm install", cosi'
// Modifica PDF lo serve dallo stesso sito invece di scaricarlo da un CDN
// esterno ad ogni utilizzo (piu' affidabile: non dipende da servizi terzi
// ne' rischia di essere bloccato da ad-blocker o policy di rete).
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const src = join(
  projectRoot,
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs"
);
const destDir = join(projectRoot, "public");
const dest = join(destDir, "pdf.worker.min.mjs");

if (!existsSync(src)) {
  console.warn(
    "[copy-pdf-worker] File non trovato: " +
      src +
      " — pdfjs-dist potrebbe non essere installato correttamente."
  );
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log("[copy-pdf-worker] pdf.worker.min.mjs copiato in public/");
