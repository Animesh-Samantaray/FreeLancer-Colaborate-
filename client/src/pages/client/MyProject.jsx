import { useEffect, useState } from "react";
import { FiFolder, FiClock, FiChevronRight } from "react-icons/fi";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { Link } from "react-router-dom";

const MyProject = () => {
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
        setError(err?.response?.data?.message || "Could not load your projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading your projects..." />;
  }

  if (error) {
    return <EmptyState title="Error loading projects" description={error} />;
  }

  return (
    <div className="space-y-8">
      <div className="glass-card border border-white/10 rounded-3xl p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#6366F1]">My Projects</p>
            <h1 className="mt-3 text-3xl font-bold text-white">All projects you have created</h1>
            <p className="mt-2 text-sm text-gray-400 max-w-2xl">
              View project details, deadlines, and the current approval status from a single client workspace.
            </p>
          </div>
          <Link
            to="/client/create-project"
            className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/20 hover:brightness-110 transition"
          >
            <FiFolder className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {projects.map((project) => (
            <div key={project._id} className="glass-card border border-white/10 rounded-3xl p-6 hover:-translate-y-1 hover:shadow-xl transition">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{project.title}</p>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{project.description}</p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] rounded-full bg-white/5 px-3 py-2 text-gray-300">
                  {project.status || "Open"}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-white/5 px-4 py-3 text-gray-300">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Category</p>
                  <p className="mt-2 text-sm text-white">{project.category || "General"}</p>
                </div>
                <div className="rounded-3xl bg-white/5 px-4 py-3 text-gray-300">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Budget</p>
                  <p className="mt-2 text-sm text-white">${project.budget}</p>
                </div>
                <div className="rounded-3xl bg-white/5 px-4 py-3 text-gray-300">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Deadline</p>
                  <p className="mt-2 text-sm text-white">{project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
                <div className="inline-flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  <span>{project.visibility || "Public"}</span>
                </div>
                <Link
                  to={`/client/create-project?edit=${project._id}`}
                  className="text-sm font-semibold text-[#6366F1] hover:text-[#3B82F6] transition flex items-center gap-2"
                >
                  <span>Manage</span>
                  <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="You have no active projects"
          description="Create a new project and start collecting proposals from top freelancers."
          action={
            <Link
              to="/client/create-project"
              className="rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-6 py-3 text-sm font-semibold text-white"
            >
              Add your first project
            </Link>
          }
        />
      )}
    </div>
  );
};

export default MyProject;
