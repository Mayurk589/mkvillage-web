import { useContext, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { LogOut, Menu, Repeat } from "lucide-react";

const Navbar = ({ setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout, roles, activeRole, setActiveRole } =
    useContext(AuthContext);

  const hasMultipleRoles = roles.length > 1;

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {}
    finally {
      logout();
      navigate("/");
    }
  };

  const handleRoleToggle = () => {
    if (!hasMultipleRoles) return;

    const nextRole = roles.find((r) => r !== activeRole);

    setActiveRole(nextRole);
    localStorage.setItem("activeRole", nextRole);

    if (nextRole === "ROLE_ADMIN") navigate("/admin");
    if (nextRole === "ROLE_DAIRY_OWNER") navigate("/dairy");
    if (nextRole === "ROLE_FARMER") navigate("/farmer");
  };

  const getPageTitle = () => {
    if (location.pathname.includes("users")) return "Users";
    if (location.pathname.includes("requests")) return "Requests";
    if (location.pathname.includes("settings")) return "Settings";
    if (location.pathname.includes("payments")) return "Payments";
    return "Dashboard";
  };

  const formattedRole = useMemo(() => {
    return activeRole?.replace("ROLE_", "");
  }, [activeRole]);

  return (
    <div className="sticky top-0 z-40 h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6 lg:px-8">

      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={() => setMobileOpen(true)} className="lg:hidden">
          <Menu size={22} />
        </button>

        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        {hasMultipleRoles && (
          <button
            onClick={handleRoleToggle}
            className="flex items-center justify-center sm:justify-start gap-2 
                       bg-indigo-100 text-indigo-700 
                       px-2 sm:px-3 py-2 
                       rounded-full text-sm font-medium 
                       hover:bg-indigo-200 transition"
          >
            <Repeat size={16} />

            {/* Hide text only on very small screens */}
            <span className="hidden sm:inline">
              {formattedRole}
            </span>
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-indigo-600 text-white 
                     px-3 py-2 rounded-lg text-sm 
                     hover:bg-indigo-700 transition"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>

      </div>
    </div>
  );
};

export default Navbar;