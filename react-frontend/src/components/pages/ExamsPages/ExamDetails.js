import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  getExamById,
  getExamQuestionsWithAnswers,
  deleteExamQuestion,
  viewExamResults,
} from "../../../services/api";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const ExamDetails = () => {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [pendingExams, setPendingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const decodedToken = jwtDecode(token);
    setUserType(decodedToken.data.user_type);
    setUserId(decodedToken.data.user_id);
  }, [navigate]);

  useEffect(() => {
    const fetchExamDetails = async () => {
      setLoading(true);
      try {
        const [examRes, questionsRes, pendingRes] = await Promise.all([
          getExamById(id),
          getExamQuestionsWithAnswers(id),
          viewExamResults(id), // Check for submitted exams that need grading
        ]);

        setExam(examRes.exam);
        setQuestions(questionsRes.questions);
        setPendingExams(pendingRes.results || []);
        setError("");
      } catch (err) {
        console.error("Error fetching exam details:", err);
        setError("Failed to load exam details");
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [id]);

  const handleDeleteQuestion = async (questionId) => {
    try {
      await deleteExamQuestion(questionId);
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}>
        {exam.name}
      </Typography>

      {userType === "school" && (
        <Button variant="contained" color="secondary" sx={{ mb: 3 }} onClick={() => navigate(`/edit-exam/${id}`)}>
          Edit Exam
        </Button>
      )}

      <Typography variant="h5" sx={{ mb: 2 }}>
        Questions
      </Typography>

      {userType === "school" && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/exam/${id}/add-question`)}
          sx={{ mb: 4 }}
        >
          Add Question
        </Button>
      )}

      <List>
        {questions.map((question) => (
          <ListItem key={question.id}>
            <ListItemText
              primary={question.question_text}
              secondary={`Type: ${question.question_type}, Max Points: ${question.max_points}`}
            />
            {userType === "school" && (
              <>
                <IconButton color="primary" onClick={() => navigate(`/edit-question/${question.id}`)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeleteQuestion(question.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </ListItem>
        ))}
      </List>

      {userType === "school" && pendingExams.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Exams Waiting for Review
          </Typography>
          <List>
            {pendingExams.map((exam) => (
              <ListItem key={exam.student_id} button onClick={() => navigate(`/review-exam/${id}/${exam.student_id}`)}>
                <ListItemText
                  primary={`Student ID: ${exam.student_id}`}
                  secondary={`Score: ${exam.score || "Pending"}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );
};

export default ExamDetails;
