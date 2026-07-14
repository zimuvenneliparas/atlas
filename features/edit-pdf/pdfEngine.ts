/**
 * Logica pura per Modifica PDF: nessun JSX qui, solo caricamento di
 * pdfjs-dist, estrazione delle posizioni del testo e rendering delle
 * pagine, più l'esportazione finale con pdf-lib. Tenuta separata da
 * EditPdfTool.tsx per rispettare la regola "logica separata dalla UI"
 * di docs/ARCHITECTURE.md.
 */

export interface PdfTextItem {
  /** Indice dell'elemento di testo nella pagina originale (stabile, usato per collegare le modifiche). */
  itemIndex: number;
  str: string;
  /** Coordinate in punti PDF (origine in basso a sinistra) — usate da pdf-lib in fase di export. */
  pdfX: number;
  pdfY: number;
  pdfWidth: number;
  pdfHeight: number;
  /** Posizione a schermo in pixel (origine in alto a sinistra) — usata per l'overlay HTML cliccabile. */
  screenLeft: number;
  screenTop: number;
  screenWidth: number;
  screenHeight: number;
}

export interface RenderedPage {
  canvasDataUrl: string;
  displayWidth: number;
  displayHeight: number;
  /** Dimensioni della pagina in punti PDF (senza scala), usate per posizionare gli elementi liberi (testo, immagini, firme). */
  pdfPageWidth: number;
  pdfPageHeight: number;
  items: PdfTextItem[];
}

/** Scala usata per renderizzare le pagine su schermo: la stessa costante va usata nell'interfaccia per convertire pixel <-> punti PDF durante trascinamento/ridimensionamento. */
export const RENDER_SCALE = 1.4;

export type FontFamilyOption =
  | "Helvetica"
  | "HelveticaBold"
  | "TimesRoman"
  | "TimesRomanBold"
  | "Courier";

export const FONT_OPTIONS: Array<{
  value: FontFamilyOption;
  label: string;
  cssFont: string;
}> = [
  { value: "Helvetica", label: "Helvetica", cssFont: "Helvetica, Arial, sans-serif" },
  { value: "HelveticaBold", label: "Helvetica Bold", cssFont: "Helvetica, Arial, sans-serif" },
  { value: "TimesRoman", label: "Times", cssFont: "'Times New Roman', Times, serif" },
  { value: "TimesRomanBold", label: "Times Bold", cssFont: "'Times New Roman', Times, serif" },
  { value: "Courier", label: "Courier", cssFont: "'Courier New', Courier, monospace" },
];

/** Una modifica applicata a un frammento di testo esistente: contenuto, font, dimensione e riquadro (posizione/dimensioni) scelti dall'utente. */
export interface TextEdit {
  text: string;
  fontSize: number;
  fontFamily: FontFamilyOption;
  /** Larghezza/altezza del riquadro di copertura, in punti PDF. */
  width: number;
  height: number;
  /** Scostamento del riquadro rispetto alla posizione originale del testo, in punti PDF. */
  offsetX: number;
  offsetY: number;
}

export function createDefaultEdit(item: PdfTextItem): TextEdit {
  return {
    text: item.str,
    fontSize: Math.round(item.pdfHeight * 0.85 * 10) / 10,
    fontFamily: "Helvetica",
    width: item.pdfWidth,
    height: item.pdfHeight,
    offsetX: 0,
    offsetY: 0,
  };
}

/**
 * Elementi "liberi": aggiunti dall'utente in un punto qualsiasi della
 * pagina (non collegati a un testo originale del PDF), a differenza di
 * TextEdit che modifica sempre un frammento di testo esistente.
 *
 * Convenzione coordinate: x/y sono in punti PDF, con (x, y) = angolo in
 * ALTO a sinistra del riquadro (y = distanza dal basso pagina del bordo
 * superiore). Questa scelta permette di riusare la stessa matematica di
 * trascinamento/ridimensionamento già validata per TextEdit (ancoraggio
 * in alto a sinistra, l'altezza cresce verso il basso). In fase di export
 * si converte nel formato bottom-left richiesto da pdf-lib.
 */
