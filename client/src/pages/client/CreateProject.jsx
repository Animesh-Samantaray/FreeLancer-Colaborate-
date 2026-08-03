import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiClipboard, FiDollarSign, FiTag, FiEye, FiShield } from "react-icons/fi";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";

const categories = ["UI/UX Design", "Web Development", "Mobile App", "Marketing", "AI / ML"];
const visibilityOptions = ["Public", "Private"];

function CreateProject() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get("edit");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: categories[0],
    requiredSkills: "",
    budget: "",
    role: "client",
    deadline: "",
    visibility: visibilityOptions[0],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/project/${projectId}`);
          if (response.data.success) {
            const project = response.data.project;
            setFormData({
              title: project.title || "",
              description: project.description || "",
              category: project.category || categories[0],
              requiredSkills: project.requiredSkills ? project.requiredSkills.join(", ") : "",
              budget: project.budget || "",
              deadline: project.deadline ? new Date(project.deadline).toISOString().split("T")[0] : "",
              visibility: project.visibility || visibilityOptions[0],
              role: "client",
            });
          }
        } catch (err) {
          toast.error("Failed to load project details.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [projectId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.title.trim()) return toast.error("Project title is required.");
    if (!formData.description.trim()) return toast.error("Project description is required.");
    if (!formData.budget || Number(formData.budget) <= 0) return toast.error("Provide a valid budget.");
    if (!formData.deadline) return toast.error("Project deadline is required.");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(",").map((skill) => skill.trim()).filter(Boolean),
      };

      let response;
      if (projectId) {
        response = await api.put(`/project/${projectId}`, payload);
      } else {
        response = await api.post("/project", payload);
      }

      if (response.data.success) {
        toast.success(projectId ? "Project updated successfully." : "Project created successfully.");
        if (projectId) {
          navigate("/client/my-projects");
        } else {
          setFormData({
            title: "",
            description: "",
            category: categories[0],
            requiredSkills: "",
            budget: "",
            deadline: "",
            visibility: visibilityOptions[0],
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card border border-white/10 rounded-3xl p-8 shadow-2xl shadow-[#09090B]/40">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#6366F1]">{projectId ? "Edit Project" : "New Project"}</p>
          <h1 className="mt-3 text-3xl font-bold text-white">{projectId ? "Update your project brief" : "Create a premium project brief"}</h1>
          <p className="mt-2 text-sm text-gray-400 max-w-2xl">
            {projectId ? "Modify your project's description, skills, budget or other terms below." : "Fill in the project details and publish to start receiving proposals from qualified freelancers."}
          </p>
        </div>
        <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-gray-300">
          <span className="font-semibold text-white">Tip</span>
          <p className="mt-1 text-xs text-gray-400">Add clear skills and deadlines for faster responses.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-6 lg:grid-cols-2">
        <label className="block text-sm text-gray-300">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-gray-400">Project Title</span>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Build a sleek landing page"
            className="glass-input w-full rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none"
          />
        </label>

        <label className="block text-sm text-gray-300">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-gray-400">Category</span>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="glass-input w-full rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none"
          >
            {categories.map((option) => (
              <option key={option} value={option} className="bg-[#0A0A0F] text-white">
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-gray-300 lg:col-span-2">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-gray-400">Project Description</span>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Describe your needs, deliverables, and expectations"
            className="glass-input w-full rounded-3xl border border-white/10 bg-transparent px-4 py-4 text-sm text-white outline-none resize-none"
          />
        </label>

        <label className="block text-sm text-gray-300">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-gray-400">Required Skills</span>
          <input
            name="requiredSkills"
            value={formData.requiredSkills}
            onChange={handleChange}
            placeholder="React, Figma, Tailwind"
            className="glass-input w-full rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none"
          />
        </label>

        <label className="block text-sm text-gray-300">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-gray-400">Budget</span>
          <div className="relative">
            <FiDollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              placeholder="2500"
              className="glass-input w-full rounded-3xl border border-white/10 bg-transparent px-4 py-3 pl-11 text-sm text-white outline-none"
            />
          </div>
        </label>

        <label className="block text-sm text-gray-300">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-gray-400">Deadline</span>
          <input
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            className="glass-input w-full rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none"
          />
        </label>

        <label className="block text-sm text-gray-300">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-gray-400">Visibility</span>
          <select
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
            className="glass-input w-full rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none"
          >
            {visibilityOptions.map((option) => (
              <option key={option} value={option} className="bg-[#0A0A0F] text-white">
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-white/5 p-5 border border-white/10">
            <div className="flex items-center gap-3 text-[#6366F1] mb-3">
              <FiClipboard className="w-5 h-5" />
              <span className="text-sm font-semibold">Project Brief</span>
            </div>
            <p className="text-sm text-gray-400">Deliver a concise overview so freelancers can scope your request fast.</p>
          </div>
          <div className="rounded-3xl bg-white/5 p-5 border border-white/10">
            <div className="flex items-center gap-3 text-[#3B82F6] mb-3">
              <FiShield className="w-5 h-5" />
              <span className="text-sm font-semibold">Secure Collaboration</span>
            </div>
            <p className="text-sm text-gray-400">Use private visibility to keep sensitive projects invite-only.</p>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-400">Note: Use commas to separate skills for better matching.</div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/20 transition hover:brightness-110 disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (projectId ? "Saving Changes..." : "Publishing Project...") : (projectId ? "Save Changes" : "Publish Project")}
          </button>
        </div>
      </form>

      {loading && (
        <div className="mt-6">
          <LoadingSpinner label={projectId ? "Saving changes..." : "Submitting project..."} />
        </div>
      )}
    </div>
  );
}

export default CreateProject;
