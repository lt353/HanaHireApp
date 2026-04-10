import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	MessageSquare,
	Send,
	ChevronLeft,
	Building2,
	User,
	Mail,
	LayoutDashboard,
	Check,
	CheckCheck,
	Mic,
	Pencil,
	Trash2,
} from "lucide-react";
import { Button } from "../ui/Button";
import { ViewType } from "../../App";
import { format } from "date-fns";
import { parseUtcTimestamp } from "../../utils/formatters";
import { cn } from "../ui/utils";
import styles from "./MessageBubble.module.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Web Speech API types (not in all TS libs)
interface SpeechRecognitionInstance {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	onresult: ((event: SpeechRecognitionEvent) => void) | null;
	onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
	onend: (() => void) | null;
	start: () => void;
	stop: () => void;
	abort: () => void;
}
interface SpeechRecognitionEvent {
	resultIndex: number;
	results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent {
	error: string;
}
interface SpeechRecognitionResultList {
	length: number;
	item(index: number): SpeechRecognitionResult;
	[index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
	length: number;
	item(index: number): SpeechRecognitionAlternative;
	[index: number]: SpeechRecognitionAlternative;
	isFinal: boolean;
}
interface SpeechRecognitionAlternative {
	transcript: string;
	confidence: number;
}
declare global {
	interface Window {
		SpeechRecognition?: new () => SpeechRecognitionInstance;
		webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
	}
}

export type ConversationRow = {
	id: string;
	employer_id: number;
	candidate_id: number;
	job_id?: number | null;
	jobTitle?: string | null;
	otherPartyName: string;
	otherPartySubtitle?: string;
	/** Logo URL (employer) or video thumbnail URL (candidate) for the other party. */
	otherPartyAvatarUrl?: string | null;
	/** Fallback initials when no avatar (e.g. "AC" for company, "JD" for person). */
	otherPartyInitials?: string;
	lastMessagePreview: string | null;
	lastMessageSubject?: string | null;
	lastMessageAt: string | null;
	unreadCount: number;
	canRead: boolean;
};

function OtherPartyAvatar({
	avatarUrl,
	initials,
	fallbackIcon,
	className = "w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden",
}: {
	avatarUrl?: string | null;
	initials?: string;
	fallbackIcon: React.ReactNode;
	className?: string;
}) {
	if (avatarUrl?.trim()) {
		return (
			<div className={className}>
				<img src={avatarUrl} alt="" className="w-full h-full object-cover" />
			</div>
		);
	}
	if (initials?.trim()) {
		return (
			<div
				className={`${className} bg-[#148F8B]/10 text-[#148F8B] font-black text-sm`}
			>
				{initials.slice(0, 2).toUpperCase()}
			</div>
		);
	}
	return <div className={className}>{fallbackIcon}</div>;
}

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

/** Renders message body with markdown: **bold**, *italic*, ~~strikethrough~~, [text](url), bullet/numbered lists. */
function renderMessageBody(body: string, keyPrefix = "msg"): React.ReactNode {
	if (!body) return null;
	const lines = body.split("\n");
	const out: React.ReactNode[] = [];
	let keyIdx = 0;
	function renderInline(text: string): React.ReactNode {
		const parts: React.ReactNode[] = [];
		const re = /\*\*(.+?)\*\*|~~(.+?)~~|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)/g;
		let lastIndex = 0;
		let m;
		while ((m = re.exec(text)) !== null) {
			if (m.index > lastIndex) {
				parts.push(
					<span key={`${keyPrefix}-${keyIdx++}`}>
						{text.slice(lastIndex, m.index)}
					</span>,
				);
			}
			if (m[1] !== undefined) {
				parts.push(
					<strong key={`${keyPrefix}-${keyIdx++}`}>
						{renderInline(m[1])}
					</strong>,
				);
			} else if (m[2] !== undefined) {
				parts.push(
					<s key={`${keyPrefix}-${keyIdx++}`}>{renderInline(m[2])}</s>,
				);
			} else if (m[3] !== undefined) {
				parts.push(
					<em key={`${keyPrefix}-${keyIdx++}`}>{renderInline(m[3])}</em>,
				);
			} else if (m[4] !== undefined && m[5] !== undefined) {
				parts.push(
					<a
						key={`${keyPrefix}-${keyIdx++}`}
						href={m[5]}
						target="_blank"
						rel="noopener noreferrer"
						className="text-[#148F8B] underline font-medium"
					>
						{m[4]}
					</a>,
				);
			}
			lastIndex = re.lastIndex;
		}
		if (lastIndex < text.length) {
			parts.push(
				<span key={`${keyPrefix}-${keyIdx++}`}>{text.slice(lastIndex)}</span>,
			);
		}
		return parts.length <= 1 ? (parts[0] ?? null) : <>{parts}</>;
	}
	let i = 0;
	while (i < lines.length) {
		const line = lines[i];
		const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/);
		const numMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
		if (bulletMatch) {
			const listItems: React.ReactNode[] = [];
			while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
				listItems.push(
					<li key={`${keyPrefix}-li-${keyIdx++}`}>
						{renderInline(lines[i].replace(/^\s*[-*]\s+/, ""))}
					</li>,
				);
				i++;
			}
			out.push(
				<ul
					key={`${keyPrefix}-ul-${keyIdx++}`}
					className="list-disc pl-5 my-1 space-y-0.5"
				>
					{listItems}
				</ul>,
			);
			if (i < lines.length)
				out.push(<br key={`${keyPrefix}-br-${keyIdx++}`} />);
			continue;
		}
		if (numMatch) {
			const listItems: React.ReactNode[] = [];
			while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
				listItems.push(
					<li key={`${keyPrefix}-oli-${keyIdx++}`}>
						{renderInline(lines[i].replace(/^\s*\d+\.\s+/, ""))}
					</li>,
				);
				i++;
			}
			out.push(
				<ol
					key={`${keyPrefix}-ol-${keyIdx++}`}
					className="list-decimal pl-5 my-1 space-y-0.5"
				>
					{listItems}
				</ol>,
			);
			if (i < lines.length)
				out.push(<br key={`${keyPrefix}-br-${keyIdx++}`} />);
			continue;
		}
		out.push(
			<span key={`${keyPrefix}-${keyIdx++}`}>{renderInline(line)}</span>,
		);
		if (i < lines.length - 1)
			out.push(<br key={`${keyPrefix}-br-${keyIdx++}`} />);
		i++;
	}
	return out.length === 0 ? null : out.length === 1 ? out[0] : <>{out}</>;
}

