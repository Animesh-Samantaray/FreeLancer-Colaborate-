import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  FiFileText,
  FiUploadCloud,
  FiCheckCircle,
  FiAlertTriangle,
  FiTrendingUp,
  FiCpu,
  FiDownload,
  FiRefreshCw,
  FiCheck,
  FiAlertCircle,
  FiAward,
  FiZap,
  FiPaperclip,
  FiClock,
  FiLoader
} from "react-icons/fi";
import api from "../../api/axios";
import { useProfile } from "../../context/ProfileContext";
import GlassCard from "../../components/GlassCard";
import Button from "../../components/Button";
import SkeletonLoader from "../../components/SkeletonLoader";

export default function ResumeAnalytics() {
  const { refetchProfile } = useProfile();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Idle, 1: Uploading, 2: Parsing, 3: AI Analysis, 4: Generating Report
  const [uploadProgressStage, setUploadProgressStage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileDetails, setSelectedFileDetails] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch full freelancer profile
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/freelancer/profile");
      if (res.data?.success && res.data?.freelancer) {
        setProfileData(res.data.freelancer);
      }
    } catch (err) {
      console.error("Failed to fetch freelancer profile for analytics:", err);
      toast.error(err.response?.data?.message || "Failed to load resume analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const latestAnalysis =
    profileData?.aiProfileAnalysis && profileData.aiProfileAnalysis.length > 0
      ? profileData.aiProfileAnalysis[profileData.aiProfileAnalysis.length - 1]
      : null;

  // File Validation
  const validateFile = (file) => {
    if (!file) return false;

    const allowedExtensions = [".pdf", ".docx"];
    const fileNameLower = file.name.toLowerCase();
    const isAllowedExt = allowedExtensions.some((ext) => fileNameLower.endsWith(ext));

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"
    ];
    const isAllowedMime = allowedTypes.includes(file.type);

    if (!isAllowedExt && !isAllowedMime) {
      toast.error("Invalid file format. Please upload a PDF or DOCX file.");
      return false;
    }

    const maxSizeInMB = 10;
    if (file.size > maxSizeInMB * 1024 * 1024) {
      toast.error(`File is too large. Maximum allowed size is ${maxSizeInMB}MB.`);
      return false;
    }

    return true;
  };

  // Single-stage unified upload & AI analysis flow (Zero intermediate state updates)
  const processResumeFile = async (file) => {
    if (!validateFile(file)) return;

    setSelectedFileDetails({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      type: file.name.endsWith(".pdf") ? "PDF" : "DOCX"
    });

    try {
      setIsProcessing(true);
      setCurrentStep(1);
      setUploadProgressStage("Uploading resume to secure storage...");

      const formData = new FormData();
      formData.append("resume", file);

      // Step 1: Upload resume to server
      const uploadRes = await api.post("/freelancer/profile/resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (!uploadRes.data?.success) {
        throw new Error(uploadRes.data?.message || "Failed to upload resume.");
      }

      // Step 2 & 3: Immediately run AI analysis without intermediate state re-render
      setCurrentStep(2);
      setUploadProgressStage("Extracting skills & experience keywords...");

      const stepTimer1 = setTimeout(() => {
        setCurrentStep(3);
        setUploadProgressStage("Evaluating alignment with Gemini AI...");
      }, 1200);

      const stepTimer2 = setTimeout(() => {
        setCurrentStep(4);
        setUploadProgressStage("Formulating strengths & recruiter recommendations...");
      }, 3000);

      const analyzeRes = await api.post("/freelancer/profile/analyze");

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (analyzeRes.data?.success) {
        toast.success("AI Resume Analysis generated!");

        // Single unified state update: combines uploaded resume & new AI report in one render
        const updatedFreelancer = {
          ...uploadRes.data.freelancer,
          aiProfileAnalysis: [
            ...(uploadRes.data.freelancer?.aiProfileAnalysis || []),
            analyzeRes.data.analysis
          ]
        };

        setProfileData(updatedFreelancer);
        refetchProfile();
      }
    } catch (err) {
      console.error("Resume processing error:", err);
      toast.error(err.response?.data?.message || err.message || "An error occurred during processing.");
    } finally {
      setIsProcessing(false);
      setCurrentStep(0);
      setUploadProgressStage("");
    }
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.target.files && e.target.files[0];
    if (file) {
      processResumeFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isProcessing) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processResumeFile(files[0]);
    }
  };

  // Run AI analysis manually on current uploaded resume
  const handleManualReAnalyze = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!profileData?.resumeData?.trim()) {
      toast.error("Please upload a resume first before running AI analysis.");
      return;
    }

    try {
      setIsProcessing(true);
      setCurrentStep(3);
      setUploadProgressStage("Re-evaluating resume data with Gemini AI...");

      const stepTimer = setTimeout(() => {
        setCurrentStep(4);
        setUploadProgressStage("Formulating custom recommendations & score...");
      }, 2000);

      const res = await api.post("/freelancer/profile/analyze");
      clearTimeout(stepTimer);

      if (res.data?.success) {
        toast.success("AI Analysis updated successfully!");
        setProfileData((prev) => ({
          ...prev,
          aiProfileAnalysis: [
            ...(prev?.aiProfileAnalysis || []),
            res.data.analysis
          ]
        }));
        refetchProfile();
      }
    } catch (err) {
      console.error("Manual AI re-analysis error:", err);
      toast.error(err.response?.data?.message || "Failed to analyze resume.");
    } finally {
      setIsProcessing(false);
      setCurrentStep(0);
      setUploadProgressStage("");
    }
  };

  if (loading) {
    return <SkeletonLoader type="profile" />;
  }

  const hasResume = Boolean(profileData?.resume?.trim());
  const score = latestAnalysis?.overallScore || 0;
  const analysisResult = latestAnalysis?.result || {};

  const getScoreColor = (val) => {
    if (val >= 85) return { stroke: "#10B981", bg: "text-emerald-400", border: "border-emerald-500/30", label: "Exceptional Match" };
    if (val >= 70) return { stroke: "#6366F1", bg: "text-indigo-400", border: "border-indigo-500/30", label: "Strong Profile" };
    if (val >= 50) return { stroke: "#F59E0B", bg: "text-amber-400", border: "border-amber-500/30", label: "Moderate Alignment" };
    return { stroke: "#EF4444", bg: "text-red-400", border: "border-red-500/30", label: "Needs Optimization" };
  };

  const scoreTheme = getScoreColor(score);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Section */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-[#6366F1]/10 via-[#3B82F6]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6366F1]">
                AI Intelligence Studio
              </span>
              {isProcessing ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  AI Generating Report...
                </span>
              ) : hasResume && latestAnalysis ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Analysis Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {hasResume ? "Analysis Pending" : "Resume Required"}
                </span>
              )}
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
              <FiCpu className="text-[#6366F1] w-7 h-7 sm:w-8 sm:h-8" /> Resume Analytics
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Upload your resume for real-time AI processing. Our Gemini model audits your technical skills, experience alignment, strengths, and actionable recruiter optimization suggestions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {hasResume && (
              <a
                href={profileData.resume.startsWith("http") ? profileData.resume : `https://${profileData.resume}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-xs font-semibold text-gray-200"
              >
                <FiDownload className="w-4 h-4 text-emerald-400" /> View Current Resume
              </a>
            )}

            {hasResume && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleManualReAnalyze}
                loading={isProcessing}
                disabled={isProcessing}
                icon={<FiRefreshCw className="w-4 h-4 text-indigo-400" />}
              >
                Re-analyze Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Drag & Drop Upload Card */}
      <GlassCard hover={false} className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <FiUploadCloud className="text-[#6366F1] w-5 h-5" /> Resume Upload & Document Parser
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Upload your latest resume file to receive instant AI feedback and completeness scoring.
            </p>
          </div>
          {profileData?.resumeUpdatedAt && (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              <FiClock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Last updated: {new Date(profileData.resumeUpdatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="hidden"
          id="analytics-resume-upload-input"
        />

        {/* Dropzone Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all duration-300 overflow-hidden ${
            isDragOver
              ? "border-[#6366F1] bg-[#6366F1]/10 scale-[1.01]"
              : isProcessing
              ? "border-indigo-500/40 bg-indigo-500/5 cursor-wait"
              : "border-white/15 bg-white/[0.02] hover:border-white/35 hover:bg-white/[0.04] cursor-pointer"
          }`}
        >
          {isProcessing ? (
            <div className="space-y-4 py-2 flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-purple-500 border-b-blue-500 border-l-transparent animate-spin" />
                <FiCpu className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white tracking-wide animate-pulse">
                  {uploadProgressStage || "Processing..."}
                </p>
                <p className="text-xs text-gray-400">
                  Please keep this screen open while Gemini AI generates your comprehensive report.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition duration-300">
                <FiFileText className="w-8 h-8 text-[#6366F1]" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Upload your resume to get AI-powered insights
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                  Drag and drop your PDF or DOCX file here, or click anywhere to browse from your computer.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  Supported: PDF & DOCX
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  Max Size: 10MB
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  Instant AI Parsing
                </span>
              </div>

              {selectedFileDetails && (
                <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/10 inline-flex items-center gap-3 text-xs text-gray-300">
                  <FiPaperclip className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-white">{selectedFileDetails.name}</span>
                  <span className="text-gray-400">({selectedFileDetails.size})</span>
                  <span className="text-emerald-400 font-bold">✓ Ready</span>
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {/* 3. Dedicated AI Loading Screen (Shown during processing) */}
      {isProcessing ? (
        <GlassCard hover={false} className="p-8 sm:p-10 space-y-8 animate-in fade-in duration-300 border border-indigo-500/30 bg-indigo-500/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-indigo-500/20 pb-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <FiZap className="w-7 h-7 animate-pulse text-indigo-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-display">AI Resume Analysis in Progress</h2>
                <p className="text-xs text-indigo-300 mt-1">
                  Gemini AI is reading your resume, evaluating market completeness, and writing recommendations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-200">
              <FiLoader className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Analyzing Document...</span>
            </div>
          </div>

          {/* Dynamic 4-Step Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${currentStep >= 1 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/5 text-gray-400"} space-y-2 transition`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Step 1</span>
                {currentStep > 1 ? <FiCheck className="text-emerald-400 w-4 h-4" /> : currentStep === 1 ? <FiLoader className="animate-spin text-indigo-400 w-4 h-4" /> : null}
              </div>
              <p className="text-xs font-bold text-white">Upload & Cloud Storage</p>
              <p className="text-[11px] opacity-80">{currentStep > 1 ? "Uploaded ✓" : currentStep === 1 ? "Uploading resume file..." : "Waiting..."}</p>
            </div>

            <div className={`p-4 rounded-2xl border ${currentStep >= 2 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/5 text-gray-400"} space-y-2 transition`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Step 2</span>
                {currentStep > 2 ? <FiCheck className="text-emerald-400 w-4 h-4" /> : currentStep === 2 ? <FiLoader className="animate-spin text-indigo-400 w-4 h-4" /> : null}
              </div>
              <p className="text-xs font-bold text-white">Text & Keyword Parsing</p>
              <p className="text-[11px] opacity-80">{currentStep > 2 ? "Extracted ✓" : currentStep === 2 ? "Extracting resume text..." : "Waiting..."}</p>
            </div>

            <div className={`p-4 rounded-2xl border ${currentStep >= 3 ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200" : "border-white/10 bg-white/5 text-gray-400"} space-y-2 transition`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Step 3</span>
                {currentStep > 3 ? <FiCheck className="text-emerald-400 w-4 h-4" /> : currentStep === 3 ? <FiLoader className="animate-spin text-indigo-400 w-4 h-4" /> : null}
              </div>
              <p className="text-xs font-bold text-white">Gemini Market Audit</p>
              <p className="text-[11px] opacity-80">{currentStep > 3 ? "Audited ✓" : currentStep === 3 ? "Evaluating alignment..." : "Waiting..."}</p>
            </div>

            <div className={`p-4 rounded-2xl border ${currentStep >= 4 ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200" : "border-white/10 bg-white/5 text-gray-400"} space-y-2 transition`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Step 4</span>
                {currentStep === 4 ? <FiLoader className="animate-spin text-indigo-400 w-4 h-4" /> : null}
              </div>
              <p className="text-xs font-bold text-white">Recruiter Report</p>
              <p className="text-[11px] opacity-80">{currentStep === 4 ? "Writing suggestions..." : "Waiting..."}</p>
            </div>
          </div>

          {/* Skeleton Preview of Upcoming Report */}
          <div className="space-y-4 pt-4 border-t border-indigo-500/20">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preparing Analytics Report...</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
              <div className="h-44 bg-white/5 rounded-2xl animate-pulse" />
              <div className="md:col-span-2 h-44 bg-white/5 rounded-2xl animate-pulse" />
            </div>
          </div>
        </GlassCard>
      ) : hasResume && latestAnalysis ? (
        /* 4. Analytics Dashboard Section (When report is ready) */
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
          {/* Main Grid: Score Gauge & Executive Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Overall Score Card */}
            <GlassCard hover={false} className="p-8 flex flex-col items-center justify-between text-center space-y-6">
              <div className="w-full text-left border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <FiAward className="text-amber-400 w-5 h-5" /> Overall Resume Score
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Automated AI evaluation against market benchmarks</p>
              </div>

              {/* Radial Gauge */}
              <div className="relative w-44 h-44 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-white/10"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Circle */}
                  <path
                    stroke={scoreTheme.stroke}
                    strokeDasharray={`${score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000 ease-out"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-white font-display tracking-tight">
                    {score}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    out of 100
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="w-full space-y-2">
                <div className={`py-2 px-4 rounded-2xl border ${scoreTheme.border} bg-white/5 inline-block text-xs font-extrabold uppercase tracking-wider ${scoreTheme.bg}`}>
                  {scoreTheme.label}
                </div>
                <p className="text-xs text-gray-400">
                  {score >= 80
                    ? "Your resume shows strong technical clarity and high recruiter appeal."
                    : score >= 65
                    ? "Good foundation. Address highlighted gaps to maximize client response rates."
                    : "Needs optimization to effectively showcase your skillset."}
                </p>
              </div>
            </GlassCard>

            {/* AI Feedback & Executive Summary (2 cols) */}
            <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
              {/* Feedback Banner */}
              <GlassCard hover={false} className="p-8 space-y-4 flex-1">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                    <FiZap className="text-[#6366F1] w-5 h-5" /> Executive Summary & Feedback
                  </h3>
                  <span className="text-xs text-gray-400">
                    Analyzed: {new Date(latestAnalysis.analyzedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl space-y-2">
                  <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">AI Evaluation</p>
                  <p className="text-sm text-gray-200 leading-relaxed italic">
                    "{analysisResult.feedback || "Your resume text has been parsed and evaluated for technical relevance, completeness, and recruiter presentation."}"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Parsed Skills</span>
                    <p className="text-sm font-bold text-white">
                      {profileData.skills?.length || 0} Listed Skills
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Experience Level</span>
                    <p className="text-sm font-bold text-white">
                      {profileData.experience || 0} Years Industry Experience
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Strengths & Improvements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Strengths */}
            <GlassCard hover={false} className="p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-400 w-5 h-5" /> Profile & Resume Strengths
                </h3>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {analysisResult.strengths?.length || 0} Identified
                </span>
              </div>

              {analysisResult.strengths && analysisResult.strengths.length > 0 ? (
                <ul className="space-y-3">
                  {analysisResult.strengths.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/20 transition">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <FiCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-200 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">No specific strengths recorded.</p>
              )}
            </GlassCard>

            {/* Areas to Improve / Weaknesses */}
            <GlassCard hover={false} className="p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <FiAlertTriangle className="text-amber-400 w-5 h-5" /> Areas for Improvement
                </h3>
                <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {analysisResult.improvements?.length || 0} Suggested
                </span>
              </div>

              {analysisResult.improvements && analysisResult.improvements.length > 0 ? (
                <ul className="space-y-3">
                  {analysisResult.improvements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <FiAlertCircle className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-200 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">No critical improvement areas detected.</p>
              )}
            </GlassCard>
          </div>

          {/* Actionable Recommendations / Suggestions Section */}
          {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
            <GlassCard hover={false} className="p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                    <FiTrendingUp className="text-[#6366F1] w-5 h-5" /> Actionable Recommendations
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Concrete optimization steps recommended by AI to increase job offers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.suggestions.map((suggestion, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition flex items-start gap-4">
                    <div className="w-7 h-7 rounded-xl bg-[#6366F1]/20 text-[#6366F1] flex items-center justify-center shrink-0 font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Recommendation #{idx + 1}</h4>
                      <p className="text-xs text-gray-200 mt-1 leading-relaxed">{suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      ) : (
        /* 5. Polished Empty State (Only when no resume uploaded & not processing) */
        <GlassCard hover={false} className="p-10 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#6366F1]/20 to-[#3B82F6]/20 border border-white/10 flex items-center justify-center text-[#6366F1]">
            <FiZap className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-white font-display">Unlock your resume insights</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Upload your latest resume and let our AI analyze your skills, experience, strengths, and areas for improvement.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              loading={isProcessing}
              icon={<FiUploadCloud />}
            >
              Upload Resume & Generate AI Insights
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
