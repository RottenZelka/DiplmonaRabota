import { useState, useEffect } from "react";
import axios from "axios";

export const useApplicationStatus = (userId) => {
  const [isApplied, setIsApplied] = useState(null);
  const [appId, setAppId] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axios.get(`http://localhost:8888/api/is-applied/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.is_applied === false) {
          setIsApplied(false);
        } else {
          setIsApplied(true);
          setAppId(response.data.application_id);
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
