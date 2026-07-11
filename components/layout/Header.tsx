export default function Header() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
            <span className="h-3.5 w-3.5 rounded-[4px] bg-white" />
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-secondary">
            Atlas
          </h1>
        </div>

        <nav className="flex items-center gap-8 text-sm font-medium">
          <a href="#" className="text-gray-600 transition-colors duration-[180ms] ease-out hover:text-secondary">
            Tools
          </a>
          <a href="#" className="text-gray-600 transition-colors duration-[180ms] ease-out hover:text-secondary">
            Pricing
          </a>
          <button className="rounded-full border border-border px-4 py-2 transition-colors duration-[180ms] ease-out hover:border-secondary hover:text-secondary focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none">
            Login
          </button>
          <button className="rounded-full bg-accent px-4 py-2 text-white transition-colors duration-[180ms] ease-out hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none">
            Premium
          </button>
        </nav>

      </div>
    </header>
  );
}