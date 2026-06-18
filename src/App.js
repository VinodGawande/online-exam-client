import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Exam from "./pages/Exam";
import Result from "./pages/Result";
import Dashboard from "./pages/Dashboard";
import Instructions from "./pages/Instructions";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminExams from "./pages/admin/AdminExams";
import AdminResults from "./pages/admin/AdminResults";
import AdminQuestionBank from "./pages/admin/AdminQuestionBank";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminSettings from "./pages/admin/AdminSettings";
import ResultHistory from "./pages/ResultHistory";
import Footer from "./components/Footer";
import ExamDetails from "./pages/ExamDetails";
import TeacherProtectedRoute from "./components/TeacherProtectedRoute";
import TeacherDashboard from "./pages/TeacherDashboard";
import CreateExam from "./pages/CreateExam";
import Membership from "./pages/Membership";
import Profile from "./pages/Profile";
import { initializeRevealAnimations } from "./utils/animations";

function AppLayout() {
  const location = useLocation();
  const isExamMode = location.pathname === "/exam";
  const isAdminArea = location.pathname.startsWith("/admin");
  const hideFooter = isExamMode || isAdminArea;

  useEffect(() => {
    // Initialize reveal animations when location changes or component mounts
    const timer = setTimeout(() => {
      initializeRevealAnimations();
    }, 200);

    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    // Also initialize on first render
    initializeRevealAnimations();
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/exam" element={<ProtectedRoute><Exam /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/instructions" element={<ProtectedRoute><Instructions /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><ResultHistory /></ProtectedRoute>} />
        <Route path="/exam-details/:id" element={<ProtectedRoute><ExamDetails /></ProtectedRoute>} />
        <Route path="/membership" element={<ProtectedRoute><Membership /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
        <Route path="/admin/exams" element={<AdminProtectedRoute><AdminExams /></AdminProtectedRoute>} />
        <Route path="/admin/results" element={<AdminProtectedRoute><AdminResults /></AdminProtectedRoute>} />
        <Route path="/admin/question-bank" element={<AdminProtectedRoute><AdminQuestionBank /></AdminProtectedRoute>} />
        <Route path="/admin/security" element={<AdminProtectedRoute><AdminSecurity /></AdminProtectedRoute>} />
        <Route path="/admin/settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />

        <Route path="/teacher" element={<TeacherProtectedRoute><TeacherDashboard /></TeacherProtectedRoute>} />
        <Route path="/teacher/create" element={<TeacherProtectedRoute><CreateExam /></TeacherProtectedRoute>} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}

export default App;
