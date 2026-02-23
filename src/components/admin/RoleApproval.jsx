import { useEffect, useState } from "react";
import api from "../../services/api";

export default function RoleApproval() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/admin/dairy-owner-requests");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading requests", err);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (userId) => {
    await api.put(`/admin/approve-dairy-owner/${userId}`);
    fetchRequests();
  };

  const reject = async (userId) => {
    await api.put(`/admin/reject-dairy-owner/${userId}`);
    fetchRequests();
  };

  if (loading) {
    return (
      <div className="text-gray-500 text-sm sm:text-base">
        Loading requests...
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">

      {/* Title */}
      <h2 className="text-lg sm:text-xl font-semibold mb-4">
        Pending Dairy Owner Requests
      </h2>

      {requests.length === 0 ? (
        <p className="text-gray-500 text-sm sm:text-base">
          No pending requests
        </p>
      ) : (
        <div className="space-y-4">

          {requests.map((req) => (
            <div
              key={req.id}
              className="
                flex flex-col sm:flex-row
                justify-between sm:items-center
                gap-4
                border p-4
                rounded-lg
                hover:shadow-md transition
              "
            >
              {/* User Info */}
              <div>
                <p className="font-medium text-sm sm:text-base">
                  {req.user?.name}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {req.user?.mobile}
                </p>
              </div>

              {/* Buttons */}
              <div className="
                flex flex-col sm:flex-row
                gap-2 sm:gap-3
              ">
                <button
                  onClick={() => approve(req.user.id)}
                  className="
                    px-4 py-2
                    bg-green-500 hover:bg-green-600
                    text-white
                    rounded-lg
                    text-sm
                    transition
                  "
                >
                  Approve
                </button>

                <button
                  onClick={() => reject(req.user.id)}
                  className="
                    px-4 py-2
                    bg-red-500 hover:bg-red-600
                    text-white
                    rounded-lg
                    text-sm
                    transition
                  "
                >
                  Reject
                </button>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}