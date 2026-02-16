import React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Search,
  Filter,
  MapPin,
  Lock,
  Play,
  Eye,
  FolderPlus,
  Briefcase,
  Trash2,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { ViewType } from '../../App';

interface CandidatesListProps {
  onNavigate: (view: ViewType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredCandidates: any;
  unlockedCandidateIds: any;
  employerQueue: any;
  onAddToQueue: (candidate: any) => void;
  onRemoveFromQueue: (id: number) => void;
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
    else mq.addListener(update);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, [breakpointPx]);

  return isMobile;
}

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
  onRemoveFromQueue,
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
  const [passedCandidates, setPassedCandidates] = React.useState<any[]>([]);
  const [recoveredQueue, setRecoveredQueue] = React.useState<any[]>([]);
  const [showPassedBin, setShowPassedBin] = React.useState(false);

  React.useEffect(() => {
    setIndex(0);
    setPassedCandidates([]);
    setRecoveredQueue([]);
  }, [searchQuery, candidates.length]);

  // Show recovered items first before continuing the main deck
  const currentCandidate = recoveredQueue.length > 0 ? recoveredQueue[0] : candidates[index];

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
  const saveOpacity = useTransform(x, [4, 40], [0, 1]);
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

  // Toggle bookmark - add or remove from queue
  const handleToggleBookmark = (candidate: any) => {
    if (isInQueue(candidate.id)) {
      onRemoveFromQueue(candidate.id);
    } else {
      onAddToQueue(candidate);
    }
  };

  const handlePass = React.useCallback(() => {
    if (recoveredQueue.length > 0) {
      // Re-passing a recovered item puts it back in the bin
      setPassedCandidates(prev => [...prev, recoveredQueue[0]]);
      setRecoveredQueue(prev => prev.slice(1));
      return;
    }
    if (currentCandidate) {
      setPassedCandidates(prev => [...prev, currentCandidate]);
    }
    goNext();
  }, [currentCandidate, goNext, recoveredQueue]);

  const handleSave = React.useCallback(() => {
    if (recoveredQueue.length > 0) {
      // Saving a recovered item adds it to queue without touching the main deck index
      onAddToQueue(recoveredQueue[0]);
      setRecoveredQueue(prev => prev.slice(1));
      return;
    }
    if (!currentCandidate) return;
    onAddToQueue(currentCandidate);
    goNext();
  }, [currentCandidate, goNext, onAddToQueue, recoveredQueue]);

  const handleUndo = React.useCallback(() => {
    if (passedCandidates.length === 0) return;
    setIndex(prev => Math.max(0, prev - 1));
    setPassedCandidates(prev => prev.slice(0, -1));
  }, [passedCandidates.length]);

  // Recycle bin actions
  const handleRecover = React.useCallback((candidate: any) => {
    setPassedCandidates(prev => prev.filter(c => c.id !== candidate.id));
    setRecoveredQueue(prev => [...prev, candidate]);
  }, []);

  const handleRecoverAll = React.useCallback(() => {
    setRecoveredQueue(prev => [...prev, ...passedCandidates]);
    setPassedCandidates([]);
    setShowPassedBin(false);
  }, [passedCandidates]);

  const handleClearBin = React.useCallback(() => {
    setPassedCandidates([]);
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
        <h2 className="text-6xl font-black tracking-tighter">Browse Talent</h2>
        <p className="text-2xl text-gray-500 font-medium">
          Swipe right to save candidates. Review and unlock from your saved folder.
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
              {recoveredQueue.length > 0
                ? `Recovered · ${recoveredQueue.length} to review`
                : `Candidate ${candidates.length === 0 ? 0 : index + 1} of ${candidates.length}`}
            </span>
            <span>Swipe left to skip, swipe right to save</span>
          </div>

          {/* Recovered-item indicator */}
          {recoveredQueue.length > 0 && (
            <div className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#0077BE]">
              <RotateCcw size={12} />
              Reviewing recovered candidate
            </div>
          )}

          {currentCandidate ? (
            <motion.div
              drag="x"
              dragListener={false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              data-swipe-card="true"
              style={{ x, rotate, opacity: cardOpacity }}
              className="relative p-6 bg-white border border-gray-100 rounded-lg shadow-xl space-y-6 overflow-hidden select-none"
              onClick={() => onSelectCandidate(currentCandidate)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Swipe badges */}
              <motion.div
                style={{ opacity: passOpacity, scale: badgeScale }}
                className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[calc(100%+24px)] px-6 py-3 rounded-lg bg-[#FF6B6B] text-white text-xs font-black uppercase tracking-widest shadow-2xl pointer-events-none"
              >
                Skip
              </motion.div>

              <motion.div
                style={{ opacity: saveOpacity, scale: badgeScale }}
                className="absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-[24px] px-6 py-3 rounded-lg bg-[#0077BE] text-white text-xs font-black uppercase tracking-widest shadow-2xl pointer-events-none"
              >
                Save
              </motion.div>

              {/* Video preview with blur effect */}
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

              <div className="space-y-3">
                <h3 className="text-3xl font-black tracking-tight leading-none break-words">
                  {currentCandidate.display_title || currentCandidate.name || "Verified Talent"}
                </h3>

                <div className="flex flex-wrap gap-3 text-xs font-black uppercase tracking-widest text-gray-400">
                  <span className="flex items-center gap-2 shrink-0">
                    <MapPin size={14} /> <span className="truncate">{currentCandidate.location}</span>
                  </span>

                  <span className="flex items-center gap-2 shrink-0">
                    <Briefcase size={14} /> <span className="truncate">{currentCandidate.years_experience} YRS</span>
                  </span>

                  {/* Schedule Preferences / Availability */}
                  <span className="flex items-center gap-2 shrink-0 text-[#2ECC71]">
                    <span className="truncate">{currentCandidate.availability || currentCandidate.schedule_preference || 'Immediate'}</span>
                  </span>

                  <span className="flex items-center gap-2 shrink-0">
                    <Lock size={14} /> {isUnlocked(currentCandidate.id) ? "Unlocked" : "Locked"}
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
                    className="h-14 rounded-xl border-2 border-gray-200 bg-white font-bold uppercase tracking-wide text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    Skip
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleToggleBookmark(currentCandidate);
                      resetCard();
                    }}
                    className="h-14 rounded-xl bg-[#0077BE] text-white font-bold uppercase tracking-wide text-sm hover:bg-[#006aa8] transition-all shadow-lg shadow-[#0077BE]/20 flex items-center justify-center gap-2"
                  >
                    <svg 
                      className="w-5 h-5 transition-all"
                      style={{
                        fill: isInQueue(currentCandidate.id) ? '#2ECC71' : 'none',
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
                {passedCandidates.length > 0 && (
                  <div className="flex gap-2">
                    {/* Undo — only for main deck swipes, not while reviewing recovered items */}
                    {recoveredQueue.length === 0 && (
                      <button
                        type="button"
                        onClick={handleUndo}
                        className="flex-1 h-12 rounded-xl border-2 border-gray-200 bg-white font-bold uppercase tracking-wide text-sm text-gray-600 hover:border-[#0077BE] hover:text-[#0077BE] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
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
                      className={`${recoveredQueue.length > 0 ? 'w-full' : 'flex-1'} h-12 rounded-xl border-2 border-gray-200 bg-white font-bold uppercase tracking-wide text-[11px] text-gray-500 hover:border-[#FF6B6B] hover:text-[#FF6B6B] hover:bg-red-50 transition-all flex items-center justify-center gap-2`}
                    >
                      <Trash2 size={14} />
                      {passedCandidates.length} Passed
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="p-12 bg-white border-4 border-dashed border-gray-100 rounded-3xl text-center">
              <p className="text-gray-400 font-black text-lg uppercase tracking-widest">
                No more candidates
              </p>
            </div>
          )}
        </div>
      ) : (
        /* DESKTOP: Moderate-detail cards + floating Unlock button tied to bookmark queue */
        <div className="grid gap-6">
          {/* Floating Unlock button — visible when candidates are bookmarked */}
          {queue.length > 0 && (
            <div className="fixed bottom-8 right-8 z-30">
              <button
                type="button"
                onClick={() => onShowPayment({ type: 'employer', items: queue })}
                className="flex items-center gap-2 px-6 py-4 bg-[#FF6B6B] text-white rounded-2xl font-black uppercase tracking-wide text-sm shadow-2xl shadow-[#FF6B6B]/40 hover:bg-[#e55a5a] transition-all"
              >
                <Lock size={16} />
                Unlock Applicants ({queue.length})
              </button>
            </div>
          )}

          {candidates.length === 0 ? (
            <div className="p-16 bg-white border-4 border-dashed border-gray-100 rounded-3xl text-center">
              <p className="text-gray-400 font-black text-xl uppercase tracking-widest">No candidates found</p>
            </div>
          ) : (
            candidates.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCandidate(c)}
                className="p-6 lg:p-8 bg-white border border-gray-100 rounded-2xl flex flex-col lg:flex-row items-center gap-6 lg:gap-8 hover:shadow-2xl transition-all group cursor-pointer overflow-hidden"
              >
                {/* Blurred video thumbnail */}
                <div className="w-full lg:w-56 xl:w-64 aspect-video shrink-0 rounded-2xl overflow-hidden relative bg-gray-50 group-hover:scale-[1.02] transition-transform duration-500">
                  <ImageWithFallback
                    src={c.thumbnail || c.video_thumbnail_url || "/api/placeholder/800/450"}
                    className={`w-full h-full object-cover transition-all duration-1000 ${isUnlocked(c.id) ? 'blur-0 scale-100' : 'blur-[7px] scale-105 opacity-85'}`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border-2 border-white/40 shadow-2xl group-hover:scale-110 transition-transform">
                      {isUnlocked(c.id) ? <Play size={24} className="text-white fill-white ml-1" /> : <Lock size={24} className="text-white" />}
                    </div>
                  </div>
                  {!isUnlocked(c.id) && (
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest">Locked Preview</span>
                    </div>
                  )}
                </div>

                {/* Candidate info */}
                <div className="flex-1 space-y-3 text-center lg:text-left min-w-0 w-full lg:w-auto">
                  <div className="space-y-1">
                    <h3 className="text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight leading-none group-hover:text-[#0077BE] transition-colors truncate">
                      {c.display_title || "Verified Talent"}
                    </h3>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3 lg:gap-5 text-xs lg:text-sm font-black uppercase tracking-widest text-gray-400">
                      <span className="flex items-center gap-2"><MapPin size={16} /> {c.location}</span>
                      <span className="flex items-center gap-2"><Briefcase size={16} /> {c.years_experience} yrs exp</span>
                      <span className="text-[#2ECC71]">{c.availability || 'Immediate'}</span>
                      {c.preferred_pay_range && <span className="text-[#2ECC71]">{c.preferred_pay_range}</span>}
                    </div>
                  </div>

                  {Array.isArray(c.skills) && c.skills.length > 0 && (
                    <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                      {c.skills.slice(0, 6).map((s: string, i: number) => (
                        <span key={`${s}-${i}`} className="px-3 lg:px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100">{s}</span>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] font-black text-[#0077BE] uppercase tracking-widest">Tap to see full profile details →</p>
                </div>

                {/* Bookmark button */}
                <div className="flex gap-3 lg:gap-4 shrink-0 w-full lg:w-auto justify-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleToggleBookmark(c)}
                    className="flex flex-col items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all"
                    aria-label={isInQueue(c.id) ? "Remove from saved" : "Save candidate"}
                  >
                    <svg
                      className="w-6 h-6 transition-all"
                      style={{ fill: isInQueue(c.id) ? '#2ECC71' : 'none', stroke: isInQueue(c.id) ? '#2ECC71' : '#9CA3AF', strokeWidth: '2' }}
                      viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wide transition-all" style={{ color: isInQueue(c.id) ? '#2ECC71' : '#6B7280' }}>
                      {isInQueue(c.id) ? 'Saved' : 'Save'}
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Passed Candidates Bin (slide-up panel) ── */}
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
                  {passedCandidates.length} candidate{passedCandidates.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {passedCandidates.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRecoverAll}
                    className="text-[10px] font-black uppercase tracking-widest text-[#0077BE] hover:text-[#006aa8] transition-colors"
                  >
                    Recover All
                  </button>
                )}
                {passedCandidates.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearBin}
                    className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassedBin(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Item list */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3 pb-20">
              {passedCandidates.length === 0 ? (
                <div className="py-12 text-center">
                  <Trash2 size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 font-black text-sm uppercase tracking-widest">
                    Bin is empty
                  </p>
                </div>
              ) : (
                [...passedCandidates].reverse().map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl"
                  >
                    {/* Blurred thumbnail */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 shrink-0 relative">
                      <img
                        src={candidate.thumbnail || candidate.video_thumbnail_url}
                        className="w-full h-full object-cover blur-[7px] scale-110"
                        alt=""
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <Lock size={10} className="text-white" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black truncate">
                        {candidate.display_title || candidate.name || "Verified Talent"}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 truncate">
                        {candidate.location} · {candidate.years_experience} yrs exp
                      </p>
                      {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          {candidate.skills.slice(0, 3).join(" · ")}
                        </p>
                      )}
                    </div>

                    {/* Recover button */}
                    <button
                      type="button"
                      onClick={() => handleRecover(candidate)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0077BE] text-white text-[10px] font-black uppercase tracking-wide hover:bg-[#006aa8] transition-colors"
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