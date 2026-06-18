import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Instructions() {
  const exam = JSON.parse(localStorage.getItem("currentExam") || "{}");

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-lg">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <div>
            <p className="mb-1 text-white-50">Upcoming exam</p>
            <h4 className="mb-0">{exam.title || "Exam"}</h4>
          </div>
          <span className="badge bg-light text-primary">
            {exam.duration ? `${exam.duration} min` : "Timed"}
          </span>
        </div>
        <div className="card-body p-4">
          <p className="text-muted">
            Read these instructions carefully. Your answers auto-save, and the exam will submit when the timer ends.
          </p>
          <ul className="mb-4">
            <li>Keep your camera on and stay within frame during the exam.</li>
            <li>Do not refresh or close the tab once you begin.</li>
            <li>Each question carries equal marks; no negative marking unless specified.</li>
            <li>Your latest answer per question is saved automatically.</li>
            <li>Switching tabs repeatedly may pause or terminate the exam.</li>
          </ul>
          <div className="alert alert-warning d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Stable internet and a working camera are required.
          </div>
          <Link to="/exam" className="btn btn-success btn-lg mt-2">
            I agree, start exam
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Instructions;
