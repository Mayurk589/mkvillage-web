import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { dairyApi } from "../../services/api";
import { getMobileFromToken } from "../../utils/tokenUtils";
import { getUserByMobile } from "../../services/authService";
import {
  Droplets,
  TrendingUp,
  Loader2,
  Calendar
} from "lucide-react";

export default function FarmerMilkRecords() {

  const [approvedDairies, setApprovedDairies] = useState([]);
  const [selectedDairy, setSelectedDairy] = useState(null);
  const [farmerId, setFarmerId] = useState(null);
  const [allRecords, setAllRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [filterType, setFilterType] = useState("FULL");
  const [summary, setSummary] = useState({
    totalMilk: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filterType, allRecords]);

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
        await loadMilkRecords(id, dairies[0].dairyId);
      }

    } catch (err) {
      console.error("Initialization failed", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMilkRecords = async (farmerId, dairyId) => {
    const res = await dairyApi.get(`/milk/farmer/${farmerId}`);
    const dairyRecords = res.data.filter(
      r => r.dairyId === dairyId
    );
    setAllRecords(dairyRecords);
  };

  const handleDairyChange = async (e) => {
    const dairyId = Number(e.target.value);
    setSelectedDairy(dairyId);
    await loadMilkRecords(farmerId, dairyId);
  };

  const applyFilter = () => {
    let data = [...allRecords];
    const now = new Date();

    if (filterType === "WEEK") {
      const weekStart = new Date();
      weekStart.setDate(now.getDate() - 6);
      data = data.filter(r => new Date(r.createdAt) >= weekStart);
    }

    if (filterType === "MONTH") {
      data = data.filter(r => {
        const d = new Date(r.createdAt);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    }

    setFilteredRecords(data);

    setSummary({
      totalMilk: data.reduce((s, r) => s + (r.quantity || 0), 0),
      totalAmount: data.reduce((s, r) => s + (r.totalAmount || 0), 0)
    });
  };

 const formatDate = (dateTime) => {
  const d = new Date(dateTime);
  return d.toLocaleDateString("en-GB");
};

  const formatTime = (dateTime) => {
    const d = new Date(dateTime);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-60 text-gray-500">
          <Loader2 className="animate-spin mr-2" />
          Loading milk analytics...
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
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
          >
            {approvedDairies.map(d => (
              <option key={d.dairyId} value={d.dairyId}>
                {d.dairyName} ({d.phoneNumber})
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
                ? "bg-emerald-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <StatCard
          title="Total Milk Supplied"
          value={`${summary.totalMilk} L`}
          icon={<Droplets size={32} />}
          color="emerald"
        />
        <StatCard
          title="Total Earnings"
          value={`₹ ${summary.totalAmount.toFixed(2)}`}
          icon={<TrendingUp size={32} />}
          color="indigo"
        />
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        {filteredRecords.length === 0 ? (
          <div className="p-20 text-center text-gray-500">
            No milk records available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Milk</th>
                  <th className="px-6 py-4 text-left">Qty</th>
                  <th className="px-6 py-4 text-left">Fat</th>
                  <th className="px-6 py-4 text-left">Rate</th>
                  <th className="px-6 py-4 text-left">Total</th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {filteredRecords.map(record => (
                  <tr
                    key={record.id}
                    className="hover:bg-emerald-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {formatDate(record.createdAt)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(record.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {record.milkType}
                    </td>

                    <td className="px-6 py-4">
                      {record.quantity} L
                    </td>

                    <td className="px-6 py-4">
                      {record.fat} %
                    </td>

                    <td className="px-6 py-4">
                      ₹ {record.pricePerLiter}
                    </td>

                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      ₹ {record.totalAmount}
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
    indigo: "from-indigo-500 to-purple-600"
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
