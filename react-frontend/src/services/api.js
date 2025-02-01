import axios from "axios";

const API_BASE_URL = "http://localhost:8888/api"; // Update this with your backend API URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach the Authorization token (if available)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwtToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Handles API errors and returns a standardized response.
 */
const handleApiError = (error) => {
  if (!error.response) {
    return { status: 500, message: "Network Error. Please try again." };
  }

  const { status, data } = error.response;
  return {
    status,
    message: data.message || "An error occurred",
  };
};

// School API
export const getSchools = async () => {
  try {
    const response = await apiClient.get("/schools");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSchoolById = async (id) => {
  try {
    const response = await apiClient.get(`/school/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createSchool = async (schoolData) => {
  try {
    const response = await apiClient.post("/school", schoolData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateSchool = async (id, schoolData) => {
  try {
    const response = await apiClient.patch(`/school/${id}`, schoolData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteSchool = async (id) => {
  try {
    const response = await apiClient.delete(`/school/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Student API
export const getStudents = async () => {
  try {
    const response = await apiClient.get("/students");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getStudentById = async (id) => {
  try {
    const response = await apiClient.get(`/student/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createStudent = async (studentData) => {
  try {
    const response = await apiClient.post("/student", studentData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    const response = await apiClient.patch(`/student/${id}`, studentData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await apiClient.delete(`/student/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// School Levels API
export const getSchoolLevels = async () => {
  try {
    const response = await apiClient.get("/levels");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSchoolLevelById = async (id) => {
  try {
    const response = await apiClient.get(`/levels/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Studies API
export const getStudies = async () => {
  try {
    const response = await apiClient.get("/studies");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getStudyById = async (id) => {
  try {
    const response = await apiClient.get(`/studies/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Links API
export const uploadLink = async (fileData, type) => {
  try {
    const response = await apiClient.post(`/links/upload?type=${type}`, fileData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Application API
export const apply = async (id, applicationData) => {
  try {
    const response = await apiClient.post(`/application/${id}`, applicationData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getApplications = async () => {
  try {
    const response = await apiClient.get("/applications");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getApplicationById = async (id) => {
  try {
    const response = await apiClient.get(`/application/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const handleApplication = async (id, actionData) => {
  try {
    const response = await apiClient.post(`/application/handle/${id}`, actionData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const checkIfApplied = async (id) => {
  try {
    const response = await apiClient.get(`/is-applied/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// User Authentication API
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post("/register", userData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const signInUser = async (credentials) => {
  try {
    const response = await apiClient.post("/signin", credentials);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const logoutUser = async () => {
  try {
    const response = await apiClient.post("/logout");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getUserType = async (id) => {
  try {
    const response = await apiClient.get(`/users/type/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getUserById = async (userType, id) => {
    try {
      const response = await apiClient.get(`/${userType}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  };

// Exam Questions API
export const createExamQuestion = async (questionData) => {
  try {
    const response = await apiClient.post("/exam-questions/create", questionData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateExamQuestion = async (id, questionData) => {
  try {
    const response = await apiClient.patch(`/exam-questions/update/${id}`, questionData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const checkExamQuestion = async (examId, studentId, questionId) => {
  try {
    const response = await apiClient.post(`/exam-questions/check-question/${examId}/${studentId}/${questionId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteExamQuestion = async (id) => {
  try {
    const response = await apiClient.delete(`/exam-questions/delete/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getExamQuestions = async (examId) => {
  try {
    const response = await apiClient.get(`/exam-questions/get-exam-questions/${examId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const reviewExamQuestion = async (examId, studentId, questionId) => {
  try {
    const response = await apiClient.get(`/exam-questions/review-question/${examId}/${studentId}/${questionId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getQuestionTypes = async () => {
  try {
    const response = await apiClient.get("/question-types");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Exam Results API
export const viewExamResults = async (examId) => {
  try {
    const response = await apiClient.get(`/exam-results/view-results/${examId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const checkExam = async (examId, studentId) => {
  try {
    const response = await apiClient.post(`/exam-results/check-exam/${examId}/${studentId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Exams API
export const createExam = async (examData) => {
  try {
    const response = await apiClient.post("/exams/create", examData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateExam = async (id, examData) => {
  try {
    const response = await apiClient.patch(`/exams/update/${id}`, examData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteExam = async (id) => {
  try {
    const response = await apiClient.delete(`/exams/delete/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getExams = async (schoolId) => {
  try {
    const response = await apiClient.get(`/exams/list-exams/${schoolId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getExamById = async (id) => {
  try {
    const response = await apiClient.get(`/exams/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Student Answers API
export const submitStudentAnswers = async (answersData) => {
  try {
    const response = await apiClient.post("/student-answers/submit", answersData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const viewStudentResults = async () => {
  try {
    const response = await apiClient.get("/student-answers/view-results");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const viewStudentExams = async (schoolId) => {
  try {
    const response = await apiClient.get(`/student-answers/view-exams/${schoolId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export default apiClient;