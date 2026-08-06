import { useEffect, useState } from "react";
import { FiSearch, FiTrash2, FiFolder, FiDollarSign, FiCheckSquare } from "react-icons/fi";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import Modal from "../../components/Modal";
import MilestonesSection from "../../components/MilestonesSection";

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [milestonesModalOpen, setMilestonesModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get("/project");
      setProjects(response.data.projects || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async () => {
    if (!deleteTargetId) return;
    try {
      const response = await api.delete(`/project/${deleteTargetId}`);
      if (response.data.success) {
        toast.success("Project removed successfully.");
        setProjects((prev) => prev.filter((p) => p._id !== deleteTargetId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTargetId(null);
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.title?.toLowerCase().includes(query) ||
      project.category?.toLowerCase().includes(query) ||
      project.client?.fullName?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <LoadingSpinner label="Fetching platform projects..." />;
  }

  if (error) {
    return <EmptyState title="Error loading projects" description={error} />;
  }

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Remove Project?"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteProject}
        onCancel={() => setDeleteTargetId(null)}
      />

      <div className="glass-card rounded-3xl border border-white/10 p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#6366F1]">Project Management</p>
            <h1 className="mt-3 text-3xl font-bold text-white font-display">Admin project directory</h1>
            <p className="mt-2 text-sm text-gray-400 max-w-2xl leading-relaxed">
              Review published projects across all client accounts and moderate inappropriate listings.
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-3 text-xs font-semibold text-gray-300">
            Total Projects: <span className="text-white font-bold ml-1">{projects.length}</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl border border-white/10 p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, owner, category..."
              className="glass-input w-full rounded-3xl border border-white/10 bg-transparent px-11 py-3 text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">{filteredProjects.length} matching records</span>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="overflow-x-auto rounded-3xl border border-white/10">
            <table className="min-w-full text-left text-sm text-gray-200">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-[0.25em] text-gray-400 bg-white/5">
                <tr>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Owner</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Budget</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-white/5 transition">
                    <td className="px-5 py-4 font-semibold text-white max-w-xs truncate">{project.title}</td>
                    <td className="px-5 py-4 text-gray-300">
                      {project.client?.fullName || "Client User"}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{project.category || "General"}</td>
                    <td className="px-5 py-4 font-medium text-white">${project.budget}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-300">
                        {project.status || "Open"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setActiveProject(project);
                            setMilestonesModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 transition"
                        >
                          <FiCheckSquare className="w-3.5 h-3.5" /> Milestones
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(project._id)}
                          className="inline-flex items-center gap-1.5 rounded-2xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No projects found"
            description="There are currently no projects matching your search filter."
          />
        )}
      </div>

      {/* Admin Milestones Modal */}
      <Modal
        isOpen={milestonesModalOpen}
        onClose={() => setMilestonesModalOpen(false)}
        title={`Manage Milestones - "${activeProject?.title || "Project"}"`}
        maxWidth="max-w-4xl"
      >
        {activeProject && (
          <MilestonesSection
            projectId={activeProject._id}
            project={activeProject}
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminProjects;
