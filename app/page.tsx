import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import PopularTools from "@/components/home/PopularTools";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Header />
      <Hero />
      <Categories />
      <PopularTools />
      <Footer />
    </main>
  );
}