// admin/components/UsersTable.jsx

import PropTypes from "prop-types";
import { FaTrash, FaUserEdit } from "react-icons/fa";

const UsersTable = ({ users, onEditUser, onDeleteUser }) => {
  return (
    <div className="overflow-x-auto bg-[#2c2c2c] p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6">Users Management</h2>

      <table className="w-full table-auto text-left">
        <thead className="bg-[#A58077] text-[#181818]">
          <tr>
            <th className="p-4">#</th>
            <th className="p-4">Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Role</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.length > 0 ? (
            users.map((user, index) => (
              <tr
                key={user._id}
                className="border-b border-[#A58077]/30 hover:bg-[#3a3a3a] transition"
              >
                <td className="p-4">{index + 1}</td>
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4 capitalize">{user.role}</td>
                <td className="p-4 flex items-center gap-4">
                  <button
                    onClick={() => onEditUser(user)}
                    className="bg-[#E5CBBE] text-[#181818] px-3 py-2 rounded hover:bg-[#A58077] hover:text-white transition"
                    title="Edit User"
                  >
                    <FaUserEdit />
                  </button>
                  <button
                    onClick={() => onDeleteUser(user._id)}
                    className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition"
                    title="Delete User"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-6 text-center text-[#A58077]">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

UsersTable.propTypes = {
  users: PropTypes.array.isRequired,
  onEditUser: PropTypes.func.isRequired,
  onDeleteUser: PropTypes.func.isRequired,
};

export default UsersTable;
