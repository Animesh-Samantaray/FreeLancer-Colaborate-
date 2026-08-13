import { useEffect, useState } from "react";
import {
  FiUsers,
  FiMail,
  FiPhone,
  FiCalendar,
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiLock,
  FiGlobe,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import {
  getAllUsersApi,
  getUserByIdApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from "../../api/apiServices";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Active / Selected User states
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "freelancer",
  });

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    role: "freelancer",
    avatar: "",
  });

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsersApi();
      if (data?.success) {
        setUsers(data.users || []);
      } else {
        setUsers(data?.users || []);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(err?.response?.data?.message || "Failed to load user directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query and role filter
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    if (!matchesRole) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.role?.toLowerCase().includes(query)
    );
  });

  // ------------------- VIEW USER DETAILS -------------------
  const handleOpenView = async (user) => {
    setSelectedUser(user);
    setIsViewOpen(true);
    setViewLoading(true);
    try {
      const res = await getUserByIdApi(user._id);
      if (res?.success) {
        setViewDetails(res.user);
      } else {
        setViewDetails(user);
      }
    } catch (err) {
      console.error("Fetch user by id error:", err);
      setViewDetails(user);
    } finally {
      setViewLoading(false);
    }
  };

  // ------------------- CREATE USER -------------------
  const handleOpenCreate = () => {
    setCreateForm({
      fullName: "",
      email: "",
      password: "",
      role: "freelancer",
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.fullName.trim() || !createForm.email.trim() || !createForm.password || !createForm.role) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createUserApi({
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      });

      if (res?.success) {
        toast.success(res.message || "User created successfully.");
        setIsCreateOpen(false);
        setCreateForm({ fullName: "", email: "", password: "", role: "freelancer" });
        await fetchUsers();
      }
    } catch (err) {
      console.error("Create user error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------- EDIT USER -------------------
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || "",
      email: user.email || "",
      role: user.role || "freelancer",
      avatar: user.avatar || "",
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser?._id) return;
    if (!editForm.fullName.trim() || !editForm.email.trim() || !editForm.role) {
      toast.error("Full name, email, and role are required.");
      return;
    }

    try {
      setSubmitting(true);
      // Strictly pass accepted update fields only
      const payload = {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
      };
      if (editForm.avatar.trim()) {
        payload.avatar = editForm.avatar.trim();
      }

      const res = await updateUserApi(selectedUser._id, payload);

      if (res?.success) {
        toast.success(res.message || "User updated successfully.");
        setIsEditOpen(false);
        setSelectedUser(null);
        await fetchUsers();
      }
    } catch (err) {
      console.error("Update user error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------- DELETE USER -------------------
  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser?._id) return;
    try {
      setDeleting(true);
      const res = await deleteUserApi(selectedUser._id);
      if (res?.success) {
        toast.success(res.message || "User deleted successfully.");
        setIsDeleteOpen(false);
        setSelectedUser(null);
        await fetchUsers();
      }
    } catch (err) {
      console.error("Delete user error:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Fetching user directory..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <EmptyState title="Unable to load users" description={error} />
        <div className="flex justify-center">
          <Button onClick={fetchUsers} variant="primary">
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  const clientCount = users.filter((u) => u.role === "client").length;
  const freelancerCount = users.filter((u) => u.role === "freelancer").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl border border-white/10 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-semibold text-[#6366F1]">
              <FiShield className="w-4 h-4" /> Admin Console
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white font-display">
              User Management
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Manage system accounts, inspect user profiles, grant or revoke role privileges, and create platform users.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleOpenCreate} icon={<FiPlus />}>
              Add New User
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/5 pt-6">
          <div className="rounded-2xl bg-white/5 border border-white/5 p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-[#6366F1] flex items-center justify-center font-bold">
              <FiUsers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Total</p>
              <p className="text-lg font-bold text-white font-display">{users.length}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/5 p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              <FiUser className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Clients</p>
              <p className="text-lg font-bold text-white font-display">{clientCount}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/5 p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center font-bold">
              <FiUsers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Freelancers</p>
              <p className="text-lg font-bold text-white font-display">{freelancerCount}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/5 p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
              <FiShield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Admins</p>
              <p className="text-lg font-bold text-white font-display">{adminCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Role Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Users" },
            { id: "client", label: "Clients" },
            { id: "freelancer", label: "Freelancers" },
            { id: "admin", label: "Admins" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`rounded-2xl px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                roleFilter === tab.id
                  ? "bg-gradient-to-r from-[#6366F1] to-[#3B82F6] text-white shadow-md shadow-indigo-500/20"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, role..."
            className="glass-input w-full rounded-2xl border border-white/10 bg-transparent px-11 py-2.5 text-xs sm:text-sm text-white outline-none placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Users Table / Grid */}
      {filteredUsers.length > 0 ? (
        <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-gray-300">
              <thead className="bg-white/5 text-[11px] uppercase font-semibold tracking-wider text-gray-400 border-b border-white/10">
                <tr>
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Contact / Status</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.fullName}
                            className="w-10 h-10 rounded-2xl object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center font-bold text-white text-sm shadow-md">
                            {u.fullName?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white font-display text-sm">
                            {u.fullName}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <FiMail className="w-3 h-3 text-gray-500" />
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-wider ${
                          u.role === "admin"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : u.role === "client"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-green-500/10 text-green-400 border border-green-500/20"
                        }`}
                      >
                        {u.role === "admin" && <FiShield className="w-3 h-3" />}
                        {u.role === "client" && <FiUser className="w-3 h-3" />}
                        {u.role === "freelancer" && <FiUser className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {u.phone ? (
                          <p className="text-xs text-gray-300 flex items-center gap-1.5">
                            <FiPhone className="w-3 h-3 text-[#6366F1]" />
                            {u.phone}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">No phone provided</p>
                        )}

                        <div className="flex items-center gap-2">
                          {u.status && (
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${
                                u.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {u.status}
                            </span>
                          )}
                          {u.isVerified !== undefined && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              {u.isVerified ? (
                                <FiCheckCircle className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <FiXCircle className="w-3 h-3 text-gray-500" />
                              )}
                              {u.isVerified ? "Verified" : "Unverified"}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <p className="text-xs text-gray-300 flex items-center gap-1.5">
                        <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => handleOpenView(u)}
                          className="rounded-xl bg-white/5 border border-white/10 p-2 text-gray-300 hover:text-white hover:bg-white/10 transition"
                          title="View Details"
                          aria-label={`View ${u.fullName}`}
                        >
                          <FiEye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-2 text-indigo-400 hover:bg-indigo-500/20 transition"
                          title="Edit User"
                          aria-label={`Edit ${u.fullName}`}
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleOpenDelete(u)}
                          className="rounded-xl bg-red-500/10 border border-red-500/20 p-2 text-red-400 hover:bg-red-500/20 transition"
                          title="Delete User"
                          aria-label={`Delete ${u.fullName}`}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No users found"
          description={
            searchQuery || roleFilter !== "all"
              ? "No registered accounts match your selected filter criteria."
              : "There are currently no users registered in the system."
          }
        />
      )}

      {/* ================= USER DETAILS MODAL ================= */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedUser(null);
          setViewDetails(null);
        }}
        title="User Account Details"
        maxWidth="max-w-xl"
      >
        {viewLoading ? (
          <LoadingSpinner label="Loading user details..." />
        ) : viewDetails ? (
          <div className="space-y-6">
            {/* Header profile info */}
            <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
              {viewDetails.avatar ? (
                <img
                  src={viewDetails.avatar}
                  alt={viewDetails.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center font-bold text-white text-2xl shadow-md">
                  {viewDetails.fullName?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  {viewDetails.fullName}
                </h3>
                <p className="text-xs text-gray-400">{viewDetails.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      viewDetails.role === "admin"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : viewDetails.role === "client"
                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        : "bg-green-500/10 text-green-400 border border-green-500/20"
                    }`}
                  >
                    {viewDetails.role}
                  </span>
                  {viewDetails.status && (
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-gray-300 capitalize">
                      {viewDetails.status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-1">
                <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">
                  Full Name
                </span>
                <p className="text-white font-medium">{viewDetails.fullName}</p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-1">
                <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">
                  Email Address
                </span>
                <p className="text-white font-medium">{viewDetails.email}</p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-1">
                <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">
                  Role
                </span>
                <p className="text-white font-medium capitalize">{viewDetails.role}</p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-1">
                <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">
                  Phone Number
                </span>
                <p className="text-white font-medium">
                  {viewDetails.phone || "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-1">
                <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">
                  Auth Provider
                </span>
                <p className="text-white font-medium capitalize">
                  {viewDetails.authProvider || "Local"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-1">
                <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">
                  Email Verified
                </span>
                <p className="text-white font-medium flex items-center gap-1.5">
                  {viewDetails.isVerified ? (
                    <>
                      <FiCheckCircle className="text-emerald-400 w-4 h-4" /> Yes
                    </>
                  ) : (
                    <>
                      <FiXCircle className="text-amber-400 w-4 h-4" /> No
                    </>
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-1">
                <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">
                  Joined Date
                </span>
                <p className="text-white font-medium">
                  {viewDetails.createdAt
                    ? new Date(viewDetails.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-1">
                <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">
                  User ID
                </span>
                <p className="text-gray-400 font-mono text-[11px] truncate">
                  {viewDetails._id}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsViewOpen(false);
                  setSelectedUser(null);
                  setViewDetails(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ================= CREATE USER MODAL ================= */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => !submitting && setIsCreateOpen(false)}
        title="Create New User Account"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-5">
          <Input
            label="Full Name *"
            icon={<FiUser />}
            placeholder="e.g. Jane Doe"
            value={createForm.fullName}
            onChange={(e) =>
              setCreateForm({ ...createForm, fullName: e.target.value })
            }
            required
          />

          <Input
            label="Email Address *"
            type="email"
            icon={<FiMail />}
            placeholder="e.g. jane@example.com"
            value={createForm.email}
            onChange={(e) =>
              setCreateForm({ ...createForm, email: e.target.value })
            }
            required
          />

          <Input
            label="Password *"
            type="password"
            icon={<FiLock />}
            placeholder="At least 6 characters"
            value={createForm.password}
            onChange={(e) =>
              setCreateForm({ ...createForm, password: e.target.value })
            }
            required
          />

          <Input
            label="User Role *"
            type="select"
            icon={<FiShield />}
            value={createForm.role}
            onChange={(e) =>
              setCreateForm({ ...createForm, role: e.target.value })
            }
            options={[
              { label: "Freelancer", value: "freelancer" },
              { label: "Client", value: "client" },
              { label: "Admin", value: "admin" },
            ]}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting} icon={<FiPlus />}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= EDIT USER MODAL ================= */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => !submitting && setIsEditOpen(false)}
        title={`Edit User: ${selectedUser?.fullName || ""}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-5">
          <Input
            label="Full Name *"
            icon={<FiUser />}
            placeholder="Full Name"
            value={editForm.fullName}
            onChange={(e) =>
              setEditForm({ ...editForm, fullName: e.target.value })
            }
            required
          />

          <Input
            label="Email Address *"
            type="email"
            icon={<FiMail />}
            placeholder="Email Address"
            value={editForm.email}
            onChange={(e) =>
              setEditForm({ ...editForm, email: e.target.value })
            }
            required
          />

          <Input
            label="User Role *"
            type="select"
            icon={<FiShield />}
            value={editForm.role}
            onChange={(e) =>
              setEditForm({ ...editForm, role: e.target.value })
            }
            options={[
              { label: "Freelancer", value: "freelancer" },
              { label: "Client", value: "client" },
              { label: "Admin", value: "admin" },
            ]}
            required
          />

          <Input
            label="Avatar Image URL (Optional)"
            icon={<FiGlobe />}
            placeholder="https://example.com/avatar.jpg"
            value={editForm.avatar}
            onChange={(e) =>
              setEditForm({ ...editForm, avatar: e.target.value })
            }
          />

          <p className="text-[11px] text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5">
            Note: Passwords and system fields are excluded from this editor for security compliance.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= DELETE USER CONFIRM DIALOG ================= */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete User Account"
        message={
          selectedUser
            ? `Are you sure you want to delete the user account for "${selectedUser.fullName}" (${selectedUser.email})? This action cannot be undone.`
            : "Are you sure you want to delete this user?"
        }
        confirmLabel={deleting ? "Deleting..." : "Delete User"}
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setIsDeleteOpen(false)}
      />
    </div>
  );
};

export default Users;
