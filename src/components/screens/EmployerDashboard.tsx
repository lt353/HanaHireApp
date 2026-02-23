import React, { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Plus, Play, Briefcase, MapPin, Lock, LogIn, LogOut, Star, Users, Phone, Mail, BarChart3, Shield, Building2, CheckCircle, Clock, ChevronDown, Eye, DollarSign, X, Filter } from "lucide-react";
import { Button } from "../ui/Button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { formatCandidateTitle } from "../../utils/formatters";
import { ViewType } from '../../App';

const APPLICANT_STATUSES = ['New', 'Reviewed', 'Shortlisted', 'Interview Scheduled'] as const;
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'New': { bg: 'bg-[#A63F8E]/10', text: 'text-[#A63F8E]' },
  'Reviewed': { bg: 'bg-[#148F8B]/10', text: 'text-[#148F8B]' },
  'Shortlisted': { bg: 'bg-[#A63F8E]/10', text: 'text-[#A63F8E]' },
  'Interview Scheduled': { bg: 'bg-purple-100', text: 'text-purple-600' },
};

interface EmployerDashboardProps {
  isLoggedIn: boolean;
  userProfile?: any;
  jobs: any[];
  candidates: any[];
  unlockedCandidateIds: number[];
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
  onNavigate,
  onShowPostJob,
  onSelectJob,
  onSelectCandidate,
  onShowPayment,
  onShowAuth,
  onLogout,
  interactionFee
}) => {
  const unlockedCandidates = candidates.filter(c => unlockedCandidateIds.includes(c.id));
  const isVerified = isLoggedIn && userProfile?.businessLicense;
  const applicantsRef = useRef<HTMLDivElement>(null);

  // Filter jobs to show only the employer's posted jobs
  const myJobs = useMemo(() => {
    if (!isLoggedIn || !userProfile?.employerId) return jobs.slice(0, 2);
    return jobs.filter(j => j.employer_id === userProfile.employerId);
  }, [isLoggedIn, userProfile, jobs]);

  // Build mock applicants from actual candidate data, assigned to the employer's posted jobs
  const mockApplicants = useMemo(() => {
    if (!isLoggedIn || candidates.length === 0 || myJobs.length === 0) return [];
    const daysAgoLabels = ['2 hours ago', '5 hours ago', 'Yesterday', '2 days ago', '3 days ago', '4 days ago', '5 days ago', '1 week ago', '1 week ago'];
    return candidates.slice(2, 20).map((c, i) => ({
      ...c,
      appliedToJob: myJobs[i % myJobs.length],
      status: APPLICANT_STATUSES[i % APPLICANT_STATUSES.length],
      appliedAgo: daysAgoLabels[i % daysAgoLabels.length],
    }));
  }, [isLoggedIn, candidates, myJobs]);

  const [filterByJobId, setFilterByJobId] = useState<number | null>(null);

  const filteredApplicants = filterByJobId
    ? mockApplicants.filter(a => a.appliedToJob?.id === filterByJobId)
    : mockApplicants;
  const lockedApplicants = filteredApplicants.filter(a => !unlockedCandidateIds.includes(a.id));
  const unlockedApplicants = filteredApplicants.filter(a => unlockedCandidateIds.includes(a.id));
  const filterJobTitle = filterByJobId ? jobs.find(j => j.id === filterByJobId)?.title : null;

  return (
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 sm:p-8 bg-gray-900 text-white rounded-[2rem] sm:rounded-[2.5rem] space-y-3 group relative overflow-hidden">
            <span className="text-white/40 font-black uppercase tracking-[0.3em] text-[9px]">Jobs Posted</span>
            <p className="text-4xl sm:text-5xl font-black tracking-tighter group-hover:text-[#148F8B] transition-colors">{myJobs.length}</p>
            <Briefcase className="absolute -right-4 -bottom-4 text-white/5" size={80} />
          </div>
          <div className="p-6 sm:p-8 bg-gray-900 text-white rounded-[2rem] sm:rounded-[2.5rem] space-y-3 group relative overflow-hidden">
            <span className="text-white/40 font-black uppercase tracking-[0.3em] text-[9px]">Candidates Unlocked</span>
            <p className="text-4xl sm:text-5xl font-black tracking-tighter group-hover:text-[#A63F8E] transition-colors">{unlockedCandidates.length}</p>
            <Users className="absolute -right-4 -bottom-4 text-white/5" size={80} />
          </div>
          <button
            onClick={() => { setFilterByJobId(null); setTimeout(() => applicantsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}
            className="p-6 sm:p-8 bg-gray-900 text-white rounded-[2rem] sm:rounded-[2.5rem] space-y-3 group relative overflow-hidden text-left hover:ring-2 ring-[#A63F8E]/40 transition-all hover:scale-105 active:scale-95 duration-200"
          >
            <span className="text-white/40 font-black uppercase tracking-[0.3em] text-[9px] flex items-center gap-2">Applicants Received <ChevronDown size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" /></span>
            <p className="text-4xl sm:text-5xl font-black tracking-tighter group-hover:text-[#A63F8E] transition-colors">{mockApplicants.length}</p>
            <Mail className="absolute -right-4 -bottom-4 text-white/5" size={80} />
          </button>
          <div className="p-6 sm:p-8 bg-gray-900 text-white rounded-[2rem] sm:rounded-[2.5rem] space-y-3 group relative overflow-hidden">
            <span className="text-white/40 font-black uppercase tracking-[0.3em] text-[9px]">Profile Views</span>
            <p className="text-4xl sm:text-5xl font-black tracking-tighter group-hover:text-yellow-400 transition-colors">156</p>
            <BarChart3 className="absolute -right-4 -bottom-4 text-white/5" size={80} />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
        <section className="space-y-8 sm:space-y-12">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 sm:gap-5">
              <Briefcase size={28} className="sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#148F8B]" /> Active Postings
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
              const jobApplicantCount = mockApplicants.filter(a => a.appliedToJob?.id === j.id).length;
              return (
              <div key={j.id} className="p-6 sm:p-8 md:p-10 bg-white border border-gray-100 rounded-[2.5rem] sm:rounded-[3rem] md:rounded-[3.5rem] shadow-sm space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight break-words">{j.title}</h4>
                    <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] pt-1">{j.location} • LIVE • {jobApplicantCount} applicant{jobApplicantCount !== 1 ? 's' : ''}</p>
                  </div>
                  <Button variant="outline" className="h-9 sm:h-10 border-none bg-[#F3EAF5]/30 text-[10px] px-3 sm:px-4 font-black uppercase tracking-widest shrink-0 hover:scale-105 active:scale-95 transition-all duration-200" onClick={() => onSelectJob(j)}>
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
              {unlockedCandidates.map(cand => (
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
                      <h4 className="text-lg sm:text-xl font-black tracking-tight truncate">{cand.name || cand.display_title}</h4>
                      <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        <MapPin size={12} /> {cand.location}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-50 flex gap-2 sm:gap-3">
                    <button className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-[#148F8B]/5 text-[#148F8B] flex items-center justify-center gap-2 hover:bg-[#148F8B] hover:text-white transition-all hover:scale-105 active:scale-95 duration-200">
                      <Phone size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="font-black text-[10px] uppercase tracking-widest">Call</span>
                    </button>
                    <button className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-[#A63F8E]/5 text-[#A63F8E] flex items-center justify-center gap-2 hover:bg-[#A63F8E] hover:text-white transition-all hover:scale-105 active:scale-95 duration-200">
                      <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="font-black text-[10px] uppercase tracking-widest">Email</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Recent Applicants Section */}
      {isLoggedIn && mockApplicants.length > 0 && (
        <section ref={applicantsRef} className="space-y-8 sm:space-y-12 scroll-mt-28">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 sm:gap-5">
                <Mail size={28} className="sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#A63F8E]" /> {filterJobTitle ? 'Applicants' : 'Recent Applicants'}
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
                  onClick={() => setFilterByJobId(null)}
                  className="p-1 rounded-lg hover:bg-[#148F8B]/10 transition-colors shrink-0"
                >
                  <X size={14} className="text-[#148F8B]" />
                </button>
              </div>
            )}
          </div>

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
  const statusStyle = STATUS_COLORS[applicant.status] || STATUS_COLORS['New'];
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
      <div className="p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl sm:rounded-2xl bg-gray-100 overflow-hidden relative shrink-0 group-hover:scale-105 transition-transform">
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
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-base sm:text-lg font-black tracking-tight break-words leading-tight">
              {applicant.name}
            </h4>
            {/* Status Badge */}
            <span className={`px-2 sm:px-2.5 py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${statusStyle.bg} ${statusStyle.text} whitespace-nowrap shrink-0`}>
              {applicant.status}
            </span>
          </div>
          
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
          <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Skills</h5>
          <div className="flex flex-wrap gap-2">
            {applicant.skills.slice(0, 6).map((s: string, idx: number) => (
              <span 
                key={idx} 
                className="px-3 py-1.5 bg-[#F3EAF5]/30 text-gray-600 rounded-lg text-[10px] font-bold tracking-wide border border-gray-100"
              >
                {s}
              </span>
            ))}
            {applicant.skills.length > 6 && (
              <span className="px-3 py-1.5 text-gray-400 text-[10px] font-bold tracking-wide">
                +{applicant.skills.length - 6}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 sm:px-6 pb-4 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="flex-1 h-10 sm:h-11 rounded-xl bg-[#148F8B]/5 text-[#148F8B] flex items-center justify-center gap-1.5 hover:bg-[#148F8B] hover:text-white transition-all"
        >
          <Phone size={16} />
          <span className="font-black text-[10px] uppercase tracking-wider">Call</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="flex-1 h-10 sm:h-11 rounded-xl bg-[#A63F8E]/5 text-[#A63F8E] flex items-center justify-center gap-1.5 hover:bg-[#A63F8E] hover:text-white transition-all"
        >
          <Mail size={16} />
          <span className="font-black text-[10px] uppercase tracking-wider">Email</span>
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
          onClick={() => onSelectCandidate(applicant)}
          className="flex-1 h-10 sm:h-11 rounded-xl bg-[#F3EAF5]/30 text-gray-600 flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-all"
        >
          <Eye size={16} />
          <span className="font-black text-[10px] uppercase tracking-wider">Preview</span>
        </button>
        <button
          onClick={() => onShowPayment({ type: 'employer', items: [applicant] })}
          className="flex-1 h-10 sm:h-11 rounded-xl bg-[#A63F8E] text-white flex items-center justify-center gap-1.5 hover:bg-[#A63F8E]/90 transition-all shadow-md shadow-[#A63F8E]/20"
        >
          <Lock size={16} />
          <span className="font-black text-[10px] uppercase tracking-wider">${interactionFee.toFixed(2)}</span>
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
  );
};
