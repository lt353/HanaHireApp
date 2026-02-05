import React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Search,
  Filter,
  MapPin,
  Lock,
  Play,
  Eye,
  ShoppingCart,
  Briefcase,
} from "lucide-react";
import { Button } from "../ui/Button";

interface CandidatesListProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredCandidates: any;
  unlockedCandidateIds: any;
  employerQueue: any;
  onAddToQueue: (candidate: any) => void;
  onShowPayment: (target: any) => void;
  onShowFilters: () => void;
  onSelectCandidate: (candidate: any) => void;
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

// Simple image component with fallback
const ImageWithFallback: React.FC<{ src: string; className?: string }> = ({ src, className }) => {
  return <img src={src} className={className} alt="" />;
};

export const CandidatesList: React.FC<CandidatesListProps> = ({
  searchQuery,
  setSearchQuery,
  filteredCandidates,
  unlockedCandidateIds,
  employerQueue,
  onAddToQueue,
  onShowPayment,
  onShowFilters,
  onSelectCandidate,
  interactionFee,
}) => {
  const isMobile = useIsMobile(768);

  const candidates: any[] = Array.isArray(filteredCandidates)
    ? filteredCandidates
    : [];
  const unlockedIds: any[] = Array.isArray(unlockedCandidateIds)
    ? unlockedCandidateIds
    : [];
  const queue: any[] = Array.isArray(employerQueue) ? employerQueue : [];

  // Mobile swipe state
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    setIndex(0);
  }, [searchQuery, candidates.length]);

  const currentCandidate = candidates[index];

  const goNext = React.useCallback(() => {
    setIndex((prev) => {
      const next = prev + 1;
      if (next >= candidates.length) return prev;
      return next;
    });
  }, [candidates.length]);

  // Swipe motion values (mobile only)
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-160, 0, 160], [-6, 0, 6]);
  const cardOpacity = useTransform(x, [-220, 0, 220], [0.75, 1, 0.75]);

  // BADGES: fade in immediately when swipe starts
  const unlockOpacity = useTransform(x, [4, 40], [0, 1]);
  const passOpacity = useTransform(x, [-4, -40], [0, 1]);
  const badgeScale = useTransform(
    x,
    [-140, -40, 40, 140],
    [0.92, 1, 1, 0.92]
  );

  const SWIPE_THRESHOLD = 110;

  const resetCard = () => {
    animate(x, 0, { type: "spring", stiffness: 320, damping: 26 });
  };

  const isInQueue = (id: any) => queue.some((q) => q?.id === id);
  const isUnlocked = (id: any) => unlockedIds.includes(id);

  const handlePass = React.useCallback(() => {
    goNext();
  }, [goNext]);

  const handleUnlock = React.useCallback(() => {
    if (!currentCandidate) return;
    onShowPayment({ type: "employer", items: [currentCandidate] });
    goNext();
  }, [currentCandidate, goNext, onShowPayment]);

  const swipeOut = (direction: "left" | "right") => {
    const targetX = direction === "left" ? -420 : 420;
    animate(x, targetX, { type: "spring", stiffness: 260, damping: 24 });

    window.setTimeout(() => {
      if (direction === "left") handlePass();
      else handleUnlock();
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
        <h2 className="text-6xl font-black tracking-tighter">Browse Talent</h2>
        <p className="text-2xl text-gray-500 font-medium">
          Unlock a candidate to reveal full video and contact details.
        </p>
      </div>

      {/* Search + Filters */}
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
            placeholder="Search candidates by skills, location..."
            className="w-full pl-14 pr-5 py-5 rounded-lg bg-white border border-gray-100 shadow-sm focus:ring-4 ring-[#0077BE]/10 outline-none font-bold text-lg"
          />
        </div>

        <Button
          variant="outline"
          className="h-16 px-8 bg-white rounded-lg"
          onClick={onShowFilters}
        >
          <Filter size={20} /> Filters
        </Button>
      </div>

      {/* MOBILE: Swipe card */}
      {isMobile ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span>
              Candidate {candidates.length === 0 ? 0 : index + 1} of{" "}
              {candidates.length}
            </span>
            <span>Swipe left to pass, swipe right to unlock</span>
          </div>

          {currentCandidate ? (
            <motion.div
              drag="x"
              dragListener={false} // Disable Framer Motion's drag listener
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              data-swipe-card="true"
              style={{ x, rotate, opacity: cardOpacity }}
              className="relative p-8 bg-white border border-gray-100 rounded-lg shadow-xl space-y-6 overflow-hidden select-none"
              onClick={() => onSelectCandidate(currentCandidate)}
              // ✅ Manual touch event handlers for iOS Safari
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* BADGES */}
              <motion.div
                style={{ opacity: passOpacity, scale: badgeScale }}
                className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[calc(100%+24px)] px-6 py-3 rounded-lg bg-[#FF6B6B] text-white text-xs font-black uppercase tracking-widest shadow-2xl z-20 pointer-events-none"
              >
                Pass
              </motion.div>

              <motion.div
                style={{ opacity: unlockOpacity, scale: badgeScale }}
                className="absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-[24px] px-6 py-3 rounded-lg bg-[#2ECC71] text-white text-xs font-black uppercase tracking-widest shadow-2xl z-20 pointer-events-none"
              >
                Unlock
              </motion.div>

              {/* Video Preview Blur */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-6">
                <ImageWithFallback 
                  src={currentCandidate.thumbnail || currentCandidate.video_thumbnail_url}
                  className={`w-full h-full object-cover transition-all duration-700 ${isUnlocked(currentCandidate.id) ? 'blur-0' : 'blur-[7px] opacity-80'}`}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                  <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40">
                    {isUnlocked(currentCandidate.id) ? (
                      <Play size={20} className="text-white fill-white ml-1" />
                    ) : (
                      <Lock size={20} className="text-white" />
                    )}
                  </div>
                </div>
                {!isUnlocked(currentCandidate.id) && (
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest">
                    Pay to Reveal
                  </div>
                )}
              </div>

              {/* Candidate summary */}
              <div className="space-y-3">
                <h3 className="text-4xl font-black tracking-tight leading-none">
                  {currentCandidate.display_title || currentCandidate.name || "Verified Talent"}
                </h3>

                <div className="flex flex-wrap gap-4 text-xs font-black uppercase tracking-widest text-gray-400">
                  <span className="flex items-center gap-2">
                    <MapPin size={16} /> {currentCandidate.location}
                  </span>

                  <span className="flex items-center gap-2">
                    <Briefcase size={16} /> {currentCandidate.years_experience} YRS
                  </span>

                  <span className="flex items-center gap-2 text-[#2ECC71]">
                    {currentCandidate.availability || 'Immediate'}
                  </span>

                  <span className="flex items-center gap-2">
                    <Lock size={16} />{" "}
                    {isUnlocked(currentCandidate.id) ? "Unlocked" : "Locked"}
                  </span>
                </div>

                {/* Skills chips */}
                {Array.isArray(currentCandidate.skills) && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {currentCandidate.skills.slice(0, 4).map((s: string, i: number) => (
                      <span
                        key={`${s}-${i}`}
                        className="px-3 py-2 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-100"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToQueue(currentCandidate);
                    // Auto-advance to next card with animation on mobile
                    swipeOutAndAdvance();
                  }}
                  className={`p-4 rounded-lg border transition-all ${
                    isInQueue(currentCandidate.id)
                      ? "bg-[#0077BE] text-white border-[#0077BE]"
                      : "bg-gray-50 border-gray-100 text-gray-600 hover:text-[#0077BE] hover:border-[#0077BE]"
                  }`}
                  aria-label="Add to queue"
                >
                  <ShoppingCart size={22} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePass();
                    resetCard();
                  }}
                  className="flex-1 h-14 rounded-lg border border-gray-200 bg-white font-black uppercase tracking-widest text-[10px] text-gray-700"
                >
                  Pass
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnlock();
                    resetCard();
                  }}
                  className="flex-1 h-14 rounded-lg bg-[#2ECC71] text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#2ECC71]/20"
                >
                  Unlock ${interactionFee.toFixed(2)}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="p-16 text-center text-gray-400">
              <p className="text-lg font-black uppercase tracking-widest">No candidates available</p>
            </div>
          )}
        </div>
      ) : (
        // Desktop grid view - keep your existing desktop layout
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => onSelectCandidate(candidate)}
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