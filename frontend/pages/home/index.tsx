"use client";

import React from "react";
import Navbar from "../../ui/navbar/Navbar";
import HeroSection from "./HeroSection";
import TutorialSection from "./TutorialSection";
import FeaturesSection from "./FeaturesSection";
import TopicsSection from "./TopicsSection";
import DemoSection from "./DemoSection";
import Footer from "../../ui/footer/Footer";

export default function HomePage() {
  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <HeroSection />
      <TutorialSection />
      <FeaturesSection />
      <TopicsSection />
      <DemoSection />
      <Footer />
    </div>
  );
}
