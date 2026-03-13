import React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Briefcase,
  Lock,
  Trash2,
  RotateCcw,
  X,
} from "lucide-react";
import { getJobCategoryStyle } from "../../utils/jobCategoryStyles";

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
}) => {
  const isMobile = useIsMobile(768);

  const jobs: any[] = Array.isArray(filteredJobs) ? filteredJobs : [];
  const unlockedIds: any[] = Array.isArray(unlockedJobIds) ? unlockedJobIds : [];
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

  const parsePayValue = React.useCallback((pay: string | undefined | null): number => {
    if (!pay) return 0;
    const numbers = (pay.match(/\d+(\.\d+)?/g) || []).map(Number);
    if (!numbers.length) {
      const lower = pay.toLowerCase();
      if (lower.includes("min")) return 15;
      return 0;
    }
    if (numbers.length === 1) return numbers[0];
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }, []);

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
          return String(a.company_industry || "").localeCompare(String(b.company_industry || ""));
        case "newest":
        default:
          return getIdNum(b) - getIdNum(a);
      }
    });

    return arr;
  }, [jobs, sortOption, viewerLocation, parsePayValue]);

  // Show recovered items first before continuing the main deck
  const currentJob = recoveredQueue.length > 0 ? recoveredQueue[0] : sortedJobs[index];

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
  const isUnlocked = (id: any) => unlockedIds.includes(id);
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
      setPassedJobs(prev => [...prev, recoveredQueue[0]]);
      setRecoveredQueue(prev => prev.slice(1));
      return;
    }
    if (currentJob) {
      setPassedJobs(prev => [...prev, currentJob]);
    }
    goNext();
  }, [currentJob, goNext, recoveredQueue]);

  const handleSave = React.useCallback(() => {
    if (recoveredQueue.length > 0) {
      // Saving a recovered job adds it to queue without touching main deck index
      onAddToQueue(recoveredQueue[0]);
      setRecoveredQueue(prev => prev.slice(1));
      return;
    }
    if (!currentJob) return;
    onAddToQueue(currentJob);
    goNext();
  }, [currentJob, goNext, onAddToQueue, recoveredQueue]);

  const handleUndo = React.useCallback(() => {
    if (passedJobs.length === 0) return;
    setIndex(prev => Math.max(0, prev - 1));
    setPassedJobs(prev => prev.slice(0, -1));
  }, [passedJobs.length]);

  // Recycle bin actions
  const handleRecover = React.useCallback((job: any) => {
    setPassedJobs(prev => prev.filter(j => j.id !== job.id));
    setRecoveredQueue(prev => [...prev, job]);
  }, []);

  const handleRecoverAll = React.useCallback(() => {
    setRecoveredQueue(prev => [...prev, ...passedJobs]);
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
  const gestureDirection = React.useRef<'horizontal' | 'vertical' | null>(null);

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

    if (gestureDirection.current === null && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
      gestureDirection.current = Math.abs(diffX) > Math.abs(diffY) ? 'horizontal' : 'vertical';
    }

    if (gestureDirection.current === 'horizontal') {
      e.preventDefault();
      x.set(diffX);
    }
    // vertical — let the browser handle page scroll naturally
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (gestureDirection.current === 'horizontal') {
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
        <h2 className="text-6xl font-black tracking-tighter">Browse Jobs</h2>
        <p className="text-2xl text-gray-500 font-medium">
          Swipe right to save jobs. Review and apply from your saved folder.
        </p>
      </div>

      {/* Search + Filters + Sort */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search jobs by title, location..."
            aria-label="Search jobs by title or location"
            className="w-full pl-14 pr-5 py-5 rounded-lg bg-white border border-gray-100 shadow-sm focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-lg"
          />
        </div>

        <div className="flex items-center gap-3">
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
              onChange={(e) => setSortOption(e.target.value as JobSortOption)}
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
        </div>
      </div>

      {/* MOBILE: Swipe card */}
      {isMobile ? (
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
              <motion.div style={{ opacity: passOpacity, scale: badgeScale }} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[calc(100%+24px)] px-6 py-3 rounded-lg bg-[#A63F8E] text-white text-xs font-black uppercase tracking-widest shadow-2xl pointer-events-none">Skip</motion.div>
              <motion.div style={{ opacity: saveOpacity, scale: badgeScale }} className="absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-[24px] px-6 py-3 rounded-lg bg-[#148F8B] text-white text-xs font-black uppercase tracking-widest shadow-2xl pointer-events-none">Save</motion.div>

              {/* Top row: image + title + save button */}
              <div className="flex items-start gap-3">
                {getJobCategoryStyle(currentJob.job_category).svgPath ? (
                  <div className="rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-white/60 border border-white/80 p-1" style={{ width: 56, height: 56 }}>
                    <img src={`${import.meta.env.BASE_URL}${getJobCategoryStyle(currentJob.job_category).svgPath}`} alt="" className="w-full h-full object-contain" />
                  </div>
                ) : null}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectJob(currentJob)}>
                  <h3 className="text-lg font-black tracking-tight leading-snug break-words">{currentJob.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentJob.company_industry && <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-lg" style={{ backgroundColor: "rgba(20, 143, 139, 0.15)", color: "#0D7377" }}>{currentJob.company_industry}</span>}
                    {currentJob.job_category && (() => {
                      const s = getJobCategoryStyle(currentJob.job_category);
                      return <span className="inline-flex px-2.5 py-1 text-xs font-bold uppercase rounded-lg w-fit" style={{ background: s.badgeBackground ?? "rgba(249, 115, 22, 0.1)", color: s.textColor ?? "#C05621" }}>{currentJob.job_category}</span>;
                    })()}
                    {currentJob.company_size && <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-lg" style={{ backgroundColor: "rgba(139, 92, 246, 0.18)", color: "#5B21B6" }}>{currentJob.company_size}</span>}
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => { handleToggleBookmark(currentJob); resetCard(); }}
                    className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-[#F3EAF5]/30 transition-all"
                    title={isInQueue(currentJob.id) ? "Remove from saved" : "Save job"}
                  >
                    <svg className="w-6 h-6" style={{ fill: isInQueue(currentJob.id) ? '#A63F8E' : 'none', stroke: isInQueue(currentJob.id) ? '#A63F8E' : '#9CA3AF', strokeWidth: '2' }} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                    <span className="text-[10px] font-black uppercase" style={{ color: isInQueue(currentJob.id) ? '#A63F8E' : '#6B7280' }}>{isInQueue(currentJob.id) ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>

              {/* Metadata row */}
              <div className="flex flex-wrap text-[11px] font-semibold text-gray-500 mt-3" style={{ gap: "0.5rem 1rem" }}>
                <span className="flex items-center gap-1"><MapPin size={10} /> {currentJob.location}</span>
                <span className="flex items-center gap-1 text-[#148F8B]"><DollarSign size={10} /> {currentJob.pay_range}</span>
                <span className="flex items-center gap-1"><Briefcase size={10} /> {currentJob.job_type}</span>
                <span className="text-gray-400 flex items-center gap-1"><Lock size={10} /> {isApplied(currentJob.id) ? "Applied" : isUnlocked(currentJob.id) ? "Unlocked" : "Locked"}</span>
              </div>

              {/* Description — full width */}
              <div className="cursor-pointer mt-3" onClick={() => onSelectJob(currentJob)}>
                {currentJob.description && <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{currentJob.description}</p>}
                <p className="text-xs font-black text-[#148F8B] uppercase tracking-widest mt-2">Tap for details →</p>
              </div>

              {/* Action buttons - Skip, Save, Undo */}
              <div className="pt-2.5 mt-0.5 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { handlePass(); resetCard(); }} className="h-9 rounded-lg border-2 border-gray-200 bg-white font-bold uppercase text-[11px] text-gray-700 hover:border-gray-300 hover:bg-[#F3EAF5]/30 transition-all active:scale-95">Skip</button>
                  <button type="button" onClick={() => { handleToggleBookmark(currentJob); resetCard(); }} className="h-9 rounded-lg bg-[#148F8B] text-white font-bold uppercase text-[11px] flex items-center justify-center gap-1.5 hover:bg-[#006aa8] transition-all active:scale-95">
                    <svg className="w-4 h-4" style={{ fill: isInQueue(currentJob.id) ? '#A63F8E' : 'none', stroke: 'white', strokeWidth: '2.5' }} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                    Save
                  </button>
                </div>
                {passedJobs.length > 0 && (
                  <div className="flex gap-1.5">
                    {recoveredQueue.length === 0 && (
                      <button type="button" onClick={handleUndo} className="flex-1 h-8 rounded-lg border border-gray-200 bg-white font-bold uppercase text-[10px] text-gray-600 hover:border-[#148F8B] hover:text-[#148F8B] flex items-center justify-center gap-1">Undo</button>
                    )}
                    <button type="button" onClick={() => setShowPassedBin(true)} className={`${recoveredQueue.length > 0 ? 'w-full' : 'flex-1'} h-8 rounded-lg border border-gray-200 bg-white font-bold uppercase text-[10px] text-gray-500 hover:border-[#A63F8E] hover:text-[#A63F8E] flex items-center justify-center gap-1`}><Trash2 size={11} /> {passedJobs.length} Passed</button>
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
      ) : (
        /* DESKTOP: Compact cards + floating Apply button tied to bookmark queue */
        <div className="space-y-3">
          {/* Floating Apply button — visible when items are bookmarked */}
          {queue.length > 0 && (
            <div className="fixed bottom-8 right-8 z-50">
              <button
                type="button"
                onClick={() => onShowPayment({ type: 'seeker', items: queue })}
                className="flex items-center gap-2 px-6 py-4 bg-[#148F8B] text-white rounded-2xl font-black uppercase tracking-wide text-sm shadow-2xl shadow-[#148F8B]/40 hover:bg-[#006aa8] transition-all hover:scale-105 active:scale-95 duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Apply to Saved Jobs ({queue.length})
              </button>
            </div>
          )}

          {sortedJobs.length === 0 ? (
            <div className="p-16 bg-white border-4 border-dashed border-gray-100 rounded-3xl text-center">
              <p className="text-gray-400 font-black text-xl uppercase tracking-widest">No jobs found</p>
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
                  <div className="shrink-0 flex flex-col gap-2.5 items-center" style={{ width: 148 }}>
                    {categoryStyle.svgPath ? (
                      <div className="rounded-lg overflow-hidden opacity-90 flex items-center justify-center bg-white/60 border border-white/80 p-1" style={{ width: 132, height: 132 }}>
                        <img src={`${import.meta.env.BASE_URL}${categoryStyle.svgPath}`} alt="" className="w-full h-full object-contain" />
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {job.company_industry && <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded" style={{ backgroundColor: "rgba(20, 143, 139, 0.15)", color: "#0D7377" }}>{job.company_industry}</span>}
                      {job.job_category && <span className="inline-flex px-1.5 py-0.5 text-[9px] font-bold uppercase rounded w-fit" style={{ background: categoryStyle.badgeBackground ?? "rgba(249, 115, 22, 0.1)", color: categoryStyle.textColor ?? "#C05621" }}>{job.job_category}</span>}
                      {job.company_size && <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded" style={{ backgroundColor: "rgba(139, 92, 246, 0.18)", color: "#5B21B6" }}>{job.company_size}</span>}
                    </div>
                  </div>

                  {/* Middle: title, location/pay/type, description, tap */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-3 px-4 py-2 cursor-pointer" onClick={() => onSelectJob(job)}>
                    <h3 className="text-lg font-black tracking-tight leading-snug break-words">{job.title}</h3>
                    <div className="flex flex-wrap text-[11px] font-semibold text-gray-500" style={{ gap: "0.75rem 1.25rem" }}>
                      <span className="flex items-center gap-1"><MapPin size={10} /> {job.location}</span>
                      <span className="flex items-center gap-1 text-[#148F8B]"><DollarSign size={10} /> {job.pay_range}</span>
                      <span className="flex items-center gap-1"><Briefcase size={10} /> {job.job_type}</span>
                    </div>
                    {job.description && <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{job.description}</p>}
                    <p className="text-xs font-black text-[#148F8B] uppercase tracking-widest">Tap to see full details →</p>
                  </div>

                  {/* Right: larger Save button */}
                  <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(job)}
                      className="flex flex-col items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-[#F3EAF5]/30 transition-all"
                      title={isInQueue(job.id) ? "Remove from saved" : "Save job"}
                    >
                      <svg className="w-7 h-7" style={{ fill: isInQueue(job.id) ? '#A63F8E' : 'none', stroke: isInQueue(job.id) ? '#A63F8E' : '#9CA3AF', strokeWidth: '2' }} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                      <span className="text-xs font-black uppercase" style={{ color: isInQueue(job.id) ? '#A63F8E' : '#6B7280' }}>{isInQueue(job.id) ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
            })
          )}
        </div>
      )}

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
                <h3 id="passed-jobs-title" className="text-xl font-black tracking-tight">Passed</h3>
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
                [...passedJobs].reverse().map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 p-3 bg-[#F3EAF5]/30 rounded-2xl"
                  >
                    {/* Job icon placeholder */}
                    <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0 flex items-center justify-center">
                      <Briefcase size={20} className="text-gray-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black truncate">{job.title}</p>
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
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};