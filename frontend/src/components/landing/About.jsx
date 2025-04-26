const About = () => {
  return (
    <section id="about" className="bg-[#181818] text-[#E5CBBE] px-6 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <h2 className="text-5xl font-extrabold mb-10 tracking-tight">
          <span className="text-white">
            A<span className="text-[#A58077]">B</span>OUT US
          </span>
        </h2>

        {/* Paragraphs */}
        <div className="grid md:grid-cols-2 gap-10 text-[#d1d1d1] text-base leading-relaxed mb-12">
          <p>
            Welcome to our interior Design. We are here to make the best furniture for you at prices that are better than the rest. We are keen to use the finest materials that will last with you for the longest possible time.
          </p>
          <p>
            We also feature artificial intelligence and drag and drop to divide your home comfortably. With us, you will enjoy all means of comfort with specialists in their fields, specialized engineers in decoration, so there is no need to worry.
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <img
            src="/images/about1.png"
            alt="Interior Design"
            className="rounded-lg shadow-md w-full h-full object-cover"
          />

          <div className="grid grid-cols-2 gap-4">
            <img src="/images/about2.png" className="rounded-lg shadow-sm object-cover" alt="Room A" />
            <img src="/images/about3.png" className="rounded-lg shadow-sm object-cover" alt="Room B" />
            <img src="/images/about4.png" className="rounded-lg shadow-sm object-cover col-span-2" alt="Room C" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
