const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const membershipRoutes = require("./routes/membership");
const Result = require("./models/Result");
const UsageLimit = require("./models/UsageLimit");

const app = express();
const DEFAULT_ADMIN = {
  name: process.env.DEFAULT_ADMIN_NAME || "Platform Admin",
  email: process.env.DEFAULT_ADMIN_EMAIL || "admin@gmail.com",
  password: process.env.DEFAULT_ADMIN_PASSWORD || "admin123",
  role: "admin",
  isAdmin: true,
};

app.use(cors());
app.use(express.json());

app.use("/api/membership", membershipRoutes);

async function ensureDefaultAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });

    if (!existingAdmin) {
      const createdAdmin = await User.create(DEFAULT_ADMIN);
      console.log(`Default admin created: ${DEFAULT_ADMIN.email}`);
      return createdAdmin;
    }

    let shouldUpdate = false;

    if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      shouldUpdate = true;
    }

    if (!existingAdmin.isAdmin) {
      existingAdmin.isAdmin = true;
      shouldUpdate = true;
    }

    if (existingAdmin.password !== DEFAULT_ADMIN.password) {
      existingAdmin.password = DEFAULT_ADMIN.password;
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await existingAdmin.save();
      console.log(`Default admin updated: ${DEFAULT_ADMIN.email}`);
    }

    if (!shouldUpdate) {
      console.log(`Default admin ready: ${DEFAULT_ADMIN.email}`);
    }

    return existingAdmin;
  } catch (error) {
    console.error("Default admin setup failed:", error.message);
    return null;
  }
}

async function ensureUsageLimits() {
  try {
    const existingCount = await UsageLimit.countDocuments();
    if (existingCount >= 3) {
      console.log("Usage limits ready");
      return;
    }

    const limits = [
      {
        tier: "free",
        limits: {
          examsPerMonth: 2,
          maxConcurrentExams: 1,
          certificatesPerMonth: 0,
          storageGB: 1,
          supportPriority: "none",
        },
        features: {
          advancedAnalytics: false,
          certificateGeneration: false,
          prioritySupport: false,
          adFree: false,
          advancedProctoring: false,
          customReports: false,
        },
        pricing: {
          monthly: 0,
          annual: 0,
        },
      },
      {
        tier: "premium",
        limits: {
          examsPerMonth: 50,
          maxConcurrentExams: 3,
          certificatesPerMonth: 10,
          storageGB: 10,
          supportPriority: "standard",
        },
        features: {
          advancedAnalytics: true,
          certificateGeneration: true,
          prioritySupport: false,
          adFree: true,
          advancedProctoring: true,
          customReports: false,
        },
        pricing: {
          monthly: 999,
          annual: 9990,
        },
      },
      {
        tier: "pro",
        limits: {
          examsPerMonth: 999,
          maxConcurrentExams: 10,
          certificatesPerMonth: 100,
          storageGB: 100,
          supportPriority: "priority",
        },
        features: {
          advancedAnalytics: true,
          certificateGeneration: true,
          prioritySupport: true,
          adFree: true,
          advancedProctoring: true,
          customReports: true,
        },
        pricing: {
          monthly: 1999,
          annual: 19990,
        },
      },
    ];

    for (const item of limits) {
      await UsageLimit.findOneAndUpdate(
        { tier: item.tier },
        item,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log("Usage limits initialized");
  } catch (error) {
    console.error("Usage limit setup failed:", error.message);
  }
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await ensureDefaultAdmin();
    await ensureUsageLimits();
  })
  .catch((err) => console.error("MongoDB error:", err));

app.get("/", (req, res) => {
  res.send("Backend running with MongoDB");
});

app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role });

    res.json({ message: "Registration successful", user });
  } catch (err) {
    res.status(500).json({ message: "Register failed", error: err.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const isDefaultAdminLogin =
      email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password;

    if (isDefaultAdminLogin) {
      await ensureDefaultAdmin();
    }

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked || user.status === "blocked") {
      return res.status(403).json({ message: "Your account is blocked. Please contact the admin." });
    }

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "student"
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Fetch users failed' });
  }
});

