"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Eraser, PenTool, Type, X } from "lucide-react";

interface SignaturePadProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (dataUrl: string, width: number, height: number) => void;
}

type Mode = "draw" | "write";

const CANVAS_WIDTH = 440;
const CANVAS_HEIGHT = 160;

/**
 * Finestra per creare una firma: disegnata a mano libera (mouse o tocco) o
 * scritta e trasformata in stile corsivo. In entrambi i casi il risultato è
 * un'immagine PNG con sfondo trasparente, così può essere posizionata come
 * qualsiasi altro elemento libero sulla pagina.
 */
export default function SignaturePad({ open, onCancel, onConfirm }: SignaturePadProps) {
  const [mode, setMode] = useState<Mode>("draw");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [typedName, setTypedName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  if (!open) return null;

  function getContext() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const ctx = getContext();
    if (!ctx) return;
    isDrawingRef.current = true;
    const rect = event.currentTarget.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;
    const ctx = getContext();
    if (!ctx) return;
    const rect = event.currentTarget.getBoundingClientRect();
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111111";
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
    if (!hasDrawn) setHasDrawn(true);
  }

  function handlePointerUp() {
    isDrawingRef.current = false;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  function renderTypedSignature(text: string): { dataUrl: string; width: number; height: number } {
    const fontSize = 56;
    const fontFamily = "'Brush Script MT', 'Segoe Script', cursive";
    const measure = document.createElement("canvas").getContext("2d")!;
    measure.font = `${fontSize}px ${fontFamily}`;
    const textWidth = measure.measureText(text).width;

    const paddingX = 20;
    const width = Math.max(140, Math.ceil(textWidth) + paddingX * 2);
    const height = Math.ceil(fontSize * 1.5);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = "#111111";
    ctx.textBaseline = "middle";
    ctx.fillText(text, paddingX, height / 2);

    return { dataUrl: canvas.toDataURL("image/png"), width, height };
  }

  function handleConfirm() {
    if (mode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      onConfirm(canvas.toDataURL("image/png"), canvas.width, canvas.height);
    } else {
      const trimmed = typedName.trim();
      if (!trimmed) return;
      const { dataUrl, width, height } = renderTypedSignature(trimmed);
      onConfirm(dataUrl, width, height);
    }
    reset();
  }

  function handleCancel() {
    reset();
    onCancel();
  }

  function reset() {
    clearCanvas();
    setTypedName("");
    setMode("draw");
  }

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-[180ms] ease-out ${
      active ? "border border-border bg-white text-gray-900" : "text-gray-500 hover:text-gray-700"
    }`;

  const canConfirm = mode === "draw" ? hasDrawn : typedName.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Aggiungi firma</h3>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Chiudi"
            className="rounded-full p-1 text-gray-500 transition-colors duration-[180ms] ease-out hover:text-secondary"
          >
            <X size={24} strokeWidth={1.75} />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-1 rounded-full bg-surface p-1">
          <button type="button" onClick={() => setMode("draw")} className={tabClass(mode === "draw")}>
            <PenTool size={24} strokeWidth={1.75} aria-hidden="true" />
            Disegna
          </button>
          <button type="button" onClick={() => setMode("write")} className={tabClass(mode === "write")}>
            <Type size={24} strokeWidth={1.75} aria-hidden="true" />
            Scrivi
          </button>
        </div>

        {mode === "draw" ? (
          <div>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{ touchAction: "none" }}
              className="w-full cursor-crosshair rounded-xl border border-border bg-surface"
            />
            <button
              type="button"
              onClick={clearCanvas}
              className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors duration-[180ms] ease-out hover:text-error"
            >
              <Eraser size={24} strokeWidth={1.75} aria-hidden="true" />
              Cancella
            </button>
          </div>
        ) : (
          <div>
            <input
              autoFocus
              value={typedName}
              onChange={(event) => setTypedName(event.target.value)}
              placeholder="Il tuo nome"
              className="w-full rounded-xl border border-border p-3 text-base text-gray-900 focus:border-accent focus:outline-none"
            />
            {typedName.trim() && (
              <div className="mt-4 flex h-24 items-center justify-center rounded-xl border border-border bg-surface px-4">
                <span style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontSize: 40 }}>
                  {typedName}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-[180ms] ease-out hover:border-secondary hover:text-secondary"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors duration-[180ms] ease-out hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Usa questa firma
          </button>
        </div>
      </div>
    </div>
  );
}
