import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import PopularTools from "@/components/home/PopularTools";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Hero />
      <Categories />
      <PopularTools />
    </main>
  );
}