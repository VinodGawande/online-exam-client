const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['student','teacher','admin'],
      default: 'student'
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active"
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    isAdmin: {
      type: Boolean,
      default: false
    },

    // ===== MEMBERSHIP FIELDS =====
    membership: {
      tier: {
        type: String,
        enum: ['free', 'premium', 'pro'],
        default: 'free'
      },
      status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'trial'],
        default: 'trial'
      },
      startDate: {
        type: Date,
        default: Date.now
      },
      expiryDate: {
        type: Date
      },
      trialEndsAt: {
        type: Date
      },
      autoRenew: {
        type: Boolean,
        default: true
      },
      billingCycle: {
        type: String,
        enum: ['monthly', 'annual'],
        default: 'monthly'
      }
    },

    // ===== USAGE TRACKING =====
    usage: {
      examsAttempted: {
        type: Number,
        default: 0
      },
      examsThisMonth: {
        type: Number,
        default: 0
      },
      lastExamDate: {
        type: Date
      },
      totalTimeSpent: {
        type: Number,
        default: 0
      },
      certificatesGenerated: {
        type: Number,
        default: 0
      }
    },

    // ===== PAYMENT TRACKING =====
    payment: {
      stripeCustomerId: String,
      stripeSubscriptionId: String,
      lastPaymentDate: Date,
      nextBillingDate: Date,
      paymentMethod: String,
      failedPaymentAttempts: {
        type: Number,
        default: 0
      }
    },

    // ===== PREFERENCES =====
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      marketingEmails: {
        type: Boolean,
        default: false
      },
      upgradeReminders: {
        type: Boolean,
        default: true
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
