import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { dairyApi } from "../../services/api";
import { getUserByMobile } from "../../services/authService";
import { getMobileFromToken } from "../../utils/tokenUtils";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export default function DairyFarmers() {
  const [farmers, setFarmers] = useState([]);
  const [dairyId, setDairyId] = useState(null);
  const [mobile, setMobile] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const token = localStorage.getItem("token");
      const mobileFromToken = getMobileFromToken(token);
      if (!mobileFromToken) return;

      const userRes = await getUserByMobile(mobileFromToken);
      const ownerId = userRes.data.id;

      const dairyRes = await dairyApi.get(`/dairies/owner/${ownerId}`);
      const realDairyId = dairyRes.data.id;

      setDairyId(realDairyId);
      await loadFarmers(realDairyId);

    } catch (err) {
      console.error("Initialization error:", err);
    }
  };

  const loadFarmers = async (id) => {
    try {
      const res = await dairyApi.get(`/mappings/dairy/${id}`);
      setFarmers(res.data);
    } catch (err) {
      console.error("Failed to load farmers");
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (mobile.length !== 10) {
      setMessage({ type: "error", text: "Enter valid 10-digit mobile number" });
      return;
    }

    const fullMobile = `+91${mobile}`;
    setLoading(true);

    try {
      await dairyApi.post("/mappings/request", null, {
        params: { dairyId, farmerMobile: fullMobile }
      });

      setMessage({ type: "success", text: "Mapping request sent successfully!" });
      setMobile("");
      await loadFarmers(dairyId);

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to send request"
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmRemove = (farmer) => {
    setSelectedMapping(farmer);
    setModalError(null);
    setShowModal(true);
  };

  const handleRemove = async () => {
    if (!selectedMapping) return;

    setModalLoading(true);
    setModalError(null);

    try {
      await dairyApi.put(`/mappings/remove/${selectedMapping.mappingId}`);

      setMessage({ type: "success", text: "Farmer removed successfully" });
      setShowModal(false);
      setSelectedMapping(null);
      await loadFarmers(dairyId);

    } catch (err) {
      setModalError(
        err.response?.data?.message ||
        "Cannot remove farmer. Settlement might not be cleared."
      );
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-700";
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      case "REMOVED": return "bg-gray-200 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredFarmers = farmers.filter((f) =>
    f.farmerName?.toLowerCase().includes(search.toLowerCase()) ||
    f.farmerMobile?.includes(search)
  );

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          Dairy Farmers
        </h1>
      </div>

      {/* ADD FARMER */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Add Farmer to Dairy
        </h2>

        <form
          onSubmit={handleSendRequest}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex items-center border rounded-lg overflow-hidden w-full sm:w-auto">
            <span className="bg-gray-100 px-3 py-3 text-gray-600 font-medium">
              +91
            </span>

            <input
              type="text"
              maxLength="10"
              placeholder="Enter 10-digit mobile"
              className="px-3 py-3 outline-none w-full sm:w-64"
              value={mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setMobile(value);
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition w-full sm:w-auto"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </form>

        {message && (
          <div className={`flex items-center gap-3 mt-4 p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}>
            {message.type === "success"
              ? <CheckCircle size={18} />
              : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}
      </div>

      {/* FARMERS LIST */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow">

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold">Dairy Farmers</h2>

          <input
            type="text"
            placeholder="Search by name or mobile..."
            className="border px-3 py-2 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-emerald-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredFarmers.length === 0 ? (
          <p className="text-gray-500">No farmers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b">
                  <th className="py-3">Name</th>
                  <th className="py-3">Mobile</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Requested At</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarmers.map((f) => (
                  <tr key={f.mappingId} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{f.farmerName}</td>
                    <td className="py-3 text-gray-600">{f.farmerMobile}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(f.status)}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {f.requestedAt
                        ? new Date(f.requestedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-3">
                      {f.status === "APPROVED" && (
                        <button
                          onClick={() => confirmRemove(f)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-600">
                Confirm Removal
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Remove <span className="font-semibold">
                {selectedMapping?.farmerName}
              </span>?
            </p>

            {modalError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
                {modalError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={modalLoading}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={handleRemove}
                disabled={modalLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                {modalLoading ? "Removing..." : "Confirm Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}