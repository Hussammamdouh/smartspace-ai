import PropTypes from "prop-types";

const ProductForm = ({ product, onChange, onSubmit, isEditing, onCancel }) => {
  const categories = ["bedroom", "child bedroom", "kitchen", "bathroom", "living room"];
  
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-[#2c2c2c] p-6 rounded-xl shadow-md"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1 text-[#E5CBBE]">Name *</label>
          <input
            type="text"
            name="name"
            value={product.name || ""}
            onChange={onChange}
            required
            className="w-full p-3 rounded bg-[#1e1e1e] text-[#E5CBBE] border border-[#A58077] focus:outline-none focus:border-[#E5CBBE] transition-colors"
            placeholder="Product name"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-[#E5CBBE]">Category *</label>
          <select
            name="category"
            value={product.category || ""}
            onChange={onChange}
            required
            className="w-full p-3 rounded bg-[#1e1e1e] text-[#E5CBBE] border border-[#A58077] focus:outline-none focus:border-[#E5CBBE] transition-colors"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 text-[#E5CBBE]">Style</label>
          <input
            type="text"
            name="style"
            value={product.style || ""}
            onChange={onChange}
            className="w-full p-3 rounded bg-[#1e1e1e] text-[#E5CBBE] border border-[#A58077] focus:outline-none focus:border-[#E5CBBE] transition-colors"
            placeholder="e.g., Modern, Classic, Minimalist"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-[#E5CBBE]">Color</label>
          <input
            type="text"
            name="color"
            value={product.color || ""}
            onChange={onChange}
            className="w-full p-3 rounded bg-[#1e1e1e] text-[#E5CBBE] border border-[#A58077] focus:outline-none focus:border-[#E5CBBE] transition-colors"
            placeholder="e.g., Brown, White, Black"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-[#E5CBBE]">Price *</label>
          <input
            type="number"
            name="price"
            value={product.price || ""}
            onChange={onChange}
            required
            min="0"
            step="0.01"
            className="w-full p-3 rounded bg-[#1e1e1e] text-[#E5CBBE] border border-[#A58077] focus:outline-none focus:border-[#E5CBBE] transition-colors"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-[#E5CBBE]">Stock *</label>
          <input
            type="number"
            name="stock"
            value={product.stock || ""}
            onChange={onChange}
            required
            min="0"
            className="w-full p-3 rounded bg-[#1e1e1e] text-[#E5CBBE] border border-[#A58077] focus:outline-none focus:border-[#E5CBBE] transition-colors"
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1 text-[#E5CBBE]">Description</label>
        <textarea
          name="description"
          value={product.description || ""}
          onChange={onChange}
          rows="3"
          className="w-full p-3 rounded bg-[#1e1e1e] text-[#E5CBBE] border border-[#A58077] focus:outline-none focus:border-[#E5CBBE] transition-colors resize-none"
          placeholder="Product description..."
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-[#E5CBBE]">Tags</label>
        <input
          type="text"
          name="tags"
          value={product.tags ? product.tags.join(', ') : ""}
          onChange={(e) => {
            const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
            onChange({
              target: {
                name: 'tags',
                value: tags
              }
            });
          }}
          className="w-full p-3 rounded bg-[#1e1e1e] text-[#E5CBBE] border border-[#A58077] focus:outline-none focus:border-[#E5CBBE] transition-colors"
          placeholder="tag1, tag2, tag3 (comma separated)"
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-[#E5CBBE]">Product Image *</label>
        <input
          type="file"
          name="file"
          onChange={onChange}
          accept="image/*"
          required={!isEditing}
          className="w-full p-3 rounded bg-[#1e1e1e] text-[#E5CBBE] border border-[#A58077] focus:outline-none focus:border-[#E5CBBE] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#A58077] file:text-white hover:file:bg-[#E5CBBE] hover:file:text-[#181818] transition-colors"
        />
        {isEditing && product.image && (
          <div className="mt-2">
            <p className="text-sm text-[#A58077]">Current image:</p>
            <img 
              src={product.image} 
              alt="Current product" 
              className="w-20 h-20 object-cover rounded mt-1"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-[#E5CBBE]">
          <input
            type="checkbox"
            name="available"
            checked={product.available !== false}
            onChange={(e) => onChange({
              target: {
                name: 'available',
                value: e.target.checked
              }
            })}
            className="w-4 h-4 text-[#A58077] bg-[#1e1e1e] border-[#A58077] rounded focus:ring-[#A58077] focus:ring-2"
          />
          <span className="text-sm">Available for purchase</span>
        </label>
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
  onCancel: PropTypes.func,
};

export default ProductForm;
