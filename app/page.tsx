import About from "@/components/About";
import Services from "@/components/Services";
import RequestForm from "@/components/RequestForm";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import PortfolioGallery from "@/components/PortfolioGallery";
import { getPortfolio } from "@/lib/data";
import { buildSlides } from "@/lib/slides";
import { site } from "@/lib/site";

export const revalidate = 60;

export default async function Home() {
  const data = await getPortfolio();
  return (
    <main id="top">
      <HeroSlider slides={buildSlides(data)} name={site.ownerName} subtitle={site.tagline} />
      <About settings={data.settings} />
      <PortfolioGallery data={data} />
      <Services />
      <RequestForm />
      <Footer />
    </main>
  );
}
