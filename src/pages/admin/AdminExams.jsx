import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin-panel.css";

const defaultForm = {
  title: "",
  subject: "",
  duration: 60,
  passingMarks: 40,
  startDate: "",
  endDate: "",
  attemptLimit: 1,
  negativeMarking: 0,
  randomizeQuestions: true,
  published: false,
};

function AdminExams() {
  const [exams, setExams] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("createdExams") || "[]");
    setExams(Array.isArray(stored) ? stored : []);
  }, []);

  const persist = (next) => {
    setExams(next);
    localStorage.setItem("createdExams", JSON.stringify(next));
  };

  const metrics = useMemo(() => ({
    total: exams.length,
    live: exams.filter((item) => item.published !== false).length,
    drafts: exams.filter((item) => item.published === false).length,
    randomized: exams.filter((item) => item.randomizeQuestions).length,
  }), [exams]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const startEdit = (exam) => {
    setEditingId(exam.id);
    setForm({
      title: exam.title || "",
      subject: exam.subject || "",
      duration: exam.duration || 60,
      passingMarks: exam.passingMarks || 40,
      startDate: exam.startDate ? String(exam.startDate).slice(0, 16) : "",
      endDate: exam.endDate ? String(exam.endDate).slice(0, 16) : "",
      attemptLimit: exam.attemptLimit || 1,
      negativeMarking: exam.negativeMarking || 0,
      randomizeQuestions: exam.randomizeQuestions ?? true,
      published: exam.published ?? false,
    });
  };

  const reset = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const saveExam = () => {
    if (!editingId) return;
    const next = exams.map((exam) =>
      exam.id === editingId
        ? {
            ...exam,
            ...form,
            duration: Number(form.duration),
            passingMarks: Number(form.passingMarks),
            attemptLimit: Number(form.attemptLimit),
            negativeMarking: Number(form.negativeMarking),
            startDate: form.startDate || null,
            endDate: form.endDate || null,
          }
        : exam
    );
    persist(next);
    reset();
  };

  const togglePublish = (id) => {
    persist(exams.map((exam) => (exam.id === id ? { ...exam, published: !(exam.published !== false) } : exam)));
  };

  const removeExam = (id) => {
    if (!window.confirm("Delete this exam?")) return;
    persist(exams.filter((exam) => exam.id !== id));
    if (editingId === id) reset();
  };

  return (
    <div className="admin-page">
      <AdminNavbar />
      <div className="container py-4">
        <div className="admin-header">
          <div>
            <h2>Exam management</h2>
            <p className="mb-0">Manage scheduling, passing marks, randomization, negative marking, attempt limits, and publish status.</p>
          </div>
          <div className="admin-chip-row">
            <span className="admin-chip">{metrics.total} exams</span>
            <span className="admin-chip">{metrics.live} live</span>
            <span className="admin-chip">{metrics.drafts} drafts</span>
            <span className="admin-chip">{metrics.randomized} randomized</span>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-lg-5">
            <div className="admin-surface p-3 p-md-4 h-100">
              <div className="admin-header mb-3">
                <div>
                  <h3>Exam controls</h3>
                  <p className="mb-0">Select any exam below and update its rules.</p>
                </div>
                <Link to="/teacher/create" className="btn btn-outline-light btn-sm">Create new exam</Link>
              </div>

              {!editingId ? (
                <div className="admin-empty">Pick an exam from the right-side list to edit schedule and rules.</div>
              ) : (
                <>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Exam title</label>
                      <input name="title" className="form-control" value={form.title} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Subject</label>
                      <input name="subject" className="form-control" value={form.subject} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Duration (min)</label>
                      <input name="duration" type="number" className="form-control" value={form.duration} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Passing marks %</label>
                      <input name="passingMarks" type="number" className="form-control" value={form.passingMarks} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Start date</label>
                      <input name="startDate" type="datetime-local" className="form-control" value={form.startDate} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">End date</label>
                      <input name="endDate" type="datetime-local" className="form-control" value={form.endDate} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Attempt limit</label>
                      <input name="attemptLimit" type="number" className="form-control" value={form.attemptLimit} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Negative marking</label>
                      <input name="negativeMarking" type="number" className="form-control" value={form.negativeMarking} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="d-grid gap-2 mt-3">
                    <label className="form-check">
                      <input className="form-check-input" type="checkbox" name="randomizeQuestions" checked={form.randomizeQuestions} onChange={handleChange} />
                      <span className="form-check-label">Randomize questions for each student</span>
                    </label>
                    <label className="form-check">
                      <input className="form-check-input" type="checkbox" name="published" checked={form.published} onChange={handleChange} />
                      <span className="form-check-label">Publish exam live for students</span>
                    </label>
                  </div>

                  <div className="admin-actions mt-3">
                    <button className="btn btn-success" onClick={saveExam}>Save controls</button>
                    <button className="btn btn-outline-light" onClick={reset}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="col-lg-7">
            <div className="admin-surface p-3 p-md-4">
              <div className="admin-header mb-3">
                <div>
                  <h3>Exam catalog</h3>
                  <p className="mb-0">Draft and live exams with all core rule settings visible at once.</p>
                </div>
              </div>

              {!exams.length ? (
                <div className="admin-empty">No exams available. Create one from the teacher builder first.</div>
              ) : (
                <div className="d-grid gap-3">
                  {exams.map((exam) => (
                    <div className="admin-panel-card" key={exam.id}>
                      <div className="d-flex justify-content-between gap-2 flex-wrap align-items-start">
                        <div>
                          <h4 className="h6 mb-1">{exam.title || "Untitled Exam"}</h4>
                          <p className="mb-2">{exam.subject || "General"} • {exam.totalQuestions || exam.questions?.length || 0} questions</p>
                        </div>
                        <span className={`admin-tag ${exam.published !== false ? "success" : "warning"}`}>
                          {exam.published !== false ? "Live" : "Draft"}
                        </span>
                      </div>
                      <div className="admin-chip-row mb-3">
                        <span className="admin-chip">{exam.duration || 0} min</span>
                        <span className="admin-chip">Pass {exam.passingMarks || 40}%</span>
                        <span className="admin-chip">Attempts {exam.attemptLimit || 1}</span>
                        <span className="admin-chip">Neg. marking {exam.negativeMarking || 0}</span>
                        <span className="admin-chip">{exam.randomizeQuestions ? "Randomized" : "Fixed order"}</span>
                      </div>
                      <div className="admin-actions">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(exam)}>Edit rules</button>
                        <button className="btn btn-sm btn-outline-warning" onClick={() => togglePublish(exam.id)}>
                          {exam.published !== false ? "Move to draft" : "Publish live"}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => removeExam(exam.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminExams;
