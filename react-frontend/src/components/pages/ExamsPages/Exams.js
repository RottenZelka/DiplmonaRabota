import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getExams, deleteExam, getSchoolExams } from "../../../services/api";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeUser = () => {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        const decodedToken = jwtDecode(token);
        setUserType(decodedToken.data.user_type);
        setUserId(decodedToken.data.user_id);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      if (!userType || !userId) return;

      setLoading(true);
      try {
        let response = userType === "school" ? await getSchoolExams(userId) : await getExams();

        if (!response || !response.exams) {
          throw new Error("Invalid API response");
        }

        setExams(response.exams);
        setError(false);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [userType, userId]);

  const handleDeleteExam = async (examId) => {
    try {
      await deleteExam(examId);
      setExams(exams.filter((exam) => exam.id !== examId));
    } catch (error) {
      console.error("Error deleting exam:", error);
    }
  };

  const handleCreateExam = () => {
    navigate("/create-exam");
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}>
        {userType === "school" ? "Manage Your Exams" : "Available Exams"}
      </Typography>

      {userType === "school" && (
        <Box sx={{ mb: 4, display: "flex", gap: 3, alignItems: "center" }}>
          <Button variant="contained" color="primary" onClick={handleCreateExam}>
            Create Exam
          </Button>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Failed to load exams. Please try again later.</Alert>
      ) : (
        <Grid container spacing={4}>
          {exams.map((exam) => (
            <Grid item xs={12} sm={6} md={4} lg={4} key={exam.id}>
              <Card
                sx={{ height: "100%", display: "flex", flexDirection: "column", cursor: "pointer" }}
                onClick={() => (userType === "student" ? navigate(`/take-exam/${exam.id}`) : null)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {exam.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Time Needed: {exam.time_needed_minutes} minutes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mandatory: {exam.is_mandatory ? "Yes" : "No"}
                  </Typography>
                </CardContent>

                {userType === "school" && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
                    <IconButton color="primary" onClick={() => navigate(`/exam/${exam.id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteExam(exam.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Exams;
