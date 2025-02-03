import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../components/pages/Home";
import SignIn from "../components/pages/AuthenticationPages/SignIn";
import Register from "../components/pages/AuthenticationPages/Register";
import RegisterSchool from "../components/pages/AuthenticationPages/RegisterSchool";
import RegisterStudent from "../components/pages/AuthenticationPages/RegisterStudent";
import Schools from "../components/pages/SchoolsPages/Schools";
import Students from "../components/pages/StudentsPages/Students";
import Exams from "../components/pages/ExamsPages/Exams";
import CreateExam from "../components/pages/ExamsPages/CreateExam";
import ExamDetails from "../components/pages/ExamsPages/ExamDetails";
import AddQuestion from "../components/pages/ExamsPages/AddQuestion";
import Applications from "../components/pages/ApplicationsPages/Applications";
import ApplicationApplyPage from "../components/pages/ApplicationsPages/ApplicationApplyPage";
import ApplicationView from "../components/pages/ApplicationsPages/ApplicationView";
import Profile from "../components/pages/ProfilesPages/Profile";
import TakeExam from "../components/pages/ExamsPages/TakeExam";
import StudentResults from "../components/pages/ExamsPages/StudentResults";
import ExamReview from "../components/pages/ExamsPages/ExamReview";
import BadRequest from "../components/errors/BadRequest";
import Unauthorized from "../components/errors/Unauthorized";
import NotFound from "../components/errors/NotFound";
import InternalServerError from "../components/errors/InternalServerError";


const AppRoutes = () => {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-student" element={<RegisterStudent />} />
        <Route path="/register-school" element={<RegisterSchool />} />
        <Route path="/schools" element={<Schools />} />
        <Route path="/students" element={<Students />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/application/:id" element={<ApplicationView />} />
        <Route path="/apply/:id" element={<ApplicationApplyPage />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/create-exam" element={<CreateExam />} />
        <Route path="/exam/:id" element={<ExamDetails />} />
        <Route path="/exam/:id/add-question" element={<AddQuestion />} />
        <Route path="/take-exam/:id" element={<TakeExam />} />
        <Route path="/student-results" element={<StudentResults />} />
        <Route path="/review-exam/:id/:studentId" element={<ExamReview />} />
        <Route path="/400" element={<BadRequest />} />
        <Route path="/401" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/500" element={<InternalServerError />} />
      </Routes>
  );
};

export default AppRoutes;
