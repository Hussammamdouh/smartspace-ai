const Hero = () => {
  return (
    <section
      className="relative h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/hero.png')" }}
      >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 flex items-center justify-start px-6 md:px-16">
        <div className="max-w-2xl">
          {/* Logo Style Icon (Optional Placeholder) */}
          <div className="mb-4">
            <div className="w-10 h-10 bg-[#E5CBBE] rounded-full rotate-45"></div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
            <span className="text-[#E5CBBE]">Interior</span><br />
            Design & AI
          </h1>

          {/* Subtext */}
          <p className="mt-4 text-lg text-[#d1d1d1]">
            The best solution for luxury life
          </p>

          {/* CTA Button */}
          <a
            href="#about"
            className="group inline-flex items-center mt-6 text-[#E5CBBE] border-b border-[#E5CBBE] hover:text-[#A58077] hover:border-[#A58077] transition-all duration-300 text-lg font-medium"
          >
            Explore Now
            <span className="ml-2 transform group-hover:translate-x-1 transition-all">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
