import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
});

export const sendMail = async(to , subject , html)=>{
    const formattedTo = Array.isArray(to) ? to.filter(Boolean).join(", ") : to;
    await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to: formattedTo,
        subject,
        html
    })
};

export const sendInvoiceSuccessEmail = async (client, freelancer, project, payment, invoice) => {
  const amount = payment.amount;
  const currency = payment.currency || "INR";
  const currencySymbol = currency === "INR" ? "₹" : currency;
  const paymentDate = payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : new Date().toLocaleDateString();

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="background-color: #4F46E5; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Payment & Invoice Successful</h1>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 16px;">Payment of <strong>${currencySymbol}${amount}</strong> has been successfully completed.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eee;">From:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${client.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eee;">To:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${freelancer.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eee;">Amount:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${currencySymbol}${amount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eee;">Regarding:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${project.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eee;">Invoice:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${invoice.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eee;">Payment Date:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${paymentDate}</td>
          </tr>
        </table>
        
        <p style="font-size: 14px; color: #666; margin-top: 24px; text-align: center; border-top: 1px solid #eee; padding-top: 16px;">
          This email confirms that the payment and invoice have been successfully processed.
        </p>
      </div>
    </div>
  `;

  const recipients = [client.email, freelancer.email];
  await sendMail(recipients, "Payment & Invoice Successful", html);
};