const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tier: {
      type: String,
      enum: ["premium", "pro"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "annual"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    }, // in cents
    currency: {
      type: String,
      default: "USD",
    },

    // Payment Gateway Integration
    stripeSubscriptionId: String,
    stripePaymentIntentId: String,

    // Renewal Info
    autoRenew: {
      type: Boolean,
      default: true,
    },
    renewalAttempts: {
      type: Number,
      default: 0,
    },
    lastRenewalDate: Date,

    // Cancellation Info
    cancelledAt: Date,
    cancellationReason: String,

    // Promo Code
    promoCode: String,
    discountPercentage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
