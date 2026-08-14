import Invoice from "../models/Invoice.model.js";
import PaymentModel from "../models/Payment.model.js";
import { createInvoiceFromPayment } from "../services/invoice.service.js";


// CREATE INVOICE
export const createInvoice = async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required.",
      });
    }

    // Find payment
    const payment = await PaymentModel.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    // Invoice should only be created for successful payments
    if (payment.status !== "Paid") {
      return res.status(400).json({
        success: false,
        message: "Invoice can only be created for a paid payment.",
      });
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({
      payment: payment._id,
    });

    if (existingInvoice) {
      return res.status(200).json({
        success: true,
        message: "Invoice already exists.",
        invoice: existingInvoice,
      });
    }

    // Make sure only the client/admin can create it
    const isClient =
      payment.client.toString() === req.user.id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const invoice = await createInvoiceFromPayment(payment);

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully.",
      invoice,
    });

  } catch (error) {
    console.error("Create Invoice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// GET MY INVOICES
export const getMyInvoices = async (req, res) => {
  try {
    const userId = req.user.id;

    const invoices = await Invoice.find({
      $or: [
        { client: userId },
        { freelancer: userId },
      ],
    })
      .populate("project")
      .populate("client", "fullName email avatar")
      .populate("freelancer", "fullName email avatar")
      .populate("payment")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });

  } catch (error) {
    console.error("Get My Invoices Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// GET SINGLE INVOICE
export const getInvoiceById = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user.id;

    const invoice = await Invoice.findById(invoiceId)
      .populate("project")
      .populate("client", "fullName email avatar")
      .populate("freelancer", "fullName email avatar")
      .populate("payment");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    const isClient =
      invoice.client._id.toString() === userId.toString();

    const isFreelancer =
      invoice.freelancer._id.toString() === userId.toString();

    const isAdmin = req.user.role === "admin";

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      invoice,
    });

  } catch (error) {
    console.error("Get Invoice By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};