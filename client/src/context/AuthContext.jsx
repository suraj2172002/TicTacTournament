import { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../utils/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("ttt_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      api
        .get("/user/me")
        .then(({ data }) => {
          setUser(data.user);
        })
        .catch(() => {
          handleLogout();
        })
        .finally(() => setLoading(false));
    } else {
      setAuthToken(null);
      setLoading(false);
    }
  }, [token]);

  const handleAuthSuccess = (data) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("ttt_token", data.token);
    setAuthToken(data.token);
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    handleAuthSuccess(data);
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    handleAuthSuccess(data);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("ttt_token");
    setAuthToken(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    register,
    login,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
