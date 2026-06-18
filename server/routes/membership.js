const express = require("express");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const UsageLimit = require("../models/UsageLimit");
const PaymentTransaction = require("../models/PaymentTransaction");

const router = express.Router();

const VALID_TIERS = ["premium", "pro"];
const VALID_BILLING_CYCLES = ["monthly", "annual"];
const VALID_PAYMENT_METHODS = ["upi", "card", "netbanking", "wallet", "manual"];
const DEFAULT_CURRENCY = "INR";

const PLAN_COPY = {
  free: {
    label: "Free",
    summary: "A light starter plan for occasional exam practice.",
    badge: "Starter",
    highlights: ["2 exams each month", "Basic analytics", "Standard support"],
  },
  premium: {
    label: "Premium",
    summary: "Best for regular students who need more attempts and better insights.",
    badge: "Most Popular",
    highlights: ["50 exams each month", "Certificates included", "Advanced proctoring"],
  },
  pro: {
    label: "Pro",
    summary: "Built for power users, trainers, and higher-volume exam workflows.",
    badge: "Power Users",
    highlights: ["Virtually unlimited exams", "Custom reports", "Priority support"],
  },
};

const PAYMENT_LABELS = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
  wallet: "Wallet",
  manual: "Manual",
};

const authenticateUser = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.userId = userId;
  next();
};

const calculateExpiryDate = (billingCycle) => {
  const expiryDate = new Date();
  if (billingCycle === "monthly") {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  } else {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }
  return expiryDate;
};

const formatPaymentSummary = (paymentMethod, paymentDetails = {}) => {
  if (paymentMethod === "upi") {
    return paymentDetails.upiId ? `UPI - ${paymentDetails.upiId}` : "UPI payment";
  }

  if (paymentMethod === "card") {
    return paymentDetails.cardLast4 ? `Card ending ${paymentDetails.cardLast4}` : "Card payment";
  }

  if (paymentMethod === "netbanking") {
    return paymentDetails.bankName ? `${paymentDetails.bankName} net banking` : "Net banking";
  }

  if (paymentMethod === "wallet") {
    return paymentDetails.walletProvider ? `${paymentDetails.walletProvider} wallet` : "Wallet payment";
  }

  return "Membership upgrade";
};

const validatePaymentDetails = (paymentMethod, paymentDetails = {}) => {
  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    return { isValid: false, message: "Invalid payment method" };
  }

  if (paymentMethod === "manual") {
    return { isValid: true, normalized: {} };
  }

  if (paymentMethod === "upi") {
    const upiId = String(paymentDetails.upiId || "").trim();
    if (!upiId || !upiId.includes("@")) {
      return { isValid: false, message: "Enter a valid UPI ID" };
    }
    return { isValid: true, normalized: { upiId } };
  }

  if (paymentMethod === "card") {
    const cardName = String(paymentDetails.cardName || "").trim();
    const cardNumber = String(paymentDetails.cardNumber || "").replace(/\s+/g, "");
    const expiry = String(paymentDetails.expiry || "").trim();
    const cvv = String(paymentDetails.cvv || "").trim();

    if (!cardName || cardNumber.length < 12 || !expiry || cvv.length < 3) {
      return { isValid: false, message: "Complete the card details to continue" };
    }

    return {
      isValid: true,
      normalized: {
        cardName,
        cardLast4: cardNumber.slice(-4),
        expiry,
      },
    };
  }

  if (paymentMethod === "netbanking") {
    const bankName = String(paymentDetails.bankName || "").trim();
    if (!bankName) {
      return { isValid: false, message: "Select a bank to continue" };
    }
    return { isValid: true, normalized: { bankName } };
  }

  if (paymentMethod === "wallet") {
    const walletProvider = String(paymentDetails.walletProvider || "").trim();
    if (!walletProvider) {
      return { isValid: false, message: "Select a wallet provider" };
    }
    return { isValid: true, normalized: { walletProvider } };
  }

  return { isValid: false, message: "Unsupported payment details" };
};

const ensureMembershipIsCurrent = async (user) => {
  if (
    user.membership.status === "trial" &&
    user.membership.trialEndsAt &&
    user.membership.trialEndsAt < Date.now()
  ) {
    user.membership.status = "expired";
    user.membership.tier = "free";
    await user.save();
  }

  if (
    user.membership.status === "active" &&
    user.membership.expiryDate &&
    user.membership.expiryDate < Date.now()
  ) {
    user.membership.status = "expired";
    user.membership.tier = "free";
    await user.save();
  }
};

