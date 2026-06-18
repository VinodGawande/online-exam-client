import { useEffect, useMemo, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin-panel.css";
import API_BASE_URL from "../../utils/api";

const parseCsv = (text) => {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((item) => item.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((item) => item.trim());
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] || "";
      return acc;
    }, {});
  });
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "student",
    isAdmin: false,
    isBlocked: false,
  });

  const apiBase = API_BASE_URL;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase();
    return users.filter((user) =>
      (user.name || "").toLowerCase().includes(query) ||
      (user.email || "").toLowerCase().includes(query) ||
      (user.role || "").toLowerCase().includes(query)
    );
  }, [search, users]);

  const counts = useMemo(() => ({
    students: users.filter((item) => item.role === "student").length,
    teachers: users.filter((item) => item.role === "teacher").length,
    blocked: users.filter((item) => item.isBlocked || item.status === "blocked").length,
  }), [users]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", email: "", role: "student", isAdmin: false, isBlocked: false });
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: "changeme123",
          role: form.role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFeedback(data.message || "Could not create user.");
        return;
      }

      if (form.isBlocked) {
        const allRes = await fetch(`${apiBase}/users`);
        const allUsers = await allRes.json();
        const created = Array.isArray(allUsers) ? allUsers.find((item) => item.email === form.email) : null;
        if (created?._id) {
          await fetch(`${apiBase}/users/${created._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isBlocked: true, status: "blocked" }),
          });
        }
      }

      setFeedback("User created successfully.");
      resetForm();
      fetchUsers();
    } catch (err) {
      setFeedback("User creation failed.");
    }
  };

  const handleEditStart = (user) => {
    setEditing(user._id);
    setFeedback("");
    setForm({
      name: user.name,
      email: user.email,
      role: user.role || "student",
      isAdmin: !!user.isAdmin,
      isBlocked: !!user.isBlocked || user.status === "blocked",
    });
  };

  const handleSave = async () => {
    try {
      await fetch(`${apiBase}/users/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: form.role,
          isAdmin: form.role === "admin" || form.isAdmin,
          isBlocked: form.isBlocked,
        }),
      });
      setFeedback("User updated successfully.");
      resetForm();
      fetchUsers();
    } catch (err) {
      setFeedback("Update failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await fetch(`${apiBase}/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  const handleToggleBlock = async (user) => {
    await fetch(`${apiBase}/users/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: !(user.isBlocked || user.status === "blocked") }),
    });
    fetchUsers();
  };

  const handleBulkImport = async () => {
    const rows = parseCsv(bulkText).map((item) => ({
      name: item.name,
      email: item.email,
      role: item.role || "student",
      password: item.password || "changeme123",
      isBlocked: item.status === "blocked" || item.isblocked === "true",
    }));

    if (!rows.length) {
      setFeedback("Paste CSV with at least name,email,role columns.");
      return;
    }

    const res = await fetch(`${apiBase}/admin/users/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users: rows }),
    });
    const data = await res.json();
    setFeedback(data.message || "Bulk import complete.");
    setBulkText("");
    fetchUsers();
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setBulkText(text);
  };

  return (
    <div className="admin-page">
      <AdminNavbar />
      <div className="container py-4">
        <div className="admin-header">
          <div>
            <h2>User management</h2>
            <p className="mb-0">Add, edit, delete, block/unblock, and bulk import students or teachers.</p>
          </div>
          <div className="admin-chip-row">
            <span className="admin-chip">{users.length} total users</span>
            <span className="admin-chip">{counts.students} students</span>
            <span className="admin-chip">{counts.teachers} teachers</span>
            <span className="admin-chip">{counts.blocked} blocked</span>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-lg-5">
            <div className="admin-surface p-3 p-md-4 h-100">
              <h3 className="mb-3">{editing ? "Edit user" : "Create user"}</h3>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Full name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input name="email" value={form.email} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Role</label>
                  <select name="role" value={form.role} onChange={handleChange} className="form-select">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="col-md-6 d-flex align-items-center">
                  <div className="form-check mt-4">
                    <input className="form-check-input" type="checkbox" id="blockUser" name="isBlocked" checked={form.isBlocked} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="blockUser">Blocked account</label>
                  </div>
                </div>
              </div>

              {feedback && <div className="alert alert-info mt-3 mb-0">{feedback}</div>}

              <div className="admin-actions mt-3">
                {editing ? (
                  <>
                    <button className="btn btn-success" onClick={handleSave}>Save changes</button>
                    <button className="btn btn-outline-light" onClick={resetForm}>Cancel</button>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={handleCreate}>Create user</button>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="admin-surface p-3 p-md-4 h-100">
              <div className="admin-header mb-3">
                <div>
                  <h3>Bulk upload</h3>
                  <p className="mb-0">Import many students in one go with CSV columns like `name,email,role,password,status`.</p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <input type="file" accept=".csv,text/csv" className="form-control" onChange={handleFile} />
                </div>
                <div className="col-12">
                  <textarea
                    className="form-control"
                    rows="8"
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={"name,email,role,password,status\nAman,aman@example.com,student,changeme123,active"}
                  />
                </div>
              </div>
              <div className="admin-actions mt-3">
                <button className="btn btn-outline-light" onClick={handleBulkImport}>Import CSV</button>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-surface p-3 p-md-4 mt-4">
          <div className="admin-header">
            <div>
              <h3>User directory</h3>
              <p className="mb-0">Search and manage all student, teacher, and admin accounts.</p>
            </div>
            <div style={{ minWidth: "280px" }}>
              <input
                className="form-control"
                placeholder="Search by name, email, role"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="admin-empty">Loading users...</div>
          ) : !filteredUsers.length ? (
            <div className="admin-empty">No users found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const blocked = user.isBlocked || user.status === "blocked";
                    return (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role || "student"}</td>
                        <td>
                          <span className={`admin-tag ${blocked ? "danger" : "success"}`}>
                            {blocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
                        <td className="d-flex gap-2 flex-wrap">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditStart(user)}>Edit</button>
                          <button className="btn btn-sm btn-outline-warning" onClick={() => handleToggleBlock(user)}>
                            {blocked ? "Unblock" : "Block"}
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user._id)}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
