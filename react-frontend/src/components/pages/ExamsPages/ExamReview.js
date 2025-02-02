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
  TextField,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { getExamQuestions, reviewExamQuestion, checkExamQuestion } from "../../../services/api";

const ExamReview = () => {
  const { id, studentId } = useParams();
  const [answers, setAnswers] = useState([]);
  const [grades, setGrades] = useState({});
  const [commentaries, setCommentaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentAnswers = async () => {
      setLoading(true);
      try {
        const questionsResponse = await getExamQuestions(id);
        const questionList = questionsResponse.questions || [];
        
        const answersPromises = questionList.map((q) => reviewExamQuestion(id, studentId, q.id));
        const answersResponses = await Promise.all(answersPromises);
        
        const formattedAnswers = answersResponses.map((res) => ({
          question_id: res.question.id,
          question_text: res.question.text,
          student_answer: res.student_answer,
          max_points: res.question.max_points,
          question_type: res.question.type,
          correct_answer: res.question.correct_answer,
        }));

        setAnswers(formattedAnswers);
        setError("");
      } catch (err) {
        console.error("Error fetching answers:", err);
        setError("Failed to load student answers");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAnswers();
  }, [id, studentId]);

  const handleGradeChange = (questionId, value) => {
    setGrades({ ...grades, [questionId]: value });
  };

  const handleCommentaryChange = (questionId, value) => {
    setCommentaries({ ...commentaries, [questionId]: value });
  };

  const handleSubmitGrades = async () => {
    try {
      const gradingPromises = answers.map(async (answer) => {
        const requestData = {
          points: parseFloat(grades[answer.question_id]) || 0,
          commentary: commentaries[answer.question_id] || "",
        };

        return checkExamQuestion(id, studentId, answer.question_id, requestData);
      });

      await Promise.all(gradingPromises);
      navigate(`/exam/${id}`);
    } catch (error) {
      console.error("Error submitting grades:", error);
      setError("Failed to submit grades.");
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
        Review Exam
      </Typography>

      <List>
        {answers.map((answer) => (
          <ListItem key={answer.question_id}>
            <ListItemText primary={answer.question_text} secondary={`Student's Answer: ${answer.student_answer}`} />
            <TextField
              type="number"
              label={`Score (Max: ${answer.max_points})`}
              variant="outlined"
              size="small"
              value={grades[answer.question_id] || ""}
              onChange={(e) => handleGradeChange(answer.question_id, e.target.value)}
            />
            <TextField
              label="Commentary"
              variant="outlined"
              size="small"
              value={commentaries[answer.question_id] || ""}
              onChange={(e) => handleCommentaryChange(answer.question_id, e.target.value)}
              sx={{ ml: 2 }}
            />
          </ListItem>
        ))}
      </List>

      <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleSubmitGrades}>
        Submit Grades
      </Button>
    </Box>
  );
};

export default ExamReview;
