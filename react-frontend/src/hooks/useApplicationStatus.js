import { useState, useEffect } from "react";
import axios from "axios";
import { checkIfApplied } from "../services/api";

export const useApplicationStatus = (userId) => {
  const [isApplied, setIsApplied] = useState(null);
  const [appId, setAppId] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await checkIfApplied(userId);

        if (response.is_applied === false) {
          setIsApplied(false);
        } else {
          setIsApplied(true);
          setAppId(response.application_id);
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