/** Convert markdown to HTML for contenteditable (bold, italic, strikethrough, links, lists, newlines). */
function markdownToHtml(md: string): string {
	if (!md) return "";
	const escaped = md
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
	const lines = escaped.split("\n");
	const out: string[] = [];
	let i = 0;
	function inlineToHtml(s: string): string {
		let t = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
		t = t.replace(/~~(.+?)~~/g, "<s>$1</s>");
		t = t.replace(/\*([^*]+?)\*/g, "<em>$1</em>");
		t = t.replace(
			/\[([^\]]+)\]\(([^)]+)\)/g,
			'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
		);
		return t;
	}
	while (i < lines.length) {
		const line = lines[i];
		if (/^\s*[-*]\s+/.test(line)) {
			out.push("<ul>");
			while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
				out.push(
					"<li>" + inlineToHtml(lines[i].replace(/^\s*[-*]\s+/, "")) + "</li>",
				);
				i++;
			}
			out.push("</ul>");
			if (i < lines.length) out.push("<br>");
			continue;
		}
		if (/^\s*\d+\.\s+/.test(line)) {
			out.push("<ol>");
			while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
				out.push(
					"<li>" + inlineToHtml(lines[i].replace(/^\s*\d+\.\s+/, "")) + "</li>",
				);
				i++;
			}
			out.push("</ol>");
			if (i < lines.length) out.push("<br>");
			continue;
		}
		/* Wrap each line in <p> so Quill keeps paragraphs and Enter works correctly */
		out.push("<p>" + inlineToHtml(line) + "</p>");
		i++;
	}
	return out.join("");
}

