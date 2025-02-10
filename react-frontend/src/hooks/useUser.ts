import { useLocalStorage } from "./useLocalStorage";
import { useAuthContext } from "../context/AuthContext";

export const useUser = () => {
  const { user, setUser } = useAuthContext();
  const { setItem, removeItem } = useLocalStorage();

  const addUser = (userData: any, token: string, refreshToken: string) => {
    const user = {
      id: userData.id,
      email: userData.email,
      user_type: userData.user_type
    };
    setUser(user);
    setItem("user", JSON.stringify(user));
    setItem("jwtToken", token);
    setItem("refreshToken", refreshToken);
  };

  const removeUser = () => {
    setUser(null);
    removeItem("user");
    removeItem("jwtToken");
    removeItem("refreshToken");
  };

  return { user, addUser, removeUser };
};