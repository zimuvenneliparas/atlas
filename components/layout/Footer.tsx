export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-10 text-sm text-gray-600 sm:flex-row sm:justify-between">
        <span className="text-lg font-bold tracking-tight text-secondary">
          Atlas
        </span>

        <nav className="flex items-center gap-6">
          <a href="#" className="transition-colors duration-[180ms] ease-out hover:text-secondary">
            About
          </a>
          <a href="#" className="transition-colors duration-[180ms] ease-out hover:text-secondary">
            Contact
          </a>
          <a href="#" className="transition-colors duration-[180ms] ease-out hover:text-secondary">
            Privacy
          </a>
          <a href="#" className="transition-colors duration-[180ms] ease-out hover:text-secondary">
            Terms
          </a>
        </nav>

        <span>© {year} Atlas. Tutti i diritti riservati.</span>
      </div>
    </footer>
  );
}
