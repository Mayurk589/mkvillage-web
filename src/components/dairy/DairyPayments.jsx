import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { dairyApi } from "../../services/api";
import { getUserByMobile } from "../../services/authService";
import { getMobileFromToken } from "../../utils/tokenUtils";
import { Search, CheckCircle, AlertCircle } from "lucide-react";

export default function DairyPayments() {
  const [dairyId, setDairyId] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);

  const [form, setForm] = useState({
    search: "",
    amount: "",
    paymentMode: "CASH",
    remarks: ""
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    const token = localStorage.getItem("token");
    const mobile = getMobileFromToken(token);
    const userRes = await getUserByMobile(mobile);
    const ownerId = userRes.data.id;

    const dairyRes = await dairyApi.get(`/dairies/owner/${ownerId}`);
    const realDairyId = dairyRes.data.id;
    setDairyId(realDairyId);

    const farmersRes = await dairyApi.get(`/mappings/dairy/${realDairyId}`);
    setFarmers(
      farmersRes.data.filter((f) => f.status === "APPROVED")
    );
  };

  const loadSummary = async (farmerId) => {
    const res = await dairyApi.get("/payments/summary", {
      params: { dairyId, farmerId }
    });
    setSummary(res.data);

    const history = await dairyApi.get(`/payments/dairy/${dairyId}`);
    setPayments(
      history.data.filter((p) => p.farmerId === farmerId)
    );
  };

  const validate = () => {
    let newErrors = {};
    if (!selectedFarmer) newErrors.farmer = "Select farmer";
    if (!form.amount || parseFloat(form.amount) <= 0)
      newErrors.amount = "Enter valid amount";
    if (summary && parseFloat(form.amount) > summary.pendingAmount)
      newErrors.amount = "Amount exceeds pending";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await dairyApi.post("/payments/add", null, {
        params: {
          dairyId,
          farmerId: selectedFarmer.farmerId,
          amount: parseFloat(form.amount),
          paymentMode: form.paymentMode,
          remarks: form.remarks
        }
      });

      setMessage({ type: "success", text: "Payment recorded successfully!" });
      setForm({ ...form, amount: "", remarks: "" });
      loadSummary(selectedFarmer.farmerId);

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Payment failed."
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFarmers = farmers.filter((f) => {
    if (!form.search.trim()) return false;
    const value = form.search.trim();
    if (/^\d+$/.test(value)) {
      return f.farmerMobile?.includes(value);
    } else {
      return f.farmerName?.toLowerCase().includes(value.toLowerCase());
    }
  });

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          Payments Dashboard
        </h1>
      </div>

      {/* Farmer Search */}
      <div className="relative mb-6">
        <div className="flex items-center border rounded-xl px-4">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search Farmer"
            className="w-full py-3 outline-none text-sm sm:text-base"
            value={form.search}
            onChange={(e) => {
              const value = e.target.value;
              setForm({ ...form, search: value });
              if (!value.trim()) {
                setSelectedFarmer(null);
                setSummary(null);
                setPayments([]);
                setShowDropdown(false);
                return;
              }
              setShowDropdown(true);
            }}
          />
        </div>

        {showDropdown && filteredFarmers.length > 0 && (
          <div className="absolute bg-white border w-full mt-2 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
            {filteredFarmers.map((f) => (
              <div
                key={f.mappingId}
                className="p-3 hover:bg-emerald-50 cursor-pointer"
                onClick={() => {
                  setSelectedFarmer(f);
                  setForm({
                    ...form,
                    search: `${f.farmerName} (${f.farmerMobile})`
                  });
                  setShowDropdown(false);
                  loadSummary(f.farmerId);
                }}
              >
                <p className="font-medium">{f.farmerName}</p>
                <p className="text-xs text-gray-500">{f.farmerMobile}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">

            <SummaryCard
              title="Total Earnings"
              value={summary.totalMilkEarnings}
              color="bg-green-100 text-green-700"
            />

            <SummaryCard
              title="Total Paid"
              value={summary.totalPayments}
              color="bg-blue-100 text-blue-700"
            />

            <SummaryCard
              title="Pending"
              value={summary.pendingAmount}
              color="bg-red-100 text-red-700"
            />

          </div>

          {/* Message */}
          {message && (
            <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
              {message.type === "success"
                ? <CheckCircle />
                : <AlertCircle />}
              {message.text}
            </div>
          )}

          {/* Record Payment */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Record Payment
            </h2>

            <form onSubmit={handlePayment} className="space-y-4">

              <input
                type="number"
                placeholder="Amount"
                className="w-full border p-3 rounded-lg"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
              />

              <select
                className="w-full border p-3 rounded-lg"
                value={form.paymentMode}
                onChange={(e) =>
                  setForm({ ...form, paymentMode: e.target.value })
                }
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK">Bank Transfer</option>
              </select>

              <textarea
                placeholder="Remarks (optional)"
                className="w-full border p-3 rounded-lg"
                value={form.remarks}
                onChange={(e) =>
                  setForm({ ...form, remarks: e.target.value })
                }
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition"
              >
                {loading ? "Processing..." : "Record Payment"}
              </button>

            </form>
          </div>

          {/* Payment History */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg overflow-x-auto">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Payment History
            </h2>

            {payments.length === 0 ? (
              <p className="text-gray-500">No payments found.</p>
            ) : (
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="py-3">Date</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Mode</th>
                    <th className="py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-medium text-green-600">
                        ₹ {p.amount}
                      </td>
                      <td className="py-3">{p.paymentMode}</td>
                      <td className="py-3">{p.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

    </DashboardLayout>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div className={`${color} p-4 sm:p-6 rounded-2xl shadow`}>
      <p className="text-sm sm:text-base">{title}</p>
      <h2 className="text-xl sm:text-2xl font-bold">
        ₹ {Number(value || 0).toFixed(2)}
      </h2>
    </div>
  );
}