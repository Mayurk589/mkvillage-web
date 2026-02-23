import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { dairyApi } from "../../services/api";
import { getUserByMobile } from "../../services/authService";
import { getMobileFromToken } from "../../utils/tokenUtils";
import {
  Users,
  Droplets,
  TrendingUp,
  IndianRupee,
  AlertCircle
} from "lucide-react";

export default function DairyDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noDairy, setNoDairy] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      setNoDairy(false);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not logged in.");
        return;
      }

      const mobile = getMobileFromToken(token);
      if (!mobile) {
        setError("Invalid token.");
        return;
      }

      const userRes = await getUserByMobile(mobile);
      const ownerId = userRes.data.id;

      let dairyId;

      try {
        const dairyRes = await dairyApi.get(`/dairies/owner/${ownerId}`);
        dairyId = dairyRes.data?.id;

        if (!dairyId) {
          setNoDairy(true);
          return;
        }

      } catch (err) {
        // 🔥 Handle 404 and 403 as "No Dairy Created"
        if (
          err.response?.status === 404 ||
          err.response?.status === 403
        ) {
          setNoDairy(true);
          return;
        }

        throw err;
      }

      const dashRes = await dairyApi.get(`/dashboard/dairy/${dairyId}`);
      setDashboard(dashRes.data);

    } catch (err) {
      console.error("Dashboard load failed", err);
      setError(
        err.response?.data?.message || "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          Dairy Overview
        </h1>
        <p className="text-gray-500 text-sm sm:text-base mt-2">
          Monitor milk collection and earnings in real-time.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 animate-pulse h-28 rounded-2xl"
            />
          ))}
        </div>
      )}

      {/* No Dairy Created */}
      {!loading && noDairy && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={22} />
            <div>
              <p className="font-semibold">
                You haven't created your dairy yet.
              </p>
              <p className="text-sm opacity-80">
                Please create your dairy in the My Dairy section to view dashboard data.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/dairy/my-dairy")}
            className="bg-yellow-600 text-white px-5 py-2 rounded-xl hover:bg-yellow-700 transition"
          >
            Create Dairy
          </button>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Dashboard Cards */}
      {!loading && dashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">

          <StatCard
            title="Total Farmers"
            value={dashboard.totalFarmers ?? 0}
            icon={<Users size={26} />}
            color="from-emerald-500 to-emerald-700"
          />

          <StatCard
            title="Today's Milk"
            value={`${dashboard.todayTotalQuantity ?? 0} L`}
            icon={<Droplets size={26} />}
            color="from-blue-500 to-indigo-600"
          />

          <StatCard
            title="Today's Earnings"
            value={`₹ ${dashboard.todayEarnings ?? 0}`}
            icon={<IndianRupee size={26} />}
            color="from-purple-500 to-purple-700"
          />

          <StatCard
            title="Weekly Earnings"
            value={`₹ ${dashboard.weeklyEarnings ?? 0}`}
            icon={<TrendingUp size={26} />}
            color="from-pink-500 to-rose-600"
          />

        </div>
      )}

    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`
      bg-gradient-to-r ${color}
      p-5 sm:p-6
      rounded-2xl
      text-white
      shadow-md
      hover:shadow-xl
      transition
    `}>
      <div className="flex justify-between items-center">
        <div>
          <p className="opacity-80 text-sm sm:text-base">
            {title}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <div className="opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );
}