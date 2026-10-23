import Hero from "@/components/hero/Hero";
import About from "@/components/about/About";
import Experience from "@/components/experience/Experience";
import Projects from "@/components/projects/Projects";
import Travel from "@/components/travel/Travel";
import Footer from "@/components/ui/Footer";
import SnapSection from "@/components/ui/SnapSection";
import { MonkeyProvider } from "@/components/monkey/MonkeyContext";
import Monkey from "@/components/monkey/Monkey";

export default function Home() {
  return (
    // Hero's CTA button and the Monkey overlay are siblings here, not
    // parent/child -- MonkeyProvider is what lets Hero's click reach
    // Monkey.tsx without threading state through every section between
    // them.
    <MonkeyProvider>
      <main id="top" className="flex flex-col">
        <SnapSection>
          <Hero />
        </SnapSection>

        <SnapSection>
          <About />
        </SnapSection>

        <SnapSection>
          <Experience />
        </SnapSection>

        <SnapSection>
          <Projects />
        </SnapSection>

        <SnapSection>
          <Travel />
        </SnapSection>

        {/* Footer deliberately isn't snapped -- it's a closing strip, not a
            full-page "destination" section; snapping it would mean scrolling
            past a mostly-empty final viewport. */}
        <Footer />
      </main>
      <Monkey />
    </MonkeyProvider>
  );
}
