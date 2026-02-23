import { useState } from "react";
import { sendOtp } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { User, Phone, Lock } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.name.trim()) {
      setError("Full name is required");
      setLoading(false);
      return;
    }

    if (form.mobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await sendOtp({
        name: form.name.trim(),
        mobile: "+91" + form.mobile,
        password: form.password,
      });

      navigate("/verify-otp", {
        state: {
          name: form.name.trim(),
          mobile: "+91" + form.mobile,
          password: form.password,
        },
      });

    } catch (err) {
      if (err.response?.status === 409) {
        setError("Mobile number already registered. Please login.");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid request.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (err.request) {
        setError("Network error. Please check your internet.");
      } else {
        setError("Registration failed. Please try again.");
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
        <h2 className="text-2xl sm:text-3xl md:text-4xl 
          font-extrabold text-center text-indigo-700 mb-2">
          Create Account
        </h2>

        <p className="text-center text-gray-600 
          text-sm sm:text-base mb-6 sm:mb-8">
          Join MK Village and get started
        </p>

        <form onSubmit={handleRegister} className="space-y-5 sm:space-y-6">

          {/* Full Name */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Full Name
            </label>

            <div className="flex items-center mt-2 border rounded-xl 
              px-3 sm:px-4 bg-white
              focus-within:ring-2 focus-within:ring-indigo-500">

              <User size={18} className="text-gray-400 mr-2 sm:mr-3" />

              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="Enter your full name"
                className="w-full py-2.5 sm:py-3 outline-none 
                  bg-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Mobile Number
            </label>

            <div className="flex mt-2 rounded-xl overflow-hidden border 
              bg-white focus-within:ring-2 focus-within:ring-indigo-500">

              <div className="flex items-center px-3 sm:px-4 
                bg-gray-100 text-gray-700 font-medium text-sm">
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
                className="w-full px-2 sm:px-3 py-2.5 sm:py-3 
                  outline-none bg-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Password
            </label>

            <div className="flex items-center mt-2 border rounded-xl 
              px-3 sm:px-4 bg-white
              focus-within:ring-2 focus-within:ring-indigo-500">

              <Lock size={18} className="text-gray-400 mr-2 sm:mr-3" />

              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="Create password"
                className="w-full py-2.5 sm:py-3 outline-none 
                  bg-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-200 
              text-red-600 text-xs sm:text-sm 
              p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r 
              from-indigo-600 to-blue-600 
              text-white py-2.5 sm:py-3 
              rounded-xl font-semibold 
              text-sm sm:text-base
              hover:scale-[1.02] active:scale-95 
              transition transform shadow-lg 
              disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

        </form>

        {/* Login Link */}
        <p className="text-center mt-6 sm:mt-8 
          text-xs sm:text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}