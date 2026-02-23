import { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { dairyApi } from "../../services/api";
import { getUserByMobile } from "../../services/authService";
import { getMobileFromToken } from "../../utils/tokenUtils";
import { CheckCircle, AlertCircle, Search } from "lucide-react";

export default function DairyMilkCollection() {

  const [farmers, setFarmers] = useState([]);
  const [dairyId, setDairyId] = useState(null);
  const [rate, setRate] = useState(null);
  const [rateError, setRateError] = useState(false);

  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [form, setForm] = useState({
    search: "",
    milkType: "COW",
    quantity: "",
    fat: ""
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const messageRef = useRef(null);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (message?.type === "success" && messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, [message]);

  // ================= INITIALIZE =================
  const initialize = async () => {
    try {
      const token = localStorage.getItem("token");
      const mobile = getMobileFromToken(token);
      const userRes = await getUserByMobile(mobile);
      const ownerId = userRes.data.id;

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

      try {
        const farmersRes = await dairyApi.get(`/mappings/dairy/${realDairyId}`);
        setFarmers(
          farmersRes.data.filter((f) => f.status === "APPROVED")
        );
      } catch {
        setFarmers([]);
      }

      try {
        const rateRes = await dairyApi.get(`/rates/dairy/${realDairyId}`);
        if (!rateRes.data) {
          setRateError(true);
          setRate(null);
          setMessage({
            type: "error",
            text: "Milk rate is not set. Please configure rate in settings."
          });
        } else {
          setRate(rateRes.data);
          setRateError(false);
        }
      } catch {
        setRateError(true);
        setRate(null);
        setMessage({
          type: "error",
          text: "Milk rate is not set. Please configure rate in settings."
        });
      }

    } catch {
      setMessage({
        type: "error",
        text: "Failed to initialize page."
      });
    }
  };

  // ================= VALIDATION =================
  const validate = () => {
    let newErrors = {};

    if (!selectedFarmer)
      newErrors.farmer = "Please select a farmer";

    if (!form.quantity || parseFloat(form.quantity) <= 0)
      newErrors.quantity = "Quantity must be greater than 0";

    if (!form.fat || parseFloat(form.fat) <= 0)
      newErrors.fat = "Fat % must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validate()) return;

    setLoading(true);

    try {
      await dairyApi.post("/milk/add", null, {
        params: {
          dairyId,
          farmerId: selectedFarmer.farmerId,
          milkType: form.milkType,
          quantity: parseFloat(form.quantity),
          fat: parseFloat(form.fat)
        }
      });

      setMessage({
        type: "success",
        text: "Milk entry saved successfully!"
      });

      setForm({
        search: "",
        milkType: "COW",
        quantity: "",
        fat: ""
      });

      setSelectedFarmer(null);
      setErrors({});

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save entry."
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH FILTER =================
  const filteredFarmers = farmers.filter((f) => {
    if (!form.search.trim()) return false;

    const value = form.search.trim();

    if (/^\d+$/.test(value)) {
      return f.farmerMobile?.includes(value);
    } else {
      return f.farmerName?.toLowerCase().includes(value.toLowerCase());
    }
  });

  // ================= ESTIMATION =================
  const estimatedAmount =
    selectedFarmer && form.quantity && form.fat && rate
      ? (
          form.quantity *
          form.fat *
          (form.milkType === "COW"
            ? rate.cowFatRate
            : rate.buffaloFatRate)
        ).toFixed(2)
      : 0;

  return (
    <DashboardLayout>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        Milk Collection
      </h1>

      {/* MESSAGE */}
      {message && (
        <div
          ref={messageRef}
          className={`flex items-center gap-3 p-4 mb-6 rounded-lg border shadow-sm
            ${message.type === "success"
              ? "bg-green-50 border-green-300 text-green-700"
              : "bg-red-50 border-red-300 text-red-700"}
          `}
        >
          {message.type === "success"
            ? <CheckCircle size={20} />
            : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* RATE SECTION */}
      {rate && (
        <div className="bg-emerald-100 text-emerald-700 p-5 rounded-xl shadow mb-6">
          <div className="flex justify-between">
            <span>🐄 Cow Rate</span>
            <span className="font-semibold">₹ {rate.cowFatRate}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>🐃 Buffalo Rate</span>
            <span className="font-semibold">₹ {rate.buffaloFatRate}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* PREVIEW */}
        <div className="order-1 lg:order-2 lg:col-span-1">
          <div className={`border rounded-xl p-6 shadow-sm transition
            ${form.milkType === "COW"
              ? "bg-emerald-50 border-emerald-300"
              : "bg-indigo-50 border-indigo-300"}
          `}>
            <h3 className="text-base font-semibold mb-4 text-gray-800">
              Entry Preview
            </h3>

            <Row label="Farmer" value={selectedFarmer?.farmerName || "-"} />
            <Row label="Milk Type" value={form.milkType} />
            <Row label="Quantity" value={`${form.quantity || 0} L`} />
            <Row label="Fat" value={`${form.fat || 0}%`} />

            <div className="border-t pt-4 flex justify-between font-semibold text-lg">
              <span>Estimated</span>
              <span>₹ {estimatedAmount}</span>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="order-2 lg:order-1 lg:col-span-2 bg-white p-8 rounded-2xl shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* SEARCH WITH DROPDOWN */}
            <div className="relative">
              <div className="flex items-center border rounded-lg px-3 focus-within:ring-2 focus-within:ring-emerald-500">
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search farmer by name or mobile..."
                  className="w-full py-3 outline-none text-sm"
                  value={form.search}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({ ...form, search: value });
                    setSelectedFarmer(null);
                    setShowDropdown(value.trim() !== "");
                  }}
                />
              </div>

              {showDropdown && filteredFarmers.length > 0 && (
                <div className="absolute bg-white border w-full mt-2 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
                  {filteredFarmers.map((f) => (
                    <div
                      key={f.mappingId}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedFarmer(f);
                        setForm({
                          ...form,
                          search: `${f.farmerName} (${f.farmerMobile})`
                        });
                        setShowDropdown(false);
                      }}
                    >
                      <p className="font-medium">{f.farmerName}</p>
                      <p className="text-xs text-gray-500">{f.farmerMobile}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FORM ENABLED ONLY AFTER SELECTION */}
            <fieldset
              disabled={!selectedFarmer}
              className={`space-y-6 ${!selectedFarmer ? "opacity-50" : ""}`}
            >
              <div className="flex gap-6 text-sm">
                {["COW", "BUFFALO"].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={form.milkType === type}
                      onChange={() =>
                        setForm({ ...form, milkType: type })
                      }
                    />
                    {type}
                  </label>
                ))}
              </div>

              <input
                type="number"
                placeholder="Quantity (L)"
                className="border p-3 rounded-lg w-full text-sm"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Fat %"
                className="border p-3 rounded-lg w-full text-sm"
                value={form.fat}
                onChange={(e) =>
                  setForm({ ...form, fat: e.target.value })
                }
              />

              <button
                type="submit"
                disabled={loading || rateError}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition"
              >
                {loading ? "Saving..." : "Save Entry"}
              </button>
            </fieldset>

          </form>
        </div>

      </div>
    </DashboardLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-gray-700 mb-2">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}