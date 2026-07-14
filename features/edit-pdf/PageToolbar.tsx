"use client";

import { useRef, type ChangeEvent } from "react";
import { ImagePlus, PenTool, Type } from "lucide-react";

interface PageToolbarProps {
  onAddText: () => void;
  onAddImage: (file: File) => void;
  onOpenSignature: () => void;
}

/**
 * Barra strumenti di una pagina: aggiunge elementi liberi (testo, immagine,
 * firma) non collegati al testo originale del PDF. Componente puramente di
 * presentazione — tutta la logica di creazione/posizionamento resta in
 * EditPdfTool.tsx, coerente con la regola di singola responsabilità.
 */
export default function PageToolbar({ onAddText, onAddImage, onOpenSignature }: PageToolbarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onAddImage(file);
    event.target.value = "";
  }

  const buttonClass =
    "flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-[180ms] ease-out hover:border-secondary hover:text-secondary";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={onAddText} className={buttonClass} title="Aggiungi una casella di testo libera sulla pagina">
        <Type size={24} strokeWidth={1.75} aria-hidden="true" />
        Aggiungi testo
      </button>

      <button
        type="button"
        onClick={() => imageInputRef.current?.click()}
        className={buttonClass}
        title="Carica un'immagine e posizionala sulla pagina"
      >
        <ImagePlus size={24} strokeWidth={1.75} aria-hidden="true" />
        Aggiungi immagine
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </button>

      <button
        type="button"
        onClick={onOpenSignature}
        className={buttonClass}
        title="Disegna o scrivi una firma da posizionare sulla pagina"
      >
        <PenTool size={24} strokeWidth={1.75} aria-hidden="true" />
        Aggiungi firma
      </button>
    </div>
  );
}
