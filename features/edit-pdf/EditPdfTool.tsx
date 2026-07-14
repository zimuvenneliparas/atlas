"use client";

import { useEffect, useState, type ChangeEvent, type DragEvent, type MouseEvent as ReactMouseEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Loader2,
  RotateCw,
  Upload,
  X,
} from "lucide-react";
import {
  getPageCount,
  renderPage,
  exportPdf,
  createDefaultEdit,
  createDefaultFreeText,
  createImageFreeElement,
  createSignatureFreeElement,
  fileToPngDataUrl,
  freeElementScreenRect,
  FONT_OPTIONS,
  RENDER_SCALE,
  type RenderedPage,
  type PdfTextItem,
  type TextEdit,
  type FontFamilyOption,
  type FreeElement,
} from "./pdfEngine";
import PageToolbar from "./PageToolbar";
import SignaturePad from "./SignaturePad";
import ElementOverlay from "./ElementOverlay";

type ExportStatus = "idle" | "processing" | "success" | "error";

interface PageState {
  id: string;
  file: File;
  fileName: string;
  pageIndex: number;
  rotation: 0 | 90 | 180 | 270;
  edits: Map<number, TextEdit>;
  /** Testo libero, immagini e firme aggiunti dall'utente su questa pagina, indicizzati per id elemento. */
  elements: Map<string, FreeElement>;
  render: RenderedPage | null;
  renderError: string | null;
}

export default function EditPdfTool() {
  const [pages, setPages] = useState<PageState[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(null);
  const [signatureTargetPageId, setSignatureTargetPageId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Renderizza una pagina alla volta: appena una pagina ottiene il suo
  // "render", questo effetto si riattiva e passa alla prossima ancora senza.
  useEffect(() => {
    const pending = pages.find((page) => !page.render && !page.renderError);
    if (!pending) return;

    let cancelled = false;

    renderPage(pending.file, pending.pageIndex)
      .then((render) => {
        if (cancelled) return;
        setPages((prev) =>
          prev.map((page) => (page.id === pending.id ? { ...page, render } : page))
        );
      })
      .catch((error) => {
        console.error(error);
        if (cancelled) return;
        setPages((prev) =>
          prev.map((page) =>
            page.id === pending.id
              ? {
                  ...page,
                  renderError:
                    "Non sono riuscito a visualizzare questa pagina (file danneggiato o protetto).",
                }
              : page
          )
        );
      });

    return () => {
      cancelled = true;
    };
  }, [pages]);

  async function processFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const allFiles = Array.from(fileList);
    const pdfFiles = allFiles.filter((file) => file.type === "application/pdf");
    const skippedNonPdf = allFiles.length - pdfFiles.length;

    setIsLoadingFiles(true);
    setErrorMessage(null);
    setWarningMessage(null);

    const newPages: PageState[] = [];
    const failedFiles: string[] = [];

    for (const file of pdfFiles) {
      try {
        const pageCount = await getPageCount(file);
        for (let i = 0; i < pageCount; i++) {
          newPages.push({
            id: crypto.randomUUID(),
            file,
            fileName: file.name,
            pageIndex: i,
            rotation: 0,
            edits: new Map(),
            elements: new Map(),
            render: null,
            renderError: null,
          });
        }
      } catch (error) {
        console.error(error);
        failedFiles.push(file.name);
      }
    }

    setPages((prev) => [...prev, ...newPages]);
    setIsLoadingFiles(false);

    const warnings: string[] = [];
    if (skippedNonPdf > 0) {
      warnings.push(
        `${skippedNonPdf} file ${skippedNonPdf === 1 ? "non era un PDF ed è stato ignorato" : "non erano PDF e sono stati ignorati"}.`
      );
    }
    if (failedFiles.length > 0) {
      warnings.push(
        `Non sono riuscito a leggere: ${failedFiles.join(", ")} (potrebbero essere protetti da password o danneggiati).`
      );
    }
    if (warnings.length > 0) {
      setWarningMessage(warnings.join(" "));
    }
  }

  async function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    await processFiles(event.target.files);
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    await processFiles(event.dataTransfer.files);
  }

  function removePage(id: string) {
    setPages((prev) => prev.filter((page) => page.id !== id));
    setEditingKey(null);
    setSelectedElementKey(null);
  }

  function movePage(index: number, direction: -1 | 1) {
    setPages((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function rotatePage(id: string) {
    setPages((prev) =>
      prev.map((page) =>
        page.id === id
          ? { ...page, rotation: (((page.rotation + 90) % 360) as PageState["rotation"]) }
          : page
      )
    );
    setEditingKey(null);
    setSelectedElementKey(null);
  }

  function updateEdit(pageId: string, item: PdfTextItem, updater: (prev: TextEdit) => TextEdit) {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        const edits = new Map(page.edits);
        const current = edits.get(item.itemIndex) ?? createDefaultEdit(item);
        edits.set(item.itemIndex, updater(current));
        return { ...page, edits };
      })
    );
  }

  function startEditing(pageId: string, item: PdfTextItem) {
    updateEdit(pageId, item, (prev) => prev);
    setEditingKey(`${pageId}:${item.itemIndex}`);
  }

  function restoreOriginal(pageId: string, itemIndex: number) {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        const edits = new Map(page.edits);
        edits.delete(itemIndex);
        return { ...page, edits };
      })
    );
    setEditingKey(null);
  }

  /** Chiude l'editing: se l'utente non ha davvero cambiato nulla rispetto al testo originale, rimuove la modifica vuota invece di lasciarla nell'export. */
  function closeEditing(pageId: string, item: PdfTextItem) {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        const current = page.edits.get(item.itemIndex);
        if (!current) return page;

        const isUnchanged =
          current.text === item.str &&
          current.offsetX === 0 &&
          current.offsetY === 0 &&
          current.width === item.pdfWidth &&
          current.height === item.pdfHeight &&
          current.fontFamily === "Helvetica";

        if (!isUnchanged) return page;

        const edits = new Map(page.edits);
        edits.delete(item.itemIndex);
        return { ...page, edits };
      })
    );
    setEditingKey(null);
  }

  function startMove(pageId: string, item: PdfTextItem, edit: TextEdit, event: ReactMouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const initialOffsetX = edit.offsetX;
    const initialOffsetY = edit.offsetY;

    function onMove(moveEvent: globalThis.MouseEvent) {
      const dx = (moveEvent.clientX - startX) / RENDER_SCALE;
      const dy = (moveEvent.clientY - startY) / RENDER_SCALE;
      updateEdit(pageId, item, (prev) => ({
        ...prev,
        offsetX: initialOffsetX + dx,
        offsetY: initialOffsetY - dy,
      }));
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function startResize(pageId: string, item: PdfTextItem, edit: TextEdit, event: ReactMouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const initialWidth = edit.width;
    const initialHeight = edit.height;

    function onMove(moveEvent: globalThis.MouseEvent) {
      const dx = (moveEvent.clientX - startX) / RENDER_SCALE;
      const dy = (moveEvent.clientY - startY) / RENDER_SCALE;
      updateEdit(pageId, item, (prev) => ({
        ...prev,
        width: Math.max(8, initialWidth + dx),
        height: Math.max(4, initialHeight + dy),
      }));
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function updateElement(pageId: string, elementId: string, updater: (prev: FreeElement) => FreeElement) {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        const current = page.elements.get(elementId);
        if (!current) return page;
        const elements = new Map(page.elements);
        elements.set(elementId, updater(current));
        return { ...page, elements };
      })
    );
  }

  function addTextElement(pageId: string) {
    const page = pages.find((candidate) => candidate.id === pageId);
    if (!page?.render) return;
    const element = createDefaultFreeText(page.render.pdfPageWidth, page.render.pdfPageHeight);
    setPages((prev) =>
      prev.map((candidate) =>
        candidate.id === pageId
          ? { ...candidate, elements: new Map(candidate.elements).set(element.id, element) }
          : candidate
      )
    );
    setSelectedElementKey(`${pageId}:${element.id}`);
  }

  async function addImageElement(pageId: string, file: File) {
    const page = pages.find((candidate) => candidate.id === pageId);
    if (!page?.render) return;
    try {
      const { dataUrl, width, height } = await fileToPngDataUrl(file);
      const element = createImageFreeElement(dataUrl, width, height, page.render.pdfPageWidth, page.render.pdfPageHeight);
      setPages((prev) =>
        prev.map((candidate) =>
          candidate.id === pageId
            ? { ...candidate, elements: new Map(candidate.elements).set(element.id, element) }
            : candidate
        )
      );
      setSelectedElementKey(`${pageId}:${element.id}`);
    } catch (error) {
      console.error(error);
      setErrorMessage("Non sono riuscito a caricare questa immagine. Prova con un altro file.");
    }
  }

  function openSignaturePad(pageId: string) {
    setSignatureTargetPageId(pageId);
  }

  function handleSignatureConfirm(dataUrl: string, width: number, height: number) {
    const pageId = signatureTargetPageId;
    setSignatureTargetPageId(null);
    if (!pageId) return;
    const page = pages.find((candidate) => candidate.id === pageId);
    if (!page?.render) return;
    const element = createSignatureFreeElement(dataUrl, width, height, page.render.pdfPageWidth, page.render.pdfPageHeight);
    setPages((prev) =>
      prev.map((candidate) =>
        candidate.id === pageId
          ? { ...candidate, elements: new Map(candidate.elements).set(element.id, element) }
          : candidate
      )
    );
    setSelectedElementKey(`${pageId}:${element.id}`);
  }

  function deleteElement(pageId: string, elementId: string) {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        const elements = new Map(page.elements);
        elements.delete(elementId);
        return { ...page, elements };
      })
    );
    setSelectedElementKey((prev) => (prev === `${pageId}:${elementId}` ? null : prev));
  }

  function startMoveElement(pageId: string, elementId: string, element: FreeElement, event: ReactMouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const initialX = element.x;
    const initialY = element.y;

    function onMove(moveEvent: globalThis.MouseEvent) {
      const dx = (moveEvent.clientX - startX) / RENDER_SCALE;
      const dy = (moveEvent.clientY - startY) / RENDER_SCALE;
      updateElement(pageId, elementId, (prev) => ({ ...prev, x: initialX + dx, y: initialY - dy }));
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function startResizeElement(pageId: string, elementId: string, element: FreeElement, event: ReactMouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const initialWidth = element.width;
    const initialHeight = element.height;

    function onMove(moveEvent: globalThis.MouseEvent) {
      const dx = (moveEvent.clientX - startX) / RENDER_SCALE;
      const dy = (moveEvent.clientY - startY) / RENDER_SCALE;
      updateElement(pageId, elementId, (prev) => ({
        ...prev,
        width: Math.max(8, initialWidth + dx),
        height: Math.max(8, initialHeight + dy),
      }));
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  async function handleExport() {
    if (pages.length === 0) return;

    setExportStatus("processing");
    setErrorMessage(null);

    try {
      const bytes = await exportPdf(
        pages.map((page) => ({
          file: page.file,
          pageIndex: page.pageIndex,
          rotation: page.rotation,
          edits: page.edits,
          items: page.render?.items ?? [],
          elements: Array.from(page.elements.values()),
        }))
      );

      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "atlas-modifica-pdf.pdf";
      link.click();
      URL.revokeObjectURL(url);

      setExportStatus("success");
    } catch (error) {
      console.error(error);
      setExportStatus("error");
      setErrorMessage("Non sono riuscito a generare il PDF. Riprova.");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-8">
      <label
        htmlFor="edit-pdf-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors duration-[180ms] ease-out ${
          isDragging ? "border-accent bg-white" : "border-border bg-surface hover:border-accent"
        }`}
      >
        <Upload size={24} strokeWidth={1.75} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-900">
          Trascina qui uno o più PDF o clicca per selezionarli
        </span>
        <span className="text-xs text-gray-500">
          Poi clicca su un testo nella pagina per modificarlo: puoi cambiare
          contenuto, font, dimensione e ridimensionare il riquadro. Tutto
          avviene nel tuo browser, i file non vengono mai caricati su un
          server.
        </span>
        <input
          id="edit-pdf-upload"
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </label>

      {isLoadingFiles && (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 size={24} strokeWidth={1.75} className="animate-spin" />
          Lettura dei file in corso...
        </p>
      )}

      {warningMessage && <p className="mt-4 text-sm text-warning">{warningMessage}</p>}
      {errorMessage && <p className="mt-4 text-sm text-error">{errorMessage}</p>}
      {exportStatus === "success" && (
        <p className="mt-4 text-sm text-success">
          PDF generato con successo — il download dovrebbe essere partito.
        </p>
      )}

      {pages.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm text-gray-600">
          <span className="font-medium text-gray-900">Come funziona: </span>
          clicca su un testo del PDF per modificarlo — cambia contenuto, font e
          dimensione dalla barra che appare sopra il riquadro. Trascina il
          pallino in alto a sinistra per spostarlo, quello in basso a destra
          per ridimensionarlo; &quot;Ripristina&quot; annulla la singola
          modifica. Con i pulsanti sopra ogni pagina puoi anche aggiungere
          testo libero, immagini e la tua firma.
        </div>
      )}

      {pages.length > 0 && (
        <div className="mt-6 flex flex-col gap-6">
          {pages.map((page, index) => (
            <div key={page.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="truncate text-xs text-gray-500">
                  {page.fileName} — pagina {page.pageIndex + 1}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => rotatePage(page.id)}
                    aria-label="Ruota pagina di 90 gradi"
                    className="rounded-full p-1 text-gray-500 transition-colors duration-[180ms] ease-out hover:text-secondary"
                  >
                    <RotateCw size={24} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePage(index, -1)}
                    disabled={index === 0}
                    aria-label="Sposta su"
                    className="rounded-full p-1 text-gray-500 transition-colors duration-[180ms] ease-out hover:text-secondary disabled:opacity-30"
                  >
                    <ArrowUp size={24} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePage(index, 1)}
                    disabled={index === pages.length - 1}
                    aria-label="Sposta giù"
                    className="rounded-full p-1 text-gray-500 transition-colors duration-[180ms] ease-out hover:text-secondary disabled:opacity-30"
                  >
                    <ArrowDown size={24} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePage(page.id)}
                    aria-label="Elimina pagina"
                    className="rounded-full p-1 text-gray-500 transition-colors duration-[180ms] ease-out hover:text-error"
                  >
                    <X size={24} strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              {page.renderError && (
                <p className="text-sm text-error">{page.renderError}</p>
              )}

              {!page.render && !page.renderError && (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 size={24} strokeWidth={1.75} className="animate-spin text-gray-400" />
                </div>
              )}

              {page.render && (
                <div className="mb-3">
                  <PageToolbar
                    onAddText={() => addTextElement(page.id)}
                    onAddImage={(file) => addImageElement(page.id, file)}
                    onOpenSignature={() => openSignaturePad(page.id)}
                  />
                </div>
              )}

              {page.render && (
                <div className="overflow-auto rounded-lg border border-border bg-white p-6">
                  <div
                    style={{
                      position: "relative",
                      width: page.render.displayWidth,
                      height: page.render.displayHeight,
                      transform: `rotate(${page.rotation}deg)`,
                      transformOrigin: "center center",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={page.render.canvasDataUrl}
                      alt={`Pagina ${page.pageIndex + 1} di ${page.fileName}`}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: page.render.displayWidth,
                        height: page.render.displayHeight,
                      }}
                    />

                    {page.render.items.map((item) => {
                      const key = `${page.id}:${item.itemIndex}`;
                      const isEditing = editingKey === key;
                      const edit = page.edits.get(item.itemIndex);

                      if (!isEditing && !edit) {
                        return (
                          <div
                            key={key}
                            onClick={() => startEditing(page.id, item)}
                            title="Clicca per modificare questo testo"
                            className="cursor-text hover:outline hover:outline-1 hover:outline-accent"
                            style={{
                              position: "absolute",
                              left: item.screenLeft,
                              top: item.screenTop,
                              width: item.screenWidth,
                              height: item.screenHeight,
                            }}
                          />
                        );
                      }

                      const active = edit ?? createDefaultEdit(item);
                      const fontOption =
                        FONT_OPTIONS.find((option) => option.value === active.fontFamily) ??
                        FONT_OPTIONS[0];
                      const screenLeft = item.screenLeft + active.offsetX * RENDER_SCALE;
                      const screenTop = item.screenTop - active.offsetY * RENDER_SCALE;
                      const screenWidth = active.width * RENDER_SCALE;
                      const screenHeight = active.height * RENDER_SCALE;

                      return (
                        <div
                          key={key}
                          style={{
                            position: "absolute",
                            left: screenLeft,
                            top: screenTop,
                            width: screenWidth,
                            height: screenHeight,
                            background: "white",
                            outline: isEditing ? "1px solid #4f46e5" : "none",
                          }}
                        >
                          {isEditing ? (
                            <input
                              autoFocus
                              value={active.text}
                              onChange={(event) =>
                                updateEdit(page.id, item, (prev) => ({
                                  ...prev,
                                  text: event.target.value,
                                }))
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  closeEditing(page.id, item);
                                }
                                if (event.key === "Escape") {
                                  closeEditing(page.id, item);
                                }
                              }}
                              style={{
                                width: "100%",
                                height: "100%",
                                border: "none",
                                padding: 0,
                                outline: "none",
                                background: "transparent",
                                fontSize: active.fontSize * RENDER_SCALE,
                                fontFamily: fontOption.cssFont,
                              }}
                            />
                          ) : (
                            <span
                              onClick={() => setEditingKey(key)}
                              style={{
                                display: "block",
                                width: "100%",
                                height: "100%",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                cursor: "text",
                                fontSize: active.fontSize * RENDER_SCALE,
                                fontFamily: fontOption.cssFont,
                              }}
                            >
                              {active.text}
                            </span>
                          )}

                          {isEditing && (
                            <>
                              <div
                                onMouseDown={(event) => event.stopPropagation()}
                                className="flex items-center gap-1 rounded-lg border border-border bg-white p-1 shadow-sm"
                                style={{
                                  position: "absolute",
                                  left: 0,
                                  top: -44,
                                  zIndex: 20,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <select
                                  value={active.fontFamily}
                                  onChange={(event) =>
                                    updateEdit(page.id, item, (prev) => ({
                                      ...prev,
                                      fontFamily: event.target.value as FontFamilyOption,
                                    }))
                                  }
                                  className="rounded border border-border px-1 py-0.5 text-xs text-gray-900"
                                >
                                  {FONT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  min={4}
                                  max={72}
                                  value={Math.round(active.fontSize)}
                                  onChange={(event) => {
                                    const value = Number(event.target.value);
                                    if (Number.isNaN(value)) return;
                                    updateEdit(page.id, item, (prev) => ({
                                      ...prev,
                                      fontSize: value,
                                    }));
                                  }}
                                  className="w-12 rounded border border-border px-1 py-0.5 text-xs text-gray-900"
                                />
                                <button
                                  type="button"
                                  onClick={() => restoreOriginal(page.id, item.itemIndex)}
                                  className="px-1.5 py-0.5 text-xs text-gray-500 hover:text-error"
                                >
                                  Ripristina
                                </button>
                                <button
                                  type="button"
                                  onClick={() => closeEditing(page.id, item)}
                                  className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white hover:bg-accent-hover"
                                >
                                  Fatto
                                </button>
                              </div>

                              {page.rotation === 0 && (
                                <div
                                  onMouseDown={(event) => startMove(page.id, item, active, event)}
                                  title="Trascina per spostare"
                                  style={{
                                    position: "absolute",
                                    left: -8,
                                    top: -8,
                                    width: 14,
                                    height: 14,
                                    borderRadius: "50%",
                                    background: "#4f46e5",
                                    cursor: "move",
                                    zIndex: 20,
                                  }}
                                />
                              )}

                              {page.rotation === 0 && (
                                <div
                                  onMouseDown={(event) => startResize(page.id, item, active, event)}
                                  title="Trascina per ridimensionare"
                                  style={{
                                    position: "absolute",
                                    right: -8,
                                    bottom: -8,
                                    width: 14,
                                    height: 14,
                                    borderRadius: "50%",
                                    background: "#4f46e5",
                                    cursor: "nwse-resize",
                                    zIndex: 20,
                                  }}
                                />
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}

                    {Array.from(page.elements.entries()).map(([elementId, element]) => {
                      const key = `${page.id}:${elementId}`;
                      const rect = freeElementScreenRect(element, page.render!.pdfPageHeight, RENDER_SCALE);
                      return (
                        <ElementOverlay
                          key={key}
                          element={element}
                          rect={rect}
                          scale={RENDER_SCALE}
                          allowDrag={page.rotation === 0}
                          isSelected={selectedElementKey === key}
                          onSelect={() => setSelectedElementKey(key)}
                          onDeselect={() => setSelectedElementKey(null)}
                          onTextChange={(text) =>
                            updateElement(page.id, elementId, (prev) => (prev.type === "text" ? { ...prev, text } : prev))
                          }
                          onFontChange={(fontFamily) =>
                            updateElement(page.id, elementId, (prev) =>
                              prev.type === "text" ? { ...prev, fontFamily } : prev
                            )
                          }
                          onFontSizeChange={(fontSize) =>
                            updateElement(page.id, elementId, (prev) => (prev.type === "text" ? { ...prev, fontSize } : prev))
                          }
                          onDelete={() => deleteElement(page.id, elementId)}
                          onStartMove={(event) => startMoveElement(page.id, elementId, element, event)}
                          onStartResize={(event) => startResizeElement(page.id, elementId, element, event)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleExport}
        disabled={pages.length === 0 || exportStatus === "processing"}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-white transition-colors duration-[180ms] ease-out hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {exportStatus === "processing" ? (
          <>
            <Loader2 size={24} strokeWidth={1.75} className="animate-spin" />
            Generazione in corso...
          </>
        ) : (
          <>
            <Download size={24} strokeWidth={1.75} />
            Esporta PDF
          </>
        )}
      </button>

      {pages.length === 0 && !isLoadingFiles && (
        <p className="mt-3 text-center text-xs text-gray-500">
          Carica almeno un PDF per iniziare a modificarlo.
        </p>
      )}

      <SignaturePad
        open={signatureTargetPageId !== null}
        onCancel={() => setSignatureTargetPageId(null)}
        onConfirm={handleSignatureConfirm}
      />
    </div>
  );
}
