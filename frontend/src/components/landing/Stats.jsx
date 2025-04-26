const Stats = () => {
  return (
    <section className="bg-[#181818] text-[#E5CBBE] px-6 py-20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        <div className="border border-[#A58077] p-6 rounded-lg text-center">
          <h3 className="text-4xl font-bold">140+</h3>
          <p className="mt-2 text-sm text-[#A09C9C]">Project Created</p>
        </div>
        <div className="border border-[#A58077] p-6 rounded-lg text-center">
          <h3 className="text-4xl font-bold">5+</h3>
          <p className="mt-2 text-sm text-[#A09C9C]">Years Of Experience</p>
        </div>
        <div className="border border-[#A58077] p-6 rounded-lg text-center">
          <h3 className="text-4xl font-bold">120K</h3>
          <p className="mt-2 text-sm text-[#A09C9C]">Visitor</p>
        </div>
      </div>
    </section>
  );
};

export default Stats;
