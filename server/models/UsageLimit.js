const mongoose = require("mongoose");

const usageLimitSchema = new mongoose.Schema(
  {
    tier: {
      type: String,
      enum: ["free", "premium", "pro"],
      required: true,
      unique: true,
    },

    limits: {
      examsPerMonth: {
        type: Number,
        required: true,
      },
      maxConcurrentExams: {
        type: Number,
        default: 1,
      },
      certificatesPerMonth: {
        type: Number,
        default: 0,
      },
      storageGB: {
        type: Number,
        default: 1,
      },
      supportPriority: {
        type: String,
        enum: ["none", "standard", "priority"],
        default: "none",
      },
    },

    features: {
      advancedAnalytics: {
        type: Boolean,
        default: false,
      },
      certificateGeneration: {
        type: Boolean,
        default: false,
      },
      prioritySupport: {
        type: Boolean,
        default: false,
      },
      adFree: {
        type: Boolean,
        default: false,
      },
      advancedProctoring: {
        type: Boolean,
        default: false,
      },
      customReports: {
        type: Boolean,
        default: false,
      },
    },

    pricing: {
      monthly: {
        type: Number,
        default: 0,
      }, // in cents
      annual: {
        type: Number,
        default: 0,
      }, // in cents
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UsageLimit", usageLimitSchema);
