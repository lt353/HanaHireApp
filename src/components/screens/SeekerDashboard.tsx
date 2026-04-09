import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import {
	Play,
	Video,
	Settings as SettingsIcon,
	Users,
	Edit3,
	LogIn,
	LogOut,
	Briefcase,
	MapPin,
	DollarSign,
	Building2,
	ExternalLink,
	BarChart3,
	AlertTriangle,
	Trash2,
	Clock,
	MessageSquare,
} from "lucide-react";
import { Button } from "../ui/Button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ViewType } from "../../App";
import { deleteCandidate } from "../../utils/deleteCandidate";

interface SeekerDashboardProps {
	isLoggedIn: boolean;
	userProfile?: {
		candidateId?: string;
		video_url?: string;
		video_thumbnail_url?: string;
		videoUrl?: string;
		videoThumbnailUrl?: string;
		name?: string;
		location?: string;
		skills?: string[];
		preferredJobCategories?: string[];
		industries?: string[];
		[key: string]: any;
	};
	onNavigate: (view: ViewType) => void;
	onShowMedia: () => void;
	onShowVisibility: () => void;
	onShowAuth: (mode: "login" | "signup") => void;
	onLogout: () => void;
	unlockedJobs?: any[];
	applications?: any[];
	profileViewsCount?: number;
	onSelectJob?: (job: any) => void;
	onAnswerQuestions?: (job: any) => void;
	applicationCount?: number;
	onOpenMessageWithEmployer?: (employerId: number) => void;
	jobsFromConversations?: any[];
	conversationsByJobId?: Record<string | number, any>;
	onSelectConversation?: (conversationId: string) => void;
}

