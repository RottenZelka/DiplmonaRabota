import { useUser } from "./useUser";
import { useAuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const { user, addUser, removeUser } = useUser();
  const { setIsAuthenticated } = useAuthContext();

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