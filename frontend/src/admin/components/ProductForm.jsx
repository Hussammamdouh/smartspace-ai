import PropTypes from "prop-types";

const ProductForm = ({ product, onChange, onSubmit, isEditing }) => {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-[#2c2c2c] p-6 rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">
        {isEditing ? "Edit Product" : "Add New Product"}
      </h2>

      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={product.name || ""}
          onChange={onChange}
          required
          className="w-full p-3 rounded bg-[#E5CBBE] text-[#181818]"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Price</label>
        <input
          type="number"
          name="price"
          value={product.price || ""}
          onChange={onChange}
          required
          className="w-full p-3 rounded bg-[#E5CBBE] text-[#181818]"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Type</label>
        <input
          type="text"
          name="type"
          value={product.type || ""}
          onChange={onChange}
          required
          className="w-full p-3 rounded bg-[#E5CBBE] text-[#181818]"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Stock</label>
        <input
          type="number"
          name="stock"
          value={product.stock || ""}
          onChange={onChange}
          required
          className="w-full p-3 rounded bg-[#E5CBBE] text-[#181818]"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Image URL</label>
        <input
          type="file"
          name="file"
          onChange={onChange}
          className="w-full p-3 rounded bg-[#E5CBBE] text-[#181818]"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#A58077] hover:bg-[#E5CBBE] hover:text-[#181818] text-white font-bold py-3 rounded-lg transition"
      >
        {isEditing ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
};

ProductForm.propTypes = {
  product: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

export default ProductForm;
