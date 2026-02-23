import api from "./api";

export const sendOtp = (data) =>
  api.post("/auth/register/send-otp", data);

export const verifyOtp = (data) =>
  api.post("/auth/register/verify-otp", data);

export const loginUser = (data) =>
  api.post("/auth/login", data);

// 🔥 FIXED — override baseURL
export const getUserByMobile = (mobile) =>
  api.get(
    `/internal/users/by-mobile/${encodeURIComponent(mobile)}`,
    {
      baseURL: "http://mkvillage-user-service-env.eba-hkcstuwr.us-east-1.elasticbeanstalk.com"  // remove /api
    }
  );
