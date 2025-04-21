const Contact = () => {
    return (
      <section className="bg-[#181818] text-[#E5CBBE] py-20 px-8">
        <h2 className="text-4xl font-bold mb-8">Contact Us</h2>
        <form className="max-w-xl space-y-4">
          <input
            type="email"
            placeholder="Your Email"
            className="w-full bg-[#2c2c2c] text-white p-4 rounded"
          />
          <input
            type="text"
            placeholder="Your Name"
            className="w-full bg-[#2c2c2c] text-white p-4 rounded"
          />
          <textarea
            placeholder="Your Message"
            className="w-full bg-[#2c2c2c] text-white p-4 rounded h-32"
          ></textarea>
          <button
            type="submit"
            className="px-6 py-3 bg-[#E5CBBE] text-[#181818] rounded hover:bg-[#A58077] transition"
          >
            Send
          </button>
        </form>
      </section>
    );
  };
  
  export default Contact;
  