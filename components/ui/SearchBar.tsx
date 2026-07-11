import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({
  placeholder = "Cerca tra oltre 100 strumenti...",
}: SearchBarProps) {
  return (
    <div className="flex w-full items-center gap-2 rounded-full border-2 border-border bg-surface p-2 pl-5 transition-all duration-[180ms] ease-out focus-within:border-accent focus-within:bg-white">
      <Search size={24} strokeWidth={1.75} className="text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 bg-transparent p-2 text-lg text-gray-900 placeholder:text-gray-400 focus:outline-none"
      />
      <button className="rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-white transition-colors duration-[180ms] ease-out hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none">
        Cerca
      </button>
    </div>
  );
}
