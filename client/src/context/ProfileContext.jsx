import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "../api/axios";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(true);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!user || !role) {
      setProfile(null);
      setLoading(false);
      setProfileCompleted(true);
      setCompletionLoading(false);
      setError(null);
      return;
    }

    try {
      if (!profile) setLoading(true);
      setError(null);

      if (role === "client") {
        setProfileCompleted(true);
        setCompletionLoading(false);
        const res = await api.get("/client/profile");
        if (res.data?.success && res.data?.profile) {
          setProfile(res.data.profile);
        }
      } else if (role === "freelancer") {
        setCompletionLoading(true);
        try {
          const compRes = await api.get("/freelancer/profile/completion");
          if (compRes.data?.success) {
            setProfileCompleted(Boolean(compRes.data.profileCompleted));
          }
        } catch (compErr) {
          console.error("Fetch profile completion error:", compErr);
        } finally {
          setCompletionLoading(false);
        }

        const res = await api.get("/freelancer/profile");
        if (res.data?.success && res.data?.freelancer) {
          setProfile(res.data.freelancer);
        }
      } else {
        setProfileCompleted(true);
        setCompletionLoading(false);
      }
    } catch (err) {
      console.error("Fetch profile statistics error:", err);
      const msg = err.response?.data?.message || "Failed to load latest profile statistics.";
      setError(msg);
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
        profileCompleted,
        completionLoading,
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
