import { useAuth } from "../context/AuthContext";
import {
  FiBriefcase,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiPlus,
  FiUserPlus,
  FiFileText,
  FiMessageSquare,
  FiArrowRight,
  FiChevronRight
} from "react-icons/fi";

function Dashboard() {
  const { user } = useAuth();

  const getStats = () => {
    if (user?.role === "freelancer") {
      return [
        { label: "Active Contracts", value: "8 Projects", icon: FiBriefcase, color: "text-[#6366F1] bg-[#6366F1]/10", change: "+12% this month" },
        { label: "Total Earnings", value: "$12,450.00", icon: FiDollarSign, color: "text-[#22C55E] bg-[#22C55E]/10", change: "+8.4% this month" },
        { label: "Tasks Completed", value: "32 Tasks", icon: FiCheckCircle, color: "text-[#3B82F6] bg-[#3B82F6]/10", change: "94% success rate" },
        { label: "Hours Tracked", value: "142 hrs", icon: FiClock, color: "text-amber-400 bg-amber-400/10", change: "24 hrs this week" },
      ];
    }
    // Client stats
    return [
      { label: "Projects Posted", value: "14 Projects", icon: FiBriefcase, color: "text-[#6366F1] bg-[#6366F1]/10", change: "+2 new this week" },
      { label: "Total Budget Spent", value: "$42,100.00", icon: FiDollarSign, color: "text-[#22C55E] bg-[#22C55E]/10", change: "+$5,200 this month" },
      { label: "Milestones Cleared", value: "18 Cleared", icon: FiCheckCircle, color: "text-[#3B82F6] bg-[#3B82F6]/10", change: "98% completion rate" },
      { label: "Active Freelancers", value: "6 Hired", icon: FiUserPlus, color: "text-amber-400 bg-amber-400/10", change: "3 departments" },
    ];
  };

  const stats = getStats();

  const dummyProjects = [
    { id: 1, name: "Web App UI Redesign", client: "Stripe Inc.", budget: "$8,500", progress: 75, status: "active", category: "Design" },
    { id: 2, name: "API Gateway Integration", client: "Vercel Labs", budget: "$12,000", progress: 40, status: "review", category: "Development" },
    { id: 3, name: "SEO Optimization Campaign", client: "Notion Co.", budget: "$2,400", progress: 100, status: "completed", category: "Marketing" },
  ];

  const dummyTasks = [
    { id: 1, text: "Refactor global auth logic with secure cookie fallback", priority: "high", done: false },
    { id: 2, text: "Conduct user testing on landing page prototype", priority: "medium", done: true },
    { id: 3, text: "Draft project proposal contract and invoice templates", priority: "low", done: false },
  ];

  const dummyMessages = [
    { id: 1, sender: "Sarah Jenkins", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", message: "Hi! Did you get a chance to check the updated design tokens?", time: "5m ago" },
    { id: 2, sender: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", message: "The API endpoint has been deployed to the test environment.", time: "1h ago" },
    { id: 3, sender: "Liam Patel", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", message: "Thank you for the review! I've updated the PR.", time: "4h ago" },
  ];

  const dummyActivities = [
    { id: 1, type: "milestone", text: "Milestone 3 approved for Project Vercel", time: "10 minutes ago" },
    { id: 2, type: "contract", text: "New proposal submitted by Chloe Zhang", time: "2 hours ago" },
    { id: 3, type: "payment", text: "Payout of $4,500 initiated successfully", time: "Yesterday" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Row */}
      <div className="glass-card p-8 glow-border rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <span className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full">
            Workspace Overview
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-3 font-display">
            Welcome back, {user?.fullName || "Partner"}! 👋
          </h1>
          <p className="text-gray-400 mt-2 text-sm max-w-xl">
            {user?.role === "freelancer"
              ? "Here's what is happening with your freelance portfolio today. You have 3 active tasks remaining and 2 reviews pending."
              : "Review your ongoing projects, hire new specialists, and track budgets directly from your administration portal."}
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-gradient-to-r from-[#6366F1] to-[#3B82F6] text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition cursor-pointer flex items-center justify-center gap-2 text-sm">
            <FiPlus className="w-4 h-4" />
            {user?.role === "freelancer" ? "Submit Proposal" : "Create Project"}
          </button>
          <button className="flex-1 md:flex-none glass-card border border-white/10 hover:bg-white/5 text-white px-5 py-3 rounded-xl font-semibold transition cursor-pointer flex items-center justify-center gap-2 text-sm">
            Quick Reports
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl relative border border-white/5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-2 font-display">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
              <FiTrendingUp className="text-[#22C55E] w-3.5 h-3.5" />
              <span>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Projects Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold font-display">Recent Projects</h2>
              <button className="text-xs text-[#6366F1] hover:underline flex items-center gap-1 transition">
                View all projects <FiArrowRight />
              </button>
            </div>
            
            <div className="space-y-4">
              {dummyProjects.map((project) => (
                <div key={project.id} className="p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                      {project.category}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-1">{project.name}</h3>
                    <p className="text-xs text-gray-400">Client: {project.client}</p>
                  </div>

                  <div className="flex items-center gap-6 justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <p className="text-xs font-semibold text-white">{project.budget}</p>
                      <p className="text-[10px] text-gray-400">Total Budget</p>
                    </div>

                    <div className="w-24">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#6366F1] to-[#3B82F6] rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg ${
                      project.status === "active" ? "text-[#3B82F6] bg-[#3B82F6]/10" :
                      project.status === "review" ? "text-amber-400 bg-amber-400/10" :
                      "text-[#22C55E] bg-[#22C55E]/10"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tasks Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold font-display">Active Checklist</h2>
              <button className="text-xs text-[#6366F1] hover:underline flex items-center gap-1 transition">
                Add new task <FiPlus />
              </button>
            </div>
            
            <div className="space-y-3">
              {dummyTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white/2 border border-white/5">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked={task.done}
                      className="w-4.5 h-4.5 rounded-lg border-white/20 bg-[#09090B] accent-[#6366F1] cursor-pointer"
                    />
                    <span className={`text-sm text-gray-200 ${task.done ? "line-through text-gray-500" : ""}`}>
                      {task.text}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    task.priority === "high" ? "text-red-400 bg-red-500/10" :
                    task.priority === "medium" ? "text-amber-400 bg-amber-400/10" :
                    "text-gray-400 bg-white/10"
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-bold mb-4 font-display">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/2 border border-white/5 hover:border-[#6366F1]/20 hover:bg-white/5 transition duration-300">
                <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <FiPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">Post Work</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/2 border border-white/5 hover:border-[#3B82F6]/20 hover:bg-white/5 transition duration-300">
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                  <FiMessageSquare className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">New Chat</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/2 border border-white/5 hover:border-green-500/20 hover:bg-white/5 transition duration-300">
                <div className="p-3 rounded-lg bg-green-500/10 text-green-400">
                  <FiDollarSign className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">Invoices</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/2 border border-white/5 hover:border-amber-500/20 hover:bg-white/5 transition duration-300">
                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
                  <FiFileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">Documents</span>
              </button>
            </div>
          </div>

          {/* Recent Messages */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold font-display">Recent Messages</h2>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            </div>
            
            <div className="space-y-4">
              {dummyMessages.map((msg) => (
                <div key={msg.id} className="flex gap-3 hover:bg-white/2 p-2 rounded-xl transition duration-300 cursor-pointer">
                  <img
                    src={msg.avatar}
                    alt={msg.sender}
                    className="w-9 h-9 rounded-xl object-cover border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-white truncate">{msg.sender}</h4>
                      <span className="text-[10px] text-gray-500">{msg.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-1">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-bold mb-5 font-display">Recent Activity</h2>
            <div className="space-y-4 relative pl-4 border-l border-white/10 ml-2">
              {dummyActivities.map((act) => (
                <div key={act.id} className="relative">
                  {/* Bullet */}
                  <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#6366F1] border-2 border-[#09090B] shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                  <div>
                    <p className="text-xs text-gray-200">{act.text}</p>
                    <span className="text-[10px] text-gray-500 block mt-1">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;
