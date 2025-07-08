const teamMembers = [
  { name: 'Mostafa Elkilany', position: 'CEO & Founder', image: '/images/team1.jpg' },
  { name: 'Sarah Johnson', position: 'Lead Designer', image: '/images/team2.jpg' },
  { name: 'Ahmed Hassan', position: 'AI Engineer', image: '/images/team3.jpg' },
  { name: 'Emily Chen', position: 'Product Manager', image: '/images/team4.jpg' },
  { name: 'David Kim', position: 'Frontend Developer', image: '/images/team5.jpg' },
  { name: 'Fatima Al-Farsi', position: 'Backend Developer', image: '/images/team6.jpg' },
  { name: 'Lucas Silva', position: 'UX/UI Designer', image: '/images/team7.jpg' },
  { name: 'Priya Patel', position: 'Marketing Lead', image: '/images/team8.jpg' },
];

const Team = () => (
  <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-4xl font-bold mb-10 text-center">Our Team</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {teamMembers.map((member, idx) => (
          <div key={idx} className="bg-[#2C2C2C] rounded-xl p-6 flex flex-col items-center shadow-lg">
            <img
              src={member.image}
              alt={member.name}
              className="w-28 h-28 object-cover rounded-full mb-4 border-4 border-[#A58077]"
              onError={e => { e.target.src = 'https://via.placeholder.com/112x112/2C2C2C/A58077?text=No+Image'; }}
            />
            <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
            <p className="text-[#A58077] text-sm font-medium">{member.position}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Team; 