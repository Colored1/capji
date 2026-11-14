import About from "@/components/About";
import Services from "@/components/Services";
import RequestForm from "@/components/RequestForm";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import PortfolioGallery from "@/components/PortfolioGallery";
import { getPortfolio } from "@/lib/data";
import { getHeroSlides } from "@/lib/hero";
import { site } from "@/lib/site";

export const revalidate = 60;

export default async function Home() {
  const [data, slides] = await Promise.all([getPortfolio(), getHeroSlides()]);
  return (
    <main id="top">
      <HeroSlider slides={slides} name={site.ownerName} subtitle={site.tagline} />
      <About settings={data.settings} />
      <PortfolioGallery data={data} />
      <Services />
      <RequestForm />
      <Footer />
    </main>
  );
}
