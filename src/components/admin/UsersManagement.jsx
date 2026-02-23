import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [confirmData, setConfirmData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching users", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users
    .filter(user => {
      if (activeTab === "ALL") return true;
      return user.roles?.includes(activeTab);
    })
    .filter(user => {
      if (!search.trim()) return true;
      return (
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.mobile?.includes(search)
      );
    });

  const confirmRoleChange = (userId, action) => {
    setConfirmData({ userId, action });
  };

  const handleRoleChange = async () => {
    try {
      await api.put(`/admin/change-role/${confirmData.userId}`, {
        action: confirmData.action
      });
      await fetchUsers();
    } catch (err) {
      console.error("Role change failed", err);
    } finally {
      setConfirmData(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Loading users...
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-0">

      <h1 className="text-xl sm:text-2xl font-bold mb-6">
        User Management
      </h1>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
        {["ALL", "ROLE_FARMER", "ROLE_DAIRY_OWNER", "ROLE_ADMIN"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition 
              ${activeTab === tab
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {tab === "ALL" ? "All Users" : tab.replace("ROLE_", "")}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* MOBILE VIEW (Cards) */}
      <div className="block md:hidden space-y-4">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center">No users found</p>
        ) : (
          filteredUsers.map(user => (
            <div key={user.id} className="bg-white p-4 rounded-xl shadow">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.mobile}</p>

              <div className="flex flex-wrap gap-2 mt-2">
                {user.roles?.map(role => (
                  <span
                    key={role}
                    className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-600"
                  >
                    {role.replace("ROLE_", "")}
                  </span>
                ))}
              </div>

              {!user.roles?.includes("ROLE_ADMIN") && (
                <div className="mt-3">
                  {!user.roles?.includes("ROLE_DAIRY_OWNER") ? (
                    <button
                      onClick={() =>
                        confirmRoleChange(user.id, "ADD_DAIRY_OWNER")
                      }
                      className="w-full px-3 py-2 bg-green-500 text-white rounded-md text-sm"
                    >
                      Make Dairy
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        confirmRoleChange(user.id, "REMOVE_DAIRY_OWNER")
                      }
                      className="w-full px-3 py-2 bg-red-500 text-white rounded-md text-sm"
                    >
                      Remove Dairy
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* DESKTOP VIEW (Table) */}
      <div className="hidden md:block bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Mobile</th>
              <th className="p-4">Roles</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4">{user.mobile}</td>
                  <td className="p-4">
                    {user.roles?.map(role => (
                      <span
                        key={role}
                        className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-600 mr-2"
                      >
                        {role.replace("ROLE_", "")}
                      </span>
                    ))}
                  </td>
                  <td className="p-4">
                    {!user.roles?.includes("ROLE_ADMIN") &&
                      (!user.roles?.includes("ROLE_DAIRY_OWNER") ? (
                        <button
                          onClick={() =>
                            confirmRoleChange(user.id, "ADD_DAIRY_OWNER")
                          }
                          className="px-3 py-1 bg-green-500 text-white rounded-md text-sm"
                        >
                          Make Dairy
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            confirmRoleChange(user.id, "REMOVE_DAIRY_OWNER")
                          }
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                        >
                          Remove Dairy
                        </button>
                      ))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CONFIRM MODAL */}
      {confirmData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">
              Confirm Role Change
            </h2>

            <p className="mb-6 text-sm">
              Are you sure you want to{" "}
              <span className="font-bold">
                {confirmData.action === "ADD_DAIRY_OWNER"
                  ? "Add Dairy Owner"
                  : "Remove Dairy Owner"}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmData(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleRoleChange}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}