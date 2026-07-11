export const categoryColors = {
  Documenti: {
    border: "border-blue-600/30",
    borderHover: "hover:border-blue-600",
    borderStrong: "border-blue-600",
    icon: "text-blue-600",
  },
  Immagini: {
    border: "border-pink-600/30",
    borderHover: "hover:border-pink-600",
    borderStrong: "border-pink-600",
    icon: "text-pink-600",
  },
  "Intelligenza Artificiale": {
    border: "border-violet-600/30",
    borderHover: "hover:border-violet-600",
    borderStrong: "border-violet-600",
    icon: "text-violet-600",
  },
  Dati: {
    border: "border-teal-600/30",
    borderHover: "hover:border-teal-600",
    borderStrong: "border-teal-600",
    icon: "text-teal-600",
  },
  Business: {
    border: "border-orange-600/30",
    borderHover: "hover:border-orange-600",
    borderStrong: "border-orange-600",
    icon: "text-orange-600",
  },
} as const;

export type CategoryName = keyof typeof categoryColors;
