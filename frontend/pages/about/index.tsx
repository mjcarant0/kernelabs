import React from "react";
import Navbar from "../../ui/navbar/Navbar";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import DevSection from "./DevSection";
import Footer from "../../ui/footer/Footer";

export default function AboutPage() {
  return (
    <div className="section-atmosphere bg-(--bg-primary) text-(--text-primary) transition-colors duration-300">
      <Navbar />
      <main className="min-h-screen">
        <HeroSection />
        <div className="mx-auto max-w-7xl">
          <AboutSection />
          <DevSection />
        </div>
        <Footer />
      </main>
    </div>
  );
}
