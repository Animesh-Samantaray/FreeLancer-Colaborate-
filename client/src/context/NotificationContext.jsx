import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { toast } from "react-hot-toast";
import {
  initSocket,
  getSocket,
  disconnectSocket,
  joinUserRoom,
} from "../services/socketService";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(
    localStorage.getItem("notificationSoundEnabled") !== "false"
  );
  const [browserPermission, setBrowserPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [activeConversationId, setActiveConversationId] = useState(null);

  const activeConversationIdRef = useRef(activeConversationId);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Request browser notification permission
  const requestBrowserPermission = async () => {
    if (typeof Notification === "undefined") return "denied";
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      return permission;
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      return "default";
    }
  };

  // Play dual-tone chirp sound
  const playSound = useCallback(() => {
    if (!notificationSoundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const now = audioContext.currentTime;

      // Tone 1: D5
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Tone 2: A5
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.08);
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.3);
    } catch (err) {
      console.warn("Audio chirp playback failed (autoplay restrictions):", err.message);
    }
  }, [notificationSoundEnabled]);

  // Toggle sound preference
  const toggleSound = () => {
    const val = !notificationSoundEnabled;
    setNotificationSoundEnabled(val);
    localStorage.setItem("notificationSoundEnabled", val ? "true" : "false");
    toast.success(val ? "Notification sounds enabled" : "Notification sounds muted");
  };

  // Route navigation when clicking a notification
  const handleNotificationClick = useCallback((notif) => {
    const userRole = user?.role;
    let path = "/dashboard";

    switch (notif.type) {
      case "PROJECT_CREATED":
      case "PROJECT_APPROVED":
      case "PROJECT_REJECTED":
        path = userRole === "client" ? "/client/my-projects" : `/freelancer/project/${notif.projectId}`;
        break;
      case "PROPOSAL_SUBMITTED":
        path = "/client/my-projects";
        break;
      case "PROPOSAL_ACCEPTED":
        path = userRole === "freelancer" ? "/freelancer/my-proposals" : "/client/my-projects";
        break;
      case "PROPOSAL_REJECTED":
        path = "/freelancer/my-proposals";
        break;
      case "INVITATION_RECEIVED":
        path = "/freelancer/my-invitations";
        break;
      case "INVITATION_ACCEPTED":
      case "INVITATION_REJECTED":
        path = "/client/my-projects";
        break;
      case "MILESTONE_CREATED":
      case "MILESTONE_UPDATED":
      case "MILESTONE_COMPLETED":
      case "TASK_ASSIGNED":
      case "TASK_UPDATED":
      case "TASK_COMPLETED":
        path = "/tasks";
        break;
      case "MESSAGE_RECEIVED":
      case "FILE_RECEIVED":
        path = notif.projectId ? `/messages/${notif.projectId}` : "/messages";
        break;
      case "ACHIEVEMENT_UNLOCKED":
        path = userRole === "client" ? "/client/profile" : "/freelancer/profile";
        break;
      default:
        path = "/dashboard";
    }

    navigate(path);
  }, [user, navigate]);

  const handleIncomingNotification = useCallback((notif) => {
    if (!notif) return;

    if (notif.type === "ACHIEVEMENT_UNLOCKED") {
      window.dispatchEvent(new CustomEvent("achievement_unlocked", { detail: notif }));
    }

    const isCurrentChatSession =
      (notif.type === "MESSAGE_RECEIVED" || notif.type === "FILE_RECEIVED") &&
      notif.conversationId &&
      notif.conversationId === activeConversationIdRef.current;


    if (isCurrentChatSession) {
      return;
    }

    // Play chime sound
    playSound();

    // Show in-app Toast notification
    toast((t) => (
      <div
        className="flex flex-col gap-1 cursor-pointer w-full text-left"
        onClick={() => {
          handleNotificationClick(notif);
          toast.dismiss(t.id);
        }}
      >
        <span className="font-semibold text-white text-xs flex items-center gap-1.5">
          🔔 {notif.title}
        </span>
        <span className="text-gray-300 text-[11px] line-clamp-2">{notif.message}</span>
      </div>
    ), {
      duration: 5000,
    });

    // Show native browser notification if permission is granted
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      try {
        const browserNotif = new Notification(notif.title, {
          body: notif.message,
          icon: "/favicon.ico",
        });

        browserNotif.onclick = () => {
          window.focus();
          handleNotificationClick(notif);
          browserNotif.close();
        };
      } catch (err) {
        console.error("Failed to trigger browser notification:", err);
      }
    }
  }, [playSound, handleNotificationClick]);

  // Handle Socket.IO connection and rooms
  useEffect(() => {
    if (user) {
      const userId = user._id || user.id;
      initSocket();
      joinUserRoom(userId);

      const socket = getSocket();
      socket.on("notification", handleIncomingNotification);

      return () => {
        socket.off("notification", handleIncomingNotification);
      };
    } else {
      disconnectSocket();
    }
  }, [user, handleIncomingNotification]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount: 0, // Mocked to avoid breaking references in any other component
        notifications: [], // Mocked to avoid breaking references in any other component
        notificationSoundEnabled,
        browserPermission,
        toggleSound,
        requestBrowserPermission,
        setActiveConversationId,
        activeConversationId,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