interface FreeElementBase {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FreeTextElement extends FreeElementBase {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: FontFamilyOption;
}

export interface FreeImageElement extends FreeElementBase {
  type: "image";
  dataUrl: string;
}

export interface FreeSignatureElement extends FreeElementBase {
  type: "signature";
  dataUrl: string;
}

export type FreeElement = FreeTextElement | FreeImageElement | FreeSignatureElement;

/** Converte il riquadro di un elemento libero (punti PDF) in pixel a schermo, coerente con la scala e l'orientamento usati per il testo esistente. */
export function freeElementScreenRect(
  el: { x: number; y: number; width: number; height: number },
  pdfPageHeight: number,
  scale = RENDER_SCALE
) {
  return {
    left: el.x * scale,
    top: (pdfPageHeight - el.y) * scale,
    width: el.width * scale,
    height: el.height * scale,
  };
}

export function createDefaultFreeText(pdfPageWidth: number, pdfPageHeight: number): FreeTextElement {
  const width = 180;
  const height = 26;
  const x = Math.max(20, (pdfPageWidth - width) / 2);
  const y = Math.min(pdfPageHeight - 20, Math.max(height + 20, pdfPageHeight / 2 + height / 2));
  return {
    id: crypto.randomUUID(),
    type: "text",
    x,
    y,
    width,
    height,
    text: "Testo",
    fontSize: 16,
    fontFamily: "Helvetica",
  };
}

function placeImageElement(
  type: "image" | "signature",
  dataUrl: string,
  naturalWidth: number,
  naturalHeight: number,
  pdfPageWidth: number,
  pdfPageHeight: number
): FreeImageElement | FreeSignatureElement {
  const maxWidth = Math.min(220, pdfPageWidth * 0.6);
  const aspect = naturalWidth > 0 ? naturalHeight / naturalWidth : 1;
  const width = maxWidth;
  const height = Math.max(20, width * aspect);
  const x = Math.max(20, (pdfPageWidth - width) / 2);
  const y = Math.min(pdfPageHeight - 20, Math.max(height + 20, pdfPageHeight / 2 + height / 2));
  const base = { id: crypto.randomUUID(), x, y, width, height, dataUrl };
  return type === "image" ? { ...base, type: "image" } : { ...base, type: "signature" };
}

export function createImageFreeElement(
  dataUrl: string,
  naturalWidth: number,
  naturalHeight: number,
  pdfPageWidth: number,
  pdfPageHeight: number
): FreeImageElement {
  return placeImageElement("image", dataUrl, naturalWidth, naturalHeight, pdfPageWidth, pdfPageHeight) as FreeImageElement;
}

export function createSignatureFreeElement(
  dataUrl: string,
  naturalWidth: number,
  naturalHeight: number,
  pdfPageWidth: number,
  pdfPageHeight: number
): FreeSignatureElement {
  return placeImageElement(
    "signature",
    dataUrl,
    naturalWidth,
    naturalHeight,
    pdfPageWidth,
    pdfPageHeight
  ) as FreeSignatureElement;
}

/** Legge un file immagine caricato dall'utente e lo converte in PNG (uniforma jpg/png/webp in un unico formato da incorporare nel PDF), restituendo anche le dimensioni naturali per calcolare le proporzioni iniziali del riquadro. */
export async function fileToPngDataUrl(file: File): Promise<{ dataUrl: string; width: number; height: number }> {
  const rawDataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Lettura del file non riuscita."));
    reader.readAsDataURL(file);
  });

  const img = await loadImageElement(rawDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D non disponibile in questo browser.");
  }
  ctx.drawImage(img, 0, 0);

  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: img.naturalWidth,
    height: img.naturalHeight,
  };
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Immagine non valida o non supportata."));
    img.src = src;
  });
}

/** Rileva se un errore di caricamento è dovuto a un PDF protetto da password (pdfjs-dist lancia un errore con name "PasswordException" in questo caso), per mostrare un messaggio più preciso invece di uno generico. */
export function isPasswordProtectedError(error: unknown): boolean {
  return error instanceof Error && error.name === "PasswordException";
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

/**
 * Carica pdfjs-dist una sola volta e configura il worker servendolo dal
 * sito stesso (public/pdf.worker.min.mjs, copiato lì dallo script
 * scripts/copy-pdf-worker.mjs dopo ogni npm install) invece che da un CDN
 * esterno: nessuna dipendenza da servizi terzi, niente da bloccare per
 * ad-blocker o policy di rete.
 */
export async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return lib;
    });
  }
  return pdfjsPromise;
}

export async function getPageCount(file: File): Promise<number> {
  const pdfjs = await getPdfjs();
  const bytes = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: bytes }).promise;
  const count = doc.numPages;
  await doc.destroy();
  return count;
}

/**
 * Renderizza una pagina su canvas sempre a rotazione 0 (la rotazione visiva
 * scelta dall'utente viene applicata separatamente via CSS nell'interfaccia,
 * per tenere semplice la matematica delle posizioni del testo) e calcola la
 * posizione a schermo di ogni frammento di testo, così l'editor può
 * mostrare riquadri cliccabili esattamente sopra il testo reale.
 */
