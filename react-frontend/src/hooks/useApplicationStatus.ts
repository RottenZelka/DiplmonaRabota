import { useState, useEffect } from "react";
import { checkIfApplied } from "../services/api";
import TokenManager from "../utils/tokenManager";

interface ApplicationStatusResponse {
  is_applied: boolean;
  application_id?: string;
}

export const useApplicationStatus = (userId: string) => {
  const [isApplied, setIsApplied] = useState<boolean | null>(null);
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const decodedToken = TokenManager.getDecodedToken();
        if (!decodedToken) {
          throw new Error("No valid token found");
        }

        const response: ApplicationStatusResponse = await checkIfApplied(userId);

        if (response.is_applied === false) {
          setIsApplied(false);
        } else {
          setIsApplied(true);
          setAppId(response.application_id || null);
        }
      } catch (error) {
        console.error("Failed to fetch application status:", error);
        setIsApplied(null); // or you could set it to false to show an error state
      }
    };

    fetchStatus();
  }, [userId]); // Only depend on userId, as userType doesn't seem necessary

  return { isApplied, appId };
};
