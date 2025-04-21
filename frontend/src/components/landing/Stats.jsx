const Stats = () => {
    const stats = [
      { number: "140+", label: "Project Created" },
      { number: "5+", label: "Years Of Experience" },
      { number: "120K", label: "Visitor" },
    ];
  
    return (
      <section className="bg-[#181818] text-[#E5CBBE] px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        {stats.map((stat, idx) => (
          <div key={idx} className="text-xl font-bold">
            <div className="text-3xl">{stat.number}</div>
            <div className="text-sm text-[#A58077] mt-2">{stat.label}</div>
          </div>
        ))}
      </section>
    );
  };
  
  export default Stats;
  