const AISection = () => {
  return (
    <section className="bg-[#292929] text-white py-12 px-6 lg:px-12 rounded-2xl max-w-6xl mx-auto my-20">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left Side: Text */}
        <div className="flex-1 text-center lg:text-left">
          <h3 className="text-3xl lg:text-4xl font-bold mb-4">AI & Interior Design</h3>
          <p className="text-[#d1d1d1] mb-6 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Now you can create your room with artificial intelligence and the drag and drop feature.
            What are you waiting for? Go now.
          </p>
          <a
            href="/chatbot"
            className="inline-block mt-2 px-6 py-3 bg-[#181818] text-white rounded-full hover:bg-[#A58077] transition font-medium"
          >
            Explore now ..
          </a>
        </div>

        {/* Right Side: Image */}
        <div className="flex-1">
          <img
            src="/images/AISection.png"
            alt="AI Design Preview"
            className="w-full max-w-md mx-auto lg:mx-0 rounded-2xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default AISection;
