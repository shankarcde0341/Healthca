import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, TOKEN_KEY, apiErrorMessage } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null until initial /me completes
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(false);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (e) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async ({ email, password, role }) => {
    try {
      const { data } = await api.post("/auth/login", { email, password, role });
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (e) {
      return { ok: false, error: apiErrorMessage(e, "Login failed") };
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (e) {
      return { ok: false, error: apiErrorMessage(e, "Registration failed") };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function dashboardPath(role) {
  if (role === "patient") return "/patient/dashboard";
  if (role === "receptionist") return "/receptionist/dashboard";
  if (role === "doctor") return "/doctor/dashboard";
  return "/";
}
