import { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <p className="mb-8">Have a question or need support? Fill out the form below or email us at <a href="mailto:hello@aiinteriordesign.com" className="text-[#A58077] underline">hello@aiinteriordesign.com</a>.</p>
        <form onSubmit={handleSubmit} className="space-y-6 bg-[#2C2C2C] p-8 rounded-xl">
          <div>
            <label htmlFor="name" className="block mb-1 font-medium">Name</label>
            <input type="text" id="name" name="name" value={form.name} onChange={handleChange} className="w-full p-3 rounded bg-[#181818] text-[#E5CBBE] border border-[#3C3C3C]" required />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">Email</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange} className="w-full p-3 rounded bg-[#181818] text-[#E5CBBE] border border-[#3C3C3C]" required />
          </div>
          <div>
            <label htmlFor="message" className="block mb-1 font-medium">Message</label>
            <textarea id="message" name="message" value={form.message} onChange={handleChange} className="w-full p-3 rounded bg-[#181818] text-[#E5CBBE] border border-[#3C3C3C]" rows={5} required />
          </div>
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-lg font-semibold hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300">Send Message</button>
          {submitted && <div className="text-green-400 mt-4">Thank you for contacting us! We will get back to you soon.</div>}
        </form>
      </div>
    </div>
  );
};

export default Contact; 