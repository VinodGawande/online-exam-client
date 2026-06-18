import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/create-exam.css";

const createEmptyOptions = () => ["", "", "", ""];

const isRichTextEmpty = (value) => {
  const cleaned = (value || "")
    .replace(/<p><br><\/p>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return cleaned.length === 0;
};

function CreateExam() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    subject: "",
    duration: "",
    difficulty: "Medium",
    description: "",
    published: true,
  });

  const [questionType, setQuestionType] = useState("mcq");
  const [questionText, setQuestionText] = useState("");
  const [image, setImage] = useState("");
  const [options, setOptions] = useState(createEmptyOptions());
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    const totalDuration = Number(form.duration) || 0;
    return {
      count: questions.length,
      duration: totalDuration,
      mcq: questions.filter((q) => Array.isArray(q.options) && q.options.length > 0).length,
      written: questions.filter((q) => !Array.isArray(q.options) || q.options.length === 0).length,
    };
  }, [form.duration, questions]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const resetQuestionBuilder = () => {
    setQuestionText("");
    setImage("");
    setOptions(createEmptyOptions());
    setCorrectAnswer(0);
    setQuestionType("mcq");
  };

  const addQuestion = () => {
    setError("");

    if (isRichTextEmpty(questionText) && !image) {
      setError("Add visible question text or upload an image.");
      return;
    }

    let payload = {
      id: Date.now(),
      question: questionText,
      text: questionText,
      image,
    };

    if (questionType === "mcq") {
      const trimmedOptions = options.map((item) => item.trim());
      if (trimmedOptions.some((item) => !item)) {
        setError("Fill all MCQ options before adding the question.");
        return;
      }

      payload = {
        ...payload,
        options: trimmedOptions,
        correctAnswer,
      };
    }

    setQuestions((prev) => [...prev, payload]);
    resetQuestionBuilder();
  };

  const handleCreate = () => {
    setError("");
    if (!form.title || !form.subject || !form.duration) {
      setError("Title, subject, and duration are required.");
      return;
    }
    if (questions.length === 0) {
      setError("Add at least one question.");
      return;
    }

    const newExam = {
      id: Date.now(),
      ...form,
      duration: Number(form.duration),
      description: form.description || "Custom exam created by teacher.",
      instructions:
        "Stay focused, avoid refreshing the page, and submit before the timer ends. Answers auto-save as you progress.",
      totalQuestions: questions.length,
      questions,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("createdExams")) || [];
    existing.push(newExam);
    localStorage.setItem("createdExams", JSON.stringify(existing));
    navigate("/teacher");
  };

  return (
    <div className="container py-5 create-page">
      <div className="section-heading with-line mb-3">
        <h2 className="mb-1">Create an exam</h2>
        <p className="muted mb-0">Set details, add MCQ or written questions, and publish when ready.</p>
      </div>

      <div className="layout-grid">
        <div className="card-surface form-panel">
          <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
            <p className="pill-slim">Details</p>
            <span className="muted small">
              {totals.count} questions • {totals.mcq} MCQ • {totals.written} written • {totals.duration || 0} min
            </span>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Exam title</label>
              <input
                className="form-control"
                placeholder="Midterm assessment"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Subject</label>
              <input
                className="form-control"
                placeholder="Physics, Grade 10"
                name="subject"
                value={form.subject}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Duration (minutes)</label>
              <input
                className="form-control"
                placeholder="45"
                name="duration"
                value={form.duration}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Difficulty</label>
              <select className="form-select" name="difficulty" value={form.difficulty} onChange={handleChange}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Short description</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="What is this exam about?"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <div className="col-12 form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="publishNow"
                name="published"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="publishNow">
                Publish immediately (visible to students)
              </label>
            </div>
          </div>
        </div>

        <div className="card-surface form-panel">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <p className="pill-slim mb-0">Add question</p>
            <button className="btn btn-primary btn-sm" onClick={addQuestion}>
              Add to list
            </button>
          </div>

          <label className="form-label">Question type</label>
          <select
            className="form-select mb-3"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="mcq">MCQ</option>
            <option value="written">Written answer</option>
          </select>

          <label className="form-label">Question text</label>
          <ReactQuill value={questionText} onChange={setQuestionText} className="mb-3 quill-box" />

          <label className="form-label">Optional image</label>
          <input type="file" className="form-control mb-3" onChange={handleImage} />
          {image && (
            <div className="preview-image mb-3">
              <img src={image} alt="preview" />
              <button className="btn btn-outline-danger btn-sm" onClick={() => setImage("")}>
                Remove
              </button>
            </div>
          )}

          {questionType === "mcq" && (
            <>
              <label className="form-label">Options</label>
              <div className="row g-2 mb-3">
                {options.map((option, index) => (
                  <div className="col-md-6" key={index}>
                    <input
                      className="form-control"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const next = [...options];
                        next[index] = e.target.value;
                        setOptions(next);
                      }}
                    />
                  </div>
                ))}
              </div>

              <label className="form-label">Correct answer</label>
              <select
                className="form-select mb-2"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(Number(e.target.value))}
              >
                {options.map((_, index) => (
                  <option key={index} value={index}>
                    Option {index + 1}
                  </option>
                ))}
              </select>
            </>
          )}

          {error && <div className="alert alert-danger py-2 mb-0 mt-2">{error}</div>}
        </div>

        <div className="card-surface preview-panel">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <p className="pill-slim mb-1">Preview</p>
              <h5 className="mb-0">Questions ({questions.length})</h5>
            </div>
            <button className="btn btn-success" onClick={handleCreate}>
              Save exam
            </button>
          </div>

          {questions.length === 0 ? (
            <p className="muted mb-0">Questions you add will appear here.</p>
          ) : (
            <div className="question-list">
              {questions.map((q, index) => (
                <div className="question-card" key={q.id}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <p className="pill-slim mb-2">Q{index + 1}</p>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setQuestions((prev) => prev.filter((item) => item.id !== q.id))}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="small" dangerouslySetInnerHTML={{ __html: q.question || q.text || "<em>No text provided</em>" }} />
                  {q.image && <img src={q.image} alt="question" className="question-image" />}
                  {Array.isArray(q.options) && q.options.length > 0 && (
                    <div className="mt-3">
                      {q.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="small mb-1">
                          {optionIndex + 1}. {option}
                          {q.correctAnswer === optionIndex ? " (Correct)" : ""}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateExam;
