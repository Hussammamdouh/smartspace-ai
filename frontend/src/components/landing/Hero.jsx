const Hero = () => {
    return (
      <section className="relative h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('/your-hero-image.jpg')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center px-8">
          <h1 className="text-6xl font-extrabold leading-tight">
            <span className="text-[#E5CBBE]">Interior</span> <br />
            Design & AI
          </h1>
          <p className="text-xl mt-4 max-w-lg">The best solution for luxury life</p>
          <a
            href="#about"
            className="inline-block mt-6 px-6 py-3 text-sm rounded-full bg-[#E5CBBE] text-[#181818] hover:bg-[#A58077] transition-all w-max"
          >
            Explore Now →
          </a>
        </div>
      </section>
    );
  };
  
  export default Hero;
  