import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { dairyApi } from "../../services/api";
import { getUserByMobile } from "../../services/authService";
import { getMobileFromToken } from "../../utils/tokenUtils";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function DairySettings() {

  const [dairyId, setDairyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    cowFatRate: "",
    buffaloFatRate: ""
  });

  const [existingRate, setExistingRate] = useState(null);

  useEffect(() => {
    loadDairyAndRate();
  }, []);

  // ================= LOAD DATA =================
  const loadDairyAndRate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({
          type: "error",
          text: "User not authenticated."
        });
        return;
      }

      const mobile = getMobileFromToken(token);
      if (!mobile) {
        setMessage({
          type: "error",
          text: "Invalid session."
        });
        return;
      }

      const userRes = await getUserByMobile(mobile);
      const ownerId = userRes.data.id;

      // 1️⃣ Check Dairy Exists
      let realDairyId = null;

      try {
        const dairyRes = await dairyApi.get(`/dairies/owner/${ownerId}`);
        realDairyId = dairyRes.data?.id;
        setDairyId(realDairyId);
      } catch {
        setMessage({
          type: "error",
          text: "Dairy is not created yet. Please create dairy first."
        });
        return;
      }

      // 2️⃣ Load Existing Rate
      try {
        const rateRes = await dairyApi.get(`/rates/dairy/${realDairyId}`);

        if (!rateRes.data) {
          setExistingRate(null);
        } else {
          setExistingRate(rateRes.data);
          setForm({
            cowFatRate: rateRes.data.cowFatRate,
            buffaloFatRate: rateRes.data.buffaloFatRate
          });
        }

      } catch {
        // Rate not set — this is normal
        setExistingRate(null);
      }

    } catch {
      setMessage({
        type: "error",
        text: "Failed to load settings."
      });
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const cow = parseFloat(form.cowFatRate);
    const buffalo = parseFloat(form.buffaloFatRate);

    if (isNaN(cow) || isNaN(buffalo)) {
      setMessage({
        type: "error",
        text: "Rates must be valid numbers."
      });
      return;
    }

    if (cow <= 0 || buffalo <= 0) {
      setMessage({
        type: "error",
        text: "Rates must be greater than 0."
      });
      return;
    }

    setLoading(true);

    try {
      const res = await dairyApi.post("/rates/set", null, {
        params: {
          dairyId,
          cowFatRate: cow,
          buffaloFatRate: buffalo
        }
      });

      setExistingRate(res.data);

      setMessage({
        type: "success",
        text: "Milk rates updated successfully!"
      });

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Update failed."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          Dairy Settings
        </h1>
      </div>

      {/* MESSAGE */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 mb-6 rounded-lg text-sm sm:text-base
            ${message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"}
          `}
        >
          {message.type === "success"
            ? <CheckCircle size={18} />
            : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* CURRENT RATE */}
      {existingRate ? (
        <div className="bg-emerald-100 text-emerald-700 p-4 sm:p-6 rounded-2xl mb-6 shadow-sm">
          <h2 className="font-semibold mb-4 text-sm sm:text-base">
            Current Milk Rates
          </h2>

          <div className="flex justify-between text-sm sm:text-base mb-2">
            <span>Cow Fat Rate</span>
            <span className="font-semibold">
              ₹ {existingRate.cowFatRate}
            </span>
          </div>

          <div className="flex justify-between text-sm sm:text-base">
            <span>Buffalo Fat Rate</span>
            <span className="font-semibold">
              ₹ {existingRate.buffaloFatRate}
            </span>
          </div>
        </div>
      ) : (
        dairyId && (
          <div className="bg-yellow-100 p-4 sm:p-6 rounded-2xl mb-6 shadow-sm text-sm sm:text-base">
            No milk rates configured yet.
          </div>
        )
      )}

      {/* FORM */}
      {dairyId && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg w-full max-w-lg">

          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Update Milk Rates
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium">
                Cow Fat Rate
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="w-full border p-3 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 outline-none"
                value={form.cowFatRate}
                onChange={(e) =>
                  setForm({ ...form, cowFatRate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium">
                Buffalo Fat Rate
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="w-full border p-3 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 outline-none"
                value={form.buffaloFatRate}
                onChange={(e) =>
                  setForm({ ...form, buffaloFatRate: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition"
            >
              {loading ? "Saving..." : "Save Rates"}
            </button>

          </form>
        </div>
      )}

    </DashboardLayout>
  );
}