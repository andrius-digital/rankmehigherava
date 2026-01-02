import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { X, Send, User, Sparkles, PhoneOff, MessageSquare, Calendar, Brain, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AvaAvatar from "@/components/agency/AvaAvatar";

// Draggable position hook
const useDraggable = (initialPosition: { x: number; y: number }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const dragThreshold = 5; // Minimum pixels moved to count as a drag

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  }, [position]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  }, [position]);

  // Check if click should be allowed (wasn't a drag)
  const shouldAllowClick = useCallback(() => {
    return !hasDraggedRef.current;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      // Check if moved enough to count as a drag
      if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
        hasDraggedRef.current = true;
      }
      
      // Calculate new position (from bottom-left)
      const newX = Math.max(0, Math.min(window.innerWidth - 80, dragRef.current.initialX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 80, dragRef.current.initialY - deltaY));
      
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !dragRef.current) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragRef.current.startX;
      const deltaY = touch.clientY - dragRef.current.startY;
      
      // Check if moved enough to count as a drag
      if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
        hasDraggedRef.current = true;
      }
      
      const newX = Math.max(0, Math.min(window.innerWidth - 80, dragRef.current.initialX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 80, dragRef.current.initialY - deltaY));
      
      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  return { position, isDragging, handleMouseDown, handleTouchStart, shouldAllowClick };
};

// Declare Calendly global type
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import Vapi from "@vapi-ai/web";

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const SLACK_NOTIFY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/slack-notify`;
const AVA_NOTIFY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ava-notify`;
const TELEGRAM_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-chat`;

// Generate a unique session ID for this browser session
const generateSessionId = (): string => {
  const stored = sessionStorage.getItem('ava_chat_session_id');
  if (stored) return stored;
  const newId = crypto.randomUUID();
  sessionStorage.setItem('ava_chat_session_id', newId);
  return newId;
};

// Keywords that trigger live representative request
const LIVE_REP_KEYWORDS = [
  "live agent",
  "live representative",
  "real person",
  "speak to someone",
  "talk to a human",
  "connect to owner",
  "connect with team",
  "human agent",
  "speak to a human",
  "call me",
  "contact me",
  "talk to someone",
  "real human",
  "live support",
  "live chat",
  "speak with someone",
  "connect me",
  "get in touch",
  "reach out",
  "phone call",
  "representative",
  "live person",
  "actual person",
  "human support",
  "talk to owner",
  "speak to owner",
  "contact owner",
  "team member"
];

// Natural engagement messages for keeping prospects active
const ENGAGEMENT_MESSAGES = [
  "Hey, still there? Our team's been pinged - someone should reach out soon. Anything else you wanna know while you wait?",
  "Just checking in! Did you get a chance to drop your contact info? Makes it way easier for the team to follow up with you 👍",
  "Still here! Someone from our team will be in touch shortly. Feel free to ask me anything about SEO in the meantime!",
  "Hey! Thanks for hanging tight. Our team's on it - shouldn't be too long now. Got any other questions I can help with?",
  "Quick check-in - you still with me? Let me know if there's anything else you'd like to know about what we do!"
];

// Engagement timer intervals in milliseconds
const ENGAGEMENT_INTERVALS = [2 * 60 * 1000, 3.5 * 60 * 1000, 5 * 60 * 1000]; // 2min, 3.5min, 5min

const AVA_INTRO = `Hey! 👋 How can I help you today?`;

const CALENDLY_URL = "https://calendly.com/andrius-cdlagency/andrius-digital-asap-meeting";

const openCalendly = () => {
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url: CALENDLY_URL });
  } else {
    window.open(CALENDLY_URL, '_blank');
  }
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { position, isDragging, handleMouseDown, handleTouchStart, shouldAllowClick } = useDraggable({ x: 24, y: 24 });
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: AVA_INTRO,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLeadCollectionMode, setIsLeadCollectionMode] = useState(false);
  const [showTextMode, setShowTextMode] = useState(false);
  const [showLiveChatMode, setShowLiveChatMode] = useState(false);
  const [isWaitingForOwner, setIsWaitingForOwner] = useState(false);
  const [unreadLiveChatCount, setUnreadLiveChatCount] = useState(0);

  // Session ID for Telegram chat
  const chatSessionId = useMemo(() => generateSessionId(), []);

  // Voice state
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionStartRef = useRef<number | null>(null);
  const hasNotifiedRef = useRef(false);
  const hasLiveRepNotifiedRef = useRef(false);
  const engagementTimersRef = useRef<NodeJS.Timeout[]>([]);
  const engagementIndexRef = useRef(0);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const chatOpenedAt = useRef<string | null>(null);
  const { toast } = useToast();

  // Track when live chat is opened
  useEffect(() => {
    if (showLiveChatMode) {
      chatOpenedAt.current = new Date().toISOString();
      processedMessageIds.current.clear();
      setUnreadLiveChatCount(0); // Clear unread count when entering live chat
    }
  }, [showLiveChatMode]);

  // Poll for unread messages when on menu (not in live chat mode)
  useEffect(() => {
    if (!isOpen || showLiveChatMode || !chatSessionId || !chatOpenedAt.current) return;

    const pollForUnread = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/telegram_chat_messages?session_id=eq.${chatSessionId}&role=eq.owner&created_at=gt.${chatOpenedAt.current}&order=created_at.desc&limit=10`,
          {
            headers: {
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );
        
        const ownerMessages = await response.json();
        
        if (ownerMessages && ownerMessages.length > 0 && !ownerMessages.error) {
          const unreadCount = ownerMessages.filter(
            (msg: { id: string }) => !processedMessageIds.current.has(msg.id)
          ).length;
          setUnreadLiveChatCount(unreadCount);
        }
      } catch (error) {
        console.error('Error polling for unread:', error);
      }
    };

    const interval = setInterval(pollForUnread, 2000);
    pollForUnread();
    
    return () => clearInterval(interval);
  }, [isOpen, showLiveChatMode, chatSessionId]);

  // Poll for Telegram responses and read status
  useEffect(() => {
    if (!showLiveChatMode || !chatSessionId || !chatOpenedAt.current) return;

    const pollForUpdates = async () => {
      try {
        // Check for owner replies
        const replyResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/telegram_chat_messages?session_id=eq.${chatSessionId}&role=eq.owner&created_at=gt.${chatOpenedAt.current}&order=created_at.desc&limit=5`,
          {
            headers: {
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );
        
        const ownerMessages = await replyResponse.json();

        if (ownerMessages && ownerMessages.length > 0 && !ownerMessages.error) {
          const newMessages = [...ownerMessages]
            .reverse()
            .filter((msg: { id: string }) => !processedMessageIds.current.has(msg.id));

          newMessages.forEach((msg: { id: string; content: string }) => {
            processedMessageIds.current.add(msg.id);
            setMessages((prev) => {
              const updated = prev.map((m) => 
                m.content.includes("Delivered") || m.content.includes("Waiting")
                  ? { ...m, content: "✓✓ Seen" }
                  : m
              );
              return [...updated, { role: 'assistant', content: msg.content }];
            });
            setIsWaitingForOwner(false);
          });
        }

        // Check if user messages have been read (marked as seen)
        const readResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/telegram_chat_messages?session_id=eq.${chatSessionId}&role=eq.user&is_read=eq.true&created_at=gt.${chatOpenedAt.current}&limit=1`,
          {
            headers: {
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );

        const readMessages = await readResponse.json();
        
        if (readMessages && readMessages.length > 0 && !readMessages.error) {
          // Update status to "Seen" if any message has been read
          setMessages((prev) => 
            prev.map((m) => 
              m.content.includes("Delivered") || m.content.includes("Waiting")
                ? { ...m, content: "✓✓ Seen" }
                : m
            )
          );
        }
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    };

    const interval = setInterval(pollForUpdates, 2000);
    
    return () => clearInterval(interval);
  }, [showLiveChatMode, chatSessionId]);

  // Request mic permission proactively when chat opens
  useEffect(() => {
    if (isOpen && !hasMicPermission && !showTextMode) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setHasMicPermission(true);
        })
        .catch(() => {
          // Permission denied, user can still use text mode
          setHasMicPermission(false);
        });
    }
  }, [isOpen, showTextMode]);

  // Initialize VAPI
  useEffect(() => {
    if (!VAPI_PUBLIC_KEY) {
      console.warn("VAPI_PUBLIC_KEY is not configured. Voice features will be disabled.");
      return;
    }

    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      console.log("VAPI call started");
      setIsCallActive(true);
      setIsConnecting(false);
      startSession();
    });

    vapi.on("call-end", () => {
      console.log("VAPI call ended");
      setIsCallActive(false);
      setIsSpeaking(false);
      setIsVoiceMode(false);
      setIsConnecting(false);
    });

    vapi.on("speech-start", () => {
      setIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setIsSpeaking(false);
    });

    vapi.on("message", (msg: any) => {
      // Handle transcripts
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        const role = msg.role === "user" ? "user" : "assistant";
        setMessages(prev => [...prev, { role, content: msg.transcript }]);

        // Check for live rep request in voice
        if (role === "user" && checkForLiveRepRequest(msg.transcript)) {
          sendLiveRepNotification(msg.transcript);
        }
      }
    });

    vapi.on("error", (error: any) => {
      console.error("VAPI error:", error);
      const isPreviewSandbox = window.location.hostname.includes('lovableproject.com');
      toast({
        variant: "destructive",
        title: "Voice Error",
        description: isPreviewSandbox
          ? "Voice calls don't work in preview mode. Deploy your app to use this feature."
          : "There was an issue with the voice call. Please try again.",
      });
      setIsCallActive(false);
      setIsVoiceMode(false);
      setIsConnecting(false);
    });

    return () => {
      vapi.stop();
    };
  }, []);

  // Clear all engagement timers
  const clearEngagementTimers = useCallback(() => {
    engagementTimersRef.current.forEach(timer => clearTimeout(timer));
    engagementTimersRef.current = [];
  }, []);

  // Add engagement message to chat
  const addEngagementMessage = useCallback(() => {
    const messageIndex = engagementIndexRef.current % ENGAGEMENT_MESSAGES.length;
    const message = ENGAGEMENT_MESSAGES[messageIndex];
    engagementIndexRef.current++;

    setMessages(prev => [...prev, { role: "assistant", content: message }]);
  }, []);

  // Schedule engagement messages
  const scheduleEngagementMessages = useCallback(() => {
    clearEngagementTimers();
    engagementIndexRef.current = 0;

    const timers = ENGAGEMENT_INTERVALS.map((interval, index) => {
      return setTimeout(() => {
        addEngagementMessage();
      }, interval);
    });

    engagementTimersRef.current = timers;
  }, [clearEngagementTimers, addEngagementMessage]);

  // Start lead collection mode
  const startLeadCollectionMode = useCallback(() => {
    setIsLeadCollectionMode(true);

    const leadCollectionResponse = `Oh for sure! Let me grab someone from the team for you 🙌

While I'm pinging them - mind dropping your name, phone, and email real quick? That way they can reach you directly.

And what kind of services are you looking into? Just so they know what you're after!`;

    setMessages(prev => [...prev, { role: "assistant", content: leadCollectionResponse }]);

    // Schedule engagement messages
    scheduleEngagementMessages();
  }, [scheduleEngagementMessages]);

  // Check if message contains live rep request keywords
  const checkForLiveRepRequest = useCallback((message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return LIVE_REP_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  }, []);

  // Send urgent live rep notification to Slack
  const sendLiveRepNotification = useCallback(async (userMessage: string) => {
    if (hasLiveRepNotifiedRef.current) return;

    hasLiveRepNotifiedRef.current = true;

    try {
      await fetch(SLACK_NOTIFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.slice(1),
          pageUrl: window.location.href,
          sessionDuration: sessionStartRef.current ? Date.now() - sessionStartRef.current : 0,
          liveRepRequest: true,
          triggerMessage: userMessage,
        }),
      });
      console.log("Live rep notification sent to Slack");
    } catch (error) {
      console.error("Failed to send live rep notification:", error);
    }
  }, [messages]);

  // Track when user sends their first message
  const startSession = useCallback(() => {
    if (!sessionStartRef.current) {
      sessionStartRef.current = Date.now();
      hasNotifiedRef.current = false;
    }
  }, []);

  // Send conversation to Slack when chat closes
  const sendToSlack = useCallback(async () => {
    // Only notify if there was a real conversation (more than just the greeting)
    if (messages.length <= 1 || hasNotifiedRef.current || !sessionStartRef.current) {
      return;
    }

    hasNotifiedRef.current = true;
    const sessionDuration = Date.now() - sessionStartRef.current;

    try {
      await fetch(SLACK_NOTIFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.slice(1), // Exclude initial greeting
          pageUrl: window.location.href,
          sessionDuration,
        }),
      });
      console.log("Conversation sent to Slack");
    } catch (error) {
      console.error("Failed to send to Slack:", error);
    }
  }, [messages]);

  // Start voice call
  const startVoiceCall = useCallback(async () => {
    if (!VAPI_PUBLIC_KEY || !VAPI_ASSISTANT_ID) {
      toast({
        variant: "destructive",
        title: "Voice Not Configured",
        description: "VAPI environment variables are missing. Please configure VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID.",
      });
      return;
    }

    if (!vapiRef.current) return;

    try {
      setIsVoiceMode(true);
      setIsConnecting(true);
      setShowTextMode(false);

      // Use assistant ID from VAPI dashboard (transient assistants require special key permissions)
      await vapiRef.current.start(VAPI_ASSISTANT_ID);

    } catch (error) {
      console.error("Failed to start voice call:", error);
      toast({
        variant: "destructive",
        title: "Voice Error",
        description: "Failed to start voice call. Please check your microphone permissions.",
      });
      setIsVoiceMode(false);
      setIsConnecting(false);
    }
  }, [toast]);

  // End voice call
  const endVoiceCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    setIsCallActive(false);
    setIsVoiceMode(false);
    setIsSpeaking(false);
    setIsConnecting(false);
  }, []);



  const handleClose = useCallback(() => {
    clearEngagementTimers();
    endVoiceCall();
    sendToSlack();
    setIsOpen(false);
    setIsLeadCollectionMode(false);
    setShowTextMode(false);
    setShowLiveChatMode(false);
  }, [sendToSlack, clearEngagementTimers, endVoiceCall]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearEngagementTimers();
    };
  }, [clearEngagementTimers]);

  // Also send to Slack when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length > 1 && sessionStartRef.current && !hasNotifiedRef.current) {
        // Use sendBeacon for reliable delivery on page close
        const data = JSON.stringify({
          messages: messages.slice(1),
          pageUrl: window.location.href,
          sessionDuration: Date.now() - sessionStartRef.current,
        });
        navigator.sendBeacon(SLACK_NOTIFY_URL, data);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Enter Live Chat mode - allow multiple simultaneous chats
  const enterLiveChatMode = () => {
    setShowLiveChatMode(true);
  };

  // Send message for Live Chat (Telegram)
  const sendLiveChatMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const messageText = input.trim();

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsWaitingForOwner(true);

    try {
      const response = await fetch(TELEGRAM_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          sessionId: chatSessionId,
          message: messageText,
          pageUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to send message");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "✓ Delivered • Waiting for Andrius to see..." },
      ]);

    } catch (error) {
      console.error("Live chat error:", error);
      setIsWaitingForOwner(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send message for AI Chat (AVA)
  const sendAIMessage = async () => {
    if (!input.trim() || isLoading) return;

    startSession();

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages.slice(1), userMessage],
        }),
      });

      if (!response.ok || !response.body) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("AI chat error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
      });
      setMessages((prev) => prev.filter((m) => m.content !== ""));
    } finally {
      setIsLoading(false);
    }
  };

  // Main send function that routes to the right handler
  const sendMessage = async () => {
    if (showLiveChatMode) {
      await sendLiveChatMessage();
    } else {
      await sendAIMessage();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button - Futuristic AVA Avatar (Draggable) */}
      <div
        style={{ 
          left: `${position.x}px`, 
          bottom: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        className="fixed z-50 group"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Click area for opening chat */}
        <button
          onClick={(e) => {
            if (shouldAllowClick()) {
              isOpen ? handleClose() : setIsOpen(true);
            }
          }}
          className="relative"
          aria-label="Toggle AI chat"
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/30 via-blue-500/30 to-purple-500/30 blur-xl animate-pulse" />

          {/* Main avatar container */}
          <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-md border border-cyan-400/30 flex items-center justify-center overflow-hidden transition-transform duration-300 ${isDragging ? 'scale-95' : 'group-hover:scale-110'}`}>
          {/* Animated scan lines */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-scan" />
          </div>

          {/* Neural network pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            {/* Neural connections */}
            <circle cx="50" cy="50" r="2" fill="url(#neuralGradient)" className="animate-pulse" />
            <circle cx="30" cy="30" r="1.5" fill="url(#neuralGradient)" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
            <circle cx="70" cy="30" r="1.5" fill="url(#neuralGradient)" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
            <circle cx="30" cy="70" r="1.5" fill="url(#neuralGradient)" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
            <circle cx="70" cy="70" r="1.5" fill="url(#neuralGradient)" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
            <line x1="30" y1="30" x2="50" y2="50" stroke="url(#neuralGradient)" strokeWidth="0.5" opacity="0.3" />
            <line x1="70" y1="30" x2="50" y2="50" stroke="url(#neuralGradient)" strokeWidth="0.5" opacity="0.3" />
            <line x1="30" y1="70" x2="50" y2="50" stroke="url(#neuralGradient)" strokeWidth="0.5" opacity="0.3" />
            <line x1="70" y1="70" x2="50" y2="50" stroke="url(#neuralGradient)" strokeWidth="0.5" opacity="0.3" />
          </svg>

          {/* Icon with glow */}
          <div className="relative z-10 flex flex-col items-center">
            {isOpen ? (
              <X className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            ) : (
              <>
                <Brain className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-float" />
                <span className="text-[8px] font-orbitron tracking-widest text-cyan-400 mt-0.5">AVA</span>
              </>
            )}
          </div>

          {/* Rotating ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400/50 border-r-blue-400/50 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

          {/* Pulse effect on hover */}
          <div className="absolute inset-0 rounded-full bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-all duration-300" />
        </button>
      </div>

      {/* Chat Window - AVA Futuristic Design */}
      {isOpen && (
        <div 
          style={{ 
            left: `${position.x + 80}px`, 
            bottom: `${position.y}px` 
          }}
          className="fixed z-50 w-[420px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-120px)] rounded-3xl shadow-2xl shadow-cyan-500/30 flex flex-col overflow-hidden animate-scale-in"
        >
          {/* Glowing border effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-3xl opacity-70" />
          <div className="absolute -inset-[3px] bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-3xl opacity-30 blur-md" />

          {/* Inner content */}
          <div className="relative bg-black/95 backdrop-blur-xl rounded-3xl flex flex-col overflow-hidden h-full">
            {/* Futuristic background patterns */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Circuit grid pattern */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(34,211,238,0.1) 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }} />

              {/* Radial gradient glow */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-blue-900/20 rounded-full blur-[80px]" />
            </div>

            {/* Header */}
            <div className="relative px-6 py-5 border-b border-cyan-400/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AvaAvatar className="w-12 h-12" />
                <div>
                  <h3 className="font-orbitron font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-2xl tracking-tight">AVA</h3>
                  <p className="text-cyan-400/70 text-xs tracking-wide font-orbitron">by Rank Me Higher</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Selection Screen (Default View) */}
              {!showTextMode && !showLiveChatMode && !isVoiceMode && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-orbitron font-bold text-white tracking-tight">How would you like to interact?</h3>
                    <p className="text-cyan-400/60 text-sm font-medium tracking-widest font-orbitron uppercase">Select protocol</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    {/* Talk Button */}
                    <button
                      onClick={startVoiceCall}
                      className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 transition-all duration-500 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <Brain className="w-7 h-7 text-cyan-400" />
                      </div>
                      <span className="font-orbitron font-bold text-white tracking-widest text-base">TALK</span>
                    </button>

                    {/* Type Button - AVA AI */}
                    <button
                      onClick={() => setShowTextMode(true)}
                      className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 transition-all duration-500 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        <MessageSquare className="w-7 h-7 text-blue-400" />
                      </div>
                      <span className="font-orbitron font-bold text-white tracking-widest text-base">TYPE</span>
                    </button>
                  </div>

                  {/* Live Chat with Andrius Digital */}
                  <button
                    onClick={enterLiveChatMode}
                    className="group w-full max-w-sm flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-500 relative"
                  >
                    {/* Notification badge */}
                    {unreadLiveChatCount > 0 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center animate-pulse shadow-lg shadow-green-500/50">
                        <span className="text-white text-xs font-bold">{unreadLiveChatCount}</span>
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center overflow-hidden border-2 border-cyan-400/30 group-hover:scale-105 transition-transform">
                      <img 
                        src="/andrius-avatar.png" 
                        alt="Andrius Digital"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full items-center justify-center text-primary font-bold text-lg" style={{ display: 'none' }}>AD</div>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-orbitron font-bold text-white text-sm">Live Chat with Andrius Digital</p>
                      <p className="text-xs text-white/50">Usually responds in minutes</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </button>

                  {/* Calendly booking button */}
                  <button
                    onClick={openCalendly}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-100/60 text-xs font-orbitron transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book a Call</span>
                  </button>
                </div>
              )}

              {/* Voice Call Active UI */}
              {isVoiceMode && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5">
                  {/* Voice visualization */}
                  <div className="relative">
                    {/* Connecting state - animated rings */}
                    {isConnecting && !isCallActive && (
                      <>
                        <div className="absolute -inset-16 rounded-full border-2 border-primary/20 animate-[spin_4s_linear_infinite]">
                          <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary/60 rounded-full" />
                        </div>
                        <div className="absolute -inset-12 rounded-full border-2 border-primary/30 animate-[spin_3s_linear_infinite_reverse]">
                          <div className="absolute right-0 top-1/2 w-2.5 h-2.5 bg-white/50 rounded-full" />
                          <div className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-red-400/60 rounded-full" />
                        </div>
                        <div className="absolute -inset-8 rounded-full border-2 border-primary/40 animate-pulse" />
                      </>
                    )}

                    {/* Active call - pulsing rings */}
                    {isCallActive && (
                      <>
                        <div className="absolute -inset-20 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
                        <div className="absolute -inset-16 rounded-full border border-primary/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.2s' }} />
                        <div className="absolute -inset-12 rounded-full border border-primary/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.4s' }} />
                        <div className="absolute -inset-8 rounded-full border-2 border-primary/40 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.6s' }} />
                      </>
                    )}

                    {/* Spinning orbital rings */}
                    <div className="absolute -inset-10 rounded-full border border-white/10 animate-[spin_8s_linear_infinite]">
                      <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50" />
                      <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-red-400 rounded-full" />
                    </div>
                    <div className="absolute -inset-6 rounded-full border border-white/20 animate-[spin_6s_linear_infinite_reverse]">
                      <div className="absolute right-0 top-1/2 w-2 h-2 bg-white/60 rounded-full" />
                    </div>

                    {/* Main orb with waveform */}
                    <div className={`relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 ${isSpeaking
                      ? "bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-700 shadow-2xl shadow-cyan-500/60"
                      : isCallActive
                        ? "bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 shadow-2xl shadow-green-500/40"
                        : "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 shadow-xl"
                      }`}>
                      {/* Inner glow */}
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent" />

                      {/* Waveform bars */}
                      <div className="flex items-center gap-1.5 relative z-10">
                        {[...Array(9)].map((_, i) => {
                          const baseHeight = isSpeaking ? 28 : isCallActive ? 16 : 10;
                          const variation = isSpeaking ? 20 : isCallActive ? 10 : 6;
                          const heights = [0.6, 0.8, 1, 0.9, 1.2, 0.9, 1, 0.8, 0.6];
                          return (
                            <div
                              key={i}
                              className={`w-1.5 rounded-full bg-white transition-all ${isSpeaking || isCallActive || isConnecting ? 'animate-pulse' : ''
                                }`}
                              style={{
                                height: `${baseHeight * heights[i] + (isSpeaking || isConnecting ? Math.sin(i * 0.5) * variation : 0)}px`,
                                animationDelay: `${i * 0.08}s`,
                                animationDuration: isSpeaking ? '0.4s' : isConnecting ? '0.6s' : '0.8s'
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Status text */}
                  <div className="text-center">
                    <p className={`text-2xl font-semibold tracking-wide font-orbitron ${isSpeaking ? 'text-cyan-400' : isCallActive ? 'text-green-400' : 'text-white/70'
                      }`}>
                      {isSpeaking ? "AVA IS SPEAKING..." : isCallActive ? "LISTENING..." : "CONNECTING..."}
                    </p>
                    {isCallActive && !isSpeaking && (
                      <p className="text-white/40 text-sm mt-2">Speak naturally, I'm here to help</p>
                    )}
                    {isConnecting && !isCallActive && (
                      <p className="text-white/40 text-sm mt-2">Setting up voice connection...</p>
                    )}
                  </div>

                  {/* Enhanced Transcription View */}
                  {messages.length > 1 && (
                    <div className="w-full flex-1 flex flex-col justify-center px-4 overflow-hidden mb-4">
                      <ScrollArea className="w-full h-full max-h-[300px]">
                        <div className="space-y-6 pb-4 px-2">
                          {messages.slice(-8).map((msg, i) => (
                            <div
                              key={i}
                              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`max-w-[95%] px-5 py-4 rounded-2xl font-body text-base leading-relaxed shadow-2xl backdrop-blur-xl ${msg.role === 'user'
                                  ? 'bg-cyan-500/20 border border-cyan-400/40 text-white'
                                  : 'bg-white/10 border border-white/20 text-cyan-50'
                                  }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* End call button */}
                  <Button
                    onClick={endVoiceCall}
                    className="rounded-full px-10 py-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-xl shadow-red-600/30 hover:shadow-red-500/50 transition-all text-base font-semibold"
                  >
                    <PhoneOff className="w-5 h-5 mr-2" />
                    End Call
                  </Button>

                  {/* Switch to text mode during connecting/call */}
                  <button
                    onClick={() => {
                      endVoiceCall();
                      setShowTextMode(true);
                    }}
                    className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white/70 hover:text-white text-sm font-medium transition-all duration-300 group"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Switch to text</span>
                  </button>

                  {/* Calendly booking button */}
                  <button
                    onClick={openCalendly}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/60 to-red-600/60 hover:from-primary hover:to-red-600 border border-primary/20 text-white/90 text-xs font-medium transition-all duration-300 hover:scale-105"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book a Call</span>
                  </button>
                </div>
              )}

              {/* Text Mode Interface - AVA AI */}
              {showTextMode && !showLiveChatMode && !isVoiceMode && (
                <>
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""} animate-fade-in`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            {message.role === "assistant" && (
                              <div className="absolute inset-0 bg-primary/30 rounded-full blur-md" />
                            )}
                            <div
                              className={`relative w-8 h-8 rounded-full flex items-center justify-center ${message.role === "user"
                                ? "backdrop-blur-xl bg-cyan-500/20 border border-cyan-400/30"
                                : "bg-gradient-to-br from-white/10 to-white/5 border border-primary/30"
                                }`}
                            >
                              {message.role === "user" ? (
                                <User className="w-4 h-4 text-white" />
                              ) : (
                                <Sparkles className="w-4 h-4 text-primary" />
                              )}
                            </div>
                          </div>

                          {/* Message bubble */}
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 ${message.role === "user"
                              ? "backdrop-blur-xl bg-cyan-500/20 border border-cyan-400/30 text-white rounded-tr-sm"
                              : "bg-white/10 text-white/90 rounded-tl-sm border border-white/10"
                              }`}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          </div>
                        </div>
                      ))}

                      {/* Loading indicator */}
                      {isLoading && messages[messages.length - 1]?.content === "" && (
                        <div className="flex gap-3 animate-fade-in">
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary/30 rounded-full blur-md animate-pulse" />
                            <div className="relative w-8 h-8 rounded-full bg-white/10 border border-primary/30 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                            </div>
                          </div>
                          <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 border border-white/10">
                            <div className="flex gap-1.5">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                              <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input area */}
                  <div className="relative p-4 border-t border-white/10 bg-black/50">
                    {/* Top action buttons */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
                      <button
                        onClick={() => setShowTextMode(false)}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-xs font-orbitron tracking-wide transition-all duration-300"
                      >
                        <Sparkles className="w-3.5 h-3.5 group-hover:animate-pulse" />
                        <span>Menu</span>
                      </button>
                      <button
                        onClick={openCalendly}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 text-primary hover:text-white text-xs font-orbitron tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                      >
                        <Calendar className="w-3.5 h-3.5 group-hover:animate-pulse" />
                        <span>Book Call</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1 group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-red-600 to-primary rounded-xl opacity-0 group-focus-within:opacity-50 blur-sm transition-opacity duration-300" />
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything..."
                          disabled={isLoading}
                          className="relative flex-1 bg-white/10 border-white/20 rounded-xl focus:border-primary/50 text-white placeholder:text-white/40 transition-all"
                        />
                      </div>

                      <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="shrink-0 w-11 h-11 rounded-xl backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-cyan-400/50 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/30 hover:scale-105 transition-all duration-300"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Live Chat Mode Interface */}
              {showLiveChatMode && !isVoiceMode && (
                <>
                  {/* Header with Andrius info */}
                  <div className="px-4 py-3 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-red-600/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                        <img 
                          src="/andrius-avatar.png" 
                          alt="Andrius Digital"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-orbitron font-bold text-white text-sm">Andrius Digital</p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <p className="text-xs text-green-400">Online - Usually replies instantly</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {/* Welcome message */}
                      {messages.length === 1 && (
                        <div className="flex gap-3 animate-fade-in">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30 flex-shrink-0">
                            <img 
                              src="/andrius-avatar.png" 
                              alt="Andrius"
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>
                          <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 border border-white/10">
                            <p className="text-sm text-white/90">Hi! 👋 Messages here go straight to my phone. I'm usually available and will reply within minutes!</p>
                          </div>
                        </div>
                      )}

                      {messages.slice(1).map((message, index) => {
                        // Check if this is a status message (Delivered/Seen)
                        const isStatusMessage = message.content.startsWith("✓");
                        
                        if (isStatusMessage) {
                          return (
                            <div key={index} className="flex justify-end animate-fade-in">
                              <p className={`text-xs ${message.content.includes("✓✓") ? "text-blue-400" : "text-white/40"}`}>
                                {message.content}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={index}
                            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""} animate-fade-in`}
                          >
                            <div className="relative flex-shrink-0">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${message.role === "user"
                                  ? "backdrop-blur-xl bg-cyan-500/20 border border-cyan-400/30"
                                  : "bg-primary/20 border border-primary/30"
                                  }`}
                              >
                                {message.role === "user" ? (
                                  <User className="w-4 h-4 text-white" />
                                ) : (
                                  <img 
                                    src="/andrius-avatar.png" 
                                    alt="Andrius"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />
                                )}
                              </div>
                            </div>
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-3 ${message.role === "user"
                                ? "backdrop-blur-xl bg-cyan-500/20 border border-cyan-400/30 text-white rounded-tr-sm"
                                : "bg-white/10 text-white/90 rounded-tl-sm border border-white/10"
                                }`}
                            >
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            </div>
                          </div>
                        );
                      })}

                      {isLoading && (
                        <div className="flex gap-3 animate-fade-in">
                          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          </div>
                          <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 border border-white/10">
                            <p className="text-sm text-white/60">Sending...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input area */}
                  <div className="relative p-4 border-t border-white/10 bg-black/50">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
                      <button
                        onClick={() => setShowLiveChatMode(false)}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-xs font-orbitron tracking-wide transition-all duration-300"
                      >
                        <Sparkles className="w-3.5 h-3.5 group-hover:animate-pulse" />
                        <span>Menu</span>
                      </button>
                      <button
                        onClick={openCalendly}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 text-primary hover:text-white text-xs font-orbitron tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                      >
                        <Calendar className="w-3.5 h-3.5 group-hover:animate-pulse" />
                        <span>Book Call</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1 group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-red-600 to-primary rounded-xl opacity-0 group-focus-within:opacity-50 blur-sm transition-opacity duration-300" />
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your message..."
                          disabled={isLoading}
                          className="relative flex-1 bg-white/10 border-white/20 rounded-xl focus:border-primary/50 text-white placeholder:text-white/40 transition-all"
                        />
                      </div>

                      <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="shrink-0 w-11 h-11 rounded-xl backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-cyan-400/50 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/30 hover:scale-105 transition-all duration-300"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