app.get("/admin/stats", async (req, res) => {
  try {
    const [users, results] = await Promise.all([
      User.find().sort({ createdAt: -1 }).select("-password"),
      Result.find().sort({ createdAt: -1 }),
    ]);

    const roleBreakdown = users.reduce(
      (acc, user) => {
        const role = user.role || "student";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      { student: 0, teacher: 0, admin: 0 }
    );

    const examMap = {};
    results.forEach((result) => {
      const key = (result.examTitle || "Untitled Exam").trim();
      if (!examMap[key]) {
        examMap[key] = {
          examTitle: key,
          subject: result.subject || "General",
          attempts: 0,
          avgScore: 0,
          avgPercentage: 0,
          uniqueStudents: new Set(),
          lastSubmission: result.createdAt || null,
        };
      }

      examMap[key].attempts += 1;
      examMap[key].avgScore += Number(result.score || 0);
      examMap[key].avgPercentage += Number(result.percentage || 0);
      examMap[key].uniqueStudents.add(result.userId || result.studentEmail || String(result._id));

      const createdAt = new Date(result.createdAt || Date.now());
      const currentLast = new Date(examMap[key].lastSubmission || 0);
      if (createdAt > currentLast) {
        examMap[key].lastSubmission = result.createdAt;
      }
    });

    const examActivity = Object.values(examMap)
      .map((item) => ({
        ...item,
        avgScore: item.attempts ? Number((item.avgScore / item.attempts).toFixed(1)) : 0,
        avgPercentage: item.attempts ? Math.round(item.avgPercentage / item.attempts) : 0,
        uniqueStudents: item.uniqueStudents.size,
      }))
      .sort((a, b) => b.attempts - a.attempts);

    const averagePercentage = results.length
      ? Math.round(results.reduce((sum, item) => sum + Number(item.percentage || 0), 0) / results.length)
      : 0;

    res.json({
      totals: {
        users: users.length,
        students: roleBreakdown.student || 0,
        teachers: roleBreakdown.teacher || 0,
        admins: roleBreakdown.admin || 0,
        results: results.length,
        exams: examActivity.length,
        averagePercentage,
      },
      recentUsers: users.slice(0, 5),
      recentResults: results.slice(0, 8),
      examActivity: examActivity.slice(0, 12),
    });
  } catch (err) {
    res.status(500).json({ message: "Stats fetch failed", error: err.message });
  }
});

app.get("/admin/exam-activity", async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });
    const grouped = {};

    results.forEach((result) => {
      const key = (result.examTitle || "Untitled Exam").trim();
      if (!grouped[key]) {
        grouped[key] = {
          examTitle: key,
          subject: result.subject || "General",
          attempts: 0,
          avgScore: 0,
          avgPercentage: 0,
          highestPercentage: 0,
          uniqueStudents: new Set(),
          lastSubmission: result.createdAt || null,
        };
      }

      grouped[key].attempts += 1;
      grouped[key].avgScore += Number(result.score || 0);
      grouped[key].avgPercentage += Number(result.percentage || 0);
      grouped[key].highestPercentage = Math.max(grouped[key].highestPercentage, Number(result.percentage || 0));
      grouped[key].uniqueStudents.add(result.userId || result.studentEmail || String(result._id));

      const createdAt = new Date(result.createdAt || Date.now());
      const currentLast = new Date(grouped[key].lastSubmission || 0);
      if (createdAt > currentLast) {
        grouped[key].lastSubmission = result.createdAt;
      }
    });

    const examActivity = Object.values(grouped)
      .map((item) => ({
        ...item,
        avgScore: item.attempts ? Number((item.avgScore / item.attempts).toFixed(1)) : 0,
        avgPercentage: item.attempts ? Math.round(item.avgPercentage / item.attempts) : 0,
        uniqueStudents: item.uniqueStudents.size,
      }))
      .sort((a, b) => b.attempts - a.attempts);

    res.json(examActivity);
  } catch (err) {
    res.status(500).json({ message: "Exam activity fetch failed", error: err.message });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Fetch user failed' });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) delete updates.password;
    if (Object.prototype.hasOwnProperty.call(updates, "isBlocked")) {
      updates.status = updates.isBlocked ? "blocked" : "active";
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

app.post("/admin/users/bulk", async (req, res) => {
  try {
    const rows = Array.isArray(req.body?.users) ? req.body.users : [];

    if (!rows.length) {
      return res.status(400).json({ message: "No users provided for import" });
    }

    const prepared = rows
      .map((item) => ({
        name: String(item.name || "").trim(),
        email: String(item.email || "").trim().toLowerCase(),
        role: ["student", "teacher", "admin"].includes(item.role) ? item.role : "student",
        password: String(item.password || "changeme123").trim() || "changeme123",
        isAdmin: item.role === "admin",
        status: item.isBlocked ? "blocked" : "active",
        isBlocked: Boolean(item.isBlocked),
      }))
      .filter((item) => item.name && item.email);

    if (!prepared.length) {
      return res.status(400).json({ message: "Imported rows are empty or invalid" });
    }

    const emails = prepared.map((item) => item.email);
    const existingUsers = await User.find({ email: { $in: emails } }).select("email");
    const existingEmailSet = new Set(existingUsers.map((item) => item.email));

    const toCreate = prepared.filter((item) => !existingEmailSet.has(item.email));

    if (!toCreate.length) {
      return res.status(409).json({ message: "All imported users already exist", created: 0, skipped: prepared.length });
    }

    await User.insertMany(toCreate, { ordered: false });

    res.json({
      message: "Bulk import completed",
      created: toCreate.length,
      skipped: prepared.length - toCreate.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Bulk import failed", error: err.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

app.post("/results", async (req, res) => {
  try {
    const { correct, total, score, time, subject, examTitle, userId, studentName, studentEmail, note } = req.body;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const result = await Result.create({
      correct,
      total,
      score,
      time,
      percentage,
      subject,
      examTitle,
      userId,
      studentName,
      studentEmail,
      note,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Save failed", error: err });
  }
});

app.get("/results", async (req, res) => {
  const results = await Result.find().sort({ createdAt: -1 });
  res.json(results);
});

app.delete("/results/:id", async (req, res) => {
  await Result.findByIdAndDelete(req.params.id);
  res.json({ message: "Result deleted" });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
