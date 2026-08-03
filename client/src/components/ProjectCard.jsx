import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiClock, FiDollarSign } from "react-icons/fi";

const ProjectCard = ({ project, role = "freelancer" }) => {
  if (!project) return null;

  return (
    <div className="glass-card rounded-3xl border border-white/10 p-6 hover:border-white/20 hover:-translate-y-1 transition duration-300 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#6366F1] bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {project.category || "General"}
          </span>
          <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-300">
            {project.status || "Open"}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white font-display line-clamp-1">{project.title}</h3>
        <p className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed">{project.description}</p>

        {project.requiredSkills && project.requiredSkills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.requiredSkills.slice(0, 4).map((skill, idx) => (
              <span key={idx} className="rounded-full bg-white/5 border border-white/5 px-2.5 py-0.5 text-[10px] text-gray-300 font-medium">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-white/5 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-white font-semibold">
            <FiDollarSign className="text-[#22C55E]" />
            <span>${project.budget}</span>
          </div>
          {project.deadline && (
            <div className="flex items-center gap-1 text-gray-400">
              <FiClock />
              <span>{new Date(project.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <Link
          to={role === "client" ? "/client/my-projects" : `/freelancer/project/${project._id}`}
          className="text-xs font-semibold text-[#6366F1] hover:text-[#3B82F6] transition flex items-center gap-1"
        >
          <span>View</span>
          <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
