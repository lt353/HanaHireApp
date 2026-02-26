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
  interactionFee,
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

    const getPostedTime = (j: any) => {
      const raw = j.posted_at || j.created_at || j.createdAt;
      if (!raw) return 0;
      const t = Date.parse(raw);
      return Number.isNaN(t) ? 0 : t;
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
          return getPostedTime(b) - getPostedTime(a);
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

  // iOS Safari touch handling - manual touch events
  const touchStartX = React.useRef(0);
  const isDragging = React.useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    x.set(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    handleDragEnd();
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
              style={{ x, rotate, opacity: cardOpacity }}
              className="relative p-6 bg-white border border-gray-100 rounded-lg shadow-xl space-y-6 overflow-hidden select-none"
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

              {/* Job summary */}
              <div className="space-y-3">
                <h3 className="text-3xl font-black tracking-tight leading-none break-words">
                  {currentJob.title}
                </h3>

                <div className="flex flex-wrap gap-3 text-xs font-black uppercase tracking-widest text-gray-400">
                  <span className="flex items-center gap-2 shrink-0">
                    <MapPin size={14} /> <span className="truncate">{currentJob.location}</span>
                  </span>

                  <span className="flex items-center gap-2 shrink-0">
                    <DollarSign size={14} /> <span className="truncate">{currentJob.pay_range}</span>
                  </span>

                  <span className="flex items-center gap-2 shrink-0">
                    <Briefcase size={14} /> <span className="truncate">{currentJob.job_type}</span>
                  </span>

                  <span className="flex items-center gap-2 shrink-0">
                    <Lock size={14} /> {isApplied(currentJob.id) ? "Applied" : isUnlocked(currentJob.id) ? "Unlocked" : "Locked"}
                  </span>
                </div>
              </div>

              {currentJob.description && (
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {currentJob.description}
                </p>
              )}

              {/* Action buttons - Skip, Save (bookmark fills in), Undo */}
              <div className="pt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                {/* Main actions: Skip and Save */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      handlePass();
                      resetCard();
                    }}
                    className="h-14 rounded-xl border-2 border-gray-200 bg-white font-bold uppercase tracking-wide text-sm text-gray-700 hover:border-gray-300 hover:bg-[#F3EAF5]/30 transition-all hover:scale-105 active:scale-95 duration-200"
                  >
                    Skip
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleToggleBookmark(currentJob);
                      resetCard();
                    }}
                    className="h-14 rounded-xl bg-[#148F8B] text-white font-bold uppercase tracking-wide text-sm hover:bg-[#006aa8] transition-all shadow-lg shadow-[#148F8B]/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 duration-200"
                  >
                    <svg 
                      className="w-5 h-5 transition-all"
                      style={{
                        fill: isInQueue(currentJob.id) ? '#A63F8E' : 'none',
                        stroke: 'white',
                        strokeWidth: '2.5'
                      }}
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    Save
                  </button>
                </div>

                {/* Undo + Passed Bin row */}
                {passedJobs.length > 0 && (
                  <div className="flex gap-2">
                    {/* Undo — only for main deck swipes, not while reviewing recovered items */}
                    {recoveredQueue.length === 0 && (
                      <button
                        type="button"
                        onClick={handleUndo}
                        className="flex-1 h-12 rounded-xl border-2 border-gray-200 bg-white font-bold uppercase tracking-wide text-sm text-gray-600 hover:border-[#148F8B] hover:text-[#148F8B] hover:bg-[#F3EAF5]/30 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Undo
                      </button>
                    )}

                    {/* Passed bin trigger */}
                    <button
                      type="button"
                      onClick={() => setShowPassedBin(true)}
                      className={`${recoveredQueue.length > 0 ? 'w-full' : 'flex-1'} h-12 rounded-xl border-2 border-gray-200 bg-white font-bold uppercase tracking-wide text-[11px] text-gray-500 hover:border-[#A63F8E] hover:text-[#A63F8E] hover:bg-red-50 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 duration-200`}
                    >
                      <Trash2 size={14} />
                      {passedJobs.length} Passed
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
      ) : (
        /* DESKTOP: Moderate-detail cards + floating Apply button tied to bookmark queue */
        <div className="space-y-6">
          {/* Floating Apply button — visible when items are bookmarked */}
          {queue.length > 0 && (
            <div className="fixed bottom-8 right-8 z-30">
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
            sortedJobs.map((job) => (
              <div
                key={job.id}
                className="p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-6">
                  {/* Job Info - clickable to open full detail modal */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer space-y-3"
                    onClick={() => onSelectJob(job)}
                  >
                   <h3 className="text-2xl font-black tracking-tight leading-tight">{job.title}</h3>

<div className="flex flex-wrap gap-2 text-sm font-bold uppercase tracking-wider">
  <span className="flex items-center gap-1.5 text-gray-500"><MapPin size={14} /> {job.location}</span>
  <span className="flex items-center gap-1.5 text-[#148F8B]"><DollarSign size={14} /> {job.pay_range}</span>
  <span className="flex items-center gap-1.5 text-gray-500"><Briefcase size={14} /> {job.job_type}</span>
  {job.company_industry && (
    <span className="inline-flex items-center px-3 py-1 bg-[#148F8B]/8 text-[#148F8B] rounded-lg whitespace-nowrap">{job.company_industry}</span>
  )}
  {job.company_size && (
    <span className="inline-flex items-center px-3 py-1 bg-gray-50 text-gray-500 rounded-lg border border-gray-100 whitespace-nowrap">{job.company_size}</span>
  )}
</div>

{job.description && (
  <p className="text-base text-gray-600 leading-relaxed line-clamp-2">{job.description}</p>
)}

<p className="text-xs font-black text-[#148F8B] uppercase tracking-widest">Tap to see full details →</p>
                  </div>

                  {/* Bookmark button */}
                  <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(job)}
                      className="flex flex-col items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-[#F3EAF5]/30 transition-all hover:scale-105 active:scale-95 duration-200"
                      title={isInQueue(job.id) ? "Remove from saved" : "Save job"}
                    >
                      <svg
                        className="w-6 h-6 transition-all"
                        style={{
                          fill: isInQueue(job.id) ? '#A63F8E' : 'none',
                          stroke: isInQueue(job.id) ? '#A63F8E' : '#9CA3AF',
                          strokeWidth: '2'
                        }}
                        viewBox="0 0 24 24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                      <span
                        className="text-xs font-bold uppercase tracking-wide transition-all"
                        style={{ color: isInQueue(job.id) ? '#A63F8E' : '#6B7280' }}
                      >
                        {isInQueue(job.id) ? 'Saved' : 'Save'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))
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
                <h3 className="text-xl font-black tracking-tight">Passed</h3>
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
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <X size={16} />
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