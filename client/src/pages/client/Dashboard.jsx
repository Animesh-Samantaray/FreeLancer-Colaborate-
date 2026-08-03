import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiArrowRight, FiFolder, FiCheckCircle, FiDollarSign, FiTrendingUp } from "react-icons/fi";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get("/project");
        setProjects(response.data.projects || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const stats = useMemo(() => {
    const total = projects.length;
    const open = projects.filter((project) => project.status === "Open" || project.status === "Hiring" || project.status === "In Progress").length;
    const completed = projects.filter((project) => project.status === "Completed").length;
    const budget = projects.reduce((sum, project) => sum + Number(project.budget || 0), 0);

    return [
      { title: "Total Projects", value: `${total}`, subtitle: "Projects you have posted.", icon: <FiFolder /> },
      { title: "Open Projects", value: `${open}`, subtitle: "Active and hiring work.", icon: <FiTrendingUp /> },
      { title: "Completed", value: `${completed}`, subtitle: "Successfully delivered.", icon: <FiCheckCircle /> },
      { title: "Budget Spent", value: `$${budget.toLocaleString()}`, subtitle: "Total project budget.", icon: <FiDollarSign /> },
    ];
  }, [projects]);

  if (loading) {
    return <LoadingSpinner label="Gathering your projects..." />;
  }

  if (error) {
    return <EmptyState title="Unable to load dashboard" description={error} />;
  }

  return (
    <div className="space-y-8">
      <div className="glass-card border border-white/10 p-8 rounded-3xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#6366F1]">Client Dashboard</p>
            <h1 className="mt-3 text-3xl font-bold text-white">Your active projects and budget overview</h1>
            <p className="mt-3 text-sm text-gray-400 max-w-2xl">
              Manage posted work, monitor milestone progress, and keep communication running smoothly from one modern client dashboard.
            </p>
          </div>
          <Link
            to="/client/create-project"
            className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/20 transition hover:brightness-110"
          >
            <FiPlus className="w-4 h-4" />
            Create Project
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="glass-card border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{stat.title}</p>
                <h3 className="mt-4 text-3xl font-bold text-white">{stat.value}</h3>
              </div>
              <div className="rounded-3xl bg-[#6366F1]/10 p-4 text-[#6366F1]">{stat.icon}</div>
            </div>
            <p className="mt-4 text-sm text-gray-400">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="glass-card border border-white/10 rounded-3xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent projects</h2>
            <p className="text-sm text-gray-400">Quick overview of your most recently posted jobs.</p>
          </div>
          <Link className="text-sm font-semibold text-[#6366F1] hover:text-[#3B82F6] transition" to="/client/my-projects">
            View all projects <FiArrowRight />
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {projects.length > 0 ? (
            projects.slice(0, 4).map((project) => (
              <div key={project._id} className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:border-white/20 transition">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{project.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{project.category || "General"} · {new Date(project.deadline).toLocaleDateString()}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] rounded-full border border-white/10 bg-white/5 px-3 py-2 text-gray-300">
                    {project.status || "Active"}
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-300 line-clamp-2">{project.description}</p>
                  <span className="rounded-full bg-white/5 px-4 py-2 text-xs text-gray-400">Budget: ${project.budget}</span>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No projects yet"
              description="You haven't posted a project yet. Start by creating your first project to attract the right freelancer."
              action={
                <Link
                  to="/client/create-project"
                  className="rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-6 py-3 text-sm font-semibold text-white"
                >
                  Create first project
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
