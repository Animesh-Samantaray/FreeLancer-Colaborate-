import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import {
  getMyConversationsApi,
  getProjectConversationApi,
  createConversationApi,
  getConversationMessagesApi,
  sendMessageApi,
  deleteMessageApi,
  markMessageReadApi,
  reactToMessageApi,
} from "../api/apiServices";
import {
  initSocket,
  joinConversationRoom,
  leaveConversationRoom,
  subscribeToNewMessage,
  subscribeToMessageDeleted,
  subscribeToMessageRead,
  subscribeToMessageReaction,
} from "../services/socketService";
import ConversationList from "../components/chat/ConversationList";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageComposer from "../components/chat/MessageComposer";
import MediaGallery from "../components/chat/MediaGallery";
import FilePreviewModal from "../components/chat/FilePreviewModal";
import EmptyState from "../components/EmptyState";
import { toast } from "react-hot-toast";
import { FiMessageSquare } from "react-icons/fi";

const ProjectChatPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { setActiveConversationId } = useNotifications();
  const currentUserId = user?._id || user?.id;

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastMessagesMap, setLastMessagesMap] = useState({});
  const [unreadsMap, setUnreadsMap] = useState({});

  const [activeTab, setActiveTab] = useState("chat");
  const [activePreview, setActivePreview] = useState(null);
  const [isChatsListOpen, setIsChatsListOpen] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      initSocket();
    }
  }, [currentUserId]);

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const res = await getMyConversationsApi();
      const list = res.conversations || [];
      setConversations(list);

      const lastMap = {};
      const unreads = {};
      list.forEach((c) => {
        if (c.lastMessage) {
          lastMap[c._id] = c.lastMessage;
        }
      });
      setLastMessagesMap(lastMap);
      setUnreadsMap(unreads);

      return list;
    } catch (err) {
      console.error("Fetch conversations error:", err);
      toast.error("Failed to load project conversations.");
      return [];
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (loadingConversations) return;

    const selectTargetConversation = async () => {
      if (projectId) {
        let found = conversations.find(
          (c) => (c.project?._id || c.project) === projectId
        );

        if (!found) {
          try {
            const res = await getProjectConversationApi(projectId);
            if (res.conversation) {
              found = res.conversation;
              setConversations((prev) => [found, ...prev]);
            }
          } catch (err) {
            if (role === "client" || role === "admin") {
              try {
                const createRes = await createConversationApi(projectId);
                if (createRes.conversation) {
                  const fetchedRes = await getProjectConversationApi(projectId);
                  found = fetchedRes.conversation || createRes.conversation;
                  setConversations((prev) => [found, ...prev]);
                }
              } catch (createErr) {
                console.error("Create conversation error:", createErr);
              }
            }
          }
        }

        if (found) {
          setSelectedConversation(found);
        }
      } else if (conversations.length > 0 && !selectedConversation) {
        if (window.innerWidth >= 768) {
          setSelectedConversation(conversations[0]);
        }
      }
    };

    selectTargetConversation();
  }, [projectId, conversations, loadingConversations, role]);

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      setActiveTab("chat");
      return;
    }

    const conversationId = selectedConversation._id;

    joinConversationRoom(conversationId);
    setActiveConversationId(conversationId);

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await getConversationMessagesApi(conversationId);
        const fetchedMessages = res.messages || [];
        setMessages(fetchedMessages);

        if (fetchedMessages.length > 0) {
          const lastMsg = fetchedMessages[fetchedMessages.length - 1];
          setLastMessagesMap((prev) => ({ ...prev, [conversationId]: lastMsg }));
        }

        fetchedMessages.forEach((msg) => {
          const readArray = msg.readBy || [];
          if (!readArray.includes(currentUserId)) {
            markMessageReadApi(msg._id).catch(() => {});
          }
        });

        setUnreadsMap((prev) => ({ ...prev, [conversationId]: 0 }));

      } catch (err) {
        console.error("Fetch messages error:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    return () => {
      leaveConversationRoom(conversationId);
      setActiveConversationId(null);
    };
  }, [selectedConversation, currentUserId, setActiveConversationId]);

  useEffect(() => {
    const activeConvId = selectedConversation?._id;

    const unsubscribe = subscribeToNewMessage((newMsg) => {
      const convId = typeof newMsg.conversation === "object" ? newMsg.conversation._id : newMsg.conversation;

      setLastMessagesMap((prev) => ({ ...prev, [convId]: newMsg }));

      if (activeConvId && activeConvId === convId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });

        const senderId = typeof newMsg.sender === "object" ? newMsg.sender?._id || newMsg.sender?.id : newMsg.sender;
        if (senderId?.toString() !== currentUserId?.toString()) {
          markMessageReadApi(newMsg._id).catch(() => {});
        }
      } else {
        setUnreadsMap((prev) => ({
          ...prev,
          [convId]: (prev[convId] || 0) + 1,
        }));
      }
    });

    return unsubscribe;
  }, [selectedConversation?._id, currentUserId]);

  useEffect(() => {
    const unsubscribe = subscribeToMessageDeleted(({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToMessageRead(({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === messageId) {
            const existingRead = msg.readBy || [];
            if (!existingRead.includes(userId)) {
              return { ...msg, readBy: [...existingRead, userId] };
            }
          }
          return msg;
        })
      );
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToMessageReaction(({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === messageId) {
            return { ...msg, reactions };
          }
          return msg;
        })
      );
    });
    return unsubscribe;
  }, []);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setActiveTab("chat");
    if (conv.project?._id) {
      navigate(`/messages/${conv.project._id}`);
    }
  };

  const handleSendMessage = async (text, file, onProgress) => {
    if (!selectedConversation || sending) return;

    try {
      setSending(true);
      let payload;

      if (file) {
        payload = new FormData();
        payload.append("file", file);
        if (text && text.trim()) {
          payload.append("message", text.trim());
        }
      } else {
        payload = text;
      }

      const res = await sendMessageApi(selectedConversation._id, payload, (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      });

      if (res.success && res.data) {
        const sentMsg = res.data;
        setMessages((prev) => {
          if (prev.some((m) => m._id === sentMsg._id)) return prev;
          return [...prev, sentMsg];
        });
        setLastMessagesMap((prev) => ({
          ...prev,
          [selectedConversation._id]: sentMsg,
        }));
      }
    } catch (err) {
      console.error("Send message error:", err);
      toast.error(err.response?.data?.message || "Failed to send message.");
      throw err;
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessageApi(messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      toast.success("Message deleted");
    } catch (err) {
      console.error("Delete message error:", err);
      toast.error("Failed to delete message.");
    }
  };

  const handleReactToMessage = async (messageId, emoji) => {
    try {
      const res = await reactToMessageApi(messageId, emoji);
      if (res.success && res.data) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg._id === messageId) {
              return { ...msg, reactions: res.data };
            }
            return msg;
          })
        );
      }
    } catch (err) {
      console.error("React to message error:", err);
      toast.error(err.response?.data?.message || "Failed to update reaction.");
    }
  };

  const handleOpenPreview = (attachment, senderName, createdAt, index = 0, list = []) => {
    setActivePreview({
      attachment,
      senderName,
      createdAt,
      index,
      list,
    });
  };

  const handleNextPreview = () => {
    if (!activePreview || !activePreview.list || activePreview.list.length === 0) return;
    const nextIdx = activePreview.index + 1;
    if (nextIdx < activePreview.list.length) {
      const item = activePreview.list[nextIdx];
      setActivePreview({
        ...activePreview,
        attachment: item.attachment,
        senderName: item.senderName,
        createdAt: item.createdAt,
        index: nextIdx,
      });
    }
  };

  const handlePrevPreview = () => {
    if (!activePreview || !activePreview.list || activePreview.list.length === 0) return;
    const prevIdx = activePreview.index - 1;
    if (prevIdx >= 0) {
      const item = activePreview.list[prevIdx];
      setActivePreview({
        ...activePreview,
        attachment: item.attachment,
        senderName: item.senderName,
        createdAt: item.createdAt,
        index: prevIdx,
      });
    }
  };

  const handleJumpToMessage = (messageId) => {
    setActiveTab("chat");
    setTimeout(() => {
      const el = document.getElementById(`msg-${messageId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-indigo-500", "transition-all");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-indigo-500");
        }, 2000);
      }
    }, 100);
  };

  const mediaMessagesCount = useMemo(() => {
    return messages.filter(
      (m) =>
        m.attachment &&
        m.attachment.url &&
        (m.attachment.mimeType?.startsWith("image/") ||
          m.attachment.mimeType?.startsWith("video/"))
    ).length;
  }, [messages]);

  return (
    <div className="h-[calc(100vh-6.5rem)] rounded-3xl border border-white/10 bg-[#0B1120] overflow-hidden flex shadow-2xl relative">
      {activePreview && (
        <FilePreviewModal
          attachment={activePreview.attachment}
          senderName={activePreview.senderName}
          createdAt={activePreview.createdAt}
          onClose={() => setActivePreview(null)}
          onNext={handleNextPreview}
          onPrev={handlePrevPreview}
          hasNext={activePreview.list && activePreview.index < activePreview.list.length - 1}
          hasPrev={activePreview.list && activePreview.index > 0}
        />
      )}

      {/* Chats List Drawer Backdrop (on mobile/tablet) */}
      {isChatsListOpen && (
        <div
          onClick={() => setIsChatsListOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden transition-opacity"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 sm:w-96 flex-col h-full bg-[#0B1120] border-r border-white/10 transition-transform duration-300 xl:translate-x-0 xl:static xl:flex xl:w-80 lg:w-96 flex-shrink-0 ${
          isChatsListOpen ? "translate-x-0" : "-translate-x-full"
        } ${selectedConversation ? "hidden xl:flex" : "flex w-full"}`}
      >
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?._id}
          onSelectConversation={(conv) => {
            handleSelectConversation(conv);
            setIsChatsListOpen(false);
          }}
          loading={loadingConversations}
          currentUserId={currentUserId}
          unreadsMap={unreadsMap}
          lastMessagesMap={lastMessagesMap}
        />
      </div>

      <div
        className={`flex-1 flex flex-col h-full bg-[#09090B] ${
          !selectedConversation ? "hidden xl:flex" : "flex"
        }`}
      >
        {selectedConversation ? (
          <>
            <ChatHeader
              conversation={selectedConversation}
              onBack={() => {
                setSelectedConversation(null);
                navigate("/messages");
              }}
              onToggleChatsList={() => setIsChatsListOpen(true)}
              currentUserId={currentUserId}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              mediaCount={mediaMessagesCount}
            />

            {activeTab === "chat" ? (
              <>
                <MessageList
                  messages={messages}
                  currentUserId={currentUserId}
                  userRole={role}
                  onDeleteMessage={handleDeleteMessage}
                  onReactToMessage={handleReactToMessage}
                  onViewAttachment={(att, sender, date) => handleOpenPreview(att, sender, date)}
                  loading={loadingMessages}
                  participants={selectedConversation.participants || []}
                />

                <MessageComposer
                  onSendMessage={handleSendMessage}
                  disabled={sending}
                  uploading={sending}
                />
              </>
            ) : (
              <MediaGallery
                messages={messages}
                onSelectMedia={(att, sender, date, idx, list) => handleOpenPreview(att, sender, date, idx, list)}
                onJumpToMessage={handleJumpToMessage}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 select-none">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600/20 to-blue-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-2xl shadow-indigo-500/10">
              <FiMessageSquare className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold font-display text-white">Select a Project Chat</h2>
            <p className="text-xs text-gray-400 mt-2 max-w-sm">
              Choose a project conversation from the left sidebar to start real-time messaging with your client or freelancers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectChatPage;
