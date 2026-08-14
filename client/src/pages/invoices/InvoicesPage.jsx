import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiFileText,
  FiPrinter,
  FiDownload,
  FiEye,
  FiSearch,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiRefreshCw
} from "react-icons/fi";
import { getMyInvoicesApi } from "../../api/apiServices";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { toast } from "react-hot-toast";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyInvoicesApi();
      if (res?.success && Array.isArray(res.invoices)) {
        setInvoices(res.invoices);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error("Fetch invoices error:", err);
      setError(err?.response?.data?.message || "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter logic
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      (inv.invoiceNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.project?.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.client?.fullName || inv.client?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.freelancer?.fullName || inv.freelancer?.email || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || inv.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Derived metrics
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const paidCount = invoices.filter((inv) => inv.status === "Paid").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#6366F1] font-semibold mb-2">
              <FiFileText className="w-4 h-4" /> Billing & Invoices
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Invoice Ledger
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
              Official records of completed project payments, detailed breakups, client and freelancer invoices.
            </p>
          </div>
          <button
            onClick={fetchInvoices}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer self-start sm:self-auto"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-36">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Invoiced Amount</p>
            <h2 className="text-3xl font-extrabold mt-2 font-display text-emerald-400">
              ₹{totalAmount.toLocaleString()}
            </h2>
          </div>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
            <FiCheckCircle /> Verified project billing
          </span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-36">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Paid Invoices</p>
            <h2 className="text-3xl font-extrabold mt-2 font-display text-white">
              {paidCount}
            </h2>
          </div>
          <span className="text-[10px] text-gray-400 font-semibold">
            {invoices.length > 0 ? `${Math.round((paidCount / invoices.length) * 100)}% of total invoices` : "No activity"}
          </span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-36">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Generated Invoices</p>
            <h2 className="text-3xl font-extrabold mt-2 font-display text-indigo-400">
              {invoices.length}
            </h2>
          </div>
          <span className="text-[10px] text-indigo-300 font-semibold">
            Recorded in system database
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by invoice #, project, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input placeholder-gray-500 border border-white/10 bg-[#09090B] text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <label className="text-xs text-gray-400 font-medium">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input rounded-xl border border-white/10 bg-[#09090B] px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all" className="bg-[#09090B]">All Statuses</option>
            <option value="paid" className="bg-[#09090B]">Paid</option>
            <option value="pending" className="bg-[#09090B]">Pending</option>
            <option value="cancelled" className="bg-[#09090B]">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        {loading ? (
          <LoadingSpinner label="Loading invoices..." />
        ) : error ? (
          <EmptyState title="Could not load invoices" description={error} />
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Invoice Number</th>
                  <th className="py-3 px-3">Project</th>
                  <th className="py-3 px-3">Client</th>
                  <th className="py-3 px-3">Freelancer</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Issued Date</th>
                  <th className="py-3 px-3">Payment Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                {filteredInvoices.map((inv) => {
                  const clientName = inv.client?.fullName || inv.client?.email || "—";
                  const freelancerName = inv.freelancer?.fullName || inv.freelancer?.email || "—";
                  const projectTitle = inv.project?.title || "—";

                  return (
                    <tr key={inv._id} className="hover:bg-white/[0.02] transition">
                      <td className="py-4 px-3 font-mono font-semibold text-indigo-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-4 px-3 font-medium text-white max-w-xs truncate">
                        {projectTitle}
                      </td>
                      <td className="py-4 px-3 text-gray-300">
                        {clientName}
                      </td>
                      <td className="py-4 px-3 text-gray-300">
                        {freelancerName}
                      </td>
                      <td className="py-4 px-3 font-bold text-emerald-400">
                        ₹{inv.amount?.toLocaleString()} <span className="text-[10px] font-mono text-gray-400">{inv.currency || "INR"}</span>
                      </td>
                      <td className="py-4 px-3 text-gray-400">
                        {inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        }) : "—"}
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border ${
                            inv.status === "Paid"
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                              : inv.status === "Cancelled"
                              ? "text-red-400 bg-red-500/10 border-red-500/20"
                              : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          }`}
                        >
                          {inv.status || "Paid"}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/invoices/${inv._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/20 text-xs font-semibold text-indigo-300 hover:text-white hover:bg-indigo-600/40 transition"
                          >
                            <FiDownload className="w-3.5 h-3.5" />
                            View & Download
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No invoices found."
            description={searchQuery || statusFilter !== "all" ? "No invoices match your current search or filter criteria." : "You do not have any generated invoices yet."}
          />
        )}
      </div>
    </div>
  );
}
