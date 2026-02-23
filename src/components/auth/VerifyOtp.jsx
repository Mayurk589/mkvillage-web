import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp, sendOtp } from "../../services/authService";
import { ShieldCheck } from "lucide-react";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (!userData) {
      navigate("/register");
    }
  }, [userData, navigate]);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const fullMobile = userData?.mobile || "";
  const digitsOnly = fullMobile.replace("+91", "");

  const maskedMobile =
    digitsOnly.length === 10
      ? digitsOnly.slice(0, 2) + "******" + digitsOnly.slice(-2)
      : "";

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      setLoading(false);
      return;
    }

    try {
      await verifyOtp({
        ...userData,
        mobile: fullMobile,
        otp: otp,
      });

      navigate("/login", {
        state: { success: "Registration successful. Please login." },
      });

    } catch {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setResendLoading(true);

    try {
      await sendOtp({
        name: userData.name,
        mobile: fullMobile,
        password: userData.password,
      });

      setTimer(30);
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setResendLoading(false);
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
          Verify OTP
        </h2>

        <p className="text-center text-gray-600 
          text-sm sm:text-base mb-3">
          Enter the 6-digit OTP sent to
        </p>

        <p className="text-center font-semibold text-indigo-600 
          text-sm sm:text-base mb-6 sm:mb-8">
          +91 {maskedMobile}
        </p>

        <form onSubmit={handleVerify} className="space-y-5 sm:space-y-6">

          {/* OTP Input */}
          <div className="flex items-center border rounded-xl 
            px-3 sm:px-4 bg-white
            focus-within:ring-2 focus-within:ring-indigo-500 transition">

            <ShieldCheck size={18} className="text-gray-400 mr-2 sm:mr-3" />

            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 6-digit OTP"
              className="w-full py-2.5 sm:py-3 outline-none 
                bg-transparent tracking-widest 
                text-center text-base sm:text-lg"
              required
            />
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
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

        </form>

        {/* Resend */}
        <div className="text-center mt-6 sm:mt-8 
          text-xs sm:text-sm text-gray-600">
          Didn’t receive OTP?{" "}
          <button
            onClick={handleResend}
            disabled={timer > 0 || resendLoading}
            className={`font-medium transition ${
              timer > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-indigo-600 hover:underline"
            }`}
          >
            {resendLoading
              ? "Sending..."
              : timer > 0
              ? `Resend in ${timer}s`
              : "Resend"}
          </button>
        </div>

      </div>
    </div>
  );
}