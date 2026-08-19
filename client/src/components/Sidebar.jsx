import { NavLink } from "react-router-dom";
import { FiLogOut, FiChevronLeft } from "react-icons/fi";
import { useProfile } from "../context/ProfileContext";

const Sidebar = ({ user, items, isOpen, onClose, onLogout }) => {
  const { profileCompleted } = useProfile();

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-[#0F172A]/95 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col px-5 py-6 overflow-hidden">
          <div className="shrink-0 flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-3xl bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center shadow-xl shadow-indigo-500/15">
                <span className="font-bold text-white text-lg">F</span>
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-[0.25em]">Freelancer</p>
                <h1 className="text-white text-xl font-semibold">Collaborate</h1>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 p-2 text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Collapse Sidebar"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto space-y-2 pr-1">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center justify-between gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-[#6366F1]/20 to-[#3B82F6]/15 text-white ring-1 ring-[#6366F1]/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <div className="flex items-center gap-3 truncate">
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {user?.role === "freelancer" && item.path === "/freelancer/profile" && profileCompleted === false && (
                  <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                    Required
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Footer - Fixed Pinned */}
          <div className="shrink-0 pt-4 mt-4 border-t border-white/10 space-y-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-3.5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Signed in as</p>
              <p className="mt-1 text-sm text-white font-semibold truncate">{user?.fullName || "Workspace User"}</p>
              <p className="text-[11px] text-gray-500 capitalize">{user?.role || "Member"}</p>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition cursor-pointer"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
