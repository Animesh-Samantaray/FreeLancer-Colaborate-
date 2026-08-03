import { FiBell, FiSearch, FiMenu } from "react-icons/fi";

const Navbar = ({ onMenuClick, onSearch, searchValue, onSearchChange, user }) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/10 backdrop-blur-xl px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-2xl border border-white/10 bg-white/5 p-2 text-gray-300 hover:bg-white/10"
        >
          <FiMenu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-2">
          <FiSearch className="text-gray-400" />
          <input
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search projects or teams"
            className="bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-2xl border border-white/10 bg-white/5 p-3 text-gray-300 hover:bg-white/10">
          <FiBell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#6366F1] ring-2 ring-black" />
        </button>
        <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#3B82F6] flex items-center justify-center text-xs font-bold text-white">
            {user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "US"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">{user?.fullName || "Freelancer"}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