export async function renderPage(
  file: File,
  pageIndex: number,
  scale = RENDER_SCALE
): Promise<RenderedPage> {
  const pdfjs = await getPdfjs();
  const bytes = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: bytes }).promise;
  const page = await doc.getPage(pageIndex + 1);

  const viewport = page.getViewport({ scale, rotation: 0 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D non disponibile in questo browser.");
  }

  await page.render({ canvasContext: ctx, viewport }).promise;

  const textContent = await page.getTextContent();
  const items: PdfTextItem[] = [];

  let itemIndex = 0;
  for (const raw of textContent.items) {
    if (!("str" in raw) || !raw.str.trim()) {
      itemIndex++;
      continue;
    }

    const transform = raw.transform as number[];
    const pdfX = transform[4];
    const pdfY = transform[5];
    const fontSize = Math.hypot(transform[2], transform[3]) || 10;
    const pdfWidth = raw.width || fontSize * raw.str.length * 0.5;
    const pdfHeight = raw.height || fontSize;

    const screenTx = pdfjs.Util.transform(viewport.transform, transform);
    const screenFontHeight = Math.hypot(screenTx[2], screenTx[3]) || fontSize * scale;

    items.push({
      itemIndex,
      str: raw.str,
      pdfX,
      pdfY,
      pdfWidth,
      pdfHeight,
      screenLeft: screenTx[4],
      screenTop: screenTx[5] - screenFontHeight,
      screenWidth: pdfWidth * scale,
      screenHeight: screenFontHeight * 1.2,
    });
    itemIndex++;
  }

  const canvasDataUrl = canvas.toDataURL("image/png");
  await doc.destroy();

  return {
    canvasDataUrl,
    displayWidth: viewport.width,
    displayHeight: viewport.height,
    pdfPageWidth: viewport.width / scale,
    pdfPageHeight: viewport.height / scale,
    items,
  };
}

export interface ExportPageInput {
  file: File;
  pageIndex: number;
  rotation: number;
  /** itemIndex -> modifica applicata, solo per i frammenti effettivamente modificati. */
  edits: Map<number, TextEdit>;
  /** Elementi di testo della pagina, per sapere dove disegnare copertura + nuovo testo. */
  items: PdfTextItem[];
  /** Testo libero, immagini e firme aggiunti dall'utente su questa pagina. */
  elements: FreeElement[];
}

/** Genera il PDF finale: copre con un rettangolo bianco ogni testo modificato e disegna sopra il nuovo testo (con font/dimensione/riquadro scelti dall'utente), poi applica la rotazione. */
export async function exportPdf(pages: ExportPageInput[]): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");

  const standardFontMap: Record<FontFamilyOption, (typeof StandardFonts)[keyof typeof StandardFonts]> = {
    Helvetica: StandardFonts.Helvetica,
    HelveticaBold: StandardFonts.HelveticaBold,
    TimesRoman: StandardFonts.TimesRoman,
    TimesRomanBold: StandardFonts.TimesRomanBold,
    Courier: StandardFonts.Courier,
  };

  const output = await PDFDocument.create();
  const fontCache = new Map<FontFamilyOption, Awaited<ReturnType<typeof output.embedFont>>>();

  async function getFont(family: FontFamilyOption) {
    let font = fontCache.get(family);
    if (!font) {
      font = await output.embedFont(standardFontMap[family]);
      fontCache.set(family, font);
    }
    return font;
  }

  const sourceCache = new Map<File, Awaited<ReturnType<typeof PDFDocument.load>>>();
  const imageCache = new Map<string, Awaited<ReturnType<typeof output.embedPng>>>();

  async function getEmbeddedImage(dataUrl: string) {
    let image = imageCache.get(dataUrl);
    if (!image) {
      image = await output.embedPng(dataUrlToBytes(dataUrl));
      imageCache.set(dataUrl, image);
    }
    return image;
  }

  for (const pageInfo of pages) {
    let sourcePdf = sourceCache.get(pageInfo.file);
    if (!sourcePdf) {
      const bytes = await pageInfo.file.arrayBuffer();
      sourcePdf = await PDFDocument.load(bytes);
      sourceCache.set(pageInfo.file, sourcePdf);
    }

    const [copiedPage] = await output.copyPages(sourcePdf, [pageInfo.pageIndex]);

    for (const [itemIndex, edit] of pageInfo.edits.entries()) {
      const item = pageInfo.items.find((candidate) => candidate.itemIndex === itemIndex);
      if (!item) continue;

      const x = item.pdfX + edit.offsetX;
      const y = item.pdfY + edit.offsetY;

      copiedPage.drawRectangle({
        x: x - 1,
        y: y - edit.height * 0.25,
        width: edit.width + 2,
        height: edit.height * 1.3,
        color: rgb(1, 1, 1),
      });

      if (edit.text.trim().length > 0) {
        const font = await getFont(edit.fontFamily);
        copiedPage.drawText(edit.text, {
          x,
          y,
          size: edit.fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      }
    }

    for (const element of pageInfo.elements) {
      const bottomY = element.y - element.height;

      if (element.type === "text") {
        if (element.text.trim().length === 0) continue;
        const font = await getFont(element.fontFamily);
        copiedPage.drawText(element.text, {
          x: element.x,
          y: bottomY + Math.max(2, (element.height - element.fontSize) / 2),
          size: element.fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      } else {
        const embedded = await getEmbeddedImage(element.dataUrl);
        copiedPage.drawImage(embedded, {
          x: element.x,
          y: bottomY,
          width: element.width,
          height: element.height,
        });
      }
    }

    if (pageInfo.rotation !== 0) {
      const currentAngle = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((currentAngle + pageInfo.rotation) % 360));
    }

    output.addPage(copiedPage);
  }

  return output.save();
}
