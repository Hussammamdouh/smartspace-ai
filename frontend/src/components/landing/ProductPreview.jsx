const products = [
    { name: "Sofa", price: 78.99, image: "/path1.jpg" },
    { name: "Modern Chair", price: 74.99, image: "/path2.jpg" },
    { name: "Luxury Sofa", price: 78.99, image: "/path3.jpg" },
  ];
  
  const ProductPreview = () => {
    return (
      <section className="py-20 px-8 bg-[#181818] text-[#E5CBBE]">
        <h2 className="text-4xl font-bold mb-10">Product</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <div key={i} className="bg-[#2c2c2c] rounded-lg overflow-hidden shadow-lg">
              <img src={p.image} alt={p.name} className="w-full h-52 object-cover" />
              <div className="p-4">
                <h4 className="text-xl font-bold">{p.name}</h4>
                <p className="text-sm text-[#A58077]">${p.price}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <a
            href="/products"
            className="px-6 py-3 text-sm bg-[#E5CBBE] text-[#181818] rounded-full hover:bg-[#A58077] transition"
          >
            See More...
          </a>
        </div>
      </section>
    );
  };
  
  export default ProductPreview;
  