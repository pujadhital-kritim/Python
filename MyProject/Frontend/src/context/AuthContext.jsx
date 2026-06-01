import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

// create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // on app load checks if user already logged in
  useEffect(() => {
    const savedUser  = localStorage.getItem("user");
    const savedToken = localStorage.getItem("access_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // REGISTER
  const register = async (formData) => {
    const res = await API.post("/auth/register/", formData);
    localStorage.setItem("access_token",  res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);
    localStorage.setItem("user",          JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  // LOGIN
  const login = async (formData) => {
    const res = await API.post("/auth/login/", formData);
    localStorage.setItem("access_token",  res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);
    localStorage.setItem("user",          JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  // LOGOUT
  const logout = async () => {
    try {
      const refresh_token = localStorage.getItem("refresh_token");
      await API.post("/auth/logout/", { refresh_token });
    } catch (err) {
      console.log(err);
    }
    // clear everything from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook easy way to use auth in any component
export const useAuth = () => useContext(AuthContext);