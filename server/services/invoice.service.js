import Invoice from "../models/Invoice.model.js";

export const generateInvoiceNumber = async () => {
  try {
    const year = new Date().getFullYear();

    const lastInvoice = await Invoice.findOne({
      invoiceNumber: new RegExp(`^INV-${year}-`),
    }).sort({ createdAt: -1 });

    let nextNumber = 1;

    if (lastInvoice) {
      const parts = lastInvoice.invoiceNumber.split("-");
      const lastNumber = parseInt(parts[2], 10);

      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `INV-${year}-${String(nextNumber).padStart(6, "0")}`;
  } catch (error) {
    console.error("Generate Invoice Number Error:", error);
    throw error;
  }
};


export const createInvoiceFromPayment = async (payment) => {
  try {
    // Check whether invoice already exists
    const existingInvoice = await Invoice.findOne({
      payment: payment._id,
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,

      payment: payment._id,

      project: payment.project,

      client: payment.client,

      freelancer: payment.freelancer,

      amount: payment.amount,

      currency: payment.currency,

      status: "Paid",

      issuedAt: new Date(),

      paidAt: payment.paidAt || new Date(),
    });

    return invoice;
  } catch (error) {
    console.error("Create Invoice Error:", error);
    throw error;
  }
};