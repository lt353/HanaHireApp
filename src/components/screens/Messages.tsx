import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, Lock, ChevronLeft, Building2, User, Mail, LayoutDashboard } from "lucide-react";
import { Button } from "../ui/Button";
import { ViewType } from "../../App";
import { formatDistanceToNow } from "date-fns";

export type ConversationRow = {
  id: string;
  employer_id: number;
  candidate_id: number;
  job_id?: number | null;
  jobTitle?: string | null;
  otherPartyName: string;
  otherPartySubtitle?: string;
  lastMessagePreview: string | null;
  lastMessageSubject?: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  canRead: boolean;
};

export type MessageRow = {
  id: number;
  conversation_id: string;
  from_email: string;
  to_email: string;
  body: string;
  sent_at: string;
  is_read: boolean;
  read_at: string | null;
};

interface MessagesProps {
  userRole: "seeker" | "employer";
  userProfile: { email?: string; employerId?: number; candidateId?: number; name?: string; businessName?: string } | null;
  isLoggedIn: boolean;
  conversations: ConversationRow[];
  selectedConversationId: string | null;
  messages: MessageRow[];
  canReadSelected: boolean;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  onSelectConversation: (id: string) => void;
  onBackFromThread: () => void;
  onSendMessage: (body: string) => Promise<void>;
  onMarkAsRead: (conversationId: string) => void;
  onShowAuth: (mode: "login" | "signup") => void;
  onNavigate: (view: ViewType) => void;
  initialDraft?: string | null;
  onInitialDraftUsed?: () => void;
}

