import React, { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { Plus, Play, Briefcase, MapPin, Lock, LogIn, LogOut, Star, Users, Phone, Mail, BarChart3, Shield, CheckCircle, Clock, Eye, X, Filter, MessageSquare, Video, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { Button } from "../ui/Button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { formatCandidateTitle } from "../../utils/formatters";
import { ViewType } from '../../App';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'pending': { bg: 'bg-[#A63F8E]/10', text: 'text-[#A63F8E]' },
  'reviewed': { bg: 'bg-[#148F8B]/10', text: 'text-[#148F8B]' },
  'shortlisted': { bg: 'bg-[#A63F8E]/10', text: 'text-[#A63F8E]' },
  'rejected': { bg: 'bg-gray-100', text: 'text-gray-500' },
  'hired': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

interface EmployerDashboardProps {
  isLoggedIn: boolean;
  userProfile?: any;
  jobs: any[];
  candidates: any[];
  unlockedCandidateIds: number[];
  applications?: any[];
  onNavigate: (view: ViewType) => void;
  onShowPostJob: () => void;
  onSelectJob: (job: any) => void;
  onSelectCandidate: (candidate: any) => void;
  onShowPayment: (target: { type: string; items: any[] }) => void;
  onShowAuth: (mode: "login" | "signup") => void;
  onLogout: () => void;
  interactionFee: number;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({
  isLoggedIn,
  userProfile,
  jobs,
  candidates,
  unlockedCandidateIds,
  applications = [],
  onNavigate,
  onShowPostJob,
  onSelectJob,
  onSelectCandidate,
  onShowPayment,
  onShowAuth,
  onLogout,
}) => {
  const parseAppTimestamp = (value: string | null | undefined) => {
    if (!value) return null;
    const normalized = /[zZ]|[+-]\d{2}:\d{2}$/.test(value)
      ? value
      : `${value.replace(" ", "T")}Z`;
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const unlockedCandidates = candidates.filter(c => unlockedCandidateIds.includes(c.id));
  const isVerified = isLoggedIn && userProfile?.businessLicense;
  const applicantsRef = useRef<HTMLDivElement>(null);

  // Video lightbox for answer video playback
  const [videoLightbox, setVideoLightbox] = useState<string | null>(null);
  // Collapsible answers/media per applicant card
  const [openAnswersId, setOpenAnswersId] = useState<number | null>(null);

  // Filter jobs to show only the employer's posted jobs
  const myJobs = useMemo(() => {
    if (!isLoggedIn || !userProfile?.employerId) return jobs.slice(0, 2);
    return jobs.filter(j => j.employer_id === userProfile.employerId);
  }, [isLoggedIn, userProfile, jobs]);

  const actualApplicants = useMemo(() => {
    if (!isLoggedIn || applications.length === 0 || myJobs.length === 0) return [];

    return applications
      .map((application) => {
        const candidate = candidates.find((candidateItem) => candidateItem.id === application.candidate_id);
        const appliedToJob = myJobs.find((job) => job.id === application.job_id);
        if (!candidate || !appliedToJob) return null;

        return {
          ...candidate,
          application,
          appliedToJob,
          status: application.status || "pending",
          appliedAgo: application.applied_at
            ? formatDistanceToNow(parseAppTimestamp(application.applied_at) || new Date(application.applied_at), { addSuffix: true })
            : null,
        };
      })
      .filter(Boolean) as any[];
  }, [isLoggedIn, applications, candidates, myJobs]);

  const [filterByJobId, setFilterByJobId] = useState<number | null>(null);

  const filteredApplicants = filterByJobId
    ? actualApplicants.filter(a => a.appliedToJob?.id === filterByJobId)
    : actualApplicants;
  const lockedApplicants = filteredApplicants.filter(a => !unlockedCandidateIds.includes(a.id));
  const unlockedApplicants = filteredApplicants.filter(a => unlockedCandidateIds.includes(a.id));
  const filterJobTitle = filterByJobId ? jobs.find(j => j.id === filterByJobId)?.title : null;
  const openJobsCount = myJobs.filter((job) => job.status !== "filled").length;
  const filledJobsCount = myJobs.filter((job) => job.status === "filled").length;
  const reviewedCount = applications.filter((application) => !!application.reviewed_at).length;
  const shortlistedCount = applications.filter((application) => application.status === "shortlisted").length;
  const contactedCount = applications.filter((application) => !!application.contact_method).length;

  return (
    <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 space-y-12 sm:space-y-16 md:space-y-24 mb-12 sm:mb-16 md:mb-20">
      {/* Browse anonymously banner */}
      {!isLoggedIn && (
        <div className="p-6 sm:p-8 bg-gradient-to-r from-[#A63F8E]/5 to-[#148F8B]/5 rounded-[2rem] sm:rounded-[3rem] border border-[#A63F8E]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 flex-1">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">Browse Candidates Anonymously</h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium">No sign-up required to explore. Create an account and verify your business to post jobs and unlock profiles.</p>
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
              className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-[#A63F8E] hover:bg-[#A63F8E]/90 whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-200"
              onClick={() => onShowAuth("signup")}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}

      {/* Business Verification Banner */}
      {isLoggedIn && (
        <div className={`p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isVerified ? 'bg-[#A63F8E]/5 border-[#A63F8E]/20' : 'bg-amber-50 border-amber-200'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isVerified ? 'bg-[#A63F8E]/10' : 'bg-amber-100'}`}>
            {isVerified ? <CheckCircle size={22} className="text-[#A63F8E]" /> : <Shield size={22} className="text-amber-600" />}
          </div>
          <div className="flex-1 space-y-1">
            <h4 className={`text-sm font-black uppercase tracking-widest ${isVerified ? 'text-[#A63F8E]' : 'text-amber-700'}`}>
              {isVerified ? 'Business Verified' : 'Verification Pending'}
            </h4>
            <p className="text-xs text-gray-600 font-medium">
              {isVerified
                ? `${userProfile.businessName || 'Your business'} is verified. You can post jobs and unlock candidates.`
                : 'Add your business license to get a Verified Business Badge on your job posts — for a small fee. You can still post jobs and browse candidates without verifying.'}
            </p>
          </div>
          {isVerified && (
            <span className="px-3 py-1.5 bg-[#A63F8E]/10 text-[#A63F8E] rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              License: {userProfile.businessLicense}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 sm:gap-10">
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none">Employer Hub</h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-500 font-medium">
            {isLoggedIn
              ? "Post jobs and manage your talent pipeline."
              : "Browse candidates and get started when ready."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
          <Button
            className="h-16 sm:h-20 md:h-24 px-8 sm:px-10 md:px-12 rounded-[2rem] shadow-xl shadow-[#148F8B]/20 text-base sm:text-lg md:text-xl whitespace-nowrap bg-[#148F8B] hover:bg-[#148F8B]/90 hover:scale-105 active:scale-95 transition-all duration-200"
            onClick={onShowPostJob}
          >
            <Plus size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" /> Post a Job
          </Button>
          <Button
  className="h-16 sm:h-20 md:h-24 px-8 sm:px-10 md:px-12 rounded-[2rem] shadow-xl shadow-[#A63F8E]/20 text-base sm:text-lg md:text-xl whitespace-nowrap bg-[#A63F8E] hover:bg-[#A63F8E]/90 text-white hover:scale-105 active:scale-95 transition-all duration-200"
  onClick={() => onNavigate("candidates")}
>
  <Users size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" /> Browse Candidates
</Button>
          {isLoggedIn && (
            <Button
              variant="outline"
              className="h-16 sm:h-20 md:h-24 px-6 sm:px-8 rounded-[2rem] border-gray-200 bg-white text-sm sm:text-base whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-200"
              onClick={onLogout}
            >
              <LogOut size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" /> Log Out
            </Button>
          )}
        </div>
      </div>

      {/* Stats Row - Only when logged in */}
      {isLoggedIn && (
        <div className="p-5 sm:p-6 md:p-7 bg-gray-900 text-white rounded-[2rem] sm:rounded-[2.5rem] space-y-4 shadow-2xl relative overflow-hidden group">
          <h3 className="text-lg sm:text-xl font-black tracking-tighter leading-none flex items-center gap-2.5">
            <BarChart3 size={24} className="text-[#148F8B]" /> Activity
          </h3>
          <div
            style={{
              display: "flex",
              flexWrap: "nowrap",
              width: "100%",
              gap: "12px",
            }}
          >
            <div
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5"
              style={{ flex: "1 1 0", minWidth: 0 }}
            >
              <span className="block text-white/70 font-black uppercase tracking-[0.18em] text-[11px] leading-tight">Open Jobs</span>
              <span className="mt-1 block text-xl sm:text-2xl font-black tracking-tight transition-all group-hover:text-[#148F8B]">{openJobsCount}</span>
            </div>
            <div
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5"
              style={{ flex: "1 1 0", minWidth: 0 }}
            >
              <span className="block text-white/70 font-black uppercase tracking-[0.18em] text-[11px] leading-tight">Filled Jobs</span>
              <span className="mt-1 block text-xl sm:text-2xl font-black tracking-tight transition-all group-hover:text-emerald-400">{filledJobsCount}</span>
            </div>
            <button
              onClick={() => { setFilterByJobId(null); setTimeout(() => applicantsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-left hover:ring-2 ring-[#A63F8E]/40 transition-all hover:scale-105 active:scale-95 duration-200"
              style={{ flex: "1 1 0", minWidth: 0 }}
            >
              <span className="block text-white/70 font-black uppercase tracking-[0.18em] text-[11px] leading-tight">Applicants</span>
              <span className="mt-1 block text-xl sm:text-2xl font-black tracking-tight transition-all group-hover:text-[#A63F8E]">{actualApplicants.length}</span>
            </button>
            <div
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5"
              style={{ flex: "1 1 0", minWidth: 0 }}
            >
              <span className="block text-white/70 font-black uppercase tracking-[0.18em] text-[11px] leading-tight">Reviewed</span>
              <span className="mt-1 block text-xl sm:text-2xl font-black tracking-tight transition-all group-hover:text-yellow-400">{reviewedCount}</span>
            </div>
            <div
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5"
              style={{ flex: "1 1 0", minWidth: 0 }}
            >
              <span className="block text-white/70 font-black uppercase tracking-[0.18em] text-[11px] leading-tight">Shortlisted</span>
              <span className="mt-1 block text-xl sm:text-2xl font-black tracking-tight transition-all group-hover:text-[#A63F8E]">{shortlistedCount}</span>
            </div>
            <div
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5"
              style={{ flex: "1 1 0", minWidth: 0 }}
            >
              <span className="block text-white/70 font-black uppercase tracking-[0.18em] text-[11px] leading-tight">Contacted</span>
              <span className="mt-1 block text-xl sm:text-2xl font-black tracking-tight transition-all group-hover:text-[#148F8B]">{contactedCount}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
        <section className="space-y-8 sm:space-y-12">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 sm:gap-5">
              <Briefcase size={28} className="sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#148F8B]" /> Your Jobs
            </h3>
            <Button
              variant="outline"
              className="h-10 sm:h-12 rounded-xl border-[#148F8B]/20 text-[#148F8B] font-black text-[10px] uppercase tracking-widest gap-2 hover:scale-105 active:scale-95 transition-all duration-200"
              onClick={onShowPostJob}
            >
              <Plus size={16} /> New Job
            </Button>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {myJobs.map(j => {
              const jobApplicantCount = actualApplicants.filter(a => a.appliedToJob?.id === j.id).length;
              return (
              <div key={j.id} className="p-6 sm:p-8 md:p-10 bg-white border border-gray-100 rounded-[2.5rem] sm:rounded-[3rem] md:rounded-[3.5rem] shadow-sm space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight break-words">{j.title}</h4>
                    <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] pt-1">{j.location} • {j.status === 'filled' ? 'FILLED' : 'LIVE'} • {jobApplicantCount} applicant{jobApplicantCount !== 1 ? 's' : ''}</p>
                    {Array.isArray(j.application_questions) && j.application_questions.length > 0 && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-1 bg-[#148F8B]/10 text-[#148F8B] rounded-lg text-[9px] font-black uppercase tracking-widest">
                        <MessageSquare size={10} /> {j.application_questions.length} custom question{j.application_questions.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <Button variant="outline" className="h-9 sm:h-10 border-none bg-[#F3EAF5]/30 text-[10px] px-3 sm:px-4 font-black uppercase tracking-widest shrink-0 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1.5" onClick={() => onSelectJob(j)}>
                    <Pencil aria-hidden="true" size={11} />
                    Manage
                  </Button>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <Button variant="outline" className="flex-1 h-12 sm:h-14 md:h-16 rounded-[1.2rem] border-gray-100 bg-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-200" onClick={() => {
                    setFilterByJobId(j.id);
                    setTimeout(() => applicantsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                  }}>
                    View Applicants
                  </Button>
                  <Button variant="outline" className="h-12 sm:h-14 md:h-16 px-5 rounded-[1.2rem] border-gray-100 bg-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-200" onClick={() => onNavigate("candidates")}>
                    Talent Pool
                  </Button>
                </div>
              </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-8 sm:space-y-12">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 sm:gap-5">
            <Star size={28} className="sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#A63F8E]" /> Unlocked Talent
          </h3>

          {unlockedCandidates.length === 0 ? (
            <div className="p-12 sm:p-16 md:p-20 bg-[#F3EAF5]/30 rounded-[3rem] sm:rounded-[3.5rem] md:rounded-[4rem] border-4 border-dashed border-gray-100 text-center space-y-4 sm:space-y-6">
              <Users size={40} className="sm:w-11 sm:h-11 md:w-12 md:h-12 mx-auto text-gray-600" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs sm:text-sm">No unlocked profiles yet</p>
              <Button variant="outline" className="h-12 sm:h-14 px-6 sm:px-8 mx-auto hover:scale-105 active:scale-95 transition-all duration-200" onClick={() => onNavigate("candidates")}>
                Browse Candidates
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {unlockedCandidates.map(cand => {
                const candApplicant = actualApplicants.find(a => a.id === cand.id);
                const candStatus = candApplicant?.status || null;
                const candStatusStyle = candStatus ? (STATUS_COLORS[candStatus] || STATUS_COLORS['pending']) : null;
                return (
                <div
                  key={cand.id}
                  className="p-6 sm:p-8 bg-white border border-gray-100 rounded-[2.5rem] sm:rounded-[3rem] shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                  onClick={() => onSelectCandidate(cand)}
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-xl sm:rounded-2xl bg-gray-100 overflow-hidden relative shrink-0">
                      <ImageWithFallback
                        src={cand.video_thumbnail_url || cand.thumbnail}
                        alt={cand.full_name || cand.profession}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[#148F8B]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={20} className="sm:w-6 sm:h-6 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-lg sm:text-xl font-black tracking-tight truncate">{cand.name || cand.display_title}</h4>
                        {candStatusStyle && (
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-normal whitespace-nowrap shrink-0 ${candStatusStyle.bg} ${candStatusStyle.text}`}>
                            {candStatus}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        <MapPin size={12} /> {cand.location}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-50 flex gap-2 sm:gap-3">
                    <button type="button" className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-[#148F8B]/5 text-[#148F8B] flex items-center justify-center gap-2 hover:bg-[#148F8B] hover:text-white transition-all hover:scale-105 active:scale-95 duration-200">
                      <Phone aria-hidden="true" size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="font-black text-[10px] uppercase tracking-widest">Call</span>
                    </button>
                    <button type="button" className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-[#A63F8E]/5 text-[#A63F8E] flex items-center justify-center gap-2 hover:bg-[#A63F8E] hover:text-white transition-all hover:scale-105 active:scale-95 duration-200">
                      <Mail aria-hidden="true" size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="font-black text-[10px] uppercase tracking-widest">Email</span>
                    </button>
                  </div>
                </div>
              ); })}
            </div>
          )}
        </section>
      </div>

      {/* Applications Section */}
      {isLoggedIn && (
        <section ref={applicantsRef} className="space-y-8 sm:space-y-12 scroll-mt-28">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 sm:gap-5">
                <Mail size={28} className="sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#A63F8E]" /> {filterJobTitle ? 'Applications' : 'Applications'}
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{filteredApplicants.length} total</span>
                <span className="text-xs font-black uppercase tracking-widest text-[#A63F8E]">{unlockedApplicants.length} unlocked</span>
                <span className="text-xs font-black uppercase tracking-widest text-[#A63F8E]/60">{lockedApplicants.length} locked</span>
              </div>
            </div>

            {/* Job filter indicator */}
            {filterJobTitle && (
              <div className="flex items-center gap-3 p-3 bg-[#148F8B]/5 rounded-xl border border-[#148F8B]/10">
                <Filter size={14} className="text-[#148F8B] shrink-0" />
                <span className="text-xs font-bold text-[#148F8B] flex-1 truncate">Showing applicants for: {filterJobTitle}</span>
                <button
                  type="button"
                  aria-label="Clear job filter"
                  onClick={() => setFilterByJobId(null)}
                  className="p-1 rounded-lg hover:bg-[#148F8B]/10 transition-colors shrink-0"
                >
                  <X aria-hidden="true" size={14} className="text-[#148F8B]" />
                </button>
              </div>
            )}
          </div>

          {filteredApplicants.length === 0 && (
            <div className="p-12 sm:p-16 md:p-20 bg-white border-4 border-dashed border-gray-100 rounded-[3rem] sm:rounded-[3.5rem] md:rounded-[4rem] text-center space-y-4 sm:space-y-6">
              <Mail size={40} className="sm:w-11 sm:h-11 md:w-12 md:h-12 mx-auto text-gray-400" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs sm:text-sm">No applications yet</p>
              <p className="text-sm text-gray-500 font-medium">Applications will appear here when candidates actually apply to one of your jobs.</p>
            </div>
          )}

          {/* Unlocked Applicants */}
          {unlockedApplicants.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#A63F8E]/10 flex items-center justify-center">
                  <CheckCircle size={14} className="text-[#A63F8E]" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-[#A63F8E]">Unlocked Applicants</h4>
              </div>
          {unlockedApplicants.map((applicant, i) => {
  const statusStyle = STATUS_COLORS[applicant.status] || STATUS_COLORS['pending'];
  return (
    <motion.div
      key={applicant.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.03 }}
      className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] shadow-sm hover:shadow-lg transition-all overflow-hidden"
      onClick={() => onSelectCandidate(applicant)}
    >
      {/* Header Row */}
      <div className="p-5 sm:p-6 flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden relative shrink-0 transition-transform">
          <ImageWithFallback
            src={applicant.video_thumbnail_url || applicant.thumbnail}
            alt={applicant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#A63F8E]/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Play size={20} className="text-white fill-white drop-shadow-lg" />
          </div>
        </div>

        {/* Name + Location */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-base sm:text-lg font-black tracking-tight break-words leading-tight">
              {applicant.name}
            </h4>
            {/* Status Badge */}
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-normal ${statusStyle.bg} ${statusStyle.text} whitespace-nowrap shrink-0`}>
              {applicant.status}
            </span>
          </div>

          <div className="flex flex-col gap-1 text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5">
              <MapPin aria-hidden="true" size={12} /> {applicant.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock aria-hidden="true" size={12} /> {applicant.appliedAgo}
            </span>
          </div>

          {/* Applied To Job Tag - moved inside header for compactness */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">Applied to:</span>
            <span className="text-xs font-black text-[#148F8B] truncate">
              {applicant.appliedToJob?.title || 'Your Job Post'}
            </span>
          </div>
        </div>
      </div>

      {/* Skills */}
      {applicant.skills && applicant.skills.length > 0 && (
        <div className="px-5 sm:px-6 pb-4 space-y-2">
          <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Skills</h5>
          <div className="flex flex-wrap gap-2">
            {applicant.skills.slice(0, 6).map((s: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-[#F3EAF5]/30 text-gray-600 rounded-lg text-xs font-semibold border border-gray-100"
              >
                {s}
              </span>
            ))}
            {applicant.skills.length > 6 && (
              <span className="px-3 py-1.5 text-gray-400 text-xs font-semibold">
                +{applicant.skills.length - 6}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Application videos and answers — collapsible */}
      {(() => {
        const application = applicant.application;
        const jobQuestions: string[] = applicant.appliedToJob?.application_questions || [];
        const answers: any[] = Array.isArray(application?.question_answers)
          ? application.question_answers
          : jobQuestions.map((question: string) => ({ question }));
        const hasIntroVideo = !!applicant.video_url;
        const hasApplicationVideo = !!application?.video_url;
        if (!jobQuestions.length && !hasApplicationVideo && !hasIntroVideo) return null;
        const isOpen = openAnswersId === applicant.id;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenAnswersId(isOpen ? null : applicant.id)}
              className="w-full px-5 sm:px-6 pt-3 pb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors border-t border-gray-100"
            >
              <MessageSquare aria-hidden="true" size={12} />
              Application Details
              {isOpen ? <ChevronUp aria-hidden="true" size={14} /> : <ChevronDown aria-hidden="true" size={14} />}
            </button>
            {isOpen && (
              <div className="px-5 sm:px-6 pb-5 space-y-4">
                {(hasIntroVideo || hasApplicationVideo) && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-[#780262] uppercase tracking-widest flex items-center gap-1.5">
                      <Video aria-hidden="true" size={12} /> Application Media
                    </h5>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {hasIntroVideo && (
                        <button
                          type="button"
                          onClick={() => setVideoLightbox(applicant.video_url)}
                          className="flex items-center gap-3 w-full text-left bg-[#148F8B]/5 border border-[#148F8B]/15 rounded-xl px-3 py-2.5 hover:bg-[#148F8B]/10 transition-all group"
                        >
                          <div className="w-14 h-9 rounded-lg bg-[#148F8B]/15 flex items-center justify-center shrink-0">
                            <Play aria-hidden="true" size={14} className="text-[#148F8B] fill-[#148F8B]" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-wide text-[#148F8B]">
                            Intro Video
                          </span>
                        </button>
                      )}
                      {hasApplicationVideo && (
                        <button
                          type="button"
                          onClick={() => setVideoLightbox(application.video_url)}
                          className="flex items-center gap-3 w-full text-left bg-[#780262]/5 border border-[#780262]/15 rounded-xl px-3 py-2.5 hover:bg-[#780262]/10 transition-all group"
                        >
                          <div className="w-14 h-9 rounded-lg bg-[#780262]/15 flex items-center justify-center shrink-0">
                            <Play aria-hidden="true" size={14} className="text-[#780262] fill-[#780262]" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-wide text-[#780262]">
                            Personalized Video
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {jobQuestions.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-black text-[#148F8B] uppercase tracking-widest flex items-center gap-1.5">
                      <MessageSquare aria-hidden="true" size={12} /> Application Answers
                    </h5>
                    <div className="space-y-3">
                      {jobQuestions.map((question: string, qIdx: number) => {
                        const ans = answers.find((a: any) => a.question === question);
                        return (
                          <div key={qIdx} className="space-y-2">
                            <p className="text-xs font-black text-[#148F8B] uppercase tracking-wide leading-snug">
                              {question}
                            </p>
                            {ans?.answer_text ? (
                              <p className="text-sm font-medium text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                {ans.answer_text}
                              </p>
                            ) : hasApplicationVideo ? (
                              <p className="text-sm font-medium text-[#780262] bg-[#780262]/5 rounded-xl px-4 py-3 border border-[#780262]/10">
                                Answered in the candidate&apos;s personalized application video.
                              </p>
                            ) : (
                              <p className="text-xs font-medium text-gray-400 italic px-1">
                                No answer provided
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Action Buttons */}
      <div className="px-5 sm:px-6 pt-2 pb-10 flex gap-3 justify-center">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); }}
          className="px-8 h-12 rounded-2xl bg-[#148F8B]/5 text-[#148F8B] flex items-center justify-center gap-2 hover:bg-[#148F8B] hover:text-white transition-all font-black text-sm uppercase tracking-wide"
        >
          <Phone aria-hidden="true" size={16} />
          Call
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); }}
          className="px-8 h-12 rounded-2xl bg-[#A63F8E]/5 text-[#A63F8E] flex items-center justify-center gap-2 hover:bg-[#A63F8E] hover:text-white transition-all font-black text-sm uppercase tracking-wide"
        >
          <Mail aria-hidden="true" size={16} />
          Email
        </button>
      </div>
    </motion.div>
  );
})}
            </div>
          )}

          {/* Locked Applicants */}
          {lockedApplicants.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#A63F8E]/10 flex items-center justify-center">
                  <Lock size={14} className="text-[#A63F8E]" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-500">Locked Applicants — Unlock to see full profile</h4>
              </div>
             {lockedApplicants.map((applicant, i) => {
  return (
    <motion.div
      key={applicant.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.03 }}
      className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] shadow-sm hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Header Row */}
      <div className="p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
        {/* Blurred Avatar */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl sm:rounded-2xl bg-gray-100 overflow-hidden relative shrink-0">
          <ImageWithFallback
            src={applicant.video_thumbnail_url || applicant.thumbnail}
            alt="Locked applicant"
            className="w-full h-full object-cover blur-[8px] scale-110 opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Lock size={18} className="text-white drop-shadow-md" />
          </div>
        </div>

        {/* Anonymized Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <h4 className="text-base sm:text-lg font-black tracking-tight text-gray-500 break-words leading-tight">
            {formatCandidateTitle(applicant)}
          </h4>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin size={10} /> {applicant.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} /> {applicant.appliedAgo}
            </span>
          </div>
        </div>
      </div>

      {/* Applied To Job Tag */}
      <div className="px-4 sm:px-6 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Applied to:</span>
          <span className="text-xs sm:text-sm font-black text-[#148F8B] tracking-tight truncate">
            {applicant.appliedToJob?.title || 'Your Job Post'}
          </span>
        </div>
      </div>

      {/* Skills Section - IMPROVED WITH BETTER SPACING */}
      {applicant.skills && applicant.skills.length > 0 && (
        <div className="px-4 sm:px-6 pb-4 space-y-2">
          <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Skills Preview</h5>
          <div className="flex flex-wrap gap-2">
            {applicant.skills.slice(0, 4).map((s: string, idx: number) => (
              <span 
                key={idx} 
                className="px-3 py-1.5 bg-[#F3EAF5]/30 text-gray-700 rounded-lg text-[10px] font-bold tracking-wide border border-gray-100"
              >
                {s}
              </span>
            ))}
            {applicant.skills.length > 4 && (
              <span className="px-3 py-1.5 text-gray-600 text-[10px] font-bold tracking-wide">
                +{applicant.skills.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 sm:px-6 pb-4 flex gap-2">
        <button
          type="button"
          onClick={() => onSelectCandidate(applicant)}
          className="flex-1 h-10 sm:h-11 rounded-xl bg-[#F3EAF5]/30 text-gray-600 flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-all"
        >
          <Eye aria-hidden="true" size={20} />
          <span className="font-black text-[12px] uppercase tracking-wider">Preview</span>
        </button>
        <button
          type="button"
          onClick={() => onShowPayment({ type: 'employer', items: [applicant] })}
          className="flex-1 h-10 sm:h-11 rounded-xl bg-[#A63F8E] text-white flex items-center justify-center gap-1.5 hover:bg-[#A63F8E]/90 transition-all shadow-md shadow-[#A63F8E]/20"
        >
          <Lock aria-hidden="true" size={18} />
          <span className="font-black text-[12px] uppercase tracking-wider">Unlock</span>
        </button>
      </div>
    </motion.div>
  );
})}
            </div>
          )}
        </section>
      )}
    </motion.div>

    {/* Video answer lightbox */}
    {videoLightbox && createPortal(
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[999999] flex items-center justify-center p-4"
        onClick={() => setVideoLightbox(null)}
      >
        <div
          className="w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end mb-3">
            <button
              type="button"
              aria-label="Close video"
              onClick={() => setVideoLightbox(null)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          <video
            controls
            autoPlay
            playsInline
            className="w-full rounded-[2rem] bg-black shadow-2xl"
            style={{ maxHeight: "75vh" }}
          >
            <source
              src={videoLightbox}
              type={videoLightbox.includes(".webm") ? "video/webm" : "video/mp4"}
            />
          </video>
        </div>
      </div>,
      document.body
    )}
  </>
  );
};
