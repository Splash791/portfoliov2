import Hero from "@/components/hero/Hero";
import About from "@/components/about/About";
import Experience from "@/components/experience/Experience";
import Projects from "@/components/projects/Projects";
import Travel from "@/components/travel/Travel";
import Writing from "@/components/writing/Writing";
import Footer from "@/components/ui/Footer";
import { getAllPosts } from "@/lib/blog";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main id="top" className="flex flex-col">
      <Hero />

      <About />

      <Experience />

      <Projects />

      <Travel />

      <Writing posts={posts} />

      <Footer />
    </main>
  );
}
