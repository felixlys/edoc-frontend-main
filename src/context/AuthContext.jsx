import React, { createContext, useState, useEffect } from "react";
import api, { setAuthToken } from "../services/api"; // ⬅️ ambil api & baseURL dari sini

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setAuthToken(token);
    } else {
      localStorage.removeItem("token");
      setAuthToken(null);
    }

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [token, user]);

  const login = (userData, jwt) => {
    // ✅ gunakan baseURL dari axios (api.defaults.baseURL)
    const fixedUser = {
      ...userData,
      avatar: userData.avatar
        ? userData.avatar.startsWith("http")
          ? userData.avatar
          : api.defaults.baseURL + userData.avatar
        : null,
    };

    setUser(fixedUser);
    setToken(jwt);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
