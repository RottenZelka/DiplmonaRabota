import { useAuthContext } from "../context/AuthContext";
import TokenManager from "../utils/tokenManager";

export const useUser = () => {
  const { user, setUser } = useAuthContext();

  const addUser = (userData: any, token: string, refreshToken: string) => {
    try {
      // Validate tokens before setting
      if (!token || !refreshToken) {
        throw new Error('Invalid tokens provided');
      }

      // Set tokens first
      TokenManager.setTokens(token, refreshToken);

      // Then set user data with proper type checking
      const user = {
        id: userData.id,
        email: userData.email,
        user_type: userData.user_type || 'student' // Default to student if not specified
      };

      // Validate user type
      if (!['student', 'school'].includes(user.user_type)) {
        throw new Error('Invalid user type');
      }

      setUser(user);
    } catch (error) {
      console.error('Error adding user:', error);
      // Clear any partial state on error
      TokenManager.clearTokens();
      setUser(null);
      throw error;
    }
  };

  const removeUser = () => {
    try {
      // Clear tokens first
      TokenManager.clearTokens();
      // Then clear user data
      setUser(null);
    } catch (error) {
      console.error('Error removing user:', error);
      // Ensure both are cleared even if one fails
      TokenManager.clearTokens();
      setUser(null);
    }
  };

  return { user, addUser, removeUser };
};