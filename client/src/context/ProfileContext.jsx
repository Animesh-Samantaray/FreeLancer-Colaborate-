import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "../api/axios";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!user || !role) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let res;
      if (role === "client") {
        res = await api.get("/client/profile");
        if (res.data?.success && res.data?.profile) {
          setProfile(res.data.profile);
        }
      } else if (role === "freelancer") {
        res = await api.get("/freelancer/profile");
        if (res.data?.success && res.data?.freelancer) {
          setProfile(res.data.freelancer);
        }
      }
    } catch (err) {
      console.error("Fetch profile statistics error:", err);
      const msg = err.response?.data?.message || "Failed to load latest profile statistics.";
      setError(msg);
      // Keep previous profile data if available per error handling requirements
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        refetchProfile: fetchProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
