// src/admin/components/DeleteModal.jsx
import PropTypes from "prop-types";

const DeleteModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#2c2c2c] text-[#E5CBBE] rounded-lg p-8 w-full max-w-md space-y-6 shadow-lg animate-fade-in">
        <h2 className="text-2xl font-bold text-center">Are you sure?</h2>
        <p className="text-center text-[#A58077]">This action cannot be undone!</p>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-lg bg-[#A58077] hover:bg-[#E5CBBE] text-white hover:text-[#181818] transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default DeleteModal;
