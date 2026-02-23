import axios from "axios";

// =====================================
// USER SERVICE INSTANCE
// =====================================
const api = axios.create({
  baseURL: "https://mkvillage-user-service-env.eba-hkcstuwr.us-east-1.elasticbeanstalk.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================
// REQUEST INTERCEPTOR
// =====================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =====================================
// RESPONSE INTERCEPTOR
// =====================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// =====================================
// DAIRY SERVICE INSTANCE
// =====================================
export const dairyApi = axios.create({
  baseURL: "https://mkvillage-dairy-service-env.eba-x3hmmnph.us-east-1.elasticbeanstalk.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach interceptors
dairyApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

dairyApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