/** Convert contenteditable HTML back to markdown (strong, em, s, br, ul, ol, li, a). */
function htmlToMarkdown(html: string): string {
	if (!html) return "";
	const div =
		typeof document !== "undefined" ? document.createElement("div") : null;
	if (!div) return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ");
	div.innerHTML = html;
	function walk(node: Node): string {
		if (node.nodeType === Node.TEXT_NODE)
			return (node.textContent ?? "").replace(/\u00A0/g, " ");
		if (node.nodeType !== Node.ELEMENT_NODE) return "";
		const el = node as Element;
		const tag = el.tagName.toLowerCase();
		const inner = Array.from(node.childNodes).map(walk).join("");
		if (tag === "br") return "\n";
		if (tag === "strong" || tag === "b") return `**${inner}**`;
		if (tag === "em" || tag === "i") return `*${inner}*`;
		if (tag === "s" || tag === "strike") return `~~${inner}~~`;
		if (tag === "a") {
			const href = (el.getAttribute("href") || "").trim();
			return href ? `[${inner}](${href})` : inner;
		}
		if (tag === "li") return inner;
		if (tag === "ul") {
			return Array.from(el.children)
				.map((child) =>
					child.tagName.toLowerCase() === "li"
						? "- " + walk(child)
						: walk(child),
				)
				.join("\n");
		}
		if (tag === "ol") {
			return Array.from(el.children)
				.map((child, idx) =>
					child.tagName.toLowerCase() === "li"
						? `${idx + 1}. ${walk(child)}`
						: walk(child),
				)
				.join("\n");
		}
		/* Quill uses <p> for paragraphs; preserve newlines so round-trip doesn't collapse lines */
		if (tag === "p" || tag === "div") return inner + "\n";
		return inner;
	}
	return Array.from(div.childNodes).map(walk).join("").trim();
}

