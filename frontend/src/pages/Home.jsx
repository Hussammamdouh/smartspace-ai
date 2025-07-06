import HeroSection from "../components/landing/Hero";
import AboutSection from "../components/landing/About";
import StatsSection from "../components/landing/Stats";
import AISection from "../components/landing/AISection";
import ContactSection from "../components/landing/Contact";

const LandingPage = () => {
  return (
    <div className="bg-theme-background text-theme-text">
      {/* <div className="text-center py-4">
        <h1 className="text-2xl font-bold">{'Home'}</h1>
      </div> */}
      <HeroSection />
      <AboutSection />
      <StatsSection />
      <AISection />
      <ContactSection />
    </div>
  );
};

export default LandingPage;