export const Messages: React.FC<MessagesProps> = ({
  userRole,
  userProfile,
  isLoggedIn,
  conversations,
  selectedConversationId,
  messages,
  canReadSelected,
  isLoadingConversations,
  isLoadingMessages,
  onSelectConversation,
  onBackFromThread,
  onSendMessage,
  onMarkAsRead,
  onShowAuth,
  onNavigate,
  initialDraft,
  onInitialDraftUsed,
}) => {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConversationId && canReadSelected) {
      onMarkAsRead(selectedConversationId);
    }
  }, [selectedConversationId, canReadSelected, onMarkAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // If there's an initialDraft (eg from a quick template) and the composer is empty,
  // pre-fill the draft once and notify the parent so it can clear.
  useEffect(() => {
    if (initialDraft && !draft) {
      setDraft(initialDraft);
      onInitialDraftUsed?.();
    }
  }, [initialDraft, draft, onInitialDraftUsed]);

  const selectedConv = selectedConversationId
    ? conversations.find((c) => c.id === selectedConversationId)
    : null;

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await onSendMessage(body);
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
      >
        <div className="p-8 sm:p-12 bg-white border border-gray-100 rounded-[2rem] shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#148F8B]/10 flex items-center justify-center mx-auto">
            <MessageSquare size={32} className="text-[#148F8B]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">Messages</h2>
          <p className="text-gray-600 font-medium">
            Log in to see your conversations with {userRole === "seeker" ? "employers" : "candidates"}.
          </p>
          <Button
            className="bg-[#148F8B] hover:bg-[#148F8B]/90 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest"
            onClick={() => onShowAuth("login")}
          >
            Log In
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 sm:pb-12"
    >
      <div className="flex flex-col sm:flex-row gap-0 h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] min-h-[400px] bg-white border border-gray-100 rounded-[2rem] shadow-xl overflow-hidden">
        {/* Conversation list */}
        <div
          className={`w-full sm:w-80 sm:border-r border-gray-100 flex flex-col shrink-0 ${
            selectedConversationId ? "hidden sm:flex" : ""
          }`}
        >
          <div className="p-4 sm:p-5 border-b border-gray-100 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                <MessageSquare size={22} className="text-[#148F8B]" />
                Messages
              </h2>
              <button
                type="button"
                onClick={() => onNavigate(userRole === "seeker" ? "seeker" : "employer")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-[#148F8B]/30 hover:text-[#148F8B] transition-all text-xs font-black uppercase tracking-widest text-gray-600 shrink-0"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {userRole === "seeker"
                ? "Conversations with employers you’ve applied to"
                : "Conversations with candidates you’ve unlocked"}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="p-6 text-center text-gray-400 font-medium">Loading…</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm font-medium">
                No conversations yet.{" "}
                {userRole === "seeker"
                  ? "Apply to a job to message that employer."
                  : "Unlock a candidate to start messaging."}
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onSelectConversation(c.id)}
                      className={`w-full text-left px-4 py-4 sm:py-3 hover:bg-gray-50 transition-colors ${
                        selectedConversationId === c.id ? "bg-[#148F8B]/5 border-l-2 sm:border-l-4 border-[#148F8B]" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                          {userRole === "employer" ? (
                            <User size={18} className="text-gray-500" />
                          ) : (
                            <Building2 size={18} className="text-gray-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-sm text-gray-900 truncate">
                              {c.otherPartyName}
                            </span>
                            {c.unreadCount > 0 && (
                              <span className="shrink-0 w-5 h-5 rounded-full bg-[#A63F8E] text-white text-[10px] font-black flex items-center justify-center">
                                {c.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {c.canRead
                              ? c.lastMessagePreview || "No messages yet"
                              : `${c.unreadCount > 0 ? "New message" : "Message"} — unlock to read`}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Thread panel */}
        <div className={`flex-1 flex flex-col min-w-0 ${!selectedConversationId ? "hidden sm:flex" : ""}`}>
          <AnimatePresence mode="wait">
            {!selectedConversationId ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center p-8 text-center text-gray-400"
              >
                <div>
                  <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Select a conversation or apply/unlock to start messaging.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={selectedConversationId}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex flex-col flex-1 min-h-0"
              >
                {/* Thread header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100 shrink-0">
                  <button
                    type="button"
                    onClick={onBackFromThread}
                    className="sm:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100"
                    aria-label="Back to list"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    {userRole === "employer" ? (
                      <User size={18} className="text-gray-500" />
                    ) : (
                      <Building2 size={18} className="text-gray-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-gray-900 truncate">
                      {selectedConv?.otherPartyName ?? "Conversation"}
                    </h3>
                    {selectedConv?.jobTitle ? (
                      <p className="text-xs text-[#148F8B] font-bold truncate">Re: {selectedConv.jobTitle}</p>
                    ) : selectedConv?.otherPartySubtitle ? (
                      <p className="text-xs text-gray-500 truncate">{selectedConv.otherPartySubtitle}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate(userRole === "seeker" ? "seeker" : "employer")}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-600 shrink-0"
                    aria-label="Go to dashboard"
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </button>
                </div>

                {/* Locked state */}
                {!canReadSelected && selectedConv && (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                      <Lock size={28} className="text-amber-600" />
                    </div>
                    <h4 className="text-lg font-black text-gray-900 mb-2">Messages are locked</h4>
                    <p className="text-sm text-gray-600 max-w-sm mb-6">
                      {userRole === "seeker"
                        ? "Apply to this employer’s job to read and reply to messages."
                        : "Unlock this candidate to read and reply to messages."}
                    </p>
                    <p className="text-xs text-gray-500">
                      You have {selectedConv.unreadCount > 0 ? selectedConv.unreadCount : "a"} message
                      {selectedConv.unreadCount !== 1 ? "s" : ""} in this conversation.
                    </p>
                    {userRole === "seeker" && (
                      <Button
                        className="mt-6 bg-[#148F8B] hover:bg-[#148F8B]/90 text-white rounded-xl px-6 py-3 font-black uppercase tracking-widest"
                        onClick={() => onNavigate("seeker")}
                      >
                        Go to My Applications
                      </Button>
                    )}
                    {userRole === "employer" && (
                      <Button
                        className="mt-6 bg-[#A63F8E] hover:bg-[#A63F8E]/90 text-white rounded-xl px-6 py-3 font-black uppercase tracking-widest"
                        onClick={() => onNavigate("candidates")}
                      >
                        Browse Talent
                      </Button>
                    )}
                  </div>
                )}

                {/* Messages + composer when unlocked */}
                {canReadSelected && (
                  <>
                    <div
                      ref={scrollContainerRef}
                      className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
                    >
                      {isLoadingMessages ? (
                        <div className="flex justify-center py-8 text-gray-400">Loading messages…</div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-sm">
                          <Mail size={32} className="mb-2 opacity-50" />
                          <p>No messages yet. Say hello!</p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isMe = msg.from_email.toLowerCase() === (userProfile?.email ?? "").toLowerCase();
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                  isMe
                                    ? "bg-[#148F8B] text-white rounded-br-md"
                                    : "bg-gray-100 text-gray-900 rounded-bl-md"
                                }`}
                              >
                                <p className="text-sm font-medium whitespace-pre-wrap break-words">{msg.body}</p>
                                <p
                                  className={`text-[10px] mt-1 ${
                                    isMe ? "text-white/80" : "text-gray-500"
                                  }`}
                                >
                                  {formatDistanceToNow(new Date(msg.sent_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-gray-100 shrink-0">
                      <div className="flex gap-2">
                        <textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSend();
                            }
                          }}
                          placeholder="Type a message…"
                          rows={2}
                          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium resize-none focus:ring-2 focus:ring-[#148F8B]/20 focus:border-[#148F8B] outline-none"
                        />
                        <Button
                          onClick={handleSend}
                          disabled={!draft.trim() || sending}
                          className="shrink-0 rounded-xl bg-[#148F8B] hover:bg-[#148F8B]/90 text-white px-4 flex items-center gap-2"
                        >
                          <Send size={18} />
                          Send
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
