import { useEffect, useState } from "react";
import {
  FiSearch,
  FiMapPin,
  FiBriefcase,
  FiFolder,
  FiDollarSign,
  FiGlobe,
  FiStar,
  FiEye,
} from "react-icons/fi";
import api from "../../api/axios";
import GlassCard from "../../components/GlassCard";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import SkeletonLoader from "../../components/SkeletonLoader";
import AchievementsSection from "../../components/achievements/AchievementsSection";

function ClientDirectory() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const res = await api.get("/client");
        if (res.data?.clients) {
          setClients(res.data.clients);
        }
      } catch (err) {
        console.error("Error fetching clients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleViewDetails = async (id) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/client/${id}`);
      if (res.data?.client) {
        setSelectedClient(res.data.client);
      }
    } catch (err) {
      console.error("Error fetching client details", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const term = search.toLowerCase();
    const name = (c.companyName || c.user?.fullName || "").toLowerCase();
    const ind = (c.industry || "").toLowerCase();
    const loc = (c.location || "").toLowerCase();
    return name.includes(term) || ind.includes(term) || loc.includes(term);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Search & Header */}
      <div className="glass-card border border-white/10 p-8 rounded-3xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#6366F1]">
              Client Directory
            </span>
            <h1 className="text-3xl font-extrabold text-white font-display mt-1">
              Explore Companies & Employers
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Browse top verified clients hiring for tech, design, and creative projects.
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <Input
            icon={<FiSearch />}
            placeholder="Search by company name, industry, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <SkeletonLoader type="directory" />
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const logo =
              client.companyLogo ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTRN4lHm8tjxvp85npV2YpZzBw8moqQPMzsuJZI0Gj9w&s=10";
            const name = client.companyName || client.user?.fullName || "Unnamed Company";

            return (
              <GlassCard key={client._id} className="flex flex-col justify-between p-6">
                <div className="space-y-4">
                  {/* Top header */}
                  <div className="flex items-center gap-4">
                    <img
                      src={logo}
                      alt={name}
                      className="w-14 h-14 rounded-2xl object-cover border border-white/10 bg-[#09090B] shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTRN4lHm8tjxvp85npV2YpZzBw8moqQPMzsuJZI0Gj9w&s=10";
                      }}
                    />
                    <div className="overflow-hidden">
                      <h3 className="text-lg font-bold text-white line-clamp-1">{name}</h3>
                      <p className="text-xs text-[#6366F1] font-semibold flex items-center gap-1 mt-0.5">
                        <FiBriefcase className="w-3 h-3" />
                        {client.industry || "General Industry"}
                      </p>
                    </div>
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                    {client.companyDescription || "No description available for this company."}
                  </p>

                  {/* Info Badges */}
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-white/10">
                    <div className="flex items-center gap-2 text-gray-300">
                      <FiFolder className="text-[#3B82F6] w-4 h-4 shrink-0" />
                      <span>{client.totalProjects || 0} Projects</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300">
                      <FiDollarSign className="text-emerald-400 w-4 h-4 shrink-0" />
                      <span>${(client.totalSpent || 0).toLocaleString()} Spent</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400 col-span-2">
                      <FiMapPin className="text-gray-500 w-4 h-4 shrink-0" />
                      <span className="truncate">{client.location || "Remote / Various"}</span>
                    </div>
                  </div>
                </div>

                {/* View Details Action */}
                <div className="pt-5 mt-4 border-t border-white/10">
                  <Button
                    variant="secondary"
                    className="w-full"
                    icon={<FiEye />}
                    onClick={() => handleViewDetails(client._id)}
                  >
                    View Details
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center border border-white/10 rounded-3xl">
          <p className="text-base font-semibold text-gray-300">No clients matching your search.</p>
          <p className="text-xs text-gray-500 mt-1">Try refining your filter criteria.</p>
        </div>
      )}

      {/* Client Detail Modal */}
      <Modal
        isOpen={Boolean(selectedClient)}
        onClose={() => setSelectedClient(null)}
        title={selectedClient?.companyName || "Client Details"}
      >
        {selectedClient && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10">
              <img
                src={
                  selectedClient.companyLogo ||
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTRN4lHm8tjxvp85npV2YpZzBw8moqQPMzsuJZI0Gj9w&s=10"
                }
                alt={selectedClient.companyName}
                className="w-20 h-20 rounded-2xl object-cover border border-white/10 bg-[#09090B]"
              />
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-2xl font-bold text-white">{selectedClient.companyName}</h3>
                <p className="text-sm font-semibold text-[#6366F1]">{selectedClient.industry || "Client"}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-400">
                  {selectedClient.location && (
                    <span className="flex items-center gap-1">
                      <FiMapPin /> {selectedClient.location}
                    </span>
                  )}
                  {selectedClient.website && (
                    <a
                      href={selectedClient.website.startsWith("http") ? selectedClient.website : `https://${selectedClient.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#3B82F6] hover:underline"
                    >
                      <FiGlobe /> {selectedClient.website}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-xs text-gray-400">Total Projects</p>
                <p className="text-lg font-bold text-white mt-1">{selectedClient.totalProjects || 0}</p>
              </div>
              <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-xs text-gray-400">Active</p>
                <p className="text-lg font-bold text-white mt-1">{selectedClient.activeProjects || 0}</p>
              </div>
              <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-xs text-gray-400">Completed</p>
                <p className="text-lg font-bold text-white mt-1">{selectedClient.completedProjects || 0}</p>
              </div>
              <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-xs text-gray-400">Total Spent</p>
                <p className="text-lg font-bold text-white mt-1">
                  ${(selectedClient.totalSpent || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <AchievementsSection
              userId={
                selectedClient.user?._id ||
                selectedClient.user?.id ||
                selectedClient.user
              }
              isOwnProfile={false}
              title="Earned Badges"
            />

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white">Company Overview</h4>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {selectedClient.companyDescription || "No detailed description provided."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ClientDirectory;
