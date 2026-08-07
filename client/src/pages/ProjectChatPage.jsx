import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMyConversationsApi,
  getProjectConversationApi,
  createConversationApi,
  getConversationMessagesApi,
  sendMessageApi,
  deleteMessageApi,
  markMessageReadApi,
} from "../api/apiServices";
import {
  initSocket,
  joinConversationRoom,
  leaveConversationRoom,
  subscribeToNewMessage,
  subscribeToMessageDeleted,
  subscribeToMessageRead,
} from "../services/socketService";
import ConversationList from "../components/chat/ConversationList";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageComposer from "../components/chat/MessageComposer";
import EmptyState from "../components/EmptyState";
import { toast } from "react-hot-toast";
import { FiMessageSquare } from "react-icons/fi";

const ProjectChatPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastMessagesMap, setLastMessagesMap] = useState({});
  const [unreadsMap, setUnreadsMap] = useState({});

  // Initialize Socket connection
  useEffect(() => {
    if (currentUserId) {
      initSocket();
    }
  }, [currentUserId]);

  // Fetch conversations on load
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const res = await getMyConversationsApi();
      const list = res.conversations || [];
      setConversations(list);

      // Populate initial lastMessages and unreads
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

  // Handle URL projectId parameter or select first conversation by default
  useEffect(() => {
    if (loadingConversations) return;

    const selectTargetConversation = async () => {
      if (projectId) {
        // Find in existing list
        let found = conversations.find(
          (c) => (c.project?._id || c.project) === projectId
        );

        if (!found) {
          try {
            // Try fetching from project API
            const res = await getProjectConversationApi(projectId);
            if (res.conversation) {
              found = res.conversation;
              setConversations((prev) => [found, ...prev]);
            }
          } catch (err) {
            // If conversation doesn't exist yet and user is client or admin, try creating
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
        // Select first conversation by default on desktop
        if (window.innerWidth >= 768) {
          setSelectedConversation(conversations[0]);
        }
      }
    };

    selectTargetConversation();
  }, [projectId, conversations, loadingConversations, role]);

  // Fetch messages and manage socket room whenever selected conversation changes
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const conversationId = selectedConversation._id;

    // Join Socket room
    joinConversationRoom(conversationId);

    // Fetch messages
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await getConversationMessagesApi(conversationId);
        const fetchedMessages = res.messages || [];
        setMessages(fetchedMessages);

        // Update last message map
        if (fetchedMessages.length > 0) {
          const lastMsg = fetchedMessages[fetchedMessages.length - 1];
          setLastMessagesMap((prev) => ({ ...prev, [conversationId]: lastMsg }));
        }

        // Mark unread messages as read
        fetchedMessages.forEach((msg) => {
          const readArray = msg.readBy || [];
          if (!readArray.includes(currentUserId)) {
            markMessageReadApi(msg._id).catch(() => {});
          }
        });

        // Reset unread count for selected conversation
        setUnreadsMap((prev) => ({ ...prev, [conversationId]: 0 }));

      } catch (err) {
        console.error("Fetch messages error:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Clean up socket room on unmount or switch
    return () => {
      leaveConversationRoom(conversationId);
    };
  }, [selectedConversation, currentUserId]);

  // Socket event listeners: newMessage
  useEffect(() => {
    const activeConvId = selectedConversation?._id;

    const unsubscribe = subscribeToNewMessage((newMsg) => {
      const convId = typeof newMsg.conversation === "object" ? newMsg.conversation._id : newMsg.conversation;

      // Update last message map for sidebar preview
      setLastMessagesMap((prev) => ({ ...prev, [convId]: newMsg }));

      // If this message belongs to active conversation, append to list
      if (activeConvId && activeConvId === convId) {
        setMessages((prev) => {
          // Avoid duplicate message
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });

        // Mark read automatically if message is incoming
        const senderId = typeof newMsg.sender === "object" ? newMsg.sender?._id || newMsg.sender?.id : newMsg.sender;
        if (senderId?.toString() !== currentUserId?.toString()) {
          markMessageReadApi(newMsg._id).catch(() => {});
        }
      } else {
        // Increment unread count for inactive conversation
        setUnreadsMap((prev) => ({
          ...prev,
          [convId]: (prev[convId] || 0) + 1,
        }));
      }
    });

    return unsubscribe;
  }, [selectedConversation?._id, currentUserId]);

  // Socket event listeners: messageDeleted
  useEffect(() => {
    const unsubscribe = subscribeToMessageDeleted(({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });
    return unsubscribe;
  }, []);

  // Socket event listeners: messageRead
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

  // Handle selecting a conversation
  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    if (conv.project?._id) {
      navigate(`/messages/${conv.project._id}`);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (text) => {
    if (!selectedConversation || !text.trim() || sending) return;

    try {
      setSending(true);
      const res = await sendMessageApi(selectedConversation._id, text);
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
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  // Handle deleting a message
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

  return (
    <div className="h-[calc(100vh-6.5rem)] rounded-3xl border border-white/10 bg-[#0B1120] overflow-hidden flex shadow-2xl">
      {/* Left Column: Conversation List */}
      <div
        className={`w-full md:w-80 lg:w-96 flex-shrink-0 ${
          selectedConversation ? "hidden md:flex" : "flex"
        } flex-col h-full`}
      >
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?._id}
          onSelectConversation={handleSelectConversation}
          loading={loadingConversations}
          currentUserId={currentUserId}
          unreadsMap={unreadsMap}
          lastMessagesMap={lastMessagesMap}
        />
      </div>

      {/* Right Column: Selected Conversation Chat */}
      <div
        className={`flex-1 flex flex-col h-full bg-[#09090B] ${
          !selectedConversation ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Top Chat Header */}
            <ChatHeader
              conversation={selectedConversation}
              onBack={() => {
                setSelectedConversation(null);
                navigate("/messages");
              }}
              currentUserId={currentUserId}
            />

            {/* Message History Area */}
            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              userRole={role}
              onDeleteMessage={handleDeleteMessage}
              loading={loadingMessages}
              participants={selectedConversation.participants || []}
            />

            {/* Bottom Message Composer */}
            <MessageComposer
              onSendMessage={handleSendMessage}
              disabled={sending}
            />
          </>
        ) : (
          /* Empty State when no conversation is selected on desktop */
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
