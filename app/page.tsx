import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import PolygonMesh from "@/components/PolygonMesh";

export default function Home() {
  return (
    <>
      <PolygonMesh />
      <Navbar />
      <main className="relative z-10 overflow-x-clip">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
    </>
  );
}
