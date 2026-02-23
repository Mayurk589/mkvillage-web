import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import api from "../../services/api";
import { Phone, Lock } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    mobile: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setForm({ ...form, mobile: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        mobile: "+91" + form.mobile,
        password: form.password,
      });

      const token = res.data.token;
      login(token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      const roles = payload.roles || [];

      // Save roles
      localStorage.setItem("roles", JSON.stringify(roles));

      // Default priority → FARMER first
      let defaultRole = null;

      if (roles.includes("ROLE_FARMER")) {
        defaultRole = "ROLE_FARMER";
      } else if (roles.includes("ROLE_DAIRY_OWNER")) {
        defaultRole = "ROLE_DAIRY_OWNER";
      } else if (roles.includes("ROLE_ADMIN")) {
        defaultRole = "ROLE_ADMIN";
      }

      // Save active role
      localStorage.setItem("activeRole", defaultRole);

      if (defaultRole === "ROLE_ADMIN") {
        navigate("/admin", { replace: true });
      } else if (defaultRole === "ROLE_DAIRY_OWNER") {
        navigate("/dairy", { replace: true });
      } else if (defaultRole === "ROLE_FARMER") {
        navigate("/farmer", { replace: true });
      }

    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid mobile number or password");
      } else if (err.response?.status === 404) {
        setError("User not found");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-indigo-200 via-blue-100 to-green-200
      px-4 sm:px-6 md:px-8 py-6">

      <div className="backdrop-blur-xl bg-white/70 border border-white/40
        p-6 sm:p-8 md:p-10
        rounded-2xl sm:rounded-3xl 
        shadow-2xl 
        w-full max-w-md">

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-indigo-700 mb-2">
          MK Village
        </h1>

        <p className="text-center text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
          Welcome back! Please login to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

          {/* Mobile */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Mobile Number
            </label>

            <div className="flex mt-2 rounded-xl overflow-hidden border 
              focus-within:ring-2 focus-within:ring-indigo-500
              bg-white">

              <div className="flex items-center px-3 sm:px-4 bg-gray-100 text-gray-700 font-medium text-sm">
                +91
              </div>

              <div className="flex items-center px-2 sm:px-3 text-gray-400">
                <Phone size={18} />
              </div>

              <input
                type="text"
                value={form.mobile}
                onChange={handleMobileChange}
                placeholder="Enter 10-digit mobile"
                className="w-full px-2 sm:px-3 py-2.5 sm:py-3 outline-none bg-transparent text-sm sm:text-base"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Password
            </label>

            <div className="flex items-center mt-2 border rounded-xl 
              px-3 bg-white
              focus-within:ring-2 focus-within:ring-indigo-500">

              <Lock size={18} className="text-gray-400 mr-2" />

              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="Enter password"
                className="w-full py-2.5 sm:py-3 outline-none bg-transparent text-sm sm:text-base"
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-200 text-red-600 
              text-xs sm:text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 
              text-white py-2.5 sm:py-3 
              rounded-xl font-semibold 
              text-sm sm:text-base
              hover:scale-[1.02] transition transform 
              shadow-lg disabled:opacity-60 active:scale-95"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register */}
        <p className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-gray-600">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-indigo-600 font-semibold cursor-pointer hover:underline"
          >
            Register here
          </span>
        </p>

      </div>
    </div>
  );
}