import React from "react";
import HeroSection from "../components/landing/Hero";
import AboutSection from "../components/landing/About";
import StatsSection from "../components/landing/Stats";
import AISection from "../components/landing/AISection";
import ProductPreview from "../components/landing/ProductPreview";
import ContactSection from "../components/landing/Contact";

const LandingPage = () => {
  return (
    <div className="bg-[#181818] text-[#E5CBBE]">
      <HeroSection />
      <AboutSection />
      <StatsSection />
      <AISection />
      <ProductPreview />
      <ContactSection />
    </div>
  );
};

export default LandingPage;
