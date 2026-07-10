export default function Hero() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20 text-center">
      <h2 className="mb-6 text-5xl font-bold">
        La piattaforma AI per lavorare con i tuoi documenti
      </h2>

      <p className="mb-10 text-lg text-gray-600">
        Converti, modifica e analizza documenti e immagini in pochi secondi.
      </p>

      <input
        type="text"
        placeholder="Cerca un tool..."
        className="w-full rounded-xl border p-4 text-lg"
      />
    </section>
  );
}