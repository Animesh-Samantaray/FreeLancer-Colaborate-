import Payment from "../models/Payment.model.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/payment.service.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const { projectId, amount } = req.body;
    const userId = req.user.id;

    if (!projectId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Project ID and amount are required.",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0.",
      });
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(
      amount,
      `project_${projectId}_${Date.now()}`
    );

    // Save payment in MongoDB
    const payment = await Payment.create({
      project: projectId,
      client: userId,
      amount,
      currency: "INR",
      status: "Pending",
      razorpayOrderId: razorpayOrder.id,
    });

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully.",
      data: {
        paymentId: payment._id,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    console.error("Create Payment Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order.",
    });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required.",
      });
    }

    // Find our payment using Razorpay order ID
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    // Prevent another user from verifying this payment
    if (payment.client.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const isValid = verifyRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      payment.status = "Failed";
      await payment.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    // Payment successfully verified
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "Paid";
    payment.paidAt = new Date();

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      data: payment,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed.",
    });
  }
};


export const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(paymentId)
      .populate("project")
      .populate("client", "fullName email")
      .populate("freelancer", "fullName email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    // Admin can access everything
    if (req.user.role !== "admin") {
      const isClient =
        payment.client &&
        payment.client._id.toString() === userId.toString();

      const isFreelancer =
        payment.freelancer &&
        payment.freelancer._id.toString() === userId.toString();

      if (!isClient && !isFreelancer) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get payment.",
    });
  }
};


export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await Payment.find({
      $or: [
        { client: userId },
        { freelancer: userId },
      ],
    })
      .populate("project")
      .populate("client", "fullName email")
      .populate("freelancer", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get My Payments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get payments.",
    });
  }
};