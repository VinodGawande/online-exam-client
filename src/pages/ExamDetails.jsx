import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import exams from "../data/exams";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'animate.css';
import axios from "axios";
import UpgradeModal from "../components/UpgradeModal";
import { apiUrl } from "../utils/api";

function ExamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const createdExams = JSON.parse(localStorage.getItem("createdExams")) || [];
  const allExams = [...createdExams, ...exams];
  const exam = allExams.find(e => String(e.id) === id || e.id === Number(id));

  if (!exam) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow animate__animated animate__fadeIn">
              <div className="card-body text-center p-5">
                <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
                <h3 className="mt-3">Exam Not Found</h3>
                <p className="text-muted">The exam you're looking for doesn't exist or has been removed.</p>
                <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
                  <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const safeExam = {
    ...exam,
    totalQuestions: exam.totalQuestions || (exam.questions ? exam.questions.length : 0),
    description: exam.description || "Teacher created exam",
    instructions:
      exam.instructions ||
      "Stay in full screen, avoid refreshing, and submit before time ends. Your answers auto-save as you go.",
    difficulty: exam.difficulty || "Medium",
  };

  const handleStartExam = async () => {
    const userId = JSON.parse(localStorage.getItem("user"))?._id;
    if (!userId) {
      navigate("/login");
      return;
    }

    setCheckingAccess(true);
    setAccessMessage("");

    try {
      const res = await axios.post(
        apiUrl("/api/membership/check-exam-access"),
        {},
        { headers: { "x-user-id": userId } }
      );

      if (!res.data?.canAccess) {
        setAccessMessage(res.data?.message || "Exam limit reached for this month.");
        setShowUpgradeModal(true);
        return;
      }

      localStorage.setItem("currentExam", JSON.stringify(safeExam));
      navigate("/instructions");
    } catch (error) {
      setAccessMessage("Could not verify membership access right now. Please try again.");
    } finally {
      setCheckingAccess(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg animate__animated animate__zoomIn">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0 fw-bold">
                  <i className="bi bi-file-earmark-text me-2"></i>
                {safeExam.title}
              </h3>
                <span className={`badge bg-${getDifficultyColor(safeExam.difficulty)} fs-6`}>
                  {safeExam.difficulty}
                </span>
              </div>
            </div>

            <div className="card-body p-4">
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-book text-primary me-3" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <h6 className="mb-0 fw-bold">Subject</h6>
                      <p className="mb-0 text-muted">{safeExam.subject}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-clock text-info me-3" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <h6 className="mb-0 fw-bold">Duration</h6>
                      <p className="mb-0 text-muted">{safeExam.duration} minutes</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-question-circle text-success me-3" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <h6 className="mb-0 fw-bold">Total Questions</h6>
                      <p className="mb-0 text-muted">{safeExam.totalQuestions} questions</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-bar-chart text-warning me-3" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <h6 className="mb-0 fw-bold">Difficulty</h6>
                      <p className="mb-0 text-muted">{safeExam.difficulty}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-info-circle text-primary me-2"></i>
                  Description
                </h5>
                <p className="text-muted">{safeExam.description}</p>
              </div>

              <div className="mb-4">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-list-check text-primary me-2"></i>
                  Instructions
                </h5>
                <div className="alert alert-info">
                  <p className="mb-0">{safeExam.instructions}</p>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/dashboard")}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Dashboard
                </button>

                <button
                  className="btn btn-success btn-lg px-4"
                  onClick={handleStartExam}
                  disabled={checkingAccess}
                >
                  <i className="bi bi-play-circle me-2"></i>
                  {checkingAccess ? "Checking access..." : "Start Exam"}
                </button>
              </div>
              {accessMessage && (
                <div className="alert alert-warning mt-3 mb-0">
                  {accessMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <UpgradeModal
        show={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeSuccess={() => {
          setShowUpgradeModal(false);
          setAccessMessage("");
        }}
      />
    </div>
  );
}

export default ExamDetails;
