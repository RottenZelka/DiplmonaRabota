import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { useAuth } from "../hooks/useAuth";

interface CustomJwtPayload extends JwtPayload {
  data: {
    user_id: string;
    email: string;
    user_type: string;
  };
  exp: number;
}

const API_BASE_URL = "http://localhost:8888/api"; // Update this with your backend API URL

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const refreshToken = async (): Promise<string> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/users/refresh-token', { refresh_token: refreshToken });
    if (response.data.token) {
      localStorage.setItem('jwtToken', response.data.token);
      return response.data.token;
    } else {
      throw new Error('Failed to refresh token');
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

// Automatically attach the Authorization token (if available)
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("jwtToken");
  if (token) {
    const decoded = jwtDecode<CustomJwtPayload>(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      try {
        const newToken = await refreshToken();
        config.headers.set('Authorization', `Bearer ${newToken}`);
        return config;
      } catch (error) {
        const { logout } = useAuth();
        await logout();
        throw error;
      }
    }

    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshToken();
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Handles API errors and returns a standardized response.
 */
const handleApiError = (error: any) => {
  if (!error.response) {
    return { status: 500, message: "Network Error. Please try again." };
  }

  const { status, data } = error.response;
  return {
    status,
    message: data.message || "An error occurred",
  };
};

// User Authentication API
export const registerUser = async (userData: any) => {
  try {
    const response = await apiClient.post("/register", userData);
    if (response.data.token && response.data.refresh_token) {
      localStorage.setItem('jwtToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refresh_token);

      const decoded = jwtDecode<CustomJwtPayload>(response.data.token);

      const userData = {
        id: decoded.data.user_id,
        email: decoded.data.email,
        user_type: decoded.data.user_type,
      };
      return response.data;
    }
    else
      throw new Error('Register failed');
  } catch (error) {
    return handleApiError(error);
  }
};

export const signInUser = async (credentials: { email: string; password: string }) => {
  try {
    const response = await apiClient.post("/signin", credentials);
    if (response.data.token && response.data.refresh_token) {
      localStorage.setItem('jwtToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refresh_token);

      const decoded = jwtDecode<CustomJwtPayload>(response.data.token);

      const userData = {
        id: decoded.data.user_id,
        email: decoded.data.email,
        user_type: decoded.data.user_type,
      };
      return userData;
    }
    throw new Error('Login failed');
  } catch (error) {
    throw handleApiError(error);
  }
};

export const logoutUser = async () => {
  try {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return true;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getUserType = async (id: string) => {
  try {
    const response = await apiClient.get(`/users/type/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getUserById = async (userType: string, id: string) => {
  try {
    const response = await apiClient.get(`/${userType}/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getUserImage = async (id: string) => {
  try {
    const response = await apiClient.get(`/users/${id}/image`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteUser = async () => {
  try {
    const response = await apiClient.delete(`/users`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
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

export const getSchoolById = async (id: string) => {
  try {
    const response = await apiClient.get(`/school/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createSchool = async (schoolData: any) => {
  try {
    const response = await apiClient.post("/school", schoolData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateSchool = async (schoolData: any) => {
  try {
    const response = await apiClient.patch(`/school`, schoolData);
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

export const getStudentById = async (id: string) => {
  try {
    const response = await apiClient.get(`/student/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createStudent = async (studentData: any) => {
  try {
    const response = await apiClient.post("/student", studentData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateStudent = async (studentData: any) => {
  try {
    const response = await apiClient.patch(`/student`, studentData);
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

export const getSchoolLevelById = async (id: string) => {
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

export const getStudyById = async (id: string) => {
  try {
    const response = await apiClient.get(`/studies/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Links API
export const uploadLink = async (fileData: File, type: string, applicationId?: string) => {
  if (!fileData) {
    console.error('uploadLink called with no file data');
    return { status: 'error', message: 'No file provided' };
  }

  const formData = new FormData();
  formData.append('file', fileData);

  let url = `/links/upload?type=${type}`;
  if (type === 'Application' && applicationId) {
    url += `&application_id=${applicationId}`;
  }

  try {
    const response = await apiClient.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateApplicationId = async (linkId: string, applicationId: string) => {
  try {
    const response = await apiClient.post('/links/update-application', { linkId, applicationId });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Application API
export const apply = async (id: string, applicationData: any) => {
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

export const getApplicationById = async (id: string) => {
  try {
    const response = await apiClient.get(`/application/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const handleApplication = async (id: string, actionData: any) => {
  try {
    const response = await apiClient.post(`/application/handle/${id}`, actionData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const checkIfApplied = async (id: string) => {
  try {
    const response = await apiClient.get(`/is-applied/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Exam Questions API
export const createExamQuestion = async (questionData: any) => {
  try {
    const response = await apiClient.post("/exam-questions/create", questionData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateExamQuestion = async (id: string, questionData: any) => {
  try {
    const response = await apiClient.patch(`/exam-questions/update/${id}`, questionData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const checkExamQuestion = async (examId: string, studentId: string, questionId: string, data: any) => {
  try {
    const response = await apiClient.post(`/exam-questions/check-question/${examId}/${studentId}/${questionId}`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteExamQuestion = async (id: string) => {
  try {
    const response = await apiClient.delete(`/exam-questions/delete/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getExamQuestionsWithAnswers = async (examId: string) => {
  try {
    const response = await apiClient.get(`/exam-questions/get-exam-questions/${examId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getExamQuestions = async (examId: string) => {
  try {
    const response = await apiClient.get(`/exam-questions/get-exam-questions-no-ans/${examId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const reviewExamQuestion = async (examId: string, studentId: string, questionId: string) => {
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
export const viewExamResults = async (examId: string) => {
  try {
    const response = await apiClient.get(`/exam-results/view-results/${examId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const checkExam = async (examId: string, studentId: string) => {
  try {
    const response = await apiClient.post(`/exam-results/check-exam/${examId}/${studentId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Exams API
export const createExam = async (examData: any) => {
  try {
    const response = await apiClient.post("/exams/create", examData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateExam = async (id: string, examData: any) => {
  try {
    const response = await apiClient.patch(`/exams/update/${id}`, examData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteExam = async (id: string) => {
  try {
    const response = await apiClient.delete(`/exams/delete/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSchoolExams = async (schoolId: string) => {
  try {
    const response = await apiClient.get(`/exams/list-school-exams/${schoolId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getExams = async () => {
  try {
    const response = await apiClient.get(`/exams/list-exams`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getExamById = async (id: string) => {
  try {
    const response = await apiClient.get(`/exams/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPendingExams = async (id: string) => {
  try {
    const response = await apiClient.get(`/exam-results/view-pending-exams/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// Student Answers API
export const submitStudentAnswers = async (answersData: any) => {
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

export const viewStudentExams = async (schoolId: string) => {
  try {
    const response = await apiClient.get(`/student-answers/view-exams/${schoolId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const checkExamStatus = async (examId: string) => {
  try {
    const response = await apiClient.get(`/student-answers/check-status/${examId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Saved Schools API
export const saveSchool = async (schoolId: string) => {
  try {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
      throw new Error('No JWT token found');
    }

    const decodedToken = jwtDecode<CustomJwtPayload>(jwtToken);
    const studentId = decodedToken.data.user_id;

    const response = await apiClient.post('/saved-schools', { student_id: studentId, school_id: schoolId });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteSavedSchool = async (id: string) => {
  try {
    const response = await apiClient.delete(`/saved-schools/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteSavedSchoolId = async (schoolId: string) => {
  try {
    const response = await apiClient.delete(`/saved-schools-id/${schoolId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSavedSchools = async () => {
  try {
    const response = await apiClient.get("/saved-schools");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export default apiClient;
