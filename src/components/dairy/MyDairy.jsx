import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { dairyApi } from "../../services/api";
import { getMobileFromToken } from "../../utils/tokenUtils";
import { getUserByMobile } from "../../services/authService";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function MyDairy() {

  const [loading, setLoading] = useState(false);
  const [dairyId, setDairyId] = useState(null);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    dairyName: "",
    location: "",
    phoneNumber: ""
  });

  const [existingDairy, setExistingDairy] = useState(null);

  useEffect(() => {
    loadDairy();
  }, []);

  const loadDairy = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const mobile = getMobileFromToken(token);
      if (!mobile) return;

      const userRes = await getUserByMobile(mobile);
      const ownerId = userRes.data.id;

      try {
        const dairyRes = await dairyApi.get(`/dairies/owner/${ownerId}`);
        const dairy = dairyRes.data;

        setExistingDairy(dairy);
        setDairyId(dairy.id);

        setForm({
          dairyName: dairy.dairyName || "",
          location: dairy.location || "",
          phoneNumber: dairy.phoneNumber || ""
        });

      } catch (err) {
        // Dairy not created yet
        setExistingDairy(null);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.dairyName.trim() || !form.phoneNumber.trim()) {
      setMessage({
        type: "error",
        text: "Dairy name and phone number are required"
      });
      return;
    }

    setLoading(true);

    try {
      if (existingDairy) {
        await dairyApi.put(`/dairies/${dairyId}`, form);
        setMessage({
          type: "success",
          text: "Dairy updated successfully!"
        });
      } else {
        const res = await dairyApi.post("/dairies", null, {
          params: form
        });

        setExistingDairy(res.data);
        setDairyId(res.data.id);

        setMessage({
          type: "success",
          text: "Dairy created successfully!"
        });
      }

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Operation failed"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          My Dairy
        </h1>
      </div>

      {/* Current Dairy Info */}
      {existingDairy ? (
        <div className="bg-emerald-100 text-emerald-700 p-4 sm:p-6 rounded-2xl mb-6 shadow-sm">
          <h2 className="font-semibold mb-4 text-sm sm:text-base">
            Current Dairy Information
          </h2>

          <div className="flex justify-between text-sm sm:text-base mb-2">
            <span>Name</span>
            <span className="font-semibold">
              {existingDairy.dairyName}
            </span>
          </div>

          <div className="flex justify-between text-sm sm:text-base mb-2">
            <span>Location</span>
            <span className="font-semibold">
              {existingDairy.location || "-"}
            </span>
          </div>

          <div className="flex justify-between text-sm sm:text-base">
            <span>Phone</span>
            <span className="font-semibold">
              {existingDairy.phoneNumber}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-100 p-4 sm:p-6 rounded-2xl mb-6 shadow-sm text-sm sm:text-base">
          No dairy created yet. Please create your dairy profile.
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 mb-6 rounded-lg text-sm sm:text-base ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.type === "success"
            ? <CheckCircle size={18} />
            : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg w-full max-w-lg">

        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          {existingDairy ? "Update Dairy Details" : "Create Dairy"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block mb-2 text-sm sm:text-base font-medium">
              Dairy Name
            </label>
            <input
              type="text"
              required
              className="w-full border p-3 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 outline-none"
              value={form.dairyName}
              onChange={(e) =>
                setForm({ ...form, dairyName: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block mb-2 text-sm sm:text-base font-medium">
              Location
            </label>
            <input
              type="text"
              className="w-full border p-3 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 outline-none"
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block mb-2 text-sm sm:text-base font-medium">
              Phone Number
            </label>
            <input
              type="text"
              required
              className="w-full border p-3 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 outline-none"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition"
          >
            {loading
              ? "Saving..."
              : existingDairy
              ? "Update Dairy"
              : "Create Dairy"}
          </button>

        </form>
      </div>

    </DashboardLayout>
  );
}