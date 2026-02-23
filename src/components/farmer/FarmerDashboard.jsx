import { useEffect, useState } from "react";
import { dairyApi } from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getMobileFromToken } from "../../utils/tokenUtils";
import { getUserByMobile } from "../../services/authService";
import {
  Droplets,
  TrendingUp,
  Wallet,
  Loader2
} from "lucide-react";

export default function FarmerDashboard() {

  const [profile, setProfile] = useState(null);
  const [milkQuantity, setMilkQuantity] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noMapping, setNoMapping] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const token = localStorage.getItem("token");
      const mobile = getMobileFromToken(token);
      if (!mobile) return;

      const userRes = await getUserByMobile(mobile);
      const farmerId = userRes.data.id;
      setProfile(userRes.data);

      // Get approved mapping
      const mappingRes = await dairyApi.get(
        `/mappings/farmer/${farmerId}`
      );

      const approvedMapping = mappingRes.data.find(
        m => m.status === "APPROVED"
      );

      if (!approvedMapping) {
        setNoMapping(true);
        return;
      }

      const dairyId = approvedMapping.dairyId;

      // 🔹 Fetch milk records
      const milkRes = await dairyApi.get(
        `/milk/farmer/${farmerId}`
      );

      const totalMilk = milkRes.data.reduce(
        (sum, m) => sum + (m.quantity || 0),
        0
      );

      setMilkQuantity(totalMilk);

      // 🔹 Fetch payment summary
      const summaryRes = await dairyApi.get(
        `/payments/summary`,
        {
          params: {
            dairyId,
            farmerId
          }
        }
      );

      setSummary(summaryRes.data);

    } catch (err) {
      console.error("Dashboard load failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-60 text-gray-500">
          <Loader2 className="animate-spin mr-2" />
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl mb-10">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.name} 👋
        </h1>
        <p className="mt-2 opacity-90 text-sm">
          Quick overview of your dairy activity.
        </p>
      </div>

      {noMapping && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-2xl text-center shadow">
          You are not mapped to any dairy yet.
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">

          <StatCard
            title="Total Milk Supplied"
            value={`${milkQuantity} L`}
            icon={<Droplets size={28} />}
            gradient="from-emerald-500 to-green-600"
          />

          <StatCard
            title="Total Earnings"
            value={`₹ ${summary.totalMilkEarnings ?? 0}`}
            icon={<TrendingUp size={28} />}
            gradient="from-blue-500 to-indigo-600"
          />

          <StatCard
            title="Pending Amount"
            value={`₹ ${summary.pendingAmount ?? 0}`}
            icon={<Wallet size={28} />}
            gradient="from-orange-500 to-red-500"
          />

        </div>
      )}

    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, gradient }) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} text-white p-7 rounded-3xl shadow-lg hover:scale-105 transition duration-300`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="opacity-80 text-sm">{title}</p>
          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}
