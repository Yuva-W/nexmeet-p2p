import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const handleRegister = async (name, username, password) => {
    const response = await api.post("/auth/register", {
      name,
      username,
      password,
    });

    return response.data.message;
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", response.data.user.token);

      setUserData(response.data.user);

      console.log(response.data.user);

      navigate("/home");

      return response.data.message;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        setUserData(response.data.user);
      } catch (error) {
        console.log("Authentication failed");

        localStorage.removeItem("token");
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, []);

  const data = {
    userData,
    setUserData,
    isLoading,
    handleRegister,
    handleLogin,
  };

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  );
};