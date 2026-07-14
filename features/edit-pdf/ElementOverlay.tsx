"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { X } from "lucide-react";
import { FONT_OPTIONS, type FontFamilyOption, type FreeElement } from "./pdfEngine";

interface ScreenRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface ElementOverlayProps {
  element: FreeElement;
  rect: ScreenRect;
  scale: number;
  /** Le maniglie di spostamento/ridimensionamento presumono pagina a rotazione 0: nascoste quando la pagina è ruotata, come già avviene per il testo esistente. */
  allowDrag: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  onTextChange: (text: string) => void;
  onFontChange: (fontFamily: FontFamilyOption) => void;
  onFontSizeChange: (fontSize: number) => void;
  onDelete: () => void;
  onStartMove: (event: ReactPointerEvent) => void;
  onStartResize: (event: ReactPointerEvent) => void;
}

/**
 * Mostra un singolo elemento libero (testo, immagine o firma) sulla pagina
 * e gestisce selezione, spostamento e ridimensionamento. Riutilizzabile per
 * tutti e tre i tipi, così EditPdfTool.tsx non deve reimplementare la stessa
 * logica di interazione tre volte (regola di singola responsabilità,
 * docs/DESIGN_SYSTEM.md §9).
 */
export default function ElementOverlay({
  element,
  rect,
  scale,
  allowDrag,
  isSelected,
  onSelect,
  onDeselect,
  onTextChange,
  onFontChange,
  onFontSizeChange,
  onDelete,
  onStartMove,
  onStartResize,
}: ElementOverlayProps) {
  const fontOption =
    element.type === "text"
      ? FONT_OPTIONS.find((option) => option.value === element.fontFamily) ?? FONT_OPTIONS[0]
      : null;

  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        if (!isSelected) onSelect();
      }}
      style={{
        position: "absolute",
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        outline: isSelected ? "1px solid #4f46e5" : "1px dashed transparent",
        background: element.type === "text" ? "white" : "transparent",
      }}
      className={element.type !== "text" ? "hover:outline hover:outline-1 hover:outline-accent" : undefined}
    >
      {element.type === "text" ? (
        isSelected ? (
          <input
            autoFocus
            value={element.text}
            onChange={(event) => onTextChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === "Escape") {
                event.preventDefault();
                onDeselect();
              }
            }}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              padding: 0,
              outline: "none",
              background: "transparent",
              fontSize: element.fontSize * scale,
              fontFamily: fontOption?.cssFont,
            }}
          />
        ) : (
          <span
            onClick={onSelect}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              overflow: "hidden",
              whiteSpace: "nowrap",
              cursor: "text",
              fontSize: element.fontSize * scale,
              fontFamily: fontOption?.cssFont,
            }}
          >
            {element.text}
          </span>
        )
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={element.dataUrl}
          alt={element.type === "signature" ? "Firma aggiunta" : "Immagine aggiunta"}
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
        />
      )}

      {isSelected && (
        <>
          <div
            onPointerDown={(event) => event.stopPropagation()}
            className="flex items-center gap-1 rounded-lg border border-border bg-white p-1 shadow-sm"
            style={{ position: "absolute", left: 0, top: -48, zIndex: 20, whiteSpace: "nowrap" }}
          >
            {element.type === "text" && (
              <>
                <select
                  value={element.fontFamily}
                  onChange={(event) => onFontChange(event.target.value as FontFamilyOption)}
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
                  value={Math.round(element.fontSize)}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (!Number.isNaN(value)) onFontSizeChange(value);
                  }}
                  className="w-12 rounded border border-border px-1 py-0.5 text-xs text-gray-900"
                />
              </>
            )}
            <button
              type="button"
              onClick={onDelete}
              aria-label="Elimina elemento"
              className="rounded p-1 text-gray-500 transition-colors duration-[180ms] ease-out hover:text-error"
            >
              <X size={24} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={onDeselect}
              className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white transition-colors duration-[180ms] ease-out hover:bg-accent-hover"
            >
              Fatto
            </button>
          </div>

          {allowDrag && (
            <div
              onPointerDown={(event) => onStartMove(event)}
              title="Trascina per spostare"
              style={{
                position: "absolute",
                left: -20,
                top: -20,
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "move",
                touchAction: "none",
                zIndex: 20,
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#4f46e5" }} />
            </div>
          )}
          {allowDrag && (
            <div
              onPointerDown={(event) => onStartResize(event)}
              title="Trascina per ridimensionare"
              style={{
                position: "absolute",
                right: -20,
                bottom: -20,
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "nwse-resize",
                touchAction: "none",
                zIndex: 20,
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#4f46e5" }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
