export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        <h1 className="text-2xl font-bold tracking-tight">
          Atlas
        </h1>

        <nav className="flex items-center gap-8 text-sm font-medium">
          <a href="#">Tools</a>
          <a href="#">Pricing</a>
          <button className="rounded-lg border px-4 py-2">
            Login
          </button>
        </nav>

      </div>
    </header>
  );
}