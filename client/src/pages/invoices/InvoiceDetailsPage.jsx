import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiDownload,
  FiCheckCircle,
  FiFileText,
  FiUser,
  FiBriefcase,
  FiCreditCard,
  FiCalendar,
  FiDollarSign,
  FiAlertCircle
} from "react-icons/fi";
import { getInvoiceByIdApi } from "../../api/apiServices";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Button from "../../components/Button";

export default function InvoiceDetailsPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!invoiceId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await getInvoiceByIdApi(invoiceId);
        if (res?.success && res?.invoice) {
          setInvoice(res.invoice);
        } else {
          setError("Invoice not found.");
        }
      } catch (err) {
        console.error("Fetch invoice details error:", err);
        setError(err?.response?.data?.message || "Failed to load invoice details.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId]);

  const handleDownload = () => {
    if (!invoice) return;
    const originalTitle = document.title;
    const filename = `${invoice.invoiceNumber || "Invoice"}_${invoice.project?.title || "Project"}`;
    document.title = filename.replace(/[^a-zA-Z0-9_-]/g, "_");
    window.print();
    document.title = originalTitle;
  };

  if (loading) {
    return <LoadingSpinner label="Fetching invoice details..." />;
  }

  if (error || !invoice) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/invoices")}
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition"
        >
          <FiArrowLeft /> Back to Invoices
        </button>
        <EmptyState title="Invoice not found" description={error || "The requested invoice could not be located."} />
      </div>
    );
  }

  const client = invoice.client || {};
  const freelancer = invoice.freelancer || {};
  const project = invoice.project || {};
  const payment = invoice.payment || {};

  return (
    <div className="space-y-6">
      {/* Printable CSS Helper Styles - Ensures Dark Font on Clean White PDF Background */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            box-shadow: none !important;
          }
          #printable-invoice h1,
          #printable-invoice h2,
          #printable-invoice h3,
          #printable-invoice h4,
          #printable-invoice p,
          #printable-invoice span,
          #printable-invoice td,
          #printable-invoice th,
          #printable-invoice div {
            color: #0f172a !important;
            text-shadow: none !important;
          }
          #printable-invoice .text-indigo-400,
          #printable-invoice .invoice-accent {
            color: #4338ca !important;
          }
          #printable-invoice .text-emerald-400,
          #printable-invoice .invoice-green {
            color: #047857 !important;
          }
          #printable-invoice .text-gray-400,
          #printable-invoice .text-gray-300,
          #printable-invoice .text-gray-500 {
            color: #475569 !important;
          }
          #printable-invoice .bg-white\\/5,
          #printable-invoice .bg-white\\/10,
          #printable-invoice .invoice-box {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
          }
          #printable-invoice .border-white\\/10,
          #printable-invoice .border-white\\/5 {
            border-color: #cbd5e1 !important;
          }
          #printable-invoice .invoice-badge {
            background-color: #d1fae5 !important;
            color: #065f46 !important;
            border: 1px solid #a7f3d0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Header Actions */}
      <div className="flex justify-between items-center flex-wrap gap-4 print:hidden">
        <button
          onClick={() => navigate("/invoices")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={<FiDownload />}
            onClick={handleDownload}
          >
            Download Invoice
          </Button>
        </div>
      </div>

      {/* Main Printable Invoice Card */}
      <div
        id="printable-invoice"
        className="glass-card border border-white/10 rounded-3xl p-8 sm:p-10 max-w-4xl mx-auto space-y-8 bg-[#0F172A] text-white"
      >
        {/* Invoice Top Header */}
        <div className="flex justify-between items-start flex-wrap gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center shadow-lg font-bold text-white text-lg">
                F
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-white">
                  FreeLancer Collaborate
                </h1>
                <p className="text-xs text-gray-400">Official Payment Invoice</p>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="invoice-badge inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
              {invoice.status || "Paid"}
            </span>
            <h2 className="text-lg font-mono font-bold text-indigo-400 invoice-accent">
              {invoice.invoiceNumber}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Issued: {new Date(invoice.issuedAt || invoice.createdAt).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "long",
                year: "numeric"
              })}
            </p>
          </div>
        </div>

        {/* Billed To / Billed From Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-2">
          {/* Client Details (Billed To) */}
          <div className="invoice-box p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 invoice-accent">Billed To (Client)</p>
            <h3 className="text-base font-bold text-white">{client.fullName || "—"}</h3>
            <p className="text-xs text-gray-300">{client.email || "—"}</p>
            {client.phone && <p className="text-xs text-gray-400">{client.phone}</p>}
          </div>

          {/* Freelancer Details (Billed From) */}
          <div className="invoice-box p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 invoice-accent">Billed From (Freelancer)</p>
            <h3 className="text-base font-bold text-white">{freelancer.fullName || "—"}</h3>
            <p className="text-xs text-gray-300">{freelancer.email || "—"}</p>
            {freelancer.phone && <p className="text-xs text-gray-400">{freelancer.phone}</p>}
          </div>
        </div>

        {/* Project Item Table */}
        <div>
          <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-3">Project Deliverable</h4>
          <div className="invoice-box overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Project Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">
                    {project.title || "Project Milestone Settlement"}
                    {project.description && (
                      <p className="text-[11px] font-normal text-gray-400 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-300">
                    {project.category || "Development"}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-emerald-400 invoice-green text-sm">
                    ₹{invoice.amount?.toLocaleString()} {invoice.currency || "INR"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Summary Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-white/10 gap-4">
          <div className="space-y-1 text-xs text-gray-400">
            <p className="flex items-center gap-1.5 text-emerald-400 invoice-green font-semibold">
              <FiCheckCircle /> Verified via Razorpay Secure Gateway
            </p>
            <p>Payment ID: <span className="font-mono text-gray-300">{payment.razorpayPaymentId || payment._id || "—"}</span></p>
            {payment.razorpayOrderId && (
              <p>Order ID: <span className="font-mono text-gray-300">{payment.razorpayOrderId}</span></p>
            )}
            <p>Paid Date: <span className="text-gray-300">{invoice.paidAt ? new Date(invoice.paidAt).toLocaleString() : "—"}</span></p>
          </div>

          <div className="invoice-box p-4 rounded-2xl bg-white/10 border border-white/10 text-right min-w-[220px]">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Total Paid</span>
            <span className="text-2xl font-extrabold text-emerald-400 invoice-green font-display">
              ₹{invoice.amount?.toLocaleString()} <span className="text-xs font-mono">{invoice.currency || "INR"}</span>
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-white/5 text-center text-[11px] text-gray-500">
          This is a computer-generated invoice document issued by FreeLancer Collaborate. No physical signature is required.
        </div>
      </div>
    </div>
  );
}
