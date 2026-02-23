import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {

  const { token, roles } = useContext(AuthContext);

  // 🔐 Not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 🔐 No role restriction
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  // 🔐 Role check
  const hasRole = allowedRoles.some(role =>
    roles.includes(role)
  );

  if (!hasRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}