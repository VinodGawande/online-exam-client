import { useEffect, useMemo, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin-panel.css";

const emptyForm = {
  subject: "",
  topic: "",
  difficulty: "Medium",
  type: "MCQ",
  question: "",
  options: "",
  answer: "",
};

const parseCsv = (text) => {
  const lines = String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((item) => item.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((item) => item.trim());
    return headers.reduce((acc, header, index) => ({ ...acc, [header]: values[index] || "" }), {});
  });
};

function AdminQuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("questionBank") || "[]");
    setQuestions(Array.isArray(stored) ? stored : []);
  }, []);

  const persist = (next) => {
    setQuestions(next);
    localStorage.setItem("questionBank", JSON.stringify(next));
  };

  const summary = useMemo(() => ({
    subjects: new Set(questions.map((item) => item.subject)).size,
    easy: questions.filter((item) => item.difficulty === "Easy").length,
    medium: questions.filter((item) => item.difficulty === "Medium").length,
    hard: questions.filter((item) => item.difficulty === "Hard").length,
  }), [questions]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addQuestion = () => {
    if (!form.subject || !form.topic || !form.question) return;
    const next = [
      {
        id: Date.now(),
        ...form,
        options: form.options ? form.options.split("|").map((item) => item.trim()).filter(Boolean) : [],
        createdAt: new Date().toISOString(),
      },
      ...questions,
    ];
    persist(next);
    setForm(emptyForm);
  };

  const importBulk = () => {
    const rows = parseCsv(bulkText).map((item) => ({
      id: Date.now() + Math.random(),
      subject: item.subject || "General",
      topic: item.topic || "General",
      difficulty: item.difficulty || "Medium",
      type: item.type || "MCQ",
      question: item.question || "",
      options: item.options ? item.options.split("|").map((part) => part.trim()).filter(Boolean) : [],
      answer: item.answer || "",
      createdAt: new Date().toISOString(),
    })).filter((item) => item.question);

    if (!rows.length) return;
    persist([...rows, ...questions]);
    setBulkText("");
  };

  const removeQuestion = (id) => {
    persist(questions.filter((item) => item.id !== id));
  };

  return (
    <div className="admin-page">
      <AdminNavbar />
      <div className="container py-4">
        <div className="admin-header">
          <div>
            <h2>Question bank</h2>
            <p className="mb-0">Add questions by type, topic, subject, and difficulty with support for bulk upload.</p>
          </div>
          <div className="admin-chip-row">
            <span className="admin-chip">{questions.length} questions</span>
            <span className="admin-chip">{summary.subjects} subjects</span>
            <span className="admin-chip">{summary.easy}/{summary.medium}/{summary.hard} E/M/H</span>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-lg-5">
            <div className="admin-surface p-3 p-md-4 h-100">
              <h3 className="mb-3">Add question</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Subject</label>
                  <input className="form-control" name="subject" value={form.subject} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Topic</label>
                  <input className="form-control" name="topic" value={form.topic} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Difficulty</label>
                  <select className="form-select" name="difficulty" value={form.difficulty} onChange={handleChange}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Type</label>
                  <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                    <option>MCQ</option>
                    <option>True/False</option>
                    <option>Fill in the blanks</option>
                    <option>Descriptive</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Question</label>
                  <textarea className="form-control" rows="4" name="question" value={form.question} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Options</label>
                  <input className="form-control" name="options" value={form.options} onChange={handleChange} placeholder="Option A|Option B|Option C|Option D" />
                </div>
                <div className="col-12">
                  <label className="form-label">Correct answer</label>
                  <input className="form-control" name="answer" value={form.answer} onChange={handleChange} />
                </div>
              </div>
              <div className="admin-actions mt-3">
                <button className="btn btn-primary" onClick={addQuestion}>Add to bank</button>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="admin-surface p-3 p-md-4 h-100">
              <h3 className="mb-3">Bulk question upload</h3>
              <p className="admin-muted">Use CSV columns like `subject,topic,difficulty,type,question,options,answer`.</p>
              <textarea
                className="form-control"
                rows="9"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"subject,topic,difficulty,type,question,options,answer\nMath,Algebra,Easy,MCQ,2+2=?,1|2|3|4,4"}
              />
              <div className="admin-actions mt-3">
                <button className="btn btn-outline-light" onClick={importBulk}>Import questions</button>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-surface p-3 p-md-4 mt-4">
          <h3 className="mb-3">Question library</h3>
          {!questions.length ? (
            <div className="admin-empty">No questions in the bank yet.</div>
          ) : (
            <div className="d-grid gap-3">
              {questions.map((item) => (
                <div className="admin-panel-card" key={item.id}>
                  <div className="d-flex justify-content-between gap-2 align-items-start">
                    <div>
                      <h4 className="h6 mb-1">{item.question}</h4>
                      <p className="mb-2">{item.subject} • {item.topic} • {item.type}</p>
                    </div>
                    <span className="admin-tag info">{item.difficulty}</span>
                  </div>
                  {Array.isArray(item.options) && item.options.length > 0 && (
                    <div className="admin-chip-row mb-3">
                      {item.options.map((option) => (
                        <span className="admin-chip" key={option}>{option}</span>
                      ))}
                    </div>
                  )}
                  <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                    <small className="admin-muted">Answer: {item.answer || "Not set"}</small>
                    <button className="btn btn-sm btn-danger" onClick={() => removeQuestion(item.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminQuestionBank;
