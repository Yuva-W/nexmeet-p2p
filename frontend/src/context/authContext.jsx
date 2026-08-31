import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from './../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

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
    const response = await api.post("/auth/login", {
      username,
      password,
    });

    localStorage.setItem("token", response.data.token);

    setUserData(response.data);

    navigate("/home");

    return response.data.message;
  };

  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
  };

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  );
};