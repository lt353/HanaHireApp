import React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
	Search,
	Filter,
	MapPin,
	DollarSign,
	Briefcase,
	Trash2,
	RotateCcw,
	X,
	Building2,
	ListChecks,
	Phone,
	Mail,
	Globe,
} from "lucide-react";
import { getJobCategoryStyle } from "../../utils/jobCategoryStyles";

const INDUSTRY_BORDER_COLORS: Record<string, string> = {
	// Food & Beverage → Food Service orange-red
	Restaurant: "#FF6B4A",
	"Cafe/Coffee Shop": "#FF6B4A",
	"Food Truck": "#FF6B4A",
	Bakery: "#FF6B4A",
	"Bar/Brewery": "#FF6B4A",
	// Retail → Retail & Sales orange
	"Retail Store": "#FB923C",
	"Surf Shop": "#FB923C",
	Boutique: "#FB923C",
	"Gift Shop": "#FB923C",
	"Farmers Market": "#FB923C",
	// Hospitality → Hospitality Services green
	"Hotel/Resort": "#10B981",
	"Vacation Rental": "#10B981",
	"Bed & Breakfast": "#10B981",
	"Luau/Entertainment": "#10B981",
	// Tourism → Tourism & Recreation sky blue
	"Tour Company": "#0EA5E9",
	"Activity Desk": "#0EA5E9",
	"Rental Shop": "#0EA5E9",
	// Wellness → Healthcare & Wellness cyan
	"Spa/Wellness": "#06B6D4",
	"Dental/Medical Office": "#06B6D4",
	// Maintenance & property → Maintenance & Facilities slate
	Landscaping: "#64748B",
	"Pool Service": "#64748B",
	"Cleaning Service": "#64748B",
	"Pest Control": "#64748B",
	"Property Management": "#64748B",
	// Trades → Trades & Construction dark slate
	Construction: "#475569",
	"Home Repair": "#475569",
	HVAC: "#475569",
	Plumbing: "#475569",
	Electrical: "#475569",
	"Auto Repair": "#475569",
	"Marine Services": "#475569",
	"Farm/Agriculture": "#059669",
	// Office / Finance → blue / indigo
	"Real Estate": "#1E40AF",
	"Law Firm": "#4F46E5",
	"Accounting Firm": "#4F46E5",
	"Insurance Agency": "#4F46E5",
	// Creative / Marketing
	"Marketing Agency": "#D946EF",
	// Tech
	"IT Services": "#0066FF",
	// Education / Kids
	Childcare: "#F59E0B",
	// Fitness
	"Fitness Studio": "#EC4899",
	// Non-profit / Leadership
	"Non-Profit": "#8B5CF6",
};

function getIndustryBorderColor(industry: string | null | undefined): string {
	if (!industry) return "#e5e7eb";
	return INDUSTRY_BORDER_COLORS[industry] ?? "#e5e7eb";
}

function getEmployerCreatedMs(emp: any): number {
	const raw = emp?.created_at ?? emp?.createdAt;
	if (raw == null || raw === "") return 0;
	if (typeof raw === "number" && Number.isFinite(raw)) return raw;
	const t = Date.parse(String(raw));
	return Number.isNaN(t) ? 0 : t;
}

function getEmployerIdNum(emp: any): number {
	const id = emp?.id;
	if (id == null) return 0;
	const n = Number(id);
	if (!Number.isNaN(n)) return n;
	const match = String(id).match(/(\d+)$/);
	return match ? parseInt(match[1], 10) : 0;
}

/** Browse Businesses: newest signups first (`created_at`), then higher id. */
function sortEmployersNewestFirst(list: any[]): any[] {
	return [...list].sort((a, b) => {
		const tb = getEmployerCreatedMs(b);
		const ta = getEmployerCreatedMs(a);
		if (tb !== ta) return tb - ta;
		return getEmployerIdNum(b) - getEmployerIdNum(a);
	});
}

import { Modal } from "../ui/Modal";
import { CollapsibleFilter } from "../CollapsibleFilter";
import { Button } from "../ui/Button";

type JobSortOption =
	| "newest"
	| "pay-high"
	| "pay-low"
	| "job-type"
	| "closest"
	| "applicants"
	| "industry";

interface JobsListProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	filteredJobs: any;
	unlockedJobIds: any;
	appliedJobIds: any;
	seekerQueue: any;
	onAddToQueue: (job: any) => void;
	onRemoveFromQueue: (id: number) => void;
	onShowPayment: (target: any) => void;
	onShowFilters: () => void;
	onSelectJob: (job: any) => void;
	interactionFee: number;
	viewerLocation?: string;
	employers?: any[];
}

function useIsMobile(breakpointPx = 768) {
	const [isMobile, setIsMobile] = React.useState(false);

	React.useEffect(() => {
		if (typeof window === "undefined") return;

		const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
		const update = () => setIsMobile(mq.matches);

		update();

		if (mq.addEventListener) mq.addEventListener("change", update);
		else mq.addListener(update);

		return () => {
			if (mq.removeEventListener) mq.removeEventListener("change", update);
			else mq.removeListener(update);
		};
	}, [breakpointPx]);

	return isMobile;
}

function trimmedCompanyLogoUrl(job: any): string | null {
	const u = job?.company_logo_url;
	if (typeof u !== "string") return null;
	const t = u.trim();
	return t.length > 0 ? t : null;
}

function JobListingThumbnail({
	job,
	showEmployerLogo,
	sizePx,
}: {
	job: any;
	showEmployerLogo: boolean;
	sizePx: number;
}) {
	const logo = showEmployerLogo ? trimmedCompanyLogoUrl(job) : null;
	if (logo) {
		return (
			<div
				className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white p-1"
				style={{ width: sizePx, height: sizePx }}
			>
				<img
					src={logo}
					alt=""
					className="max-h-full max-w-full object-contain"
					loading="lazy"
				/>
			</div>
		);
	}
	const categoryStyle = getJobCategoryStyle(job.job_category);
	if (!categoryStyle.svgPath) return null;
	return (
		<div
			className="rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-white/60 border border-white/80 p-1 opacity-90"
			style={{ width: sizePx, height: sizePx }}
		>
			<img
				src={`${import.meta.env.BASE_URL}${categoryStyle.svgPath}`}
				alt=""
				className="w-full h-full object-contain"
			/>
		</div>
	);
}

export const JobsList: React.FC<JobsListProps> = ({
	searchQuery,
	setSearchQuery,
	filteredJobs,
	unlockedJobIds,
	appliedJobIds,
	seekerQueue,
	onAddToQueue,
	onRemoveFromQueue,
	onShowPayment,
	onShowFilters,
	onSelectJob,
	viewerLocation,
	employers = [],
}) => {
	const isMobile = useIsMobile(768);
	const [browseMode, setBrowseMode] = React.useState<"jobs" | "businesses">(
		"jobs",
	);
	const [selectedBusiness, setSelectedBusiness] = React.useState<any | null>(
		null,
	);
	const [showBizFilterModal, setShowBizFilterModal] = React.useState(false);
	const [bizIndustryFilter, setBizIndustryFilter] = React.useState<string[]>(
		[],
	);
	const [bizLocationFilter, setBizLocationFilter] = React.useState<string[]>(
		[],
	);
	/** Per-card: expanded company description on Browse Businesses grid */
	const [expandedBizDescriptions, setExpandedBizDescriptions] = React.useState<
		Record<string, boolean>
	>({});

	const bizIndustries = React.useMemo(() => {
		const set = new Set<string>();
		employers.forEach((e) => {
			if (e.industry) set.add(e.industry);
		});
		return Array.from(set).sort();
	}, [employers]);

	const bizLocations = React.useMemo(() => {
		const set = new Set<string>();
		employers.forEach((e) => {
			if (e.location) set.add(e.location);
		});
		return Array.from(set).sort();
	}, [employers]);

	const jobs: any[] = Array.isArray(filteredJobs) ? filteredJobs : [];
	const unlockedIds: any[] = Array.isArray(unlockedJobIds)
		? unlockedJobIds
		: [];
	const appliedIds: any[] = Array.isArray(appliedJobIds) ? appliedJobIds : [];
	const queue: any[] = Array.isArray(seekerQueue) ? seekerQueue : [];

	// Mobile swipe index
	const [index, setIndex] = React.useState(0);
	const [passedJobs, setPassedJobs] = React.useState<any[]>([]);
	const [recoveredQueue, setRecoveredQueue] = React.useState<any[]>([]);
	const [showPassedBin, setShowPassedBin] = React.useState(false);
	const [sortOption, setSortOption] = React.useState<JobSortOption>("newest");

	React.useEffect(() => {
		setIndex(0);
		setPassedJobs([]);
		setRecoveredQueue([]);
	}, [searchQuery, jobs.length]);

	const parsePayValue = React.useCallback(
		(pay: string | undefined | null): number => {
			if (!pay) return 0;
			const numbers = (pay.match(/\d+(\.\d+)?/g) || []).map(Number);
			if (!numbers.length) {
				const lower = pay.toLowerCase();
				if (lower.includes("min")) return 15;
				return 0;
			}
			if (numbers.length === 1) return numbers[0];
			return numbers.reduce((a, b) => a + b, 0) / numbers.length;
		},
		[],
	);

	const sortedJobs = React.useMemo(() => {
		const arr = [...jobs];

		/** Largest ID first (numeric id or trailing number in strings like "job_42"). */
		const getIdNum = (j: any) => {
			const id = j?.id;
			if (id == null) return 0;
			const n = Number(id);
			if (!Number.isNaN(n)) return n;
			const match = String(id).match(/(\d+)$/);
			return match ? parseInt(match[1], 10) : 0;
		};

		const getLocationScore = (loc?: string | null) => {
			if (!viewerLocation) return 0;
			if (!loc) return 2;
			const l = String(loc).toLowerCase();
			const v = String(viewerLocation).toLowerCase();
			if (l === v) return 0;
			if (l.includes(v) || v.includes(l)) return 1;
			return 2;
		};

		const getJobTypeWeight = (j: any) => {
			const jt = (j.job_type || "").toLowerCase();
			if (jt.startsWith("full-time")) return 0;
			if (jt.startsWith("part-time")) return 1;
			return 2;
		};

		arr.sort((a, b) => {
			switch (sortOption) {
				case "pay-high":
					return parsePayValue(b.pay_range) - parsePayValue(a.pay_range);
				case "pay-low":
					return parsePayValue(a.pay_range) - parsePayValue(b.pay_range);
				case "job-type":
					return getJobTypeWeight(a) - getJobTypeWeight(b);
				case "closest":
					return getLocationScore(a.location) - getLocationScore(b.location);
				case "applicants":
					return (b.applicant_count || 0) - (a.applicant_count || 0);
				case "industry":
					return String(a.company_industry || "").localeCompare(
						String(b.company_industry || ""),
					);
				case "newest":
				default:
					return getIdNum(b) - getIdNum(a);
			}
		});

		return arr;
	}, [jobs, sortOption, viewerLocation, parsePayValue]);

	// Show recovered items first before continuing the main deck
	const currentJob =
		recoveredQueue.length > 0 ? recoveredQueue[0] : sortedJobs[index];

	const goNext = React.useCallback(() => {
		setIndex((prev) => {
			const next = prev + 1;
			if (next >= jobs.length) return prev;
			return next;
		});
	}, [jobs.length]);

	// Motion values (mobile only)
	const x = useMotionValue(0);
	const rotate = useTransform(x, [-160, 0, 160], [-6, 0, 6]);
	const cardOpacity = useTransform(x, [-220, 0, 220], [0.75, 1, 0.75]);

	// Badges fade in when swipe starts
	const saveOpacity = useTransform(x, [4, 40], [0, 1]);
	const passOpacity = useTransform(x, [-4, -40], [0, 1]);

	const badgeScale = useTransform(x, [-140, -40, 40, 140], [0.92, 1, 1, 0.92]);

	const SWIPE_THRESHOLD = 110;

	const resetCard = () => {
		animate(x, 0, { type: "spring", stiffness: 320, damping: 26 });
	};

	const isInQueue = (id: any) => queue.some((q) => q?.id === id);
	const isUnlocked = (_id: any) => true;
	const isApplied = (id: any) => appliedIds.includes(id);

	// Toggle bookmark - add or remove from queue
	const handleToggleBookmark = (job: any) => {
		if (isInQueue(job.id)) {
			onRemoveFromQueue(job.id);
		} else {
			onAddToQueue(job);
		}
	};

	const handlePass = React.useCallback(() => {
		if (recoveredQueue.length > 0) {
			// Re-passing a recovered job puts it back in the bin
			setPassedJobs((prev) => [...prev, recoveredQueue[0]]);
			setRecoveredQueue((prev) => prev.slice(1));
			return;
		}
		if (currentJob) {
			setPassedJobs((prev) => [...prev, currentJob]);
		}
		goNext();
	}, [currentJob, goNext, recoveredQueue]);

	const handleSave = React.useCallback(() => {
		if (recoveredQueue.length > 0) {
			// Saving a recovered job adds it to queue without touching main deck index
			onAddToQueue(recoveredQueue[0]);
			setRecoveredQueue((prev) => prev.slice(1));
			return;
		}
		if (!currentJob) return;
		onAddToQueue(currentJob);
		goNext();
	}, [currentJob, goNext, onAddToQueue, recoveredQueue]);

	const handleUndo = React.useCallback(() => {
		if (passedJobs.length === 0) return;
		setIndex((prev) => Math.max(0, prev - 1));
		setPassedJobs((prev) => prev.slice(0, -1));
	}, [passedJobs.length]);

	// Recycle bin actions
	const handleRecover = React.useCallback((job: any) => {
		setPassedJobs((prev) => prev.filter((j) => j.id !== job.id));
		setRecoveredQueue((prev) => [...prev, job]);
	}, []);

	const handleRecoverAll = React.useCallback(() => {
		setRecoveredQueue((prev) => [...prev, ...passedJobs]);
		setPassedJobs([]);
		setShowPassedBin(false);
	}, [passedJobs]);

	const handleClearBin = React.useCallback(() => {
		setPassedJobs([]);
		setShowPassedBin(false);
	}, []);

	const swipeOut = (direction: "left" | "right") => {
		const targetX = direction === "left" ? -420 : 420;
		animate(x, targetX, { type: "spring", stiffness: 260, damping: 24 });

		window.setTimeout(() => {
			if (direction === "left") handlePass();
			else handleSave();
			animate(x, 0, { type: "spring", stiffness: 320, damping: 26 });
		}, 140);
	};

	const handleDragEnd = () => {
		const currentX = x.get();

		if (currentX > SWIPE_THRESHOLD) {
			swipeOut("right");
			return;
		}
		if (currentX < -SWIPE_THRESHOLD) {
			swipeOut("left");
			return;
		}
		resetCard();
	};

	// iOS Safari touch handling - direction-aware so vertical scroll still works
	const touchStartX = React.useRef(0);
	const touchStartY = React.useRef(0);
	const isDragging = React.useRef(false);
	const gestureDirection = React.useRef<"horizontal" | "vertical" | null>(null);

	const handleTouchStart = (e: React.TouchEvent) => {
		isDragging.current = true;
		touchStartX.current = e.touches[0].clientX;
		touchStartY.current = e.touches[0].clientY;
		gestureDirection.current = null;
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isDragging.current) return;
		const currentX = e.touches[0].clientX;
		const currentY = e.touches[0].clientY;
		const diffX = currentX - touchStartX.current;
		const diffY = currentY - touchStartY.current;

		if (
			gestureDirection.current === null &&
			(Math.abs(diffX) > 5 || Math.abs(diffY) > 5)
		) {
			gestureDirection.current =
				Math.abs(diffX) > Math.abs(diffY) ? "horizontal" : "vertical";
		}

		if (gestureDirection.current === "horizontal") {
			e.preventDefault();
			x.set(diffX);
		}
		// vertical — let the browser handle page scroll naturally
	};

	const handleTouchEnd = () => {
		if (!isDragging.current) return;
		isDragging.current = false;
		if (gestureDirection.current === "horizontal") {
			handleDragEnd();
		}
		gestureDirection.current = null;
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="max-w-6xl mx-auto px-4 py-16 space-y-12 pb-32"
		>
			{/* Header */}
			<div className="space-y-4">
				<h2 className="text-6xl font-black tracking-tighter">
					{browseMode === "jobs" ? "Browse Jobs" : "Browse Businesses"}
				</h2>
				<p className="text-2xl text-gray-500 font-medium">
					{browseMode === "jobs"
						? "Swipe right to save jobs. Review and apply from your saved folder."
						: "Explore local businesses hiring in Hawaii."}
				</p>
			</div>

			{/* Browse mode toggle */}
			<div className="flex w-fit">
				<div className="flex items-center gap-2 p-2 bg-gray-100 rounded-2xl shadow-inner">
					<button
						type="button"
						onClick={() => setBrowseMode("jobs")}
						className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-200 ${
							browseMode === "jobs"
								? "bg-[#148F8B] text-white shadow-lg shadow-[#148F8B]/30"
								: "text-gray-500 hover:text-gray-800 hover:bg-white/60"
						}`}
					>
						<ListChecks size={17} />
						Job Listings
					</button>
					<button
						type="button"
						onClick={() => setBrowseMode("businesses")}
						className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-200 ${
							browseMode === "businesses"
								? "bg-[#148F8B] text-white shadow-lg shadow-[#148F8B]/30"
								: "text-gray-500 hover:text-gray-800 hover:bg-white/60"
						}`}
					>
						<Building2 size={17} />
						Businesses
					</button>
				</div>
			</div>

			{/* Search + Filters + Sort */}
			<div className="flex flex-col md:flex-row gap-4">
				<div className="relative flex-1">
					<Search
						className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
						size={20}
					/>
					<input
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						type="text"
						placeholder={
							browseMode === "jobs"
								? "Search jobs by title, location..."
								: "Search businesses by name, industry..."
						}
						aria-label={
							browseMode === "jobs"
								? "Search jobs by title or location"
								: "Search businesses by name or industry"
						}
						className="w-full pl-14 pr-5 py-5 rounded-lg bg-white border border-gray-100 shadow-sm focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-lg"
					/>
				</div>

				<div className="flex items-center gap-3">
					{browseMode === "jobs" ? (
						<>
							<button
								type="button"
								className="h-16 px-8 bg-white rounded-lg border border-gray-200 font-black uppercase tracking-widest text-[10px] text-gray-700 inline-flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all duration-200"
								onClick={onShowFilters}
							>
								<Filter size={20} /> Filters
							</button>
							<div className="h-16">
								<select
									value={sortOption}
									onChange={(e) =>
										setSortOption(e.target.value as JobSortOption)
									}
									aria-label="Sort jobs"
									className="h-full px-4 bg-white rounded-lg border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-700 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
								>
									<option value="newest">Newest first</option>
									<option value="pay-high">Pay: high to low</option>
									<option value="pay-low">Pay: low to high</option>
									<option value="job-type">Job type (full-time first)</option>
									<option value="closest">Closest to me</option>
									<option value="applicants">Most applicants</option>
									<option value="industry">Industry</option>
								</select>
							</div>
						</>
					) : (
						<button
							type="button"
							className={`h-16 px-8 rounded-lg border font-black uppercase tracking-widest text-[10px] inline-flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all duration-200 ${
								bizIndustryFilter.length > 0 || bizLocationFilter.length > 0
									? "bg-[#148F8B] text-white border-[#148F8B]"
									: "bg-white text-gray-700 border-gray-200"
							}`}
							onClick={() => setShowBizFilterModal(true)}
						>
							<Filter size={20} />
							Filters
							{bizIndustryFilter.length + bizLocationFilter.length > 0 && (
								<span className="ml-1 bg-white/30 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">
									{bizIndustryFilter.length + bizLocationFilter.length}
								</span>
							)}
						</button>
					)}
				</div>
			</div>

			{/* BUSINESSES view */}
			{browseMode === "businesses"
				? (() => {
						const query = searchQuery.trim().toLowerCase();
						const filtered = employers.filter((emp) => {
							const matchesQuery =
								!query ||
								(emp.business_name || "").toLowerCase().includes(query) ||
								(emp.industry || "").toLowerCase().includes(query) ||
								(emp.location || "").toLowerCase().includes(query) ||
								(emp.company_description || "").toLowerCase().includes(query);
							const matchesIndustry =
								bizIndustryFilter.length === 0 ||
								bizIndustryFilter.includes(emp.industry);
							const matchesLocation =
								bizLocationFilter.length === 0 ||
								bizLocationFilter.includes(emp.location);
							return matchesQuery && matchesIndustry && matchesLocation;
						});
						const sortedFiltered = sortEmployersNewestFirst(filtered);

						return (
							<>
								{/* Business cards grid */}
								{sortedFiltered.length === 0 ? (
									<div className="p-16 bg-white border-4 border-dashed border-gray-100 rounded-3xl text-center">
										<p className="text-gray-400 font-black text-xl uppercase tracking-widest">
											No businesses found
										</p>
									</div>
								) : (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
										{sortedFiltered.map((emp) => {
											const logo =
												typeof emp.company_logo_url === "string" &&
												emp.company_logo_url.trim()
													? emp.company_logo_url.trim()
													: null;
											const cardKey = String(emp.id);
											const descRaw =
												typeof emp.company_description === "string"
													? emp.company_description.trim()
													: "";
											const descExpanded =
												expandedBizDescriptions[cardKey] === true;
											const readMoreThreshold = 80;
											const showReadMoreToggle =
												descRaw.length > readMoreThreshold;
											return (
												<div
													key={emp.id}
													role="button"
													tabIndex={0}
													onClick={() => setSelectedBusiness(emp)}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															setSelectedBusiness(emp);
														}
													}}
													className={`text-left bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-[min-height] duration-200 flex flex-col w-full max-w-full cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-[#148F8B] focus-visible:ring-offset-2 ${
														descExpanded ? "min-h-[320px] h-auto" : "h-[320px]"
													}`}
													style={{
														borderLeft: `6px solid ${getIndustryBorderColor(emp.industry)}`,
														borderTop: "1px solid #f3f4f6",
														borderRight: "1px solid #f3f4f6",
														borderBottom: "1px solid #f3f4f6",
													}}
												>
													{/* Top: logo + name + verified badge */}
													<div className="flex items-start gap-3 shrink-0 min-w-0">
														<div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-1.5">
															{logo ? (
																<img
																	src={logo}
																	alt=""
																	className="max-h-full max-w-full object-contain"
																	loading="lazy"
																/>
															) : (
																<span className="text-2xl font-black text-gray-300">
																	{(emp.business_name || "?")[0].toUpperCase()}
																</span>
															)}
														</div>
														<div className="min-w-0 flex-1">
															<div className="flex flex-wrap items-center gap-2">
																<h3 className="text-base font-black tracking-tight leading-snug group-hover:text-[#148F8B] transition-colors">
																	{emp.business_name || "Unnamed Business"}
																</h3>
																{emp.business_verified && (
																	<span className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#148F8B]/10 text-[#0D7377]">
																		Verified
																	</span>
																)}
															</div>
															<div className="mt-1.5 flex flex-wrap gap-1.5">
																{emp.industry && (
																	<span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#148F8B]/10 text-[#0D7377]">
																		{emp.industry}
																	</span>
																)}
																{emp.company_size && (
																	<span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
																		{emp.company_size}
																	</span>
																)}
															</div>
														</div>
													</div>

													{emp.location && (
														<div className="mt-1 flex shrink-0 items-center gap-1.5 text-xs font-semibold text-gray-500">
															<MapPin size={11} className="shrink-0" />
															<span>{emp.location}</span>
														</div>
													)}

													<div className="mt-2 flex min-h-0 flex-1 flex-col">
														{descRaw ? (
															<>
																<div
																	className={`min-h-0 flex-1 overflow-hidden ${descExpanded ? "overflow-visible" : ""}`}
																>
																	<p className="text-sm text-gray-600 leading-relaxed">
																		{descRaw}
																	</p>
																</div>
																{showReadMoreToggle && (
																	<button
																		type="button"
																		className="mt-2 shrink-0 text-left text-[11px] font-black uppercase tracking-widest text-[#148F8B] hover:underline"
																		onClick={(e) => {
																			e.stopPropagation();
																			setExpandedBizDescriptions((prev) => ({
																				...prev,
																				[cardKey]: !prev[cardKey],
																			}));
																		}}
																	>
																		{descExpanded ? "Read less" : "Read more"}
																	</button>
																)}
															</>
														) : (
															<p className="text-sm italic leading-relaxed text-gray-400">
																No description yet.
															</p>
														)}
													</div>

													<span className="mt-auto shrink-0 border-t border-gray-100 pt-2 text-xs font-black uppercase tracking-widest text-[#148F8B] group-hover:underline">
														View profile →
													</span>
												</div>
											);
										})}
									</div>
								)}

								{/* Business profile modal */}
								{selectedBusiness &&
									(() => {
										const emp = selectedBusiness;
										const logo =
											typeof emp.company_logo_url === "string" &&
											emp.company_logo_url.trim()
												? emp.company_logo_url.trim()
												: null;
										const website =
											emp.website &&
											(emp.website.startsWith("http")
												? emp.website
												: `https://${emp.website}`);
										return (
											<div
												className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
												onClick={() => setSelectedBusiness(null)}
											>
												<div
													className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
													onClick={(e) => e.stopPropagation()}
												>
													{/* Header band */}
													<div className="relative h-14 rounded-t-3xl bg-gradient-to-br from-[#148F8B] to-[#0D7377]">
														<button
															type="button"
															onClick={() => setSelectedBusiness(null)}
															className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all"
														>
															<X size={16} />
														</button>
													</div>

													{/* Logo overlapping header */}
													<div className="px-6 pb-10">
														<div className="-mt-8 mb-4 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white p-1.5 shadow-lg">
															{logo ? (
																<img
																	src={logo}
																	alt=""
																	className="max-h-full max-w-full object-contain"
																	loading="lazy"
																/>
															) : (
																<span className="text-2xl font-black text-gray-300">
																	{(emp.business_name || "?")[0].toUpperCase()}
																</span>
															)}
														</div>

														{/* Name + verified */}
														<div className="flex items-center gap-2 flex-wrap mb-1">
															<h2 className="text-2xl font-black tracking-tight">
																{emp.business_name || "Unnamed Business"}
															</h2>
															{emp.business_verified && (
																<span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#148F8B]/10 text-[#0D7377]">
																	Verified
																</span>
															)}
														</div>

														{/* Tags */}
														<div className="flex flex-wrap gap-2 mb-5">
															{emp.industry && (
																<span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#148F8B]/10 text-[#0D7377]">
																	{emp.industry}
																</span>
															)}
															{emp.company_size && (
																<span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700">
																	{emp.company_size}
																</span>
															)}
														</div>

														{/* Contact info */}
														<div className="space-y-3 mb-6">
															{emp.location && (
																<div className="flex items-center gap-3 text-sm text-gray-700">
																	<div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
																		<MapPin
																			size={15}
																			className="text-gray-500"
																		/>
																	</div>
																	<span className="font-semibold">
																		{emp.location}
																	</span>
																</div>
															)}
															{emp.email && (
																<a
																	href={`mailto:${emp.email}`}
																	className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#148F8B] transition-colors group/row"
																>
																	<div className="w-8 h-8 rounded-lg bg-gray-100 group-hover/row:bg-[#148F8B]/10 flex items-center justify-center shrink-0 transition-colors">
																		<Mail
																			size={15}
																			className="text-gray-500 group-hover/row:text-[#148F8B]"
																		/>
																	</div>
																	<span className="font-semibold">
																		{emp.email}
																	</span>
																</a>
															)}
															{emp.phone && (
																<a
																	href={`tel:${emp.phone}`}
																	className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#148F8B] transition-colors group/row"
																>
																	<div className="w-8 h-8 rounded-lg bg-gray-100 group-hover/row:bg-[#148F8B]/10 flex items-center justify-center shrink-0 transition-colors">
																		<Phone
																			size={15}
																			className="text-gray-500 group-hover/row:text-[#148F8B]"
																		/>
																	</div>
																	<span className="font-semibold">
																		{emp.phone}
																	</span>
																</a>
															)}
															{website && (
																<a
																	href={website}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#148F8B] transition-colors group/row"
																>
																	<div className="w-8 h-8 rounded-lg bg-gray-100 group-hover/row:bg-[#148F8B]/10 flex items-center justify-center shrink-0 transition-colors">
																		<Globe
																			size={15}
																			className="text-gray-500 group-hover/row:text-[#148F8B]"
																		/>
																	</div>
																	<span className="font-semibold truncate">
																		{emp.website}
																	</span>
																</a>
															)}
														</div>

														{/* About */}
														{emp.company_description && (
															<div>
																<p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
																	About
																</p>
																<p className="text-sm text-gray-700 leading-relaxed">
																	{emp.company_description}
																</p>
															</div>
														)}

														{/* Report link */}
														<div className="pt-2 border-t border-gray-100">
															<a
																href={`mailto:support@hanahire.com?subject=Report%20Discrimination%20or%20Abuse&body=Business%3A%20${encodeURIComponent(emp.business_name || "")}%0ABusiness%20ID%3A%20${emp.id}%0A%0APlease%20describe%20what%20happened%3A`}
																className="inline-flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-[10px] font-black text-red-500 hover:bg-red-100 hover:text-red-600 uppercase tracking-widest transition-colors"
															>
																Report Discrimination or Abuse
															</a>
														</div>
													</div>
												</div>
											</div>
										);
									})()}

								{/* Business filter modal */}
								<Modal
									isOpen={showBizFilterModal}
									onClose={() => setShowBizFilterModal(false)}
									title="Refine Businesses"
								>
									<div className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
										<div className="flex justify-between items-center pb-4 border-b border-gray-100">
											<span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
												Business Filters
											</span>
											<button
												type="button"
												onClick={() => {
													setBizIndustryFilter([]);
													setBizLocationFilter([]);
												}}
												className="text-[10px] font-black text-[#A63F8E] uppercase tracking-widest hover:underline hover:scale-105 active:scale-95 transition-all duration-200"
											>
												Clear All
											</button>
										</div>

										<p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
											Hold Cmd/Ctrl to select multiple
										</p>

										<CollapsibleFilter title="Industry" isOpen={true}>
											<select
												multiple
												value={bizIndustryFilter}
												onChange={(e) =>
													setBizIndustryFilter(
														Array.from(
															e.target.selectedOptions,
															(o) => o.value,
														),
													)
												}
												className="w-full h-44 p-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-bold"
											>
												{bizIndustries.map((ind) => (
													<option key={ind} value={ind}>
														{ind}
													</option>
												))}
											</select>
										</CollapsibleFilter>

										<CollapsibleFilter title="Location" isOpen={true}>
											<select
												multiple
												value={bizLocationFilter}
												onChange={(e) =>
													setBizLocationFilter(
														Array.from(
															e.target.selectedOptions,
															(o) => o.value,
														),
													)
												}
												className="w-full h-44 p-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-bold"
											>
												{bizLocations.map((loc) => (
													<option key={loc} value={loc}>
														{loc}
													</option>
												))}
											</select>
										</CollapsibleFilter>

										<div className="pt-6">
											<Button
												className="w-full h-16 rounded-2xl text-lg hover:scale-105 active:scale-95 transition-all duration-200"
												onClick={() => setShowBizFilterModal(false)}
											>
												Show{" "}
												{
													employers.filter((emp) => {
														const q = searchQuery.trim().toLowerCase();
														const mq =
															!q ||
															(emp.business_name || "")
																.toLowerCase()
																.includes(q) ||
															(emp.industry || "").toLowerCase().includes(q) ||
															(emp.location || "").toLowerCase().includes(q) ||
															(emp.company_description || "")
																.toLowerCase()
																.includes(q);
														const mi =
															bizIndustryFilter.length === 0 ||
															bizIndustryFilter.includes(emp.industry);
														const ml =
															bizLocationFilter.length === 0 ||
															bizLocationFilter.includes(emp.location);
														return mq && mi && ml;
													}).length
												}{" "}
												Results
											</Button>
										</div>
									</div>
								</Modal>
							</>
						);
					})()
				: null}

			{/* MOBILE: Swipe card */}
			{browseMode === "jobs" && isMobile ? (
				<div className="space-y-6">
					<div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
						<span>
							{recoveredQueue.length > 0
								? `Recovered · ${recoveredQueue.length} to review`
								: `Job ${sortedJobs.length === 0 ? 0 : index + 1} of ${sortedJobs.length}`}
						</span>
						<span>Swipe left to skip, swipe right to save</span>
					</div>

					{/* Recovered-item indicator */}
					{recoveredQueue.length > 0 && (
						<div className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 border border-[#148F8B]/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#148F8B]">
							<RotateCcw size={12} />
							Reviewing recovered job
						</div>
					)}

					{currentJob ? (
						<motion.div
							drag="x"
							dragListener={false}
							dragConstraints={{ left: 0, right: 0 }}
							dragElastic={0.18}
							data-swipe-card="true"
							style={{
								x,
								rotate,
								opacity: cardOpacity,
								background: "#FAFAFA",
								borderLeft: `6px solid ${getJobCategoryStyle(currentJob.job_category).borderColor}`,
							}}
							className="relative p-4 border border-gray-100 rounded-xl shadow-xl overflow-hidden select-none"
							onClick={() => onSelectJob(currentJob)}
							onTouchStart={handleTouchStart}
							onTouchMove={handleTouchMove}
							onTouchEnd={handleTouchEnd}
						>
							{/* Swipe badges */}
							<motion.div
								style={{ opacity: passOpacity, scale: badgeScale }}
								className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[calc(100%+24px)] px-6 py-3 rounded-lg bg-[#A63F8E] text-white text-xs font-black uppercase tracking-widest shadow-2xl pointer-events-none"
							>
								Skip
							</motion.div>
							<motion.div
								style={{ opacity: saveOpacity, scale: badgeScale }}
								className="absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-[24px] px-6 py-3 rounded-lg bg-[#148F8B] text-white text-xs font-black uppercase tracking-widest shadow-2xl pointer-events-none"
							>
								Save
							</motion.div>

							{/* Top row: image + title + save button */}
							<div className="flex items-start gap-3">
								<JobListingThumbnail
									job={currentJob}
									showEmployerLogo={isUnlocked(currentJob.id)}
									sizePx={56}
								/>
								<div
									className="flex-1 min-w-0 cursor-pointer"
									onClick={() => onSelectJob(currentJob)}
								>
									<h3 className="text-lg font-black tracking-tight leading-snug break-words">
										{currentJob.title}
									</h3>
									<div className="flex flex-wrap gap-2 mt-2">
										{currentJob.company_industry && (
											<span
												className="inline-flex px-2.5 py-1 text-xs font-bold rounded-lg"
												style={{
													backgroundColor: "rgba(20, 143, 139, 0.15)",
													color: "#0D7377",
												}}
											>
												{currentJob.company_industry}
											</span>
										)}
										{currentJob.job_category &&
											(() => {
												const s = getJobCategoryStyle(currentJob.job_category);
												return (
													<span
														className="inline-flex px-2.5 py-1 text-xs font-bold uppercase rounded-lg w-fit"
														style={{
															background:
																s.badgeBackground ?? "rgba(249, 115, 22, 0.1)",
															color: s.textColor ?? "#C05621",
														}}
													>
														{currentJob.job_category}
													</span>
												);
											})()}
										{currentJob.company_size && (
											<span
												className="inline-flex px-2.5 py-1 text-xs font-bold rounded-lg"
												style={{
													backgroundColor: "rgba(139, 92, 246, 0.18)",
													color: "#5B21B6",
												}}
											>
												{currentJob.company_size}
											</span>
										)}
									</div>
								</div>
								<div onClick={(e) => e.stopPropagation()} className="shrink-0">
									<button
										type="button"
										onClick={() => {
											handleToggleBookmark(currentJob);
											resetCard();
										}}
										className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-[#F3EAF5]/30 transition-all"
										title={
											isInQueue(currentJob.id)
												? "Remove from saved"
												: "Save job"
										}
									>
										<svg
											className="w-6 h-6"
											style={{
												fill: isInQueue(currentJob.id) ? "#A63F8E" : "none",
												stroke: isInQueue(currentJob.id)
													? "#A63F8E"
													: "#9CA3AF",
												strokeWidth: "2",
											}}
											viewBox="0 0 24 24"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
										</svg>
										<span
											className="text-[10px] font-black uppercase"
											style={{
												color: isInQueue(currentJob.id) ? "#A63F8E" : "#6B7280",
											}}
										>
											{isInQueue(currentJob.id) ? "Saved" : "Save"}
										</span>
									</button>
								</div>
							</div>

							{/* Metadata row */}
							<div
								className="flex flex-wrap text-[11px] font-semibold text-gray-500 mt-3"
								style={{ gap: "0.5rem 1rem" }}
							>
								<span className="flex items-center gap-1">
									<MapPin size={10} /> {currentJob.location}
								</span>
								<span className="flex items-center gap-1 text-[#148F8B]">
									<DollarSign size={10} /> {currentJob.pay_range}
								</span>
								<span className="flex items-center gap-1">
									<Briefcase size={10} /> {currentJob.job_type}
								</span>
								{isApplied(currentJob.id) && (
									<span className="text-[#148F8B] flex items-center gap-1 font-black">
										Applied ✓
									</span>
								)}
							</div>

							{/* Description — full width */}
							<div
								className="cursor-pointer mt-3"
								onClick={() => onSelectJob(currentJob)}
							>
								{currentJob.description && (
									<p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
										{currentJob.description}
									</p>
								)}
								<p className="text-xs font-black text-[#148F8B] uppercase tracking-widest mt-2">
									Tap for details →
								</p>
							</div>

							{/* Action buttons - Skip, Save, Undo */}
							<div
								className="pt-2.5 mt-0.5 space-y-1.5"
								onClick={(e) => e.stopPropagation()}
							>
								<div className="grid grid-cols-2 gap-2">
									<button
										type="button"
										onClick={() => {
											handlePass();
											resetCard();
										}}
										className="h-9 rounded-lg border-2 border-gray-200 bg-white font-bold uppercase text-[11px] text-gray-700 hover:border-gray-300 hover:bg-[#F3EAF5]/30 transition-all active:scale-95"
									>
										Skip
									</button>
									<button
										type="button"
										onClick={() => {
											handleToggleBookmark(currentJob);
											resetCard();
										}}
										className="h-9 rounded-lg bg-[#148F8B] text-white font-bold uppercase text-[11px] flex items-center justify-center gap-1.5 hover:bg-[#006aa8] transition-all active:scale-95"
									>
										<svg
											className="w-4 h-4"
											style={{
												fill: isInQueue(currentJob.id) ? "#A63F8E" : "none",
												stroke: "white",
												strokeWidth: "2.5",
											}}
											viewBox="0 0 24 24"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
										</svg>
										Save
									</button>
								</div>
								{passedJobs.length > 0 && (
									<div className="flex gap-1.5">
										{recoveredQueue.length === 0 && (
											<button
												type="button"
												onClick={handleUndo}
												className="flex-1 h-8 rounded-lg border border-gray-200 bg-white font-bold uppercase text-[10px] text-gray-600 hover:border-[#148F8B] hover:text-[#148F8B] flex items-center justify-center gap-1"
											>
												Undo
											</button>
										)}
										<button
											type="button"
											onClick={() => setShowPassedBin(true)}
											className={`${recoveredQueue.length > 0 ? "w-full" : "flex-1"} h-8 rounded-lg border border-gray-200 bg-white font-bold uppercase text-[10px] text-gray-500 hover:border-[#A63F8E] hover:text-[#A63F8E] flex items-center justify-center gap-1`}
										>
											<Trash2 size={11} /> {passedJobs.length} Passed
										</button>
									</div>
								)}
							</div>
						</motion.div>
					) : (
						<div className="p-12 bg-white border-4 border-dashed border-gray-100 rounded-3xl text-center">
							<p className="text-gray-400 font-black text-lg uppercase tracking-widest">
								No more jobs
							</p>
						</div>
					)}
				</div>
			) : browseMode === "jobs" ? (
				/* DESKTOP: Compact cards + floating Apply button tied to bookmark queue */
				<div className="space-y-3">
					{/* Floating Apply button — visible when items are bookmarked */}
					{queue.length > 0 && (
						<div className="fixed bottom-8 right-8 z-50">
							<button
								type="button"
								onClick={() => onShowPayment({ type: "seeker", items: queue })}
								className="flex items-center gap-2 px-6 py-4 bg-[#148F8B] text-white rounded-2xl font-black uppercase tracking-wide text-sm shadow-2xl shadow-[#148F8B]/40 hover:bg-[#006aa8] transition-all hover:scale-105 active:scale-95 duration-200"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									strokeWidth="2.5"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								Apply to Saved Jobs ({queue.length})
							</button>
						</div>
					)}

					{sortedJobs.length === 0 ? (
						<div className="p-16 bg-white border-4 border-dashed border-gray-100 rounded-3xl text-center">
							<p className="text-gray-400 font-black text-xl uppercase tracking-widest">
								No jobs found
							</p>
						</div>
					) : (
						sortedJobs.map((job) => {
							const categoryStyle = getJobCategoryStyle(job.job_category);
							return (
								<div
									key={job.id}
									className="relative p-6 border border-gray-100 rounded-2xl hover:shadow-2xl transition-all group overflow-hidden flex"
									style={{
										background: "#FAFAFA",
										borderLeft: `6px solid ${categoryStyle.borderColor}`,
									}}
								>
									{/* Layout: [ Left: illustration + metadata ] [ Middle: title + description + tap ] [ Right: Save ] */}
									<div className="flex gap-4 items-stretch flex-1 min-w-0">
										{/* Left: illustration + info centered under it, no outline */}
										<div
											className="shrink-0 flex flex-col gap-2.5 items-center"
											style={{ width: 148 }}
										>
											<JobListingThumbnail
												job={job}
												showEmployerLogo={isUnlocked(job.id)}
												sizePx={132}
											/>
											<div className="flex flex-wrap gap-2 justify-center">
												{job.company_industry && (
													<span
														className="inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded"
														style={{
															backgroundColor: "rgba(20, 143, 139, 0.15)",
															color: "#0D7377",
														}}
													>
														{job.company_industry}
													</span>
												)}
												{job.job_category && (
													<span
														className="inline-flex px-1.5 py-0.5 text-[9px] font-bold uppercase rounded w-fit"
														style={{
															background:
																categoryStyle.badgeBackground ??
																"rgba(249, 115, 22, 0.1)",
															color: categoryStyle.textColor ?? "#C05621",
														}}
													>
														{job.job_category}
													</span>
												)}
												{job.company_size && (
													<span
														className="inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded"
														style={{
															backgroundColor: "rgba(139, 92, 246, 0.18)",
															color: "#5B21B6",
														}}
													>
														{job.company_size}
													</span>
												)}
											</div>
										</div>

										{/* Middle: title, location/pay/type, description, tap */}
										<div
											className="flex-1 min-w-0 flex flex-col justify-center gap-3 px-4 py-2 cursor-pointer"
											onClick={() => onSelectJob(job)}
										>
											<h3 className="text-lg font-black tracking-tight leading-snug break-words">
												{job.title}
											</h3>
											<div
												className="flex flex-wrap text-[11px] font-semibold text-gray-500"
												style={{ gap: "0.75rem 1.25rem" }}
											>
												<span className="flex items-center gap-1">
													<MapPin size={10} /> {job.location}
												</span>
												<span className="flex items-center gap-1 text-[#148F8B]">
													<DollarSign size={10} /> {job.pay_range}
												</span>
												<span className="flex items-center gap-1">
													<Briefcase size={10} /> {job.job_type}
												</span>
											</div>
											{job.description && (
												<p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
													{job.description}
												</p>
											)}
											<p className="text-xs font-black text-[#148F8B] uppercase tracking-widest">
												Tap to see full details →
											</p>
										</div>

										{/* Right: larger Save button */}
										<div
											onClick={(e) => e.stopPropagation()}
											className="shrink-0 flex items-center"
										>
											<button
												type="button"
												onClick={() => handleToggleBookmark(job)}
												className="flex flex-col items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-[#F3EAF5]/30 transition-all"
												title={
													isInQueue(job.id) ? "Remove from saved" : "Save job"
												}
											>
												<svg
													className="w-7 h-7"
													style={{
														fill: isInQueue(job.id) ? "#A63F8E" : "none",
														stroke: isInQueue(job.id) ? "#A63F8E" : "#9CA3AF",
														strokeWidth: "2",
													}}
													viewBox="0 0 24 24"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
												</svg>
												<span
													className="text-xs font-black uppercase"
													style={{
														color: isInQueue(job.id) ? "#A63F8E" : "#6B7280",
													}}
												>
													{isInQueue(job.id) ? "Saved" : "Save"}
												</span>
											</button>
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>
			) : null}

			{/* ── Passed Jobs Bin (slide-up panel) ── */}
			{showPassedBin && (
				<div
					className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm"
					onClick={() => setShowPassedBin(false)}
				>
					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby="passed-jobs-title"
						className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl flex flex-col"
						style={{ maxHeight: "75vh" }}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Drag handle */}
						<div className="flex justify-center pt-3 pb-1">
							<div className="w-10 h-1 bg-gray-200 rounded-full" />
						</div>

						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
							<div>
								<h3
									id="passed-jobs-title"
									className="text-xl font-black tracking-tight"
								>
									Passed
								</h3>
								<p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
									{passedJobs.length} job{passedJobs.length !== 1 ? "s" : ""}
								</p>
							</div>
							<div className="flex items-center gap-3">
								{passedJobs.length > 1 && (
									<button
										type="button"
										onClick={handleRecoverAll}
										className="text-[10px] font-black uppercase tracking-widest text-[#148F8B] hover:text-[#006aa8] transition-colors hover:scale-105 active:scale-95 transition-all duration-200"
									>
										Recover All
									</button>
								)}
								{passedJobs.length > 0 && (
									<button
										type="button"
										onClick={handleClearBin}
										className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors hover:scale-105 active:scale-95 transition-all duration-200"
									>
										Clear All
									</button>
								)}
								<button
									type="button"
									onClick={() => setShowPassedBin(false)}
									aria-label="Close passed jobs panel"
									className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors hover:scale-105 active:scale-95 transition-all duration-200"
								>
									<X aria-hidden="true" size={16} />
								</button>
							</div>
						</div>

						{/* Item list */}
						<div className="overflow-y-auto flex-1 px-6 py-4 space-y-3 pb-20">
							{passedJobs.length === 0 ? (
								<div className="py-12 text-center">
									<Trash2 size={32} className="mx-auto text-gray-400 mb-3" />
									<p className="text-gray-400 font-black text-sm uppercase tracking-widest">
										Bin is empty
									</p>
								</div>
							) : (
								[...passedJobs].reverse().map((job) => {
									const binLogo = isUnlocked(job.id)
										? trimmedCompanyLogoUrl(job)
										: null;
									return (
										<div
											key={job.id}
											className="flex items-center gap-3 p-3 bg-[#F3EAF5]/30 rounded-2xl"
										>
											{binLogo ? (
												<div className="w-12 h-12 rounded-xl bg-white border border-gray-100 shrink-0 flex items-center justify-center p-0.5 overflow-hidden">
													<img
														src={binLogo}
														alt=""
														className="w-full h-full object-contain"
													/>
												</div>
											) : (
												<div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0 flex items-center justify-center">
													<Briefcase size={20} className="text-gray-400" />
												</div>
											)}

											{/* Info */}
											<div className="flex-1 min-w-0">
												<p className="text-sm font-black truncate">
													{job.title}
												</p>
												<p className="text-[10px] font-black uppercase tracking-widest text-gray-400 truncate">
													{job.location} · {job.pay_range}
												</p>
												<p className="text-[10px] text-gray-400 truncate mt-0.5">
													{job.job_type}
												</p>
											</div>

											{/* Recover button */}
											<button
												type="button"
												onClick={() => handleRecover(job)}
												className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#148F8B] text-white text-[10px] font-black uppercase tracking-wide hover:bg-[#006aa8] transition-colors hover:scale-105 active:scale-95 transition-all duration-200"
											>
												<RotateCcw size={12} />
												Recover
											</button>
										</div>
									);
								})
							)}
						</div>
					</div>
				</div>
			)}
		</motion.div>
	);
};