interface MessagesProps {
	userRole: "seeker" | "employer";
	userProfile: {
		email?: string;
		employerId?: number;
		candidateId?: number;
		name?: string;
		businessName?: string;
	} | null;
	isLoggedIn: boolean;
	conversations: ConversationRow[];
	selectedConversationId: string | null;
	messages: MessageRow[];
	/** @deprecated Always readable; kept for API compatibility */
	canReadSelected?: boolean;
	isLoadingConversations: boolean;
	isLoadingMessages: boolean;
	onSelectConversation: (id: string) => void;
	onBackFromThread: () => void;
	onSendMessage: (body: string) => Promise<void>;
	onEditMessage?: (messageId: number, newBody: string) => Promise<void>;
	onDeleteMessage?: (messageId: number) => Promise<void>;
	onMarkAsRead: (conversationId: string) => void;
	onShowAuth: (mode: "login" | "signup") => void;
	onNavigate: (view: ViewType) => void;
	/** Employer: open candidate profile (e.g. to unlock) from thread header. */
	onOpenCandidateProfile?: (candidateId: number) => void;
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
	isLoadingConversations,
	isLoadingMessages,
	onSelectConversation,
	onBackFromThread,
	onSendMessage,
	onEditMessage,
	onDeleteMessage,
	onMarkAsRead,
	onShowAuth,
	onNavigate,
	onOpenCandidateProfile,
	initialDraft,
	onInitialDraftUsed,
}) => {
	const [draft, setDraft] = useState("");
	const [sending, setSending] = useState(false);
	const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
	const [editingBody, setEditingBody] = useState("");
	const [savingEdit, setSavingEdit] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const [speechError, setSpeechError] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

	const quillModules = React.useMemo(
		() => ({
			toolbar: [["bold", "italic", "underline", "strike"], ["link"]],
		}),
		[],
	);

	const SpeechRecognitionAPI =
		typeof window !== "undefined"
			? window.SpeechRecognition || window.webkitSpeechRecognition
			: undefined;
	const speechSupported = Boolean(SpeechRecognitionAPI);

	const startListening = () => {
		if (!SpeechRecognitionAPI || isListening) return;
		setSpeechError(null);
		try {
			const recognition =
				new SpeechRecognitionAPI() as SpeechRecognitionInstance;
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = "en-US";

			recognition.onresult = (event: SpeechRecognitionEvent) => {
				let finalTranscript = "";
				let interimTranscript = "";
				for (let i = event.resultIndex; i < event.results.length; i++) {
					const transcript = event.results[i][0].transcript;
					if (event.results[i].isFinal) {
						finalTranscript += transcript;
					} else {
						interimTranscript += transcript;
					}
				}
				if (finalTranscript) {
					const next = (
						draft ? `${draft} ${finalTranscript}` : finalTranscript
					).trim();
					setDraft(next);
				} else if (interimTranscript) {
					const next = (
						draft ? `${draft} ${interimTranscript}` : interimTranscript
					).trim();
					setDraft(next);
				}
			};

			recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
				if (event.error === "no-speech") return;
				if (event.error === "not-allowed") {
					setSpeechError("Microphone access denied.");
				} else {
					setSpeechError(event.error);
				}
				setIsListening(false);
			};

			recognition.onend = () => {
				setIsListening(false);
			};

			recognitionRef.current = recognition;
			recognition.start();
			setIsListening(true);
		} catch (err) {
			setSpeechError("Speech recognition not available.");
			setIsListening(false);
		}
	};

	const stopListening = () => {
		if (recognitionRef.current && isListening) {
			recognitionRef.current.stop();
			recognitionRef.current = null;
			setIsListening(false);
		}
	};

	useEffect(() => {
		return () => {
			if (recognitionRef.current) {
				try {
					recognitionRef.current.abort();
				} catch {
					/* ignore */
				}
				recognitionRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		if (selectedConversationId) {
			onMarkAsRead(selectedConversationId);
		}
	}, [selectedConversationId, onMarkAsRead]);

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
					<h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
						Messages
					</h2>
					<p className="text-gray-600 font-medium">
						Log in to see your conversations with{" "}
						{userRole === "seeker" ? "employers" : "candidates"}.
					</p>
					<Button
						className="bg-[#148F8B] hover:bg-[#A63F8E] text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest"
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
			<div className="flex flex-col sm:flex-row gap-0 h-[calc(100vh-11rem)] sm:h-[calc(100vh-10rem)] min-h-[400px] bg-white border border-gray-100 rounded-[2rem] shadow-xl overflow-hidden">
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
								onClick={() =>
									onNavigate(userRole === "seeker" ? "seeker" : "employer")
								}
								className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-[#148F8B]/30 hover:text-[#148F8B] transition-all text-xs font-black uppercase tracking-widest text-gray-600 shrink-0"
							>
								<LayoutDashboard size={16} />
								Dashboard
							</button>
						</div>
						<p className="text-xs text-gray-500 font-medium">
							{userRole === "seeker"
								? "Conversations with employers"
								: "Conversations with candidates"}
						</p>
					</div>
					<div className="flex-1 overflow-y-auto">
						{isLoadingConversations ? (
							<div className="p-6 text-center text-gray-400 font-medium">
								Loading…
							</div>
						) : conversations.length === 0 ? (
							<div className="p-6 text-center text-gray-500 text-sm font-medium">
								No conversations yet.{" "}
								{userRole === "seeker"
									? "Browse jobs or reply when an employer reaches out."
									: "Reach out from your dashboard or when someone applies."}
							</div>
						) : (
							<ul className="divide-y divide-gray-50">
								{conversations.map((c) => (
									<li key={c.id}>
										<button
											type="button"
											onClick={() => onSelectConversation(c.id)}
											className={`w-full text-left px-4 py-4 sm:py-3 hover:bg-gray-50 transition-colors ${
												selectedConversationId === c.id
													? "bg-[#148F8B]/5 border-l-2 sm:border-l-4 border-[#148F8B]"
													: ""
											}`}
										>
											<div className="flex items-start gap-3">
												<OtherPartyAvatar
													avatarUrl={c.otherPartyAvatarUrl}
													initials={c.otherPartyInitials}
													fallbackIcon={
														userRole === "employer" ? (
															<User size={18} className="text-gray-500" />
														) : (
															<Building2 size={18} className="text-gray-500" />
														)
													}
												/>
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
														{c.lastMessagePreview || "No messages yet"}
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
				<div
					className={`flex-1 flex flex-col min-w-0 ${!selectedConversationId ? "hidden sm:flex" : ""}`}
				>
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
									<MessageSquare
										size={48}
										className="mx-auto mb-3 opacity-50"
									/>
									<p className="font-medium">
										Select a conversation to read and reply.
									</p>
								</div>
							</motion.div>
						) : (
							<motion.div
								key={selectedConversationId}
								initial={{ opacity: 0, x: 8 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -8 }}
								className="flex flex-col flex-1 min-h-0 overflow-hidden"
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
									{userRole === "employer" &&
									onOpenCandidateProfile &&
									selectedConv?.candidate_id != null ? (
										<button
											type="button"
											onClick={() =>
												onOpenCandidateProfile(
													Number(selectedConv.candidate_id),
												)
											}
											className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-xl -m-2 p-2 hover:bg-gray-50 transition-colors"
											title="View profile and unlock"
										>
											<OtherPartyAvatar
												avatarUrl={selectedConv?.otherPartyAvatarUrl}
												initials={selectedConv?.otherPartyInitials}
												fallbackIcon={
													<User size={18} className="text-gray-500" />
												}
											/>
											<div className="min-w-0 flex-1">
												<h3 className="font-black text-gray-900 truncate">
													{selectedConv?.otherPartyName ?? "Conversation"}
												</h3>
												{selectedConv?.jobTitle ? (
													<p className="text-xs text-[#148F8B] font-bold truncate">
														Re: {selectedConv.jobTitle}
													</p>
												) : selectedConv?.otherPartySubtitle ? (
													<p className="text-xs text-gray-500 truncate">
														{selectedConv.otherPartySubtitle}
													</p>
												) : (
													<p className="text-[10px] font-black uppercase tracking-widest text-[#A63F8E]">
														Tap to view profile · unlock to connect
													</p>
												)}
											</div>
										</button>
									) : (
										<>
											<OtherPartyAvatar
												avatarUrl={selectedConv?.otherPartyAvatarUrl}
												initials={selectedConv?.otherPartyInitials}
												fallbackIcon={
													userRole === "employer" ? (
														<User size={18} className="text-gray-500" />
													) : (
														<Building2 size={18} className="text-gray-500" />
													)
												}
											/>
											<div className="min-w-0 flex-1">
												<h3 className="font-black text-gray-900 truncate">
													{selectedConv?.otherPartyName ?? "Conversation"}
												</h3>
												{selectedConv?.jobTitle ? (
													<p className="text-xs text-[#148F8B] font-bold truncate">
														Re: {selectedConv.jobTitle}
													</p>
												) : selectedConv?.otherPartySubtitle ? (
													<p className="text-xs text-gray-500 truncate">
														{selectedConv.otherPartySubtitle}
													</p>
												) : null}
											</div>
										</>
									)}
									<button
										type="button"
										onClick={() =>
											onNavigate(userRole === "seeker" ? "seeker" : "employer")
										}
										className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-600 shrink-0"
										aria-label="Go to dashboard"
									>
										<LayoutDashboard size={14} />
										Dashboard
									</button>
								</div>

								<div className="flex flex-col flex-1 min-h-0 overflow-hidden">
										<div
											ref={scrollContainerRef}
											className={cn(
												"flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-4 min-h-0 flex flex-col",
												styles.bubbleList,
											)}
										>
											{isLoadingMessages ? (
												<div className="flex justify-center py-8 text-gray-400">
													Loading messages…
												</div>
											) : messages.length === 0 ? (
												<div className="flex flex-col items-center justify-center py-12 text-gray-500 text-sm">
													<Mail size={32} className="mb-2 opacity-50" />
													<p>No messages yet. Say hello!</p>
												</div>
											) : (
												messages.map((msg, i) => {
													const isMe =
														msg.from_email.toLowerCase() ===
														(userProfile?.email ?? "").toLowerCase();
													// Sender (who wrote this message) = wine pink, receiver (other party’s messages) = aqua; tail points toward author
													const noTail =
														i < messages.length - 1 &&
														messages[i + 1].from_email.toLowerCase() ===
															msg.from_email.toLowerCase();
													return (
														<div
															key={msg.id}
															style={{
																display: "flex",
																flexDirection: "column",
																alignItems: isMe ? "flex-end" : "flex-start",
																width: "100%",
															}}
														>
															<div
																className={cn(
																	styles.shared,
																	isMe ? styles.sent : styles.received,
																	noTail && styles.noTail,
																	"text-gray-900",
																)}
																style={{
																	maxWidth:
																		editingMessageId === msg.id
																			? "100%"
																			: "78%",
																	width:
																		editingMessageId === msg.id
																			? "100%"
																			: undefined,
																	minWidth: 0,
																}}
															>
																{editingMessageId === msg.id &&
																isMe &&
																onEditMessage ? (
																	<div className="space-y-2 w-full min-w-0">
																		<textarea
																			value={editingBody}
																			onChange={(e) =>
																				setEditingBody(e.target.value)
																			}
																			onKeyDown={(e) => {
																				if (e.key === "Escape") {
																					setEditingMessageId(null);
																					setEditingBody("");
																				}
																			}}
																			rows={5}
																			className="w-full min-h-[120px] rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 resize-y outline-none focus:ring-2 focus:ring-[#148F8B]/30"
																			autoFocus
																		/>
																		<div className="flex items-center gap-2">
																			<button
																				type="button"
																				onClick={async () => {
																					if (!editingBody.trim() || savingEdit)
																						return;
																					setSavingEdit(true);
																					try {
																						await onEditMessage(
																							msg.id,
																							editingBody,
																						);
																						setEditingMessageId(null);
																						setEditingBody("");
																					} finally {
																						setSavingEdit(false);
																					}
																				}}
																				disabled={
																					savingEdit || !editingBody.trim()
																				}
																				className="px-3 py-1.5 rounded-lg bg-[#148F8B] text-white text-xs font-bold hover:bg-[#A63F8E] disabled:opacity-50"
																			>
																				{savingEdit ? "Saving…" : "Save"}
																			</button>
																			<button
																				type="button"
																				onClick={() => {
																					setEditingMessageId(null);
																					setEditingBody("");
																				}}
																				className="px-3 py-1.5 rounded-lg bg-white/80 text-gray-700 text-xs font-bold hover:bg-white"
																			>
																				Cancel
																			</button>
																		</div>
																	</div>
																) : (
																	<>
																		<p
																			className="text-sm font-medium"
																			style={{
																				whiteSpace: "pre-wrap",
																				wordBreak: "break-word",
																			}}
																		>
																			{renderMessageBody(
																				msg.body,
																				`b-${msg.id}`,
																			)}
																		</p>
																		<div className="flex flex-wrap items-center gap-x-4 gap-y-0 mt-2 text-gray-800">
																			<span
																				className="text-[10px]"
																				title={
																					parseUtcTimestamp(
																						msg.sent_at,
																					)?.toISOString() ?? msg.sent_at
																				}
																			>
																				{format(
																					parseUtcTimestamp(msg.sent_at) ??
																						new Date(0),
																					"MMM d, h:mm a",
																				)}
																			</span>
																			{isMe && (
																				<span className="flex items-center gap-0.5 text-[10px] ml-2">
																					{msg.is_read ? (
																						<>
																							<CheckCheck
																								size={12}
																								aria-hidden
																							/>
																							<span>Read </span>
																							{msg.read_at && (
																								<span
																									title={
																										parseUtcTimestamp(
																											msg.read_at,
																										)?.toISOString() ??
																										msg.read_at
																									}
																								>
																									{" \u00A0"}&middot;{" "}
																									{format(
																										parseUtcTimestamp(
																											msg.read_at,
																										) ?? new Date(0),
																										"h:mm a",
																									)}
																								</span>
																							)}
																						</>
																					) : (
																						<>
																							<Check size={12} aria-hidden />
																							<span>Sent</span>
																						</>
																					)}
																				</span>
																			)}
																			{isMe && onEditMessage && (
																				<button
																					type="button"
																					onClick={() => {
																						setEditingMessageId(msg.id);
																						setEditingBody(msg.body);
																					}}
																					className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1e40af] hover:text-[#1e3a8a] hover:underline ml-2"
																					aria-label="Edit message"
																				>
																					<Pencil size={10} aria-hidden /> Edit
																				</button>
																			)}
																			{isMe &&
																				onDeleteMessage &&
																				(() => {
																					const sentAt = parseUtcTimestamp(
																						msg.sent_at,
																					);
																					const hoursAgo = sentAt
																						? (Date.now() - sentAt.getTime()) /
																							(60 * 60 * 1000)
																						: 0;
																					const isRecent = hoursAgo <= 24;
																					return isRecent ? (
																						<button
																							type="button"
																							onClick={() => {
																								if (
																									window.confirm(
																										"Delete this message? This cannot be undone.",
																									)
																								) {
																									onDeleteMessage(msg.id);
																								}
																							}}
																							className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-red-600 hover:text-red-800 hover:underline ml-2"
																							aria-label="Delete message"
																						>
																							<Trash2 size={15} aria-hidden />
																						</button>
																					) : null;
																				})()}
																		</div>
																	</>
																)}
															</div>
														</div>
													);
												})
											)}
											<div ref={messagesEndRef} />
										</div>

										<div className="p-4 border-t border-gray-100 shrink-0 space-y-1">
											{speechError && (
												<p className="text-xs text-red-600 font-medium">
													{speechError}
												</p>
											)}
											<div className="flex gap-3 items-end">
												<div className="flex-1 flex flex-col min-w-0 messages-composer-quill">
													<ReactQuill
														theme="snow"
														value={draft ? markdownToHtml(draft) : ""}
														onChange={(content) =>
															setDraft(htmlToMarkdown(content || ""))
														}
														modules={quillModules}
														placeholder="Type a message…"
														className="rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[#148F8B]/20 focus-within:border-[#148F8B] bg-white"
													/>
												</div>
												{speechSupported && (
													<button
														type="button"
														onClick={
															isListening ? stopListening : startListening
														}
														className="shrink-0 rounded-xl flex items-center justify-center w-12 min-h-[52px] max-h-[52px] border border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all"
														style={{ height: 52 }}
														title={
															isListening ? "Stop voice input" : "Voice input"
														}
														aria-label={
															isListening
																? "Stop voice input"
																: "Start voice input"
														}
													>
														{isListening ? (
															<span
																className="rounded-sm shrink-0"
																style={{
																	width: 14,
																	height: 14,
																	backgroundColor: "#ef4444",
																}}
																aria-hidden
															/>
														) : (
															<Mic size={20} className="text-gray-900" />
														)}
													</button>
												)}
												<Button
													onClick={handleSend}
													disabled={!draft.trim() || sending}
													className="shrink-0 rounded-xl min-h-[52px] max-h-[52px] bg-[#148F8B] hover:bg-[#A63F8E] text-white px-4 flex items-center justify-center gap-2"
													style={{ height: 52 }}
												>
													<Send size={18} />
													Send
												</Button>
											</div>
										</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</motion.div>
	);
};
