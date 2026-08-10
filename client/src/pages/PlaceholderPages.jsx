import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import api from "../api/axios";
import { getMyProposalsApi, getMyInvitationsApi } from "../api/apiServices";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import MilestonesSection from "../components/MilestonesSection";
import {
  FiFolder,
  FiCheckSquare,
  FiMessageSquare,
  FiCreditCard,
  FiStar,
  FiUser,
  FiSettings,
  FiLayers,
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiSend,
  FiShield,
  FiBell,
  FiLock,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";

// Helper to check if freelancer is hired for a project
const isFreelancerHiredForProject = (project, userId, acceptedProjectIdsSet) => {
  if (!project) return false;
  const pId = (project._id || project.id || "").toString();

  // Check 1: In accepted proposals or accepted invitations
  if (acceptedProjectIdsSet.has(pId)) return true;

  // Check 2: Listed in project.freelancers array
  if (project.freelancers && Array.isArray(project.freelancers)) {
    const isListed = project.freelancers.some((f) => {
      const fId = typeof f === "object" ? (f._id || f.id || "").toString() : (f || "").toString();
      return fId === userId?.toString();
    });
    if (isListed) return true;
  }

  return false;
};

// Helper components
const ComingSoonBadge = () => (
  <span className="text-[10px] font-bold tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase">
    Module 2 Coming Soon
  </span>
);

/* 1. Projects Placeholder */
export function ProjectsPage() {
  const mockProjects = [
    { id: 1, name: "E-Commerce Mobile Client", desc: "Build a React Native client matching the Figma mocks.", deadline: "Aug 24, 2026", status: "In Progress" },
    { id: 2, name: "AI Document Search Parser", desc: "Embeddings generation and LLM context search integration.", deadline: "Sep 02, 2026", status: "Review" },
    { id: 3, name: "Database Sharding & Migration", desc: "Migrate Postgres instance to multi-region cluster setup.", deadline: "Completed", status: "Archived" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <FiFolder className="text-[#6366F1]" /> Projects Portal
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage, scope, and track ongoing collaborations</p>
        </div>
        <div className="flex items-center gap-3">
          <ComingSoonBadge />
          <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white p-2.5 rounded-xl transition cursor-pointer">
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockProjects.map((p) => (
          <div key={p.id} className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#6366F1]/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex justify-between items-start">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  p.status === "In Progress" ? "text-blue-400 bg-blue-500/10" :
                  p.status === "Review" ? "text-amber-400 bg-amber-400/10" :
                  "text-gray-400 bg-white/10"
                }`}>
                  {p.status}
                </span>
                <button className="text-gray-400 hover:text-white"><FiMoreVertical className="w-4 h-4" /></button>
              </div>
              <h3 className="text-base font-semibold mt-3 text-white">{p.name}</h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.desc}</p>
            </div>
            <div className="border-t border-white/5 pt-3 flex justify-between items-center text-xs text-gray-500">
              <span>Deadline</span>
              <span className="text-gray-300 font-medium">{p.deadline}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 2. Tasks Page Component */
export function TasksPage() {
  const { user, role } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/project");
        let list = res.data?.projects || [];

        // For Freelancers: filter down strictly to projects where they are HIRED
        if (role === "freelancer") {
          const [proposalsRes, invitationsRes] = await Promise.allSettled([
            getMyProposalsApi(),
            getMyInvitationsApi(),
          ]);

          const acceptedProjectIdsSet = new Set();

          if (proposalsRes.status === "fulfilled" && proposalsRes.value?.proposals) {
            proposalsRes.value.proposals.forEach((p) => {
              if (p.status === "Accepted" && p.project) {
                const pId = typeof p.project === "object" ? p.project._id || p.project.id : p.project;
                if (pId) acceptedProjectIdsSet.add(pId.toString());
              }
            });
          }

          if (invitationsRes.status === "fulfilled" && invitationsRes.value?.invitations) {
            invitationsRes.value.invitations.forEach((i) => {
              if (i.status === "Accepted" && i.project) {
                const pId = typeof i.project === "object" ? i.project._id || i.project.id : i.project;
                if (pId) acceptedProjectIdsSet.add(pId.toString());
              }
            });
          }

          const currentUserId = user?._id || user?.id;

          list = list.filter((proj) =>
            isFreelancerHiredForProject(proj, currentUserId, acceptedProjectIdsSet)
          );
        }

        // Exclude Completed and Cancelled projects from active task management
        list = list.filter(
          (proj) => proj.status !== "Completed" && proj.status !== "Cancelled"
        );

        setProjects(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0]._id);
        }
      } catch (err) {
        console.error("Fetch projects error:", err);
        setError(err?.response?.data?.message || "Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [role, user]);

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  if (loading) {
    return <LoadingSpinner label="Loading task workspace..." />;
  }

  if (error) {
    return <EmptyState title="Could not load tasks" description={error} />;
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        title={role === "freelancer" ? "No Hired Projects Found" : "No active projects found"}
        description={
          role === "freelancer"
            ? "You have not been hired for any projects yet. Submit proposals or accept invitations to collaborate on tasks."
            : "Create or accept a project to start managing milestones and tasks."
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl border border-white/10 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2 text-white">
            <FiCheckSquare className="text-[#6366F1]" /> Task Management Tracker
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {role === "freelancer"
              ? "View tasks for projects you are hired on and update task status as you complete deliverables."
              : "Break deliverables into actionable tasks, assign tasks to project freelancers, and track progress."}
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-400 shrink-0">
            Select Project:
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="glass-input rounded-2xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-indigo-500 cursor-pointer"
          >
            {projects.map((proj) => (
              <option key={proj._id} value={proj._id} className="bg-[#09090B] text-white">
                {proj.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Render Milestones & Tasks Section for Selected Project */}
      {selectedProject && (
        <MilestonesSection
          projectId={selectedProject._id}
          project={selectedProject}
        />
      )}
    </div>
  );
}

/* 3. Messages Placeholder */
export function MessagesPage() {
  const contacts = [
    { name: "Sarah Jenkins", active: true, desc: "Active now" },
    { name: "Alex Rivera", active: false, desc: "Offline" },
    { name: "Liam Patel", active: false, desc: "Active 4h ago" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <FiMessageSquare className="text-[#6366F1]" /> Live Chat Room
          </h1>
          <p className="text-gray-400 text-sm mt-1">Real-time messaging, file sharing, and call scheduling</p>
        </div>
        <ComingSoonBadge />
      </div>

      <div className="glass-card rounded-3xl border border-white/5 h-[500px] flex overflow-hidden">
        {/* Left contacts bar */}
        <div className="w-80 border-r border-white/5 flex flex-col hidden md:flex">
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input placeholder-gray-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {contacts.map((c, i) => (
              <div key={i} className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition ${i === 0 ? "bg-white/5" : "hover:bg-white/2"}`}>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs relative">
                  {c.name[0]}
                  {c.active && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 ring-2 ring-[#09090B]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{c.name}</h4>
                  <p className="text-[10px] text-gray-400">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right chat panel */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">S</div>
              <div>
                <h4 className="text-xs font-bold text-white">Sarah Jenkins</h4>
                <p className="text-[9px] text-green-500 font-semibold uppercase tracking-wider">Active Workspace</p>
              </div>
            </div>
          </div>

          <div className="flex-grow p-6 overflow-y-auto space-y-4 flex flex-col justify-end">
            <div className="bg-white/5 max-w-sm rounded-2xl rounded-tl-none p-4 text-xs leading-relaxed">
              Hello! I've uploaded the code assets for the landing page header. Please check it over when you have a free moment.
            </div>
            <div className="bg-indigo-600/20 border border-indigo-500/10 text-indigo-100 max-w-sm self-end rounded-2xl rounded-tr-none p-4 text-xs leading-relaxed">
              Hey Sarah, looking great! I will review the designs and link the login/register screens to the database today.
            </div>
          </div>

          <div className="p-4 border-t border-white/5 flex items-center gap-3">
            <input
              type="text"
              placeholder="Write a message..."
              className="flex-1 px-4 py-2.5 text-xs rounded-xl glass-input placeholder-gray-500"
            />
            <button className="bg-gradient-to-r from-[#6366F1] to-[#3B82F6] text-white p-2.5 rounded-xl cursor-pointer hover:scale-[1.03] transition">
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 4. Payments Placeholder */
export function PaymentsPage() {
  const transactions = [
    { ref: "TXN-9042", client: "Stripe UI Integration", amt: "+$8,500.00", date: "Jul 28, 2026", status: "Cleared" },
    { ref: "TXN-7182", client: "API Deployment Milestone", amt: "+$12,000.00", date: "Jul 15, 2026", status: "Pending" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <FiCreditCard className="text-[#6366F1]" /> Invoices & Ledger
          </h1>
          <p className="text-gray-400 text-sm mt-1">Process payouts, view deposit summaries, and configure tax details</p>
        </div>
        <ComingSoonBadge />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between h-40">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Available Balance</p>
            <h2 className="text-3xl font-extrabold mt-2 font-display">$8,500.00</h2>
          </div>
          <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 rounded-xl text-xs font-semibold cursor-pointer transition">
            Request Payout
          </button>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-40">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Escrow Holds</p>
            <h2 className="text-3xl font-extrabold mt-2 font-display text-amber-400 font-display">$12,000.00</h2>
          </div>
          <p className="text-[10px] text-gray-400 flex items-center gap-1"><FiAlertCircle /> Held in escrow until milestone audit clearance</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-40">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Life-Time Earnings</p>
            <h2 className="text-3xl font-extrabold mt-2 font-display text-[#22C55E] font-display">$54,200.00</h2>
          </div>
          <span className="text-[10px] text-green-500 font-semibold">+18.5% year over year growth</span>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-base font-bold mb-4 font-display">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 uppercase tracking-wider font-semibold">
                <th className="py-3">Reference ID</th>
                <th className="py-3">Details / Project</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Settlement Date</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {transactions.map((t, idx) => (
                <tr key={idx} className="hover:bg-white/[0.01]">
                  <td className="py-4 font-mono font-semibold">{t.ref}</td>
                  <td className="py-4 font-medium text-white">{t.client}</td>
                  <td className="py-4 font-bold text-white">{t.amt}</td>
                  <td className="py-4 text-gray-400">{t.date}</td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      t.status === "Cleared" ? "text-green-400 bg-green-500/10" : "text-amber-400 bg-amber-400/10"
                    }`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* 5. Reviews Placeholder */
export function ReviewsPage() {
  const reviews = [
    { rater: "Jonathan Carter", company: "Stripe Developer Relations", stars: 5, feedback: "Exceptional UI designer. Completed the Vite-Tailwind architecture ahead of time with zero guidance necessary.", date: "1 week ago" },
    { rater: "Amira Krayem", company: "Notion HR Lead", stars: 5, feedback: "Highly recommended for react frontend work. Code is cleanly modularized.", date: "1 month ago" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <FiStar className="text-[#6366F1]" /> Customer Reviews
          </h1>
          <p className="text-gray-400 text-sm mt-1">View rating feedback, star metrics, and submit testimonials</p>
        </div>
        <ComingSoonBadge />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center h-40">
          <h1 className="text-5xl font-black text-white font-display">4.92</h1>
          <div className="flex gap-1 mt-2 text-amber-400"><FiStar /><FiStar /><FiStar /><FiStar /><FiStar /></div>
          <span className="text-[10px] text-gray-500 mt-2">Overall profile grade from 18 raters</span>
        </div>
        <div className="glass-card md:col-span-3 p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Feedback Summary</h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">5 Stars (Quality)</span>
              <div className="w-1/2 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-[#6366F1] rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">4 Stars (Timing)</span>
              <div className="w-1/2 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-[#6366F1] rounded-full" style={{ width: "8%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-white">{r.rater}</h4>
                <p className="text-xs text-gray-500">{r.company}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400"><FiStar /><FiStar /><FiStar /><FiStar /><FiStar /></div>
                <span className="text-[10px] text-gray-500">{r.date}</span>
              </div>
            </div>
            <p className="text-xs text-gray-300 mt-4 leading-relaxed italic">"{r.feedback}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 6. Profile Placeholder */
export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <FiUser className="text-[#6366F1]" /> User Profile
          </h1>
          <p className="text-gray-400 text-sm mt-1">Update public description, showcase skills, and update resume files</p>
        </div>
        <ComingSoonBadge />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center font-bold text-3xl text-white shadow-lg border-2 border-white/10 ring-4 ring-indigo-500/10">
            {user?.fullName ? user.fullName[0] : "U"}
          </div>
          <h3 className="text-lg font-bold mt-4 text-white font-display">{user?.fullName || "Account Name"}</h3>
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mt-1">{user?.role || "Member"}</p>
          <p className="text-xs text-gray-400 mt-2">{user?.email}</p>

          <div className="w-full border-t border-white/5 mt-6 pt-6 flex justify-around text-center">
            <div>
              <h4 className="text-sm font-bold text-white">4.9</h4>
              <p className="text-[10px] text-gray-500">Rating</p>
            </div>
            <div className="border-l border-white/5" />
            <div>
              <h4 className="text-sm font-bold text-white">12</h4>
              <p className="text-[10px] text-gray-500">Contracts</p>
            </div>
          </div>
        </div>

        {/* Profile Fields Form */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-6">
          <h3 className="text-base font-bold font-display border-b border-white/5 pb-2">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.fullName || ""}
                className="w-full glass-input rounded-xl py-2.5 px-4 text-xs opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Email Address</label>
              <input
                type="text"
                disabled
                value={user?.email || ""}
                className="w-full glass-input rounded-xl py-2.5 px-4 text-xs opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Phone Number</label>
              <input
                type="text"
                disabled
                value={user?.phone || "+1 (555) 000-0000"}
                className="w-full glass-input rounded-xl py-2.5 px-4 text-xs opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Account Role</label>
              <input
                type="text"
                disabled
                value={user?.role || "client"}
                className="w-full glass-input rounded-xl py-2.5 px-4 text-xs opacity-60 cursor-not-allowed capitalize"
              />
            </div>
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl flex gap-3 text-xs text-indigo-200">
            <FiCheckCircle className="w-5 h-5 flex-shrink-0 text-indigo-400" />
            <div>
              <h4 className="font-semibold text-indigo-300">Profile Linked to Backend Database</h4>
              <p className="mt-1 leading-relaxed text-indigo-200/80">
                Your profile information is fetched in real-time using secure HTTP cookies. To request change of details, please consult directory administrators.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 7. Settings Placeholder */
export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("security"); // "security" | "notifications" | "apis"
  const {
    notificationSoundEnabled,
    browserPermission,
    toggleSound,
    requestBrowserPermission,
  } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <FiSettings className="text-[#6366F1]" /> Settings Console
          </h1>
          <p className="text-gray-400 text-sm mt-1">Configure workspace rules, credentials, notifications, and integration logs</p>
        </div>
        <ComingSoonBadge />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation list */}
        <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-1 h-fit">
          <button
            onClick={() => setActiveSection("security")}
            className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
              activeSection === "security" ? "bg-white/5 text-white" : "text-gray-400 hover:text-white hover:bg-white/2"
            }`}
          >
            <FiUser className="w-4 h-4 text-indigo-400" /> Account Security
          </button>
          <button
            onClick={() => setActiveSection("notifications")}
            className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition ${
              activeSection === "notifications" ? "bg-white/5 text-white" : "text-gray-400 hover:text-white hover:bg-white/2"
            }`}
          >
            <FiBell className="w-4 h-4" /> Notifications System
          </button>
          <button
            onClick={() => setActiveSection("apis")}
            className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition ${
              activeSection === "apis" ? "bg-white/5 text-white" : "text-gray-400 hover:text-white hover:bg-white/2"
            }`}
          >
            <FiShield className="w-4 h-4" /> APIs & Permissions
          </button>
        </div>

        {/* Content detail */}
        <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-6">
          {activeSection === "security" && (
            <>
              <h3 className="text-base font-bold font-display border-b border-white/5 pb-2">Account Security Settings</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-xl bg-white/2 border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold text-white">Multi-Factor Authentication (MFA)</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Add another security layer to verify code logins</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">MFA Disabled</span>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl bg-white/2 border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold text-white">Connected Social Accounts</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Login using Google credentials</p>
                  </div>
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded">Enabled</span>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl bg-white/2 border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold text-white">Security Tokens & Keys</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Local session keys used for DB endpoints</p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded font-mono">JWT-Cookie</span>
                </div>
              </div>
            </>
          )}

          {activeSection === "notifications" && (
            <>
              <h3 className="text-base font-bold font-display border-b border-white/5 pb-2">Notifications System Settings</h3>

              <div className="space-y-4">
                {/* Toggle Sounds */}
                <div className="flex justify-between items-center p-4 rounded-xl bg-white/2 border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold text-white">Notification Chimes & Sounds</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Play an audio chirp when a new message or update arrives</p>
                  </div>
                  <button
                    onClick={toggleSound}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
                      notificationSoundEnabled
                        ? "bg-[#6366F1] hover:bg-[#5053db] text-white"
                        : "bg-white/5 hover:bg-white/10 text-gray-300"
                    }`}
                  >
                    {notificationSoundEnabled ? "Sounds Muted" : "Sounds Play Enabled"}
                  </button>
                </div>

                {/* Browser Desktop notification permissions */}
                <div className="flex justify-between items-center p-4 rounded-xl bg-white/2 border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold text-white">Desktop System Notifications</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Show browser notification cards outside the window</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        browserPermission === "granted"
                          ? "text-green-400 bg-green-500/10"
                          : browserPermission === "denied"
                          ? "text-rose-400 bg-rose-500/10"
                          : "text-amber-400 bg-amber-500/10"
                      }`}
                    >
                      {browserPermission}
                    </span>
                    {browserPermission !== "granted" && (
                      <button
                        onClick={requestBrowserPermission}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 cursor-pointer transition"
                      >
                        Request Permission
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === "apis" && (
            <>
              <h3 className="text-base font-bold font-display border-b border-white/5 pb-2">APIs & Integrations Permissions</h3>
              <div className="py-12 flex flex-col items-center justify-center text-center p-6">
                <FiShield className="w-10 h-10 text-gray-600 mb-3 bg-white/5 p-2 rounded-2xl" />
                <h3 className="text-sm font-bold text-white">APIs & Permissions Console</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Generate secure authorization tokens and configure webhook URLs.
                </p>
                <ComingSoonBadge />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
