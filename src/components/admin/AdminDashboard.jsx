import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function AdminDashboard() {
  const location = useLocation();

  const [stats, setStats] = useState({
    totalUsers: 0,
    farmers: 0,
    dairyOwners: 0,
    admins: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const usersRes = await api.get("/admin/users");
      const requestsRes = await api.get("/admin/dairy-owner-requests");

      const users = usersRes.data || [];

      setStats({
        totalUsers: users.length,
        farmers: users.filter((u) =>
          u.roles?.includes("ROLE_FARMER")
        ).length,
        dairyOwners: users.filter((u) =>
          u.roles?.includes("ROLE_DAIRY_OWNER")
        ).length,
        admins: users.filter((u) =>
          u.roles?.includes("ROLE_ADMIN")
        ).length,
        pendingRequests: requestsRes.data?.length || 0,
      });
    } catch (err) {
      console.error("Stats load failed", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-gray-50 min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8 py-6">

        {location.pathname === "/admin" && (
          <>
            {/* HEADER */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800">
                Admin Control Panel
              </h1>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                Monitor platform activity and manage users efficiently.
              </p>
            </div>

            {/* STATS GRID */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

              <PremiumCard
                title="Total Users"
                value={stats.totalUsers}
                gradient="from-blue-500 to-indigo-600"
              />

              <PremiumCard
                title="Farmers"
                value={stats.farmers}
                gradient="from-green-400 to-emerald-600"
              />

              <PremiumCard
                title="Dairy Owners"
                value={stats.dairyOwners}
                gradient="from-yellow-400 to-orange-500"
              />

              <PremiumCard
                title="Pending Requests"
                value={stats.pendingRequests}
                gradient="from-red-400 to-pink-600"
              />

            </div>
          </>
        )}

        <Outlet />
      </div>
    </DashboardLayout>
  );
}

/* ---------- COMPONENTS ---------- */

function PremiumCard({ title, value, gradient }) {
  return (
    <div
      className={`
        bg-gradient-to-r ${gradient}
        text-white
        rounded-2xl
        shadow-lg
        p-5 sm:p-6
        transition-transform duration-300
        hover:scale-[1.03]
      `}
    >
      <h3 className="text-xs sm:text-sm uppercase tracking-wide opacity-80">
        {title}
      </h3>

      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-3">
        {value}
      </p>
    </div>
  );
}