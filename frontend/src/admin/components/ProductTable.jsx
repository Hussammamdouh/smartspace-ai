// admin/components/ProductTable.jsx

import PropTypes from "prop-types";
import { FaEdit, FaTrash } from "react-icons/fa";

const ProductTable = ({ products, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto text-left border-collapse">
        <thead>
          <tr className="bg-[#A58077] text-white">
            <th className="p-3">Image</th>
            <th className="p-3">Name</th>
            <th className="p-3">Price</th>
            <th className="p-3">Type</th>
            <th className="p-3">Stock</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="border-b border-[#E5CBBE]/20">
              <td className="p-3">
                <img
                  src={product.filePath}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </td>
              <td className="p-3 font-semibold">{product.name}</td>
              <td className="p-3">${product.price.toFixed(2)}</td>
              <td className="p-3">{product.type}</td>
              <td className="p-3">{product.stock}</td>
              <td className="p-3 text-center flex gap-2 justify-center">
                <button
                  onClick={() => onEdit(product)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
                  aria-label="Edit Product"
                >
                  <FaEdit size={16} />
                </button>
                <button
                  onClick={() => onDelete(product._id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                  aria-label="Delete Product"
                >
                  <FaTrash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ProductTable.propTypes = {
  products: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ProductTable;