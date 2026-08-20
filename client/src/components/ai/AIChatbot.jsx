import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiSend,
  FiMic,
  FiMicOff,
  FiVolume2,
  FiVolumeX,
  FiTrash2,
  FiX,
  FiMinus,
  FiPlay,
  FiSquare,
  FiRefreshCw,
} from "react-icons/fi";
import { BsRobot } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi2";
import { toast } from "react-hot-toast";
import { askAiApi } from "../../api/apiServices";
import MarkdownRenderer from "./MarkdownRenderer";
import { useAuth } from "../../context/AuthContext";


const SPEECH_LANGUAGES = {
  en: {
    label: "English",
    speechCode: "en-IN",
    ttsCode: "en-IN",
  },
  hi: {
    label: "हिन्दी",
    speechCode: "hi-IN",
    ttsCode: "hi-IN",
  },
};

const generateMessageId = (prefix) => {
  return `${prefix}-${Date.now()}`;
};

const getFormattedTimestamp = () => {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const detectLanguage = (text) => {
  if (!text) return "en-IN";

  // Unicode Range for Hindi (Devanagari script) detection
  if (/[\u0900-\u097F]/.test(text)) {
    return "hi-IN";
  }

  return "en-IN"; // Default fallback
};


const getBestVoice = (language) => {
  if (!("speechSynthesis" in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();

  if (!voices || !voices.length) {
    return null;
  }

  const targetLang = language.toLowerCase();

  // 1. Try exact requested language 
  const exactMatch = voices.find(
    (voice) => voice.lang.toLowerCase() === targetLang ||
               voice.lang.toLowerCase().replace("_", "-") === targetLang
  );

  if (exactMatch) {
    return exactMatch;
  }

  // 2. Try language-only prefix match
  const languageMatch = voices.find(
    (voice) =>
      voice.lang.toLowerCase().startsWith(targetLang.split("-")[0])
  );

  if (languageMatch) {
    return languageMatch;
  }

  // 3. Try Indian regional voice preference fallback
  if (targetLang.endsWith("-in")) {
    const indianVoice = voices.find(
      (voice) => voice.lang.toLowerCase().endsWith("-in") ||
                 voice.lang.toLowerCase().replace("_", "-").endsWith("-in")
    );
    if (indianVoice) return indianVoice;
  }

  // 4. Graceful fallback 
  return null;
};

const INITIAL_WELCOME_MESSAGE = {
  id: "welcome-1",
  sender: "ai",
  text: "Hello! I am your AI Assistant. How can I help you with your projects, proposals, invoices, or tasks today?",
  timestamp: getFormattedTimestamp(),
  langKey: "en",
};

const SUGGESTED_PROMPTS = [
  "How to submit a winning proposal?",
  "How do project milestones work?",
  "Help me manage invoices and payments",
  "Tips to boost my freelancer rating",
];

export default function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);

  // Initialize selected language from localStorage or default to "en"
  const [selectedLangKey, setSelectedLangKey] = useState(() => {
    try {
      const saved = localStorage.getItem("ai_chat_selected_language");
      return saved && SPEECH_LANGUAGES[saved] ? saved : "en";
    } catch {
      return "en";
    }
  });

  // Initialize messages from sessionStorage if available
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("ai_chat_session_history");
      return saved ? JSON.parse(saved) : [INITIAL_WELCOME_MESSAGE];
    } catch {
      return [INITIAL_WELCOME_MESSAGE];
    }
  });

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  const isListeningRef = useRef(isListening);
  const spokenMessagesRef = useRef(new Set());

  // Sync messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("ai_chat_session_history", JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save session history:", e);
    }
  }, [messages]);

  // Sync selected language key to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ai_chat_selected_language", selectedLangKey);
    } catch (e) {
      console.error("Failed to save selected language:", e);
    }
  }, [selectedLangKey]);

  // Sync isListening state to ref to avoid dependency warnings
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Load Speech Synthesis Voices asynchronously (pre-warm cache for browser support)
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log("Available TTS voices:", voices);
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Stop speech synthesis helper (declared early for effect dependencies)
  const stopSpeech = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  }, []);

  // Stop speech/listening when language changes
  useEffect(() => {
    const handleLangChange = () => {
      stopSpeech();
      if (isListeningRef.current && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    };
    const timer = setTimeout(handleLangChange, 0);
    return () => clearTimeout(timer);
  }, [selectedLangKey, stopSpeech]);

  // Scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, loading]);

  // Speech Recognition Setup (STT)
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setInputMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied.");
        } else if (event.error !== "no-speech") {
          toast.error("Voice input error. Please try again.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text-to-Speech Helper (TTS)
  const speakText = useCallback((text, messageId) => {
    if (!text?.trim() || !messageId) return;

    // Avoid duplicate speech
    if (spokenMessagesRef.current.has(messageId)) {
      console.log(`Message ${messageId} has already been spoken. Skipping duplicate.`);
      return;
    }

    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis is not supported.");
      toast.error("Text-to-speech is not supported in your browser.");
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text by stripping code blocks and markdown symbols for audio reading
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/[`#*_]/g, "")
      .trim();

    if (!cleanText) return;

    // Detect language dynamically using Unicode script ranges
    const language = detectLanguage(cleanText);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language;

    const voice = getBestVoice(language);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Debugging logs as requested
    const voices = window.speechSynthesis.getVoices();
    console.log("Detected language:", language);
    console.log("Selected voice:", voice);
    console.log("Available voices:", voices);

    spokenMessagesRef.current.add(messageId);

    utterance.onstart = () => {
      setSpeakingMessageId(messageId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Toggle Speech-to-Text Listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeech();
      try {
        recognitionRef.current.lang = SPEECH_LANGUAGES[selectedLangKey].speechCode;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  // Send Message Handler
  const handleSend = async (textOveride = null) => {
    const text = (textOveride !== null ? textOveride : inputMessage).trim();
    if (!text || loading) return;

    stopSpeech();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const timestamp = getFormattedTimestamp();

    const userMessage = {
      id: generateMessageId("user"),
      sender: "user",
      text,
      timestamp,
      langKey: selectedLangKey,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const data = await askAiApi(text);

      const aiResponseText =
        data?.answer || data?.message || "Sorry, I could not generate a response.";
      const aiMessageId = generateMessageId("ai");

      const aiMessage = {
        id: aiMessageId,
        sender: "ai",
        text: aiResponseText,
        timestamp: getFormattedTimestamp(),
        langKey: selectedLangKey,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (!isOpen) {
        setHasUnread(true);
      }

      // Auto TTS if voice is enabled
      if (isVoiceEnabled) {
        speakText(aiResponseText, aiMessageId);
      }
    } catch (error) {
      console.error("AI Response Error:", error);
      const errorMessage = {
        id: generateMessageId("err"),
        sender: "ai",
        text: "I encountered an error processing your request. Please try again.",
        timestamp: getFormattedTimestamp(),
        isError: true,
        originalQuestion: text,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Retry failed message
  const handleRetry = (originalQuestion) => {
    if (originalQuestion) {
      handleSend(originalQuestion);
    }
  };

  // Clear Session Chat History
  const handleClearHistory = () => {
    stopSpeech();
    setMessages([INITIAL_WELCOME_MESSAGE]);
    try {
      sessionStorage.removeItem("ai_chat_session_history");
    } catch (e) {
      console.error("Failed to clear session storage:", e);
    }
    toast.success("Chat history cleared.");
  };

  // Handle Enter Key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Don't render chatbot if user is not authenticated
  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Floating Chat Drawer */}
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[82vh] flex flex-col rounded-2xl border border-white/10 bg-[#09090B]/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 origin-bottom-right">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-blue-950/80 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <BsRobot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-[#09090B] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-white text-sm tracking-wide">
                    AI Assistant
                  </h3>
                  <HiSparkles className="w-3.5 h-3.5 text-indigo-400" />

                </div>
                <p className="text-[11px] text-gray-400">
                  Always here to help you
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              {/* Voice ON/OFF Toggle */}
              <button
                onClick={() => {
                  if (speakingMessageId) stopSpeech();
                  setIsVoiceEnabled((prev) => !prev);
                  toast.success(
                    !isVoiceEnabled ? "Voice output enabled" : "Voice output muted"
                  );
                }}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isVoiceEnabled
                    ? "text-indigo-400 hover:bg-indigo-500/20"
                    : "text-gray-500 hover:bg-white/5"
                }`}
                title={isVoiceEnabled ? "Mute Voice Output" : "Enable Voice Output"}
              >
                {isVoiceEnabled ? (
                  <FiVolume2 className="w-4 h-4" />
                ) : (
                  <FiVolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Clear Chat */}
              <button
                onClick={handleClearHistory}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                title="Clear Chat History"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>

              {/* Minimize Window */}
              <button
                onClick={() => {
                  stopSpeech();
                  setIsOpen(false);
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                title="Minimize Window"
              >
                <FiMinus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <BsRobot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[82%] flex flex-col`}>
                  <div
                    className={`p-3.5 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-none shadow-md shadow-indigo-600/10"
                        : msg.isError
                        ? "bg-red-950/40 border border-red-500/30 text-red-200 rounded-bl-none"
                        : "bg-white/5 border border-white/10 text-gray-100 rounded-bl-none"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.text}
                      </p>
                    ) : (
                      <MarkdownRenderer content={msg.text} />
                    )}

                    {/* Retry button for errors */}
                    {msg.isError && msg.originalQuestion && (
                      <button
                        onClick={() => handleRetry(msg.originalQuestion)}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-red-900/50 hover:bg-red-900/80 text-red-200 border border-red-500/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <FiRefreshCw className="w-3 h-3" />
                        Retry
                      </button>
                    )}
                  </div>

                  {/* Message Footer: Timestamp & Audio controls */}
                  <div
                    className={`flex items-center gap-2 mt-1 px-1 text-[10px] text-gray-500 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    {msg.sender === "ai" && !msg.isError && (
                      <button
                        onClick={() => {
                          if (speakingMessageId === msg.id) {
                            stopSpeech();
                          } else {
                            spokenMessagesRef.current.delete(msg.id);
                            speakText(msg.text, msg.id);
                          }
                        }}
                        className="hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-0.5"
                        title={
                          speakingMessageId === msg.id
                            ? "Stop speaking"
                            : "Read aloud"
                        }
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <FiSquare className="w-3 h-3 text-indigo-400 animate-pulse" />
                            <span className="text-indigo-400 font-medium">
                              Stop
                            </span>
                          </>
                        ) : (
                          <>
                            <FiPlay className="w-3 h-3" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading / Typing Indicator */}
            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <BsRobot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-white/5 border border-white/10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-150" />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-300" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          {messages.length <= 2 && !loading && (
            <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap text-xs bg-white/5 hover:bg-indigo-600/20 text-gray-300 hover:text-indigo-300 border border-white/10 hover:border-indigo-500/30 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-[#09090B]/90 border-t border-white/10">
            {/* Active Speech Recognition Indicator */}
            {isListening && (
              <div className="mb-2 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300 animate-pulse">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Listening to your voice... Speak now.
                </span>
                <button
                  onClick={toggleListening}
                  className="text-gray-400 hover:text-white underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Speech Language Selector */}
            <div className="flex items-center justify-between mb-2 px-1 text-xs">
              <span className="text-gray-400 font-medium">Speech Language:</span>
              <select
                value={selectedLangKey}
                onChange={(e) => {
                  setSelectedLangKey(e.target.value);
                  toast.success(`Language set to ${SPEECH_LANGUAGES[e.target.value].label}`);
                }}
                className="text-[11px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/60 hover:border-indigo-400 rounded-md px-2 py-0.5 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              >
                {Object.entries(SPEECH_LANGUAGES).map(([key, lang]) => (
                  <option key={key} value={key} className="bg-[#09090B] text-gray-200">
                    {lang.label} ({lang.speechCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5 focus-within:border-indigo-500/50 transition-colors">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI anything..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 px-2 py-1.5 focus:outline-none resize-none max-h-24 min-h-[36px]"
              />

              {/* STT Mic Button */}
              <button
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? (
                  <FiMicOff className="w-4 h-4" />
                ) : (
                  <FiMic className="w-4 h-4" />
                )}
              </button>

              {/* Submit Button */}
              <button
                onClick={() => handleSend()}
                disabled={!inputMessage.trim() || loading}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  inputMessage.trim() && !loading
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 shadow-md shadow-indigo-500/20"
                    : "bg-white/5 text-gray-600 cursor-not-allowed"
                }`}
                title="Send message"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => {
          if (isOpen && speakingMessageId) stopSpeech();
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) {
            setHasUnread(false);
          }
        }}
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20"
        title="Open AI Assistant"
      >
        <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping pointer-events-none group-hover:hidden" />
        
        {isOpen ? (
          <FiX className="w-6 h-6" />
        ) : (
          <div className="relative">
            <BsRobot className="w-7 h-7" />
            <HiSparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-spin" style={{ animationDuration: "4s" }} />
          </div>
        )}

        {/* Unread dot */}
        {!isOpen && hasUnread && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-[#09090B] rounded-full" />
        )}
      </button>
    </div>
  );
}
