import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Settings,
  Milk,
  CreditCard,
  ClipboardList,
  ChevronLeft,
  X,
} from "lucide-react";

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) {

  // ✅ VERY IMPORTANT
  const { activeRole } = useContext(AuthContext);

  const isAdmin = activeRole === "ROLE_ADMIN";
  const isFarmer = activeRole === "ROLE_FARMER";
  const isDairy = activeRole === "ROLE_DAIRY_OWNER";
  

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition
     ${
       isActive
         ? "bg-indigo-100 text-indigo-600 font-semibold"
         : "text-gray-700 hover:bg-gray-100"
     }`;

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Overlay (Mobile) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full
          bg-white border-r shadow-sm
          w-64 z-50
          transform transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${collapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b h-16">
          
          <h2
            className={`text-xl font-bold text-indigo-600 ${
              collapsed ? "hidden lg:hidden" : ""
            }`}
          >
            MKVillage
          </h2>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block text-gray-500"
          >
            <ChevronLeft
              size={20}
              className={`transition-transform ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <div className="p-3 space-y-2 overflow-y-auto">

          {/* ================= ADMIN ================= */}
          {isAdmin && (
            <>
              <NavLink to="/admin" end className={linkClass} onClick={handleLinkClick}>
                <LayoutDashboard size={20} />
                {!collapsed && <span>Dashboard</span>}
              </NavLink>

              <NavLink to="/admin/users" className={linkClass} onClick={handleLinkClick}>
                <Users size={20} />
                {!collapsed && <span>Users</span>}
              </NavLink>

              <NavLink to="/admin/requests" className={linkClass} onClick={handleLinkClick}>
                <ClipboardList size={20} />
                {!collapsed && <span>Requests</span>}
              </NavLink>

              <NavLink to="/admin/settings" className={linkClass} onClick={handleLinkClick}>
                <Settings size={20} />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </>
          )}

          {/* ================= FARMER ================= */}
          {isFarmer && (
            <>
              <NavLink to="/farmer" end className={linkClass} onClick={handleLinkClick}>
                <LayoutDashboard size={20} />
                {!collapsed && <span>Dashboard</span>}
              </NavLink>

              <NavLink to="/farmer/milkRecords" className={linkClass} onClick={handleLinkClick}>
                <Milk size={20} />
                {!collapsed && <span>Milk Records</span>}
              </NavLink>

              <NavLink to="/farmer/payments" className={linkClass} onClick={handleLinkClick}>
                <CreditCard size={20} />
                {!collapsed && <span>Payments</span>}
              </NavLink>

              <NavLink to="/farmer/settings" className={linkClass} onClick={handleLinkClick}>
                <Settings size={20} />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </>
          )}

          {/* ================= DAIRY OWNER ================= */}
          {isDairy && (
            <>
              <NavLink to="/dairy" end className={linkClass} onClick={handleLinkClick}>
                <LayoutDashboard size={20} />
                {!collapsed && <span>Dashboard</span>}
              </NavLink>

              <NavLink to="/dairy/farmers" className={linkClass} onClick={handleLinkClick}>
                <Users size={20} />
                {!collapsed && <span>Farmers</span>}
              </NavLink>

              <NavLink to="/dairy/milk-collection" className={linkClass} onClick={handleLinkClick}>
                <Milk size={20} />
                {!collapsed && <span>Milk Collection</span>}
              </NavLink>

              <NavLink to="/dairy/dairy-payments" className={linkClass} onClick={handleLinkClick}>
                <CreditCard size={20} />
                {!collapsed && <span>Payments</span>}
              </NavLink>

              <NavLink to="/dairy/my-dairy" className={linkClass} onClick={handleLinkClick}>
                <CreditCard size={20} />
                {!collapsed && <span>My Dairy</span>}
              </NavLink>
              

              <NavLink to="/dairy/dairy-settings" className={linkClass} onClick={handleLinkClick}>
                <Settings size={20} />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </>
          )}

        </div>
      </div>
    </>
  );
}