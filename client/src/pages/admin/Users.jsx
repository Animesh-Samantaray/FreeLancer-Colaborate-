import { useEffect, useState } from "react";
import { FiShield, FiMail, FiPhone, FiCalendar, FiSearch } from "react-icons/fi";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/auth/users");
        setUsers(response.data.users || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load user directory.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.role?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <LoadingSpinner label="Fetching platform users..." />;
  }

  if (error) {
    return <EmptyState title="Unable to load users" description={error} />;
  }

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-3xl border border-white/10 p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#6366F1]">User Directory</p>
            <h1 className="mt-3 text-3xl font-bold text-white font-display">Platform users</h1>
            <p className="mt-2 text-sm text-gray-400 max-w-2xl leading-relaxed">
              Review and manage registered accounts across Client, Freelancer, and Admin roles.
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, role..."
              className="glass-input w-full rounded-3xl border border-white/10 bg-transparent px-11 py-3 text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((u) => (
            <div key={u._id} className="glass-card rounded-3xl border border-white/10 p-6 hover:border-white/20 hover:-translate-y-1 transition duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center font-bold text-white text-base shadow-md">
                    {u.fullName?.[0] || "U"}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white font-display">{u.fullName}</h2>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-[0.2em] ${
                  u.role === "admin" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                  u.role === "client" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                  "bg-green-500/10 text-green-400 border border-green-500/20"
                }`}>
                  {u.role}
                </span>
              </div>

              <div className="mt-6 border-t border-white/5 pt-4 space-y-2 text-xs text-gray-300">
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-400 flex items-center gap-2">
                    <FiPhone className="text-[#6366F1]" /> Phone
                  </span>
                  <span className="font-medium text-white">{u.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-400 flex items-center gap-2">
                    <FiCalendar className="text-[#3B82F6]" /> Joined
                  </span>
                  <span className="font-medium text-white">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active Member"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-400 flex items-center gap-2">
                    <FiShield className="text-[#22C55E]" /> Auth Type
                  </span>
                  <span className="font-medium text-white capitalize">{u.authProvider || "Local"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No users found"
          description="There are currently no registered users matching your search term."
        />
      )}
    </div>
  );
};

export default Users;
