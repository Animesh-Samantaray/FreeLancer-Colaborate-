import { NavLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

const Sidebar = ({ user, items, isOpen, onClose, onLogout }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-[#0F172A]/95 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
      <div className="flex h-full flex-col justify-between px-5 py-6">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-3xl bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center shadow-xl shadow-indigo-500/15">
              <span className="font-bold text-white text-lg">F</span>
            </div>
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-[0.25em]">Freelancer</p>
              <h1 className="text-white text-xl font-semibold">Collaborate</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-[#6366F1]/20 to-[#3B82F6]/15 text-white ring-1 ring-[#6366F1]/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400">Signed in as</p>
            <p className="mt-2 text-white font-semibold">{user?.fullName || "Workspace User"}</p>
            <p className="text-[11px] text-gray-500 mt-1 capitalize">{user?.role || "Member"}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition"
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
