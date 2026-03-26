import React, { createContext, useState, useEffect } from "react";
import { getCurrentUser } from "../services/authService";

export const AuthStateContext = createContext(null);
export const AuthActionsContext = createContext(null);

const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const initUser = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

      if (token) {
        try {
          const userData = await getCurrentUser();

          setUser({
            ...userData,
            token
          });

        } catch (err) {
          console.log("Token invalid");
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
        }
      }
    };

    initUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  };

  return (
    <AuthStateContext.Provider value={{ user }}>
      <AuthActionsContext.Provider value={{ login, logout }}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
};

export default AuthProvider;