import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api, { dairyApi } from "../../services/api";
import { getMobileFromToken } from "../../utils/tokenUtils";
import { getUserByMobile } from "../../services/authService";
import {
  User,
  ShieldCheck,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function FarmerSettings() {

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [mappingRequests, setMappingRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [requestMessages, setRequestMessages] = useState({});

  useEffect(() => {
    loadProfileAndMappings();
  }, []);

  // ================= LOAD PROFILE + MAPPINGS =================
  const loadProfileAndMappings = async () => {
    try {
      const token = localStorage.getItem("token");
      const mobile = getMobileFromToken(token);
      if (!mobile) return;

      const userRes = await getUserByMobile(mobile);
      const farmer = userRes.data;
      setProfile(farmer);

      const mappingRes = await dairyApi.get(
        `/mappings/farmer/${farmer.id}`
      );

      setMappingRequests(mappingRes.data || []);

    } catch (err) {
      console.error("Error loading profile/mappings:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= APPROVE =================
  const approveMapping = async (mappingId) => {
    try {
      setActionLoading(mappingId);

      await dairyApi.put(
        `/mappings/respond/${mappingId}`,
        null,
        { params: { status: "APPROVED" } }
      );

      // 🔥 Immediately update status locally
      setMappingRequests(prev =>
        prev.map(req =>
          req.id === mappingId
            ? {
                ...req,
                status: "APPROVED",
                respondedAt: new Date().toISOString()
              }
            : req
        )
      );

      setRequestMessages(prev => ({
        ...prev,
        [mappingId]: {
          type: "success",
          text: "Mapping approved successfully"
        }
      }));

    } catch (err) {
      setRequestMessages(prev => ({
        ...prev,
        [mappingId]: {
          type: "error",
          text: err.response?.data || "Approval failed"
        }
      }));
    } finally {
      setActionLoading(null);
    }
  };

  // ================= REJECT =================
  const rejectMapping = async (mappingId) => {
    try {
      setActionLoading(mappingId);

      await dairyApi.put(
        `/mappings/respond/${mappingId}`,
        null,
        { params: { status: "REJECTED" } }
      );

      // 🔥 Immediately update status locally
      setMappingRequests(prev =>
        prev.map(req =>
          req.id === mappingId
            ? {
                ...req,
                status: "REJECTED",
                respondedAt: new Date().toISOString()
              }
            : req
        )
      );

      setRequestMessages(prev => ({
        ...prev,
        [mappingId]: {
          type: "success",
          text: "Mapping rejected successfully"
        }
      }));

    } catch (err) {
      setRequestMessages(prev => ({
        ...prev,
        [mappingId]: {
          type: "error",
          text: err.response?.data || "Rejection failed"
        }
      }));
    } finally {
      setActionLoading(null);
    }
  };

  // ================= UPGRADE =================
  const requestUpgrade = async () => {
    setRequestLoading(true);

    try {
      await api.post("/farmer/request-dairy-owner");
      alert("Upgrade request submitted");
    } catch (err) {
      alert("Request failed");
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-60 text-gray-500">
          <Loader2 className="animate-spin mr-2" />
          Loading settings...
        </div>
      </DashboardLayout>
    );
  }

  const name = profile?.name || "Not Available";
  const mobile =
    profile?.mobileNumber ||
    profile?.mobile ||
    profile?.phone ||
    "Not Available";

  const roles = profile?.roles || [];
  const isDairyOwner = roles.includes("ROLE_DAIRY_OWNER");

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        Farmer Settings
      </h1>

      {/* PROFILE */}
      <div className="bg-white p-8 rounded-3xl shadow-xl mb-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-emerald-100 p-4 rounded-2xl">
            <User className="text-emerald-600" size={28} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              Profile Information
            </h2>
            <p className="text-gray-500 text-sm">
              Your registered account details
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium">{name}</p>
          </div>

          <div>
            <p className="text-gray-500">Mobile</p>
            <p className="font-medium">{mobile}</p>
          </div>
        </div>
      </div>

      {/* MAPPING REQUESTS */}
      {mappingRequests.length > 0 && (
        <div className="bg-white p-8 rounded-3xl shadow-xl mb-10">
          <h2 className="text-xl font-semibold mb-6">
            Dairy Mapping Requests
          </h2>

          {mappingRequests.map(req => (
            <div
              key={req.id}
              className="border border-gray-200 p-6 rounded-2xl mb-5 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg text-gray-800">
                    {req.dairyName}
                  </p>

                  <div className="mt-1 space-y-1 text-sm text-gray-600">
                    <p>📍 {req.dairyLocation}</p>
                    <p>📞 {req.dairyPhone}</p>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Requested on{" "}
                    {new Date(req.requestedAt).toLocaleDateString("en-GB")} •{" "}
                    {new Date(req.requestedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true
                    })}
                  </p>
                </div>

                <span
                  className={`px-4 py-1 text-xs font-semibold rounded-full ${
                    req.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : req.status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {req.status}
                </span>
              </div>

              {/* MESSAGE INSIDE BOX */}
              {requestMessages[req.id] && (
                <div
                  className={`mt-4 flex items-center justify-between p-3 rounded-xl text-sm ${
                    requestMessages[req.id].type === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {requestMessages[req.id].type === "success"
                      ? <CheckCircle size={16} />
                      : <AlertCircle size={16} />}
                    {requestMessages[req.id].text}
                  </div>

                  <button
                    onClick={() =>
                      setRequestMessages(prev => {
                        const copy = { ...prev };
                        delete copy[req.id];
                        return copy;
                      })
                    }
                    className="text-xs opacity-60 hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              )}

              {req.status === "PENDING" && (
                <div className="flex gap-4 mt-5">
                  <button
                    onClick={() => approveMapping(req.id)}
                    disabled={actionLoading === req.id}
                    className="bg-emerald-600 text-white px-5 py-2 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60"
                  >
                    {actionLoading === req.id
                      ? "Processing..."
                      : "Approve"}
                  </button>

                  <button
                    onClick={() => rejectMapping(req.id)}
                    disabled={actionLoading === req.id}
                    className="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 transition disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* UPGRADE */}
      {!isDairyOwner && (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-10 rounded-3xl shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <ShieldCheck size={30} />
            <div>
              <h2 className="text-xl font-semibold">
                Upgrade to Dairy Owner
              </h2>
              <p className="opacity-90 text-sm">
                Become a dairy owner and manage farmers & collections.
              </p>
            </div>
          </div>

          <button
            onClick={requestUpgrade}
            disabled={requestLoading}
            className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition disabled:opacity-60"
          >
            {requestLoading ? "Submitting..." : "Request Upgrade"}
          </button>
        </div>
      )}

    </DashboardLayout>
  );
}