import { Account } from "@/components/site/Account";
import { Booking } from "@/components/site/Booking";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Gallery } from "@/components/site/Gallery";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { MoodSliders } from "@/components/site/MoodSliders";
import { PanelProvider } from "@/components/site/panels";
import { RevealOnScroll } from "@/components/site/RevealOnScroll";
import { Services } from "@/components/site/Services";
import { Ticker } from "@/components/site/Ticker";
import { WhyUs } from "@/components/site/WhyUs";

/** Home page: same sections, in the same order, as the original website. */
export default function HomePage() {
  return (
    <PanelProvider>
      <Header />
      <main>
        <Hero />
        <Ticker />
        <MoodSliders />
        <WhyUs />
        <Services />
        <Gallery />
        <Booking />
        <Account />
        <Contact />
      </main>
      <Footer />
      <RevealOnScroll />
    </PanelProvider>
  );
}
