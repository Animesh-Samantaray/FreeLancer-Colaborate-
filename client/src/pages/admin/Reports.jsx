import { useEffect, useState, useRef } from "react";
import {
  FiUsers,
  FiFolder,
  FiFileText,
  FiStar,
  FiRefreshCw,
  FiCalendar,
  FiAlertCircle,
  FiDownload,
  FiChevronDown,
  FiFile,
  FiGrid,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import {
  getWeeklyReportApi,
  getMonthlyReportApi,
  getCustomReportApi,
} from "../../api/apiServices";
import LoadingSpinner from "../../components/LoadingSpinner";
import { downloadPDF, downloadExcel } from "../../utils/reportExporter";

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

const Reports = () => {
  const [reportType, setReportType] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateError, setDateError] = useState(null);

  const [downloadOpen, setDownloadOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target)) {
        setDownloadOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadPDF = async () => {
    if (isDownloading || !report) return;
    setIsDownloading(true);
    setDownloadOpen(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      downloadPDF(report);
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Unable to generate the report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (isDownloading || !report) return;
    setIsDownloading(true);
    setDownloadOpen(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      downloadExcel(report);
    } catch (err) {
      console.error("Excel generation error:", err);
      toast.error("Unable to generate the report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const fetchReport = async (type = reportType, customStart = startDate, customEnd = endDate) => {
    setError(null);
    setDateError(null);

    if (type === "custom") {
      if (!customStart || !customEnd) {
        setDateError("Both start date and end date are required.");
        return;
      }
      if (new Date(customStart) > new Date(customEnd)) {
        setDateError("Start date cannot be after end date.");
        return;
      }
    }

    setLoading(true);
    setReport(null);

    try {
      let res;
      if (type === "weekly") {
        res = await getWeeklyReportApi();
      } else if (type === "monthly") {
        res = await getMonthlyReportApi();
      } else if (type === "custom") {
        res = await getCustomReportApi(customStart, customEnd);
      }

      if (res && res.success) {
        setReport(res);
      } else {
        setError(res?.message || "Failed to retrieve report data.");
      }
    } catch (err) {
      console.error("Report fetch error:", err);
      const msg =
        err.response?.data?.message ||
        "An error occurred while loading the report. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType !== "custom") {
      fetchReport(reportType);
    } else {
      setReport(null);
      setLoading(false);
    }
  }, [reportType]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    fetchReport("custom", startDate, endDate);
  };

  const handleRefresh = () => {
    fetchReport(reportType, startDate, endDate);
  };

  const usersData = report?.data?.users || { total: 0, newUsers: 0, freelancers: 0, clients: 0 };
  const projectsData = report?.data?.projects || { total: 0, completed: 0, ongoing: 0, open: 0, cancelled: 0 };
  const proposalsData = report?.data?.proposals || { total: 0, accepted: 0, rejected: 0, pending: 0 };
  const reviewsData = report?.data?.reviews || {
    total: 0,
    averageRating: 0,
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0,
  };

  const avgRatingDisplay = reviewsData.averageRating
    ? `${Number(reviewsData.averageRating).toFixed(1)} / 5`
    : "0 / 5";

  const getPercentage = (count, total) => {
    if (!total || total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="glass-card border border-white/10 rounded-3xl p-8 overflow-hidden">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#6366F1]">
              Admin Control Center
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white font-display">
              Reports & Analytics
            </h1>
            <p className="mt-2 text-sm text-gray-400 max-w-2xl leading-relaxed">
              Track platform metrics, review activity, project progress, proposal distributions, and user signups.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 rounded-3xl bg-white/5 border border-white/10 px-5 py-3 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-50 transition"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Report Type Selector & Custom Range Controls */}
      <div className="glass-card rounded-3xl border border-white/10 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-[#6366F1]" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Report Period Selector
            </span>
          </div>
          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
            <button
              onClick={() => setReportType("monthly")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                reportType === "monthly"
                  ? "bg-gradient-to-r from-[#6366F1] to-[#3B82F6] text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setReportType("weekly")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                reportType === "weekly"
                  ? "bg-gradient-to-r from-[#6366F1] to-[#3B82F6] text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setReportType("custom")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                reportType === "custom"
                  ? "bg-gradient-to-r from-[#6366F1] to-[#3B82F6] text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>

        {/* Custom Range Inputs */}
        {reportType === "custom" && (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDateError(null);
                  }}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6366F1] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDateError(null);
                  }}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6366F1] transition"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-5 py-3 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 transition shadow-lg shadow-indigo-500/20"
                >
                  Generate Report
                </button>
              </div>
            </div>

            {dateError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{dateError}</span>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Main Content Area */}
      {loading && (
        <div className="glass-card rounded-3xl border border-white/10 p-12">
          <LoadingSpinner label="Fetching analytics data..." />
        </div>
      )}

      {error && !loading && (
        <div className="glass-card rounded-3xl border border-red-500/20 bg-red-500/5 p-6 flex items-start gap-4">
          <FiAlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-white">Error Loading Report</h3>
            <p className="text-xs text-gray-400 mt-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 text-xs font-semibold text-[#6366F1] hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && report && (
        <div className="space-y-8">
          <div className="glass-card rounded-3xl border border-white/10 p-6 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 relative z-30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6366F1]">
                  Active Period
                </p>
                <h2 className="text-xl font-extrabold text-white mt-1 capitalize font-display">
                  {report.reportType || reportType} Report
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-xs font-medium text-gray-200">
                  <FiCalendar className="w-4 h-4 text-[#6366F1]" />
                  <span>
                    {formatDate(report.period?.startDate)} → {formatDate(report.period?.endDate)}
                  </span>
                </div>

                <div className="relative" ref={downloadRef}>
                  <button
                    onClick={() => setDownloadOpen((prev) => !prev)}
                    disabled={isDownloading}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
                  >
                    <FiDownload className={`w-4 h-4 ${isDownloading ? "animate-bounce" : ""}`} />
                    <span>{isDownloading ? "Generating..." : "Download Report"}</span>
                    <FiChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        downloadOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {downloadOpen && !isDownloading && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#1E1B4B] border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <button
                        onClick={handleDownloadPDF}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                      >
                        <FiFile className="w-4 h-4 text-red-400" />
                        <span>Download PDF</span>
                      </button>
                      <button
                        onClick={handleDownloadExcel}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                      >
                        <FiGrid className="w-4 h-4 text-emerald-400" />
                        <span>Download Excel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Top High-level Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="glass-card rounded-3xl border border-white/10 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium">
                    Total Users
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold text-white font-display">
                    {usersData.total}
                  </h2>
                </div>
                <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-3.5 text-[#6366F1]">
                  <FiUsers className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-400 font-medium">
                {usersData.newUsers} New · {usersData.freelancers} Freelancers · {usersData.clients} Clients
              </p>
            </div>

            <div className="glass-card rounded-3xl border border-white/10 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium">
                    Total Projects
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold text-white font-display">
                    {projectsData.total}
                  </h2>
                </div>
                <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-3.5 text-blue-400">
                  <FiFolder className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-400 font-medium">
                {projectsData.completed} Completed · {projectsData.ongoing} Ongoing
              </p>
            </div>

            <div className="glass-card rounded-3xl border border-white/10 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium">
                    Total Proposals
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold text-white font-display">
                    {proposalsData.total}
                  </h2>
                </div>
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-emerald-400">
                  <FiFileText className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-400 font-medium">
                {proposalsData.accepted} Accepted · {proposalsData.pending} Pending
              </p>
            </div>

            <div className="glass-card rounded-3xl border border-white/10 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium">
                    Total Reviews
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold text-white font-display">
                    {reviewsData.total}
                  </h2>
                </div>
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-amber-400">
                  <FiStar className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-400 font-medium">
                Avg Rating: <span className="text-amber-400 font-bold">{avgRatingDisplay}</span>
              </p>
            </div>
          </div>

          {/* Detailed Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Users Section */}
            <div className="glass-card rounded-3xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-[#6366F1]">
                    <FiUsers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">Users Analytics</h3>
                    <p className="text-xs text-gray-400">Platform member growth & breakdown</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Users</p>
                  <p className="mt-2 text-2xl font-bold text-white">{usersData.total}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">New Users</p>
                  <p className="mt-2 text-2xl font-bold text-indigo-400">{usersData.newUsers}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Freelancers</p>
                  <p className="mt-2 text-2xl font-bold text-blue-400">{usersData.freelancers}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Clients</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-400">{usersData.clients}</p>
                </div>
              </div>

              {/* Visual Breakdown bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-gray-400 font-medium">
                  <span>Freelancers ({getPercentage(usersData.freelancers, usersData.total)}%)</span>
                  <span>Clients ({getPercentage(usersData.clients, usersData.total)}%)</span>
                </div>
                <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden flex">
                  <div
                    style={{ width: `${getPercentage(usersData.freelancers, usersData.total)}%` }}
                    className="bg-blue-500 h-full transition-all duration-500"
                  />
                  <div
                    style={{ width: `${getPercentage(usersData.clients, usersData.total)}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Project Section */}
            <div className="glass-card rounded-3xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400">
                    <FiFolder className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">Projects Overview</h3>
                    <p className="text-xs text-gray-400">Status breakdown of posted briefs</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Total: {projectsData.total}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
                    </span>
                    <span>{projectsData.completed} ({getPercentage(projectsData.completed, projectsData.total)}%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${getPercentage(projectsData.completed, projectsData.total)}%` }}
                      className="bg-emerald-500 h-full transition-all duration-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Ongoing
                    </span>
                    <span>{projectsData.ongoing} ({getPercentage(projectsData.ongoing, projectsData.total)}%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${getPercentage(projectsData.ongoing, projectsData.total)}%` }}
                      className="bg-blue-500 h-full transition-all duration-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Open
                    </span>
                    <span>{projectsData.open} ({getPercentage(projectsData.open, projectsData.total)}%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${getPercentage(projectsData.open, projectsData.total)}%` }}
                      className="bg-amber-500 h-full transition-all duration-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Cancelled
                    </span>
                    <span>{projectsData.cancelled} ({getPercentage(projectsData.cancelled, projectsData.total)}%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${getPercentage(projectsData.cancelled, projectsData.total)}%` }}
                      className="bg-red-500 h-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Proposal Section */}
            <div className="glass-card rounded-3xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <FiFileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">Proposals Activity</h3>
                    <p className="text-xs text-gray-400">Submission acceptance & status distribution</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Total: {proposalsData.total}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Accepted
                    </span>
                    <span>{proposalsData.accepted} ({getPercentage(proposalsData.accepted, proposalsData.total)}%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${getPercentage(proposalsData.accepted, proposalsData.total)}%` }}
                      className="bg-emerald-500 h-full transition-all duration-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending
                    </span>
                    <span>{proposalsData.pending} ({getPercentage(proposalsData.pending, proposalsData.total)}%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${getPercentage(proposalsData.pending, proposalsData.total)}%` }}
                      className="bg-amber-500 h-full transition-all duration-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Rejected
                    </span>
                    <span>{proposalsData.rejected} ({getPercentage(proposalsData.rejected, proposalsData.total)}%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${getPercentage(proposalsData.rejected, proposalsData.total)}%` }}
                      className="bg-red-500 h-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Review Section */}
            <div className="glass-card rounded-3xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400">
                    <FiStar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">Reviews & Ratings</h3>
                    <p className="text-xs text-gray-400">Client feedback & rating distribution</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Average</span>
                  <span className="text-sm font-extrabold text-amber-400">{avgRatingDisplay}</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { stars: 5, count: reviewsData.fiveStar, color: "bg-amber-400" },
                  { stars: 4, count: reviewsData.fourStar, color: "bg-amber-500" },
                  { stars: 3, count: reviewsData.threeStar, color: "bg-yellow-600" },
                  { stars: 2, count: reviewsData.twoStar, color: "bg-orange-500" },
                  { stars: 1, count: reviewsData.oneStar, color: "bg-red-500" },
                ].map((item) => (
                  <div key={item.stars} className="flex items-center gap-3 text-xs font-medium">
                    <span className="w-12 text-gray-300 flex items-center gap-1 font-bold">
                      {item.stars} <FiStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: `${getPercentage(item.count, reviewsData.total)}%` }}
                        className={`${item.color} h-full transition-all duration-500`}
                      />
                    </div>
                    <span className="w-14 text-right text-gray-400">
                      {item.count} ({getPercentage(item.count, reviewsData.total)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
