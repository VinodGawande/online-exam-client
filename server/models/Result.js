const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    correct: Number,
    total: Number,
    score: Number,
    time: String,
    percentage: Number,
    subject: String,
    examTitle: String,
    userId: String,
    studentName: String,
    studentEmail: String,
    note: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);

