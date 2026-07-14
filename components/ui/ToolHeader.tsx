import type { LucideIcon } from "lucide-react";

interface ToolHeaderProps {
  icon: LucideIcon;
  name: string;
  description: string;
  badge?: string;
}

/**
 * Intestazione condivisa dalle pagine di tool (/tools/[slug]) e Core App
 * (/apps/[slug]): icona, badge opzionale, titolo, descrizione. Un solo posto
 * da aggiornare se lo stile delle pagine strumento cambia in futuro.
 */
export default function ToolHeader({
  icon: Icon,
  name,
  description,
  badge,
}: ToolHeaderProps) {
  return (
    <div className="mb-10 text-center">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface">
        <Icon size={24} strokeWidth={1.75} className="text-accent" />
      </span>

      {badge && (
        <div className="mb-3">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-accent">
            {badge}
          </span>
        </div>
      )}

      <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
        {name}
      </h1>
      <p className="mx-auto max-w-2xl text-gray-600">{description}</p>
    </div>
  );
}
