import { Routes, Route } from "react-router-dom";

import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import VerifyOtp from "../components/auth/VerifyOtp";

import AdminDashboard from "../components/admin/AdminDashboard";
import UsersManagement from "../components/admin/UsersManagement";
import RoleApproval from "../components/admin/RoleApproval";

import Settings from "../components/common/Settings";
import ProtectedRoute from "../components/common/ProtectedRoute";

import FarmerDashboard from "../components/farmer/FarmerDashboard";
import FarmerSettings from "../components/farmer/FarmerSettings";
import FarmerMilkRecords from "../components/farmer/FarmerMilkRecords";
import FarmerPayments from "../components/farmer/FarmerPayments";

import DairyDashboard from "../components/dairy/DairyDashboard";
import DairyFarmers from "../components/dairy/DairyFarmers";
import DairyMilkCollection from "../components/dairy/DairyMilkCollection";
import DairySettings from "../components/dairy/DairySettings";
import DairyPayments from "../components/dairy/DairyPayments";
import DairyMyDairy from "../components/dairy/MyDairy";

export default function AppRoutes() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* ================= FARMER ================= */}
      <Route
        path="/farmer"
        element={
          <ProtectedRoute allowedRoles={["ROLE_FARMER"]}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/milkRecords"
        element={
          <ProtectedRoute allowedRoles={["ROLE_FARMER"]}>
            <FarmerMilkRecords />
          </ProtectedRoute>
        }
      />

       <Route
        path="/farmer/payments"
        element={
          <ProtectedRoute allowedRoles={["ROLE_FARMER"]}>
            <FarmerPayments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/settings"
        element={
          <ProtectedRoute allowedRoles={["ROLE_FARMER"]}>
            <FarmerSettings />
          </ProtectedRoute>
        }
      />

      {/* ================= DAIRY ================= */}
      <Route
        path="/dairy"
        element={
          <ProtectedRoute allowedRoles={["ROLE_DAIRY_OWNER"]}>
            <DairyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dairy/farmers"
        element={
          <ProtectedRoute allowedRoles={["ROLE_DAIRY_OWNER"]}>
            <DairyFarmers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dairy/milk-collection"
        element={
          <ProtectedRoute allowedRoles={["ROLE_DAIRY_OWNER"]}>
            <DairyMilkCollection />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dairy/dairy-payments"
        element={
          <ProtectedRoute allowedRoles={["ROLE_DAIRY_OWNER"]}>
            <DairyPayments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dairy/my-dairy"
        element={
          <ProtectedRoute allowedRoles={["ROLE_DAIRY_OWNER"]}>
            <DairyMyDairy />
          </ProtectedRoute>
        }
      />


      <Route
        path="/dairy/dairy-settings"
        element={
          <ProtectedRoute allowedRoles={["ROLE_DAIRY_OWNER"]}>
            <DairySettings />
          </ProtectedRoute>
        }
      />


      {/* ================= ADMIN ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="users" element={<UsersManagement />} />
        <Route path="requests" element={<RoleApproval />} />
        <Route path="settings" element={<Settings />} />
      </Route>

    </Routes>
  );
}
