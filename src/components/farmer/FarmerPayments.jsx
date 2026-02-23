import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { dairyApi } from "../../services/api";
import { getMobileFromToken } from "../../utils/tokenUtils";
import { getUserByMobile } from "../../services/authService";
import {
  IndianRupee,
  Calendar,
  Loader2,
  CreditCard,
  Wallet
} from "lucide-react";

export default function FarmerPayments() {

  const [approvedDairies, setApprovedDairies] = useState([]);
  const [selectedDairy, setSelectedDairy] = useState(null);
  const [farmerId, setFarmerId] = useState(null);

  const [allPayments, setAllPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filterType, setFilterType] = useState("FULL");

  const [summary, setSummary] = useState({
    totalMilkEarnings: 0,
    totalPayments: 0,
    pendingAmount: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filterType, allPayments]);

  // ================= INITIALIZE =================
  const initialize = async () => {
    try {
      const token = localStorage.getItem("token");
      const mobile = getMobileFromToken(token);
      if (!mobile) return;

      const userRes = await getUserByMobile(mobile);
      const id = userRes.data.id;
      setFarmerId(id);

      const dairyRes = await dairyApi.get(
        `/mappings/farmer/${id}/approved-dairies`
      );

      const dairies = dairyRes.data || [];
      setApprovedDairies(dairies);

      if (dairies.length > 0) {
        setSelectedDairy(dairies[0].dairyId);
        await loadPayments(id, dairies[0].dairyId);
      }

    } catch (err) {
      console.error("Initialization failed", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD PAYMENTS =================
  const loadPayments = async (farmerId, dairyId) => {
    try {
      const summaryRes = await dairyApi.get("/payments/summary", {
        params: { dairyId, farmerId }
      });

      setSummary(summaryRes.data);

      const paymentRes = await dairyApi.get(
        `/payments/farmer/${farmerId}`
      );

      const dairyPayments = paymentRes.data.filter(
        p => p.dairyId === dairyId
      );

      setAllPayments(dairyPayments);

    } catch (err) {
      console.error("Failed to load payments", err);
    }
  };

  const handleDairyChange = async (e) => {
    const dairyId = Number(e.target.value);
    setSelectedDairy(dairyId);
    await loadPayments(farmerId, dairyId);
  };

  // ================= FILTER =================
  const applyFilter = () => {
    let data = [...allPayments];
    const now = new Date();

    if (filterType === "WEEK") {
      const weekStart = new Date();
      weekStart.setDate(now.getDate() - 6);
      data = data.filter(p =>
        new Date(p.paymentDate) >= weekStart
      );
    }

    if (filterType === "MONTH") {
      data = data.filter(p => {
        const d = new Date(p.paymentDate);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    }

    setFilteredPayments(data);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-60 text-gray-500">
          <Loader2 className="animate-spin mr-2" />
          Loading payment analytics...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* Dairy Selector */}
      {approvedDairies.length > 1 && (
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <label className="block text-sm text-gray-500 mb-2">
            Select Dairy
          </label>
          <select
            value={selectedDairy || ""}
            onChange={handleDairyChange}
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
          >
            {approvedDairies.map(d => (
              <option key={d.dairyId} value={d.dairyId}>
                {d.dairyName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 mb-10 bg-gray-100 p-2 rounded-2xl w-fit">
        {["FULL", "WEEK", "MONTH"].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              filterType === type
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">

        <StatCard
          title="Total Earnings"
          value={`₹ ${summary.totalMilkEarnings.toFixed(2)}`}
          icon={<Wallet size={32} />}
          color="indigo"
        />

        <StatCard
          title="Total Paid"
          value={`₹ ${summary.totalPayments.toFixed(2)}`}
          icon={<IndianRupee size={32} />}
          color="emerald"
        />

        <StatCard
          title="Pending Balance"
          value={`₹ ${summary.pendingAmount.toFixed(2)}`}
          icon={<CreditCard size={32} />}
          color={summary.pendingAmount > 0 ? "red" : "green"}
        />

      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        {filteredPayments.length === 0 ? (
          <div className="p-20 text-center text-gray-500">
            No payment records available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Mode</th>
                  <th className="px-6 py-4 text-left">Remarks</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-indigo-50 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <Calendar size={16} className="text-gray-400" />
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      ₹ {payment.amount}
                    </td>
                    <td className="px-6 py-4">
                      {payment.paymentMode}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {payment.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorMap = {
    emerald: "from-emerald-500 to-green-600",
    indigo: "from-indigo-500 to-purple-600",
    red: "from-red-500 to-red-600",
    green: "from-green-500 to-emerald-600"
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} text-white p-8 rounded-3xl shadow-xl hover:scale-105 transition`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="opacity-80 text-sm">{title}</p>
          <h2 className="text-3xl font-bold mt-3">{value}</h2>
        </div>
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}