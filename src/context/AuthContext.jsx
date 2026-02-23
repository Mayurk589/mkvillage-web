import { createContext, useState, useEffect } from "react";
import { getRolesFromToken } from "../utils/tokenUtils";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [roles, setRoles] = useState(
    getRolesFromToken(localStorage.getItem("token"))
  );

  // ✅ Active Role (VERY IMPORTANT)
  const [activeRole, setActiveRole] = useState(
    localStorage.getItem("activeRole")
  );

  useEffect(() => {
  if (token) {
    localStorage.setItem("token", token);

    const extractedRoles = getRolesFromToken(token);
    setRoles(extractedRoles);

    // ✅ AUTO SET activeRole
    const storedRole = localStorage.getItem("activeRole");

    if (!storedRole && extractedRoles.length > 0) {
      const defaultRole = extractedRoles[0]; // only role or first role
      setActiveRole(defaultRole);
      localStorage.setItem("activeRole", defaultRole);
    } else {
      setActiveRole(storedRole);
    }

  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("activeRole");
    setRoles([]);
    setActiveRole(null);
  }
}, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        roles,
        activeRole,
        setActiveRole,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}