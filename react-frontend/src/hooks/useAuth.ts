import { useEffect } from "react";
import { useUser } from "./useUser";
import { useLocalStorage } from "./useLocalStorage";
import { refreshToken } from "../services/api";
import { useAuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const { user, addUser, removeUser } = useUser();
  const { getItem } = useLocalStorage();
  const { setIsAuthenticated } = useAuthContext();

  useEffect(() => {
    const token = getItem("jwtToken");
    const refreshingToken = getItem("refreshToken");
    
    if (token && refreshingToken) {
      const tryRefresh = async () => {
        try {
      console.log("1");
          const newToken = await refreshToken();
          // Update user data with new token
          addUser(user, newToken, refreshingToken);
          setIsAuthenticated(true);
        } catch (error) {
          removeUser();
          setIsAuthenticated(false);
        }
      };
      
      tryRefresh();
    }
  }, []);

  const login = (userData: any, token: string, refreshToken: string) => {
    addUser(userData, token, refreshToken);
    setIsAuthenticated(true);
  };

  const logout = async () => {
      removeUser();
      setIsAuthenticated(false);
  };

  return { user, login, logout, isAuthenticated: !!user };
};