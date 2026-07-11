import SearchBar from "@/components/ui/SearchBar";

export default function Hero() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20 text-center">
      <h2 className="mx-auto mb-6 max-w-3xl text-6xl leading-tight font-bold tracking-tight text-balance text-gray-900">
        Tutti gli strumenti AI di cui hai bisogno. In un unico posto.
      </h2>

      <p className="mb-10 text-lg text-gray-600">
        Converti PDF, modifica immagini, analizza documenti e automatizza il
        tuo lavoro.
      </p>

      <SearchBar />
    </section>
  );
}