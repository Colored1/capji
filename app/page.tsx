import Hero from "@/components/Hero";
import About from "@/components/About";
import Works from "@/components/Works";
import Services from "@/components/Services";
import RequestForm from "@/components/RequestForm";
import Footer from "@/components/Footer";
import { getPortfolio } from "@/lib/data";

export const revalidate = 60;

export default async function Home() {
  const data = await getPortfolio();
  return (
    <main id="top">
      <Hero />
      <About settings={data.settings} />
      <Works data={data} />
      <Services />
      <RequestForm />
      <Footer />
    </main>
  );
}