const buildMembershipStatusPayload = (user, usageLimit) => {
  const daysUntilExpiry = user.membership.expiryDate
    ? Math.ceil((user.membership.expiryDate - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const examsRemainingThisMonth = Math.max(
    0,
    (usageLimit?.limits?.examsPerMonth || 0) - (user.usage?.examsThisMonth || 0)
  );

  return {
    tier: user.membership.tier,
    status: user.membership.status,
    trialEndsAt: user.membership.trialEndsAt,
    expiryDate: user.membership.expiryDate,
    billingCycle: user.membership.billingCycle,
    daysUntilExpiry,
    examsRemainingThisMonth,
    features: usageLimit?.features || {},
    limits: usageLimit?.limits || {},
    usage: user.usage,
    currentPlan: PLAN_COPY[user.membership.tier] || PLAN_COPY.free,
  };
};

const buildCatalogEntry = (limit) => {
  const tier = limit.tier;
  return {
    tier,
    label: PLAN_COPY[tier]?.label || tier,
    summary: PLAN_COPY[tier]?.summary || "",
    badge: PLAN_COPY[tier]?.badge || "",
    highlights: PLAN_COPY[tier]?.highlights || [],
    pricing: {
      monthly: limit.pricing?.monthly || 0,
      annual: limit.pricing?.annual || 0,
      currency: DEFAULT_CURRENCY,
    },
    features: limit.features,
    limits: limit.limits,
  };
};

const processMembershipPurchase = async ({
  userId,
  tier,
  billingCycle = "monthly",
  paymentMethod = "upi",
  paymentDetails = {},
}) => {
  if (!VALID_TIERS.includes(tier)) {
    return { error: { status: 400, message: "Invalid tier" } };
  }

  if (!VALID_BILLING_CYCLES.includes(billingCycle)) {
    return { error: { status: 400, message: "Invalid billing cycle" } };
  }

  const validation = validatePaymentDetails(paymentMethod, paymentDetails);
  if (!validation.isValid) {
    return { error: { status: 400, message: validation.message } };
  }

  const user = await User.findById(userId);
  if (!user) {
    return { error: { status: 404, message: "User not found" } };
  }

  const usageLimit = await UsageLimit.findOne({ tier });
  if (!usageLimit) {
    return { error: { status: 404, message: "Plan not found" } };
  }

  const amount = usageLimit.pricing[billingCycle];
  const paymentSummary = formatPaymentSummary(paymentMethod, validation.normalized);

  const transaction = await PaymentTransaction.create({
    userId: user._id,
    type: "subscription",
    amount,
    currency: DEFAULT_CURRENCY,
    status: "pending",
    paymentMethod: PAYMENT_LABELS[paymentMethod] || paymentMethod,
    description: `Processing ${tier} membership`,
    metadata: {
      tier,
      billingCycle,
      paymentSummary,
    },
  });

  const { subscription, expiryDate } = await activateMembership({
    user,
    tier,
    billingCycle,
    amount,
    paymentMethod,
    paymentSummary,
    transaction,
  });

  return {
    data: {
      message: "Membership activated successfully",
      transaction: {
        _id: transaction._id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        description: transaction.description,
        createdAt: transaction.createdAt,
      },
      subscription,
      user: {
        _id: user._id,
        membership: user.membership,
        payment: user.payment,
      },
      receipt: {
        planName: PLAN_COPY[tier]?.label || tier,
        billingCycle,
        amount,
        currency: DEFAULT_CURRENCY,
        paidWith: paymentSummary,
        validUntil: expiryDate,
      },
    },
  };
};

const activateMembership = async ({
  user,
  tier,
  billingCycle,
  amount,
  paymentMethod,
  paymentSummary,
  transaction,
}) => {
  const expiryDate = calculateExpiryDate(billingCycle);

  await Subscription.updateMany(
    { userId: user._id, status: "active" },
    {
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: "Replaced by a newer membership purchase",
    }
  );

  const subscription = await Subscription.create({
    userId: user._id,
    tier,
    status: "active",
    expiryDate,
    billingCycle,
    amount,
    currency: DEFAULT_CURRENCY,
  });

  user.membership.tier = tier;
  user.membership.status = "active";
  user.membership.startDate = new Date();
  user.membership.expiryDate = expiryDate;
  user.membership.trialEndsAt = null;
  user.membership.billingCycle = billingCycle;
  user.membership.autoRenew = true;
  user.payment.lastPaymentDate = new Date();
  user.payment.nextBillingDate = expiryDate;
  user.payment.paymentMethod = PAYMENT_LABELS[paymentMethod] || paymentMethod;
  await user.save();

  transaction.subscriptionId = subscription._id;
  transaction.status = "completed";
  transaction.paymentMethod = PAYMENT_LABELS[paymentMethod] || paymentMethod;
  transaction.description = `${PLAN_COPY[tier]?.label || tier} membership (${billingCycle})`;
  transaction.metadata = {
    tier,
    billingCycle,
    paymentSummary,
  };
  await transaction.save();

  return { subscription, expiryDate };
};

router.get("/catalog", async (req, res) => {
  try {
    const usageLimits = await UsageLimit.find({ tier: { $in: ["free", ...VALID_TIERS] } });
    const ordered = ["free", "premium", "pro"]
      .map((tier) => usageLimits.find((item) => item.tier === tier))
      .filter(Boolean)
      .map(buildCatalogEntry);

    res.json({
      plans: ordered,
      paymentMethods: VALID_PAYMENT_METHODS.filter((method) => method !== "manual").map((method) => ({
        id: method,
        label: PAYMENT_LABELS[method],
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch plan catalog" });
  }
});

router.get("/status", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await ensureMembershipIsCurrent(user);
    const usageLimit = await UsageLimit.findOne({ tier: user.membership.tier });

    res.json(buildMembershipStatusPayload(user, usageLimit));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch membership status" });
  }
});

router.post("/check-exam-access", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await ensureMembershipIsCurrent(user);
    const usageLimit = await UsageLimit.findOne({ tier: user.membership.tier });

    if (user.membership.status === "expired" || user.membership.status === "cancelled") {
      return res.json({
        canAccess: false,
        reason: "subscription_expired",
        message: "Your subscription has expired. Upgrade to continue.",
      });
    }

    if ((user.usage?.examsThisMonth || 0) >= (usageLimit?.limits?.examsPerMonth || 0)) {
      return res.json({
        canAccess: false,
        reason: "limit_exceeded",
        message: `You've reached your ${usageLimit?.limits?.examsPerMonth || 0} exam limit this month.`,
        examsRemaining: 0,
      });
    }

    res.json({
      canAccess: true,
      examsRemaining:
        (usageLimit?.limits?.examsPerMonth || 0) - (user.usage?.examsThisMonth || 0),
    });
  } catch (err) {
    res.status(500).json({ message: "Access check failed" });
  }
});

router.get("/transactions", authenticateUser, async (req, res) => {
  try {
    const transactions = await PaymentTransaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    res.json({
      transactions: transactions.map((transaction) => ({
        _id: transaction._id,
        amount: transaction.amount,
        currency: transaction.currency || DEFAULT_CURRENCY,
        status: transaction.status,
        type: transaction.type,
        description: transaction.description,
        paymentMethod: transaction.paymentMethod,
        metadata: transaction.metadata || {},
        createdAt: transaction.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payment history" });
  }
});

router.post("/preview", authenticateUser, async (req, res) => {
  try {
    const { tier, billingCycle = "monthly", paymentMethod = "upi", paymentDetails = {} } = req.body;

    if (!VALID_TIERS.includes(tier)) {
      return res.status(400).json({ message: "Invalid tier" });
    }

    if (!VALID_BILLING_CYCLES.includes(billingCycle)) {
      return res.status(400).json({ message: "Invalid billing cycle" });
    }

    const validation = validatePaymentDetails(paymentMethod, paymentDetails);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const usageLimit = await UsageLimit.findOne({ tier });
    if (!usageLimit) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const amount = usageLimit.pricing[billingCycle];
    const nextBillingDate = calculateExpiryDate(billingCycle);

    res.json({
      tier,
      billingCycle,
      amount,
      currency: DEFAULT_CURRENCY,
      total: amount,
      nextBillingDate,
      paymentMethod,
      paymentSummary: formatPaymentSummary(paymentMethod, validation.normalized),
      plan: buildCatalogEntry(usageLimit),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to prepare purchase preview" });
  }
});

router.post("/purchase", authenticateUser, async (req, res) => {
  try {
    const result = await processMembershipPurchase({
      userId: req.userId,
      ...req.body,
    });

    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    res.json(result.data);
  } catch (err) {
    res.status(500).json({ message: "Purchase failed", error: err.message });
  }
});

router.post("/upgrade", authenticateUser, async (req, res) => {
  try {
    const result = await processMembershipPurchase({
      userId: req.userId,
      tier: req.body.tier,
      billingCycle: req.body.billingCycle,
      paymentMethod: req.body.paymentMethod || "manual",
      paymentDetails: req.body.paymentDetails || {},
    });

    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    res.json(result.data);
  } catch (err) {
    res.status(500).json({ message: "Upgrade failed", error: err.message });
  }
});

router.post("/cancel", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subscription = await Subscription.findOne({
      userId: user._id,
      status: "active",
    });

    if (subscription) {
      subscription.status = "cancelled";
      subscription.cancelledAt = Date.now();
      await subscription.save();
    }

    user.membership.status = "cancelled";
    user.membership.tier = "free";
    await user.save();

    res.json({ message: "Subscription cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Cancellation failed" });
  }
});

router.post("/record-exam", authenticateUser, async (req, res) => {
  try {
    const { timeSpent } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.usage.examsAttempted += 1;
    user.usage.examsThisMonth += 1;
    user.usage.lastExamDate = Date.now();
    if (timeSpent) {
      user.usage.totalTimeSpent += timeSpent;
    }

    await user.save();

    res.json({ message: "Exam recorded", usage: user.usage });
  } catch (err) {
    res.status(500).json({ message: "Failed to record exam" });
  }
});

router.get("/limits", async (req, res) => {
  try {
    const limits = await UsageLimit.find();
    res.json(limits);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch limits" });
  }
});

router.post("/initialize-limits", async (req, res) => {
  try {
    const existingLimits = await UsageLimit.countDocuments();
    if (existingLimits > 0) {
      return res.json({ message: "Limits already initialized" });
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

    await UsageLimit.insertMany(limits);
    res.json({ message: "Usage limits initialized", limits });
  } catch (err) {
    res.status(500).json({ message: "Failed to initialize limits" });
  }
});

module.exports = router;
