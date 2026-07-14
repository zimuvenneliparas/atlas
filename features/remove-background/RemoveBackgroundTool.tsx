"use client";

import { useState, type DragEvent } from "react";
import { Download, Image as ImageIcon, Loader2, Upload } from "lucide-react";

type Status = "idle" | "processing" | "success" | "error";

export default function RemoveBackgroundTool() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFileSelected(selected: FileList | null) {
    const file = selected?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Questo file non è un'immagine. Prova con un JPG o un PNG.");
      return;
    }

    setOriginalFile(file);
    setOriginalPreview(URL.createObjectURL(file));
    setResultUrl(null);
    setStatus("idle");
    setErrorMessage(null);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelected(event.dataTransfer.files);
  }

  async function handleRemoveBackground() {
    if (!originalFile) return;

    setStatus("processing");
    setProgress(0);
    setErrorMessage(null);

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(originalFile, {
        progress: (_key: string, current: number, total: number) => {
          setProgress(total > 0 ? Math.round((current / total) * 100) : null);
        },
      });

      setResultUrl(URL.createObjectURL(blob));
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage(
        "Non sono riuscito a elaborare questa immagine. Prova con un altro file (JPG o PNG)."
      );
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-8">
      <label
        htmlFor="image-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors duration-[180ms] ease-out ${
          isDragging ? "border-accent bg-white" : "border-border bg-surface hover:border-accent"
        }`}
      >
        <Upload size={24} strokeWidth={1.75} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-900">
          Trascina qui una foto o clicca per selezionarla
        </span>
        <span className="text-xs text-gray-500">
          Il processo avviene nel tuo browser: la foto non viene mai caricata
          su un server.
        </span>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFileSelected(event.target.files)}
        />
      </label>

      {originalPreview && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
              Originale
            </p>
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalPreview}
                alt="Immagine originale"
                className="h-auto w-full object-contain"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
              Risultato
            </p>
            <div className="flex min-h-[160px] items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
              {resultUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resultUrl}
                  alt="Immagine senza sfondo"
                  className="h-auto w-full object-contain"
                />
              ) : (
                <ImageIcon
                  size={24}
                  strokeWidth={1.75}
                  className="text-gray-300"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="mt-4 text-sm text-error">{errorMessage}</p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleRemoveBackground}
          disabled={!originalFile || status === "processing"}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-white transition-colors duration-[180ms] ease-out hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "processing" ? (
            <>
              <Loader2 size={24} strokeWidth={1.75} className="animate-spin" />
              {progress !== null
                ? `Elaborazione... ${progress}%`
                : "Elaborazione..."}
            </>
          ) : (
            "Rimuovi sfondo"
          )}
        </button>

        {resultUrl && (
          <a
            href={resultUrl}
            download="atlas-senza-sfondo.png"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-3.5 text-sm font-semibold text-gray-950 transition-colors duration-[180ms] ease-out hover:border-secondary focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
          >
            <Download size={24} strokeWidth={1.75} />
            Scarica risultato
          </a>
        )}
      </div>

      {status === "processing" && (
        <p className="mt-3 text-center text-xs text-gray-500">
          Al primo utilizzo il browser scarica il modello AI (qualche decina
          di MB): le volte successive sarà più veloce.
        </p>
      )}
    </div>
  );
}