export const SeekerDashboard: React.FC<SeekerDashboardProps> = ({
	isLoggedIn,
	userProfile,
	onNavigate,
	onShowMedia,
	onShowVisibility,
	onShowAuth,
	onLogout,
	unlockedJobs,
	applications = [],
	profileViewsCount = 0,
	onSelectJob,
	onAnswerQuestions,
	applicationCount = 0,
	onOpenMessageWithEmployer,
	jobsFromConversations = [],
	conversationsByJobId = {},
	onSelectConversation,
}) => {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [showVideoPlayer, setShowVideoPlayer] = useState(false);

	const handleDeleteAccount = async () => {
		console.log("handleDeleteAccount userProfile:", userProfile);
		if (!userProfile) return;
		setIsDeleting(true);
		setDeleteError(null);
		const { error } = await deleteCandidate(
			Number(userProfile.candidateId),
			userProfile.video_url ?? userProfile.videoUrl,
			userProfile.video_thumbnail_url ?? userProfile.videoThumbnailUrl,
		);
		setIsDeleting(false);
		if (error) {
			setDeleteError(error);
			return;
		}
		setShowDeleteConfirm(false);
		onLogout();
	};

	const getMatchMeta = (job: any) => {
		const preferredCategories: string[] =
			userProfile?.preferredJobCategories || [];
		const interestedIndustries: string[] = userProfile?.industries || [];

		const hasCategoryMatch =
			job?.job_category && preferredCategories.includes(job.job_category);
		const hasIndustryMatch =
			job?.company_industry &&
			interestedIndustries.includes(job.company_industry);

		if (hasCategoryMatch) {
			return { label: "Strong Match", tone: "strong" as const };
		}
		if (hasIndustryMatch) {
			return { label: "Industry Match", tone: "industry" as const };
		}
		return null;
	};

	const STATUS_CONFIG: Record<
		string,
		{ bg: string; text: string; label: string }
	> = {
		pending: {
			bg: "bg-[#148F8B]/10",
			text: "text-[#148F8B]",
			label: "Pending",
		},
		reviewed: { bg: "bg-amber-50", text: "text-amber-700", label: "Reviewed" },
		shortlisted: {
			bg: "bg-[#A63F8E]/10",
			text: "text-[#A63F8E]",
			label: "Shortlisted",
		},
		rejected: {
			bg: "bg-gray-100",
			text: "text-gray-500",
			label: "Not Selected",
		},
		hired: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Hired" },
	};

	const parseAppTimestamp = (value: string | null | undefined) => {
		if (!value) return null;
		const normalized = /[zZ]|[+-]\d{2}:\d{2}$/.test(value)
			? value
			: `${value.replace(" ", "T")}Z`;
		const parsed = new Date(normalized);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	};

	const toAgo = (iso: string | null | undefined) => {
		const parsed = parseAppTimestamp(iso);
		if (!parsed) return null;
		try {
			return formatDistanceToNow(parsed, { addSuffix: true });
		} catch {
			return null;
		}
	};

	const applicationViewsCount = applications.filter(
		(application) => !!application.reviewed_at,
	).length;
	const shortlistedCount = applications.filter(
		(application) => application.status === "shortlisted",
	).length;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 space-y-12 sm:space-y-16"
		>
			{/* Browse anonymously banner */}
			{!isLoggedIn && (
				<div className="p-6 sm:p-8 bg-gradient-to-r from-[#148F8B]/5 to-[#780262]/5 rounded-[2rem] sm:rounded-[3rem] border border-[#148F8B]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
					<div className="space-y-2 flex-1">
						<h3 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
							Browse Jobs Anonymously
						</h3>
						<p className="text-sm sm:text-base text-gray-600 font-medium">
							No sign-up required to explore. Create an account to save your
							info for future applications.
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
						<Button
							variant="outline"
							className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl border-gray-200 bg-white whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-200"
							onClick={() => onShowAuth("login")}
						>
							<LogIn size={20} /> Log In
						</Button>
						<Button
							className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-200"
							onClick={() => onShowAuth("signup")}
						>
							Sign Up
						</Button>
					</div>
				</div>
			)}

			<div className="flex flex-col justify-between items-start gap-3 sm:gap-4">
				<div className="space-y-3 sm:space-y-4">
					<h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none">
						Seeker Hub
					</h2>
					<p className="text-lg sm:text-xl md:text-2xl text-gray-500 font-medium">
						{isLoggedIn
							? `Welcome back${userProfile?.name ? `, ${userProfile.name}` : ""}. Manage your profile and track activity.`
							: "Browse jobs and get started when ready."}
					</p>
				</div>
				<div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-3 w-full">
					<Button
						className="h-10 sm:h-12 md:h-11 px-4 sm:px-6 md:px-5 rounded-[1.25rem] sm:rounded-[1.5rem] shadow-xl shadow-[#780262]/20 text-sm sm:text-base md:text-sm whitespace-nowrap bg-[#780262] hover:bg-[#780262]/90 text-white hover:scale-105 active:scale-95 transition-all duration-200"
						onClick={() => onNavigate("jobs")}
					>
						<Briefcase size={18} className="sm:w-5 sm:h-5 md:w-4 md:h-4" />{" "}
						Browse Jobs
					</Button>
					{isLoggedIn && (
						<Button
							variant="outline"
							className="h-10 sm:h-12 md:h-11 px-4 sm:px-5 md:px-4 rounded-[1.25rem] sm:rounded-[1.5rem] border-gray-200 bg-white text-xs sm:text-sm md:text-xs whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-200"
							onClick={onLogout}
						>
							<LogOut size={16} className="sm:w-4 sm:h-4 md:w-3.5 md:h-3.5" />{" "}
							Log Out
						</Button>
					)}
				</div>
			</div>

			{/* Employer Interest & Messages — always shown when logged in */}
			{isLoggedIn &&
				(() => {
					const totalSectionUnread = jobsFromConversations.reduce(
						(sum, job) =>
							sum +
							((conversationsByJobId[job.id]?.unreadCount ?? 0) > 0 ? 1 : 0),
						0,
					);
					return (
						<div className="space-y-5">
							<div className="flex items-center gap-3 flex-wrap">
								<h3 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
									<MessageSquare size={26} className="text-[#148F8B]" />
									Employer Interest &amp; Messages
								</h3>
								{totalSectionUnread > 0 && (
									<span className="inline-flex items-center px-3 py-1 rounded-full bg-[#148F8B]/10 text-[#148F8B] text-xs font-black uppercase tracking-widest">
										{totalSectionUnread} unread
									</span>
								)}
							</div>

							{jobsFromConversations.length === 0 ? (
								<div className="p-6 bg-white border border-gray-100 rounded-2xl text-center text-gray-400 font-medium text-sm">
									No new employer messages yet
								</div>
							) : (
								<div className="grid gap-4">
									{jobsFromConversations.map((job: any, index: number) => {
										const hasJobId = job.id != null;
										const isUnlocked =
											hasJobId &&
											unlockedJobs?.some((j: any) => j.id === job.id);
										const application = hasJobId
											? applications.find(
													(a: any) => Number(a.job_id) === Number(job.id),
												)
											: null;
										const hasApplied = !!application;
										// Look up conversation by conversation id first (covers orphan/no-job convs),
										// then fall back to job_id key for job-tagged convs.
										const conv =
											conversationsByJobId[job._conversationId] ??
											(hasJobId ? conversationsByJobId[job.id] : undefined);
										// A conversation existing means the employer has reached out — always "contacted".
										const isContacted = !!application?.contact_method || !!conv;
										const unreadCount = conv?.unreadCount ?? 0;

										// Derive visual state
										const borderClass = hasApplied
											? "border-l-4 border-l-emerald-500 border-t border-r border-b border-t-gray-100 border-r-gray-100 border-b-gray-100"
											: isUnlocked
												? "border-l-4 border-l-[#148F8B] border-t border-r border-b border-t-gray-100 border-r-gray-100 border-b-gray-100"
												: "border-l-4 border-l-amber-400 border-t border-r border-b border-t-gray-100 border-r-gray-100 border-b-gray-100";

										const statusBadge = !hasJobId
											? {
													label: "Employer message",
													bg: "bg-[#148F8B]/10",
													text: "text-[#148F8B]",
												}
											: hasApplied
												? {
														label: "Applied ✓ — messages available",
														bg: "bg-emerald-50",
														text: "text-emerald-700",
													}
												: isUnlocked
													? {
															label: "Job unlocked",
															bg: "bg-[#148F8B]/10",
															text: "text-[#148F8B]",
														}
													: {
															label: "You can message anytime",
															bg: "bg-amber-50",
															text: "text-amber-800",
														};

										return (
											<div
												key={job._conversationId ?? job.id ?? index}
												className={`p-5 sm:p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all ${borderClass}`}
											>
												<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
													<div className="min-w-0 space-y-1.5 flex-1 flex gap-3 sm:gap-4">
														{hasJobId &&
														(isUnlocked || hasApplied) &&
														typeof job.company_logo_url === "string" &&
														job.company_logo_url.trim() ? (
															<div className="w-12 h-12 rounded-xl border border-gray-100 bg-white shrink-0 flex items-center justify-center p-1 overflow-hidden">
																<img
																	src={job.company_logo_url.trim()}
																	alt=""
																	className="max-w-full max-h-full object-contain"
																/>
															</div>
														) : null}
														<div className="min-w-0 space-y-1.5 flex-1">
															{/* Status badge row */}
															<div className="flex items-center gap-2 flex-wrap">
																<span
																	className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusBadge.bg} ${statusBadge.text}`}
																>
																	{statusBadge.label}
																</span>
																{isContacted && (
																	<span
																		style={{
																			background: "#A63F8E",
																			color: "#ffffff",
																			fontSize: "10px",
																			fontWeight: 900,
																			borderRadius: "999px",
																			padding: "2px 8px",
																			display: "inline-flex",
																			alignItems: "center",
																			textTransform: "uppercase",
																			letterSpacing: "0.05em",
																			flexShrink: 0,
																		}}
																	>
																		Contacted ✓
																	</span>
																)}
																{unreadCount > 0 && (
																	<span
																		style={{
																			background: "#ef4444",
																			color: "#ffffff",
																			fontSize: "10px",
																			fontWeight: 900,
																			borderRadius: "999px",
																			padding: "2px 8px",
																			display: "inline-flex",
																			alignItems: "center",
																			textTransform: "uppercase",
																			letterSpacing: "0.05em",
																			flexShrink: 0,
																		}}
																	>
																		{unreadCount} unread
																	</span>
																)}
															</div>
															{/* Job info */}
															<h4 className="font-black text-lg text-gray-900 leading-snug">
																{job.company_name || "Company"}
															</h4>
															<p className="text-sm text-gray-500">
																{hasJobId
																	? `${job.title} · ${job.location}`
																	: `Direct outreach${job.location ? ` · ${job.location}` : ""}`}
															</p>
															{job.pay_range && (
																<p className="text-xs text-[#148F8B] font-bold">
																	{job.pay_range}
																</p>
															)}
														</div>
													</div>
													{/* Actions */}
													<div className="flex flex-wrap gap-2 shrink-0 sm:pt-0.5">
														{hasJobId && !hasApplied && (
															<Button
																variant="outline"
																className="rounded-xl font-black text-xs uppercase tracking-widest"
																onClick={() => onSelectJob && onSelectJob(job)}
															>
																View Job
															</Button>
														)}
														{hasApplied || !hasJobId ? (
															<Button
																className="rounded-xl bg-[#148F8B] hover:bg-[#148F8B]/90 text-white font-black text-xs uppercase tracking-widest"
																onClick={() => {
																	const convId =
																		conv?.id ?? job._conversationId;
																	if (convId && onSelectConversation) {
																		onSelectConversation(convId);
																	} else {
																		onNavigate("messages");
																	}
																}}
															>
																<MessageSquare size={14} className="mr-1.5" />{" "}
																View Messages
															</Button>
														) : isUnlocked ? (
															<Button
																className="rounded-xl bg-[#148F8B] hover:bg-[#148F8B]/90 text-white font-black text-xs uppercase tracking-widest"
																onClick={() =>
																	onAnswerQuestions && onAnswerQuestions(job)
																}
															>
																Apply Now
															</Button>
														) : (
															<Button
																className="rounded-xl bg-[#148F8B] hover:bg-[#148F8B]/90 text-white font-black text-xs uppercase tracking-widest"
																onClick={() => onSelectJob && onSelectJob(job)}
															>
																Unlock &amp; Apply
															</Button>
														)}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					);
				})()}

			{isLoggedIn && (
				<div className="space-y-8 sm:space-y-10">
					<div className="space-y-8 sm:space-y-12">
						<div className="p-6 sm:p-10 md:p-12 bg-white rounded-[2.5rem] sm:rounded-[3.5rem] md:rounded-[4.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 sm:gap-12 md:gap-16 group relative overflow-hidden">
							<div className="w-40 sm:w-48 md:w-52 aspect-[9/16] bg-gray-900 rounded-[2.5rem] sm:rounded-[3rem] md:rounded-[3.5rem] overflow-hidden relative shadow-2xl shrink-0">
								<ImageWithFallback
									src={
										userProfile?.videoThumbnailUrl ||
										userProfile?.video_thumbnail_url ||
										"https://images.unsplash.com/photo-1758598304204-5bec31342d05?auto=format&fit=crop&q=80&w=800"
									}
									className="w-full h-full object-cover opacity-70"
								/>
								<div className="absolute inset-0 flex items-center justify-center">
									<button
										type="button"
										aria-label="Play intro video"
										className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-full bg-white/20 backdrop-blur-2xl flex items-center justify-center text-white border-2 border-white/40 shadow-2xl hover:scale-110 transition-transform"
										onClick={() =>
											(userProfile?.videoUrl || userProfile?.video_url) &&
											setShowVideoPlayer(true)
										}
									>
										<Play
											aria-hidden="true"
											fill="white"
											size={24}
											className="sm:w-7 sm:h-7 md:w-8 md:h-8"
										/>
									</button>
								</div>
							</div>
							<div className="space-y-6 sm:space-y-8 text-center md:text-left flex-1">
								<div className="space-y-2 sm:space-y-3">
									<h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
										Your Intro Video
									</h3>
									<p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">
										RECORDED IN SECONDS
									</p>
								</div>
								<div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 md:gap-5 justify-center md:justify-start">
									<Button
										variant="outline"
										className="h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 rounded-2xl bg-white border-gray-100 hover:scale-105 active:scale-95 transition-all duration-200"
										onClick={onShowMedia}
									>
										<Video
											size={20}
											className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#148F8B]"
										/>{" "}
										Update Video
									</Button>
									<Button
										variant="outline"
										className="h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 rounded-2xl bg-white border-gray-100 hover:scale-105 active:scale-95 transition-all duration-200"
										onClick={() => onNavigate("profile-editor")}
									>
										<Edit3
											size={20}
											className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#148F8B]"
										/>{" "}
										Edit Profile
									</Button>
									<Button
										variant="ghost"
										className="h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 rounded-2xl text-gray-400 font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all duration-200"
										onClick={onShowVisibility}
									>
										<SettingsIcon
											size={20}
											className="sm:w-5 sm:h-5 md:w-6 md:h-6"
										/>{" "}
										Visibility
									</Button>
								</div>
							</div>
						</div>
					</div>

					{/* Activity Row */}
					<aside className="space-y-6 sm:space-y-8">
						<div className="-mt-6 sm:-mt-8 md:-mt-10 p-5 sm:p-6 md:p-7 bg-gray-900 text-white rounded-[2rem] sm:rounded-[2.5rem] space-y-4 shadow-2xl relative overflow-hidden group">
							<h3 className="text-lg sm:text-xl font-black tracking-tighter leading-none flex items-center gap-2.5">
								<BarChart3 size={24} className="text-[#148F8B]" /> Activity
							</h3>
							<div className="seeker-activity-stats-grid gap-3 w-full">
								<div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 w-full">
									<span className="block text-white/70 font-black uppercase tracking-[0.18em] text-[11px] leading-tight">
										Profile Views
									</span>
									<span className="mt-1 block text-xl sm:text-2xl font-black tracking-tight transition-all group-hover:text-[#148F8B]">
										{profileViewsCount}
									</span>
								</div>
								<div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 w-full">
									<span className="block text-white/70 font-black uppercase tracking-[0.18em] text-[11px] leading-tight">
										Jobs Applied
									</span>
									<span className="mt-1 block text-xl sm:text-2xl font-black tracking-tight transition-all group-hover:text-[#780262]">
										{applicationCount}
									</span>
								</div>
								<div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 w-full">
									<span className="block text-white/70 font-black uppercase tracking-[0.18em] text-[11px] leading-tight">
										Jobs Unlocked
									</span>
									<span className="mt-1 block text-xl sm:text-2xl font-black tracking-tight transition-all group-hover:text-[#780262]">
										{unlockedJobs?.length || 0}
									</span>
								</div>
								<div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 w-full">
									<span className="block text-white/70 font-black uppercase tracking-[0.18em] text-[11px] leading-tight">
										App Views
									</span>
									<span className="mt-1 block text-xl sm:text-2xl font-black tracking-tight transition-all group-hover:text-yellow-400">
										{applicationViewsCount}
									</span>
								</div>
								<div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 w-full">
									<span className="block text-white/70 font-black uppercase tracking-[0.18em] text-[11px] leading-tight">
										Shortlisted
									</span>
									<span className="mt-1 block text-xl sm:text-2xl font-black tracking-tight transition-all group-hover:text-[#A63F8E]">
										{shortlistedCount}
									</span>
								</div>
							</div>
						</div>

						{/* Quick Profile Summary */}
						{userProfile?.name && (
							<div className="p-6 sm:p-8 bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-sm space-y-4">
								<h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
									Your Profile
								</h4>
								<div className="space-y-3">
									<div className="flex items-center gap-3">
										<Users size={16} className="text-[#148F8B] shrink-0" />
										<span className="font-bold text-gray-900 text-sm">
											{userProfile.name}
										</span>
									</div>
									{userProfile.location && (
										<div className="flex items-center gap-3">
											<MapPin size={16} className="text-gray-400 shrink-0" />
											<span className="font-medium text-gray-600 text-sm">
												{userProfile.location}
											</span>
										</div>
									)}
									{userProfile.skills && (
										<div className="flex flex-wrap gap-2 pt-2">
											{userProfile.skills.slice(0, 4).map((s: string) => (
												<span
													key={s}
													className="mr-2 mb-2 px-2.5 py-1 bg-[#148F8B]/5 text-[#148F8B] rounded-lg text-[10px] font-black uppercase tracking-widest"
												>
													{s}
												</span>
											))}
										</div>
									)}
								</div>
							</div>
						)}
					</aside>
				</div>
			)}

			{/* Unlocked Jobs Section - Always visible when there are unlocked jobs */}
			{unlockedJobs && unlockedJobs.length > 0 && (
				<div className="space-y-8">
					<div className="flex justify-between items-center">
						<h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
							Your Unlocked Jobs
						</h3>
						<span className="text-sm font-black uppercase tracking-widest text-gray-400">
							{unlockedJobs.length} {unlockedJobs.length === 1 ? "Job" : "Jobs"}
						</span>
					</div>

					<div className="grid gap-6">
						{unlockedJobs.map((job) => {
							const matchMeta = getMatchMeta(job);
							const application = applications.find((a) => a.job_id === job.id);
							const hasApplied = !!application;
							const isContacted =
								!!application?.contact_method ||
								!!conversationsByJobId?.[job.id];
							const statusKey = application?.status || null;
							const statusCfg = statusKey
								? STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending
								: null;
							const appliedAgo = toAgo(application?.applied_at);
							const reviewedAgo = application?.reviewed_at
								? toAgo(application.reviewed_at)
								: null;
							const updatedDiffersFromApplied =
								application?.updated_at &&
								application?.applied_at &&
								application.updated_at !== application.applied_at;
							const updatedAgo = updatedDiffersFromApplied
								? toAgo(application.updated_at)
								: null;
							return (
								<motion.div
									key={job.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									className="p-6 sm:p-8 md:p-10 bg-white border-2 border-[#780262]/20 rounded-[2rem] sm:rounded-[3rem] shadow-lg hover:shadow-2xl transition-all group cursor-pointer"
									onClick={() => onSelectJob && onSelectJob(job)}
								>
									<div className="space-y-6">
										{/* Header with company name - ONLY VISIBLE WHEN UNLOCKED */}
										<div className="flex items-start justify-between gap-4">
											<div className="flex gap-4 flex-1 min-w-0">
												{typeof job.company_logo_url === "string" &&
												job.company_logo_url.trim() ? (
													<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-gray-100 bg-white shrink-0 flex items-center justify-center p-1.5 overflow-hidden">
														<img
															src={job.company_logo_url.trim()}
															alt=""
															className="max-w-full max-h-full object-contain"
														/>
													</div>
												) : null}
												<div className="space-y-3 flex-1 min-w-0">
													<div className="flex flex-wrap items-center gap-2">
														<div className="inline-flex items-center gap-2 px-4 py-2 bg-[#780262]/10 rounded-full">
															<div className="w-2 h-2 rounded-full bg-[#780262] animate-pulse" />
															<span className="text-xs font-black uppercase tracking-widest text-[#780262]">
																Unlocked
															</span>
														</div>
														{statusCfg && (
															<span
																className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusCfg.bg} ${statusCfg.text}`}
															>
																{statusCfg.label}
															</span>
														)}
														{isContacted && (
															<span
																style={{
																	background: "#A63F8E",
																	color: "#ffffff",
																	fontSize: "10px",
																	fontWeight: 900,
																	borderRadius: "999px",
																	padding: "2px 10px",
																	display: "inline-flex",
																	alignItems: "center",
																	textTransform: "uppercase",
																	letterSpacing: "0.05em",
																}}
															>
																Contacted ✓
															</span>
														)}
														{matchMeta && (
															<span
																className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
																	matchMeta.tone === "strong"
																		? "bg-[#148F8B]/10 text-[#148F8B]"
																		: "bg-amber-50 text-amber-700"
																}`}
															>
																{matchMeta.label}
															</span>
														)}
													</div>
													{/* Timestamps */}
													{(appliedAgo || reviewedAgo || updatedAgo) && (
														<div className="flex flex-col gap-1">
															{appliedAgo && (
																<span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
																	<Clock size={10} className="shrink-0" />{" "}
																	Applied {appliedAgo}
																</span>
															)}
															{reviewedAgo && (
																<span className="flex items-center gap-1.5 text-[10px] font-medium text-amber-600">
																	<Clock size={10} className="shrink-0" />{" "}
																	Reviewed {reviewedAgo}
																</span>
															)}
															{updatedAgo && (
																<span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
																	<Clock size={10} className="shrink-0" />{" "}
																	Updated {updatedAgo}
																</span>
															)}
														</div>
													)}
													<h4 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight group-hover:text-[#148F8B] transition-colors">
														{job.title}
													</h4>
													{/* Company Name - REVEALED ONLY WHEN UNLOCKED */}
													<div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900">
														<Building2
															size={20}
															className="text-[#148F8B] shrink-0"
														/>
														<span>
															{job.company_name || "Company Name Hidden"}
														</span>
													</div>
												</div>
											</div>
											<ExternalLink
												size={24}
												className="text-gray-600 group-hover:text-[#148F8B] transition-colors shrink-0"
											/>
										</div>

										{/* Job Details Grid */}
										<div className="grid sm:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-gray-100">
											<div className="space-y-3">
												<div className="flex items-center gap-3 text-sm sm:text-base">
													<MapPin
														size={18}
														className="text-gray-400 shrink-0"
													/>
													<span className="font-bold text-gray-900">
														{job.location}
													</span>
												</div>
												<div className="flex items-center gap-3 text-sm sm:text-base">
													<DollarSign
														size={18}
														className="text-gray-400 shrink-0"
													/>
													<span className="font-bold text-gray-900">
														{job.pay_range}
													</span>
												</div>
												<div className="flex items-center gap-3 text-sm sm:text-base">
													<Briefcase
														size={18}
														className="text-gray-400 shrink-0"
													/>
													<span className="font-bold text-gray-900">
														{job.job_type}
													</span>
												</div>
											</div>

											<div className="space-y-3">
												<div>
													<p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
														Industry
													</p>
													<p className="font-bold text-gray-900">
														{job.company_industry}
													</p>
												</div>
												{job.job_category && (
													<div>
														<p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
															Job Category
														</p>
														<p className="font-bold text-[#A63F8E]">
															{job.job_category}
														</p>
													</div>
												)}
												<div>
													<p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
														Company Size
													</p>
													<p className="font-bold text-gray-900">
														{job.company_size || "Not specified"}
													</p>
												</div>
											</div>
										</div>

										{/* Contact Info - ONLY VISIBLE WHEN UNLOCKED */}
										{(job.contact_email || job.contact_phone) && (
											<div className="pt-4 border-t border-gray-100">
												<p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
													Contact Information
												</p>
												<div className="space-y-2">
													{job.contact_email && (
														<p className="text-sm font-bold text-gray-900">
															Email:{" "}
															<a
																href={`mailto:${job.contact_email}`}
																className="text-[#148F8B] hover:underline"
															>
																{job.contact_email}
															</a>
														</p>
													)}
													{job.contact_phone && (
														<p className="text-sm font-bold text-gray-900">
															Phone:{" "}
															<a
																href={`tel:${job.contact_phone}`}
																className="text-[#148F8B] hover:underline"
															>
																{job.contact_phone}
															</a>
														</p>
													)}
												</div>
											</div>
										)}

										{/* Message employer + Apply CTA (messaging does not require unlock/apply) */}
										<div
											className="pt-4 border-t border-gray-100 space-y-2"
											onClick={(e) => e.stopPropagation()}
										>
											{onOpenMessageWithEmployer &&
												job.employer_id != null && (
													<Button
														className="w-full h-14 rounded-2xl bg-[#148F8B] hover:bg-[#148F8B]/90 text-white shadow-lg shadow-[#148F8B]/20 hover:scale-105 active:scale-95 transition-all duration-200 text-sm font-black uppercase tracking-widest"
														onClick={() =>
															onOpenMessageWithEmployer(Number(job.employer_id))
														}
													>
														<MessageSquare size={16} /> Message Employer
													</Button>
												)}
											{onAnswerQuestions && (
												<Button
													className="w-full h-14 rounded-2xl bg-[#780262] hover:bg-[#780262]/90 text-white shadow-lg shadow-[#780262]/20 hover:scale-105 active:scale-95 transition-all duration-200 text-sm font-black uppercase tracking-widest"
													onClick={() => onAnswerQuestions(job)}
												>
													<MessageSquare size={16} />{" "}
													{hasApplied ? "Update Application" : "Apply to Job"}
												</Button>
											)}
										</div>
									</div>
								</motion.div>
							);
						})}
					</div>
				</div>
			)}
			{/* Danger Zone */}
			{isLoggedIn && (
				<div className="border border-red-200 rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden">
					<div className="px-8 sm:px-12 py-6 sm:py-8 bg-red-50 flex items-center gap-3 border-b border-red-200">
						<AlertTriangle size={20} className="text-red-500 shrink-0" />
						<span className="font-black uppercase tracking-[0.2em] text-xs text-red-600">
							Danger Zone
						</span>
					</div>
					<div className="px-8 sm:px-12 py-8 sm:py-10 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
						<div className="space-y-1.5">
							<p className="font-black text-lg tracking-tight text-gray-900">
								Delete Account
							</p>
							<p className="text-sm text-gray-500 font-medium leading-relaxed max-w-md">
								Permanently deletes your profile, video intro, and all
								associated data. This cannot be undone.
							</p>
						</div>
						<Button
							variant="outline"
							className="h-12 sm:h-14 px-6 sm:px-8 rounded-2xl border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 shrink-0"
							onClick={() => {
								setDeleteError(null);
								setShowDeleteConfirm(true);
							}}
						>
							<Trash2 size={16} /> Delete Account
						</Button>
					</div>
				</div>
			)}

			{/* Video player modal */}
			<AnimatePresence>
				{showVideoPlayer && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
						onClick={() => setShowVideoPlayer(false)}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ type: "spring", stiffness: 400, damping: 30 }}
							className="w-full max-w-2xl"
							onClick={(e) => e.stopPropagation()}
						>
							{(() => {
								const videoUrl =
									userProfile?.videoUrl || userProfile?.video_url;
								const videoType = videoUrl?.includes(".webm")
									? "video/webm"
									: "video/mp4";
								return (
									<video
										controls
										autoPlay
										playsInline
										className="w-full rounded-[2rem] bg-black shadow-2xl"
										style={{ maxHeight: "80vh" }}
									>
										<source src={videoUrl} type={videoType} />
									</video>
								);
							})()}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Delete confirmation modal */}
			<AnimatePresence>
				{showDeleteConfirm && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
						onClick={(e) => {
							if (e.target === e.currentTarget && !isDeleting)
								setShowDeleteConfirm(false);
						}}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 16 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 16 }}
							transition={{ type: "spring", stiffness: 400, damping: 30 }}
							className="bg-white rounded-[2.5rem] p-8 sm:p-12 max-w-md w-full shadow-2xl space-y-8"
						>
							{/* Icon */}
							<div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
								<AlertTriangle size={32} className="text-red-500" />
							</div>

							{/* Copy */}
							<div className="space-y-3">
								<h3 className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900">
									Delete your account?
								</h3>
								<p className="text-gray-500 font-medium leading-relaxed text-sm sm:text-base">
									This will permanently delete your candidate profile, your
									video intro, and your thumbnail from our servers.
								</p>
								<p className="text-red-600 font-black text-sm uppercase tracking-widest">
									This cannot be undone.
								</p>
							</div>

							{/* Error */}
							{deleteError && (
								<div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
									<p className="text-red-700 font-bold text-sm">
										{deleteError}
									</p>
								</div>
							)}

							{/* Actions */}
							<div className="flex flex-col-reverse sm:flex-row gap-3">
								<Button
									variant="outline"
									className="flex-1 h-14 rounded-2xl border-gray-200"
									onClick={() => setShowDeleteConfirm(false)}
									disabled={isDeleting}
								>
									Cancel
								</Button>
								<Button
									className="flex-1 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-600/30"
									onClick={handleDeleteAccount}
									disabled={isDeleting}
								>
									{isDeleting ? (
										<>
											<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
											Deleting...
										</>
									) : (
										<>
											<Trash2 size={16} /> Yes, Delete Everything
										</>
									)}
								</Button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};
