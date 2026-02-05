import React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Search,
  Filter,
  MapPin,
  Lock,
  ShoppingCart,
  Briefcase,
  DollarSign,
} from "lucide-react";

interface JobsListProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredJobs: any;
  unlockedJobIds: any;
  seekerQueue: any;
  onAddToQueue: (job: any) => void;
  onShowPayment: (target: any) => void;
  onShowFilters: () => void;
  onSelectJob: (job: any) => void;
  interactionFee: number;
}

function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const update = () => setIsMobile(mq.matches);

    update();

    if (mq.addEventListener) mq.addEventListener("change", update);
    // Safari fallback
    // @ts-ignore
    else mq.addListener(update);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      // @ts-ignore
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
  seekerQueue,
  onAddToQueue,
  onShowPayment,
  onShowFilters,
  onSelectJob,
  interactionFee,
}) => {
  const isMobile = useIsMobile(768);

  // ✅ Normalize so we never crash on .map/.includes
  const jobs: any[] = Array.isArray(filteredJobs) ? filteredJobs : [];
  const unlockedIds: any[] = Array.isArray(unlockedJobIds) ? unlockedJobIds : [];
  const queue: any[] = Array.isArray(seekerQueue) ? seekerQueue : [];

  // Mobile swipe index
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    setIndex(0);
  }, [searchQuery, jobs.length]);

  const currentJob = jobs[index];

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

  // ✅ Badges fade in immediately when swipe starts
  const applyOpacity = useTransform(x, [4, 40], [0, 1]);
  const passOpacity = useTransform(x, [-4, -40], [0, 1]);

  const badgeScale = useTransform(x, [-140, -40, 40, 140], [0.92, 1, 1, 0.92]);

  const SWIPE_THRESHOLD = 110;

  const resetCard = () => {
    animate(x, 0, { type: "spring", stiffness: 320, damping: 26 });
  };

  const isInQueue = (id: any) => queue.some((q) => q?.id === id);
  const isUnlocked = (id: any) => unlockedIds.includes(id);

  const handlePass = React.useCallback(() => {
    goNext();
  }, [goNext]);

  const handleApply = React.useCallback(() => {
    if (!currentJob) return;
    onShowPayment({ type: "seeker", items: [currentJob] });
    goNext();
  }, [currentJob, goNext, onShowPayment]);

  const swipeOut = (direction: "left" | "right") => {
    const targetX = direction === "left" ? -420 : 420;
    animate(x, targetX, { type: "spring", stiffness: 260, damping: 24 });

    window.setTimeout(() => {
      if (direction === "left") handlePass();
      else handleApply();
      animate(x, 0, { type: "spring", stiffness: 320, damping: 26 });
    }, 140);
  };

  const swipeOutAndAdvance = () => {
    // For cart button: animate swipe right and advance WITHOUT opening payment
    const targetX = 420;
    animate(x, targetX, { type: "spring", stiffness: 260, damping: 24 });

    window.setTimeout(() => {
      goNext();
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

  // ✅ iOS Safari touch handling - manual touch events
  const touchStartX = React.useRef(0);
  const isDragging = React.useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    e.preventDefault(); // Prevent scrolling while swiping
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
          Swipe right to apply and unlock business identity.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search jobs by title, location..."
            className="w-full pl-14 pr-5 py-5 rounded-lg bg-white border border-gray-100 shadow-sm focus:ring-4 ring-[#0077BE]/10 outline-none font-bold text-lg"
          />
        </div>

        <button
          type="button"
          className="h-16 px-8 bg-white rounded-lg border border-gray-200 font-black uppercase tracking-widest text-[10px] text-gray-700 inline-flex items-center justify-center gap-3"
          onClick={onShowFilters}
        >
          <Filter size={20} /> Filters
        </button>
      </div>

      {/* MOBILE: Swipe card */}
      {isMobile ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span>
              Job {jobs.length === 0 ? 0 : index + 1} of {jobs.length}
            </span>
            <span>Swipe left to skip, swipe right to apply</span>
          </div>

          {currentJob ? (
            <motion.div
              drag="x"
              dragListener={false} // Disable Framer Motion's drag listener
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              data-swipe-card="true"
              style={{ x, rotate, opacity: cardOpacity }}
              className="relative p-6 bg-white border border-gray-100 rounded-lg shadow-xl space-y-6 overflow-hidden select-none"
              onClick={() => onSelectJob(currentJob)}
              // ✅ Manual touch event handlers for iOS Safari
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* ✅ Swipe badges moved to CENTER so users actually see them */}
              <motion.div
                style={{ opacity: passOpacity, scale: badgeScale }}
                className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[calc(100%+24px)] px-6 py-3 rounded-lg bg-[#FF6B6B] text-white text-xs font-black uppercase tracking-widest shadow-2xl pointer-events-none"
              >
                Skip
              </motion.div>

              <motion.div
                style={{ opacity: applyOpacity, scale: badgeScale }}
                className="absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-[24px] px-6 py-3 rounded-lg bg-[#2ECC71] text-white text-xs font-black uppercase tracking-widest shadow-2xl pointer-events-none"
              >
                Apply
              </motion.div>

              {/* Job summary - rest of your existing JSX */}
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
                    <Lock size={14} /> {isUnlocked(currentJob.id) ? "Unlocked" : "Locked"}
                  </span>
                </div>
              </div>

              {/* Add rest of your existing job card content here */}
            </motion.div>
          ) : (
            <div className="p-16 text-center text-gray-400">
              <p className="text-lg font-black uppercase tracking-widest">No jobs available</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => swipeOut("left")}
              disabled={!currentJob}
              className="flex-1 h-16 rounded-lg border-2 border-[#FF6B6B] text-[#FF6B6B] font-black uppercase tracking-widest text-xs hover:bg-[#FF6B6B]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Skip
            </button>
            <button
              onClick={() => swipeOut("right")}
              disabled={!currentJob}
              className="flex-1 h-16 rounded-lg bg-[#2ECC71] text-white font-black uppercase tracking-widest text-xs hover:bg-[#27AE60] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      ) : (
        // Desktop grid view - keep your existing desktop layout
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="p-6 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              {/* Your existing desktop card content */}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};