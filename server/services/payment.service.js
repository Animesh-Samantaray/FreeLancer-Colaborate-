import crypto from "crypto";
import razorpay from "../configs/razorpay.js";

// Create Razorpay Order
export const createRazorpayOrder = async (amount, receipt) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Razorpay uses paise
      currency: "INR",
      receipt: receipt,
    };

    const order = await razorpay.orders.create(options);

    return order;
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    throw error;
  }
};

// Verify Razorpay Payment
export const verifyRazorpayPayment = ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  try {
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    return generatedSignature === razorpay_signature;
  } catch (error) {
    console.error("Razorpay Payment Verification Error:", error);
    throw error;
  }
};