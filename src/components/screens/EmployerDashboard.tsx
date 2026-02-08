import React, { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Plus, Play, Briefcase, MapPin, Lock, LogIn, LogOut, Star, Users, Phone, Mail, BarChart3, Shield, Building2, CheckCircle, Clock, ChevronDown, Eye, DollarSign, X, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { formatCandidateTitle } from "../../utils/formatters";
import { ViewType } from '../../App';

const APPLICANT_STATUSES = ['New', 'Reviewed', 'Shortlisted', 'Interview Scheduled'] as const;
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'New': { bg: 'bg-[#FF6B6B]/10', text: 'text-[#FF6B6B]' },
  'Reviewed': { bg: 'bg-[#0077BE]/10', text: 'text-[#0077BE]' },
  'Shortlisted': { bg: 'bg-[#2ECC71]/10', text: 'text-[#2ECC71]' },
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
  onSelectCandidate,
  onShowPayment,
  onShowAuth,
  onLogout,
  interactionFee
}) => {
  const unlockedCandidates = candidates.filter(c => unlockedCandidateIds.includes(c.id));
  const isVerified = isLoggedIn && userProfile?.businessLicense;
  const applicantsRef = useRef<HTMLDivElement>(null);

  // Build mock applicants from actual candidate data, assigned to the employer's posted jobs
  const mockApplicants = useMemo(() => {
    if (!isLoggedIn || candidates.length === 0 || jobs.length === 0) return [];
    const postedJobs = jobs.slice(0, 2);
    const daysAgoLabels = ['2 hours ago', '5 hours ago', 'Yesterday', '2 days ago', '3 days ago', '4 days ago', '5 days ago', '1 week ago', '1 week ago'];
    return candidates.slice(2, 20).map((c, i) => ({
      ...c,
      appliedToJob: postedJobs[i % postedJobs.length],
      status: APPLICANT_STATUSES[i % APPLICANT_STATUSES.length],
      appliedAgo: daysAgoLabels[i % daysAgoLabels.length],
    }));
  }, [isLoggedIn, candidates, jobs]);

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
        <div className="p-6 sm:p-8 bg-gradient-to-r from-[#2ECC71]/5 to-[#0077BE]/5 rounded-[2rem] sm:rounded-[3rem] border border-[#2ECC71]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 flex-1">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">Browse Candidates Anonymously</h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium">No sign-up required to explore. Create an account and verify your business to post jobs and unlock profiles.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl border-gray-200 bg-white whitespace-nowrap"
              onClick={() => onShowAuth("login")}
            >
              <LogIn size={20} /> Log In
            </Button>
            <Button
              className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-[#2ECC71] hover:bg-[#2ECC71]/90 whitespace-nowrap"
              onClick={() => onShowAuth("signup")}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}

      {/* Business Verification Banner */}
      {isLoggedIn && (
        <div className={`p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isVerified ? 'bg-[#2ECC71]/5 border-[#2ECC71]/20' : 'bg-amber-50 border-amber-200'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isVerified ? 'bg-[#2ECC71]/10' : 'bg-amber-100'}`}>
            {isVerified ? <CheckCircle size={22} className="text-[#2ECC71]" /> : <Shield size={22} className="text-amber-600" />}
          </div>
          <div className="flex-1 space-y-1">
            <h4 className={`text-sm font-black uppercase tracking-widest ${isVerified ? 'text-[#2ECC71]' : 'text-amber-700'}`}>
              {isVerified ? 'Business Verified' : 'Verification Pending'}
            </h4>
            <p className="text-xs text-gray-600 font-medium">
              {isVerified
                ? `${userProfile.businessName || 'Your business'} is verified. You can post jobs and unlock candidates.`
                : 'Submit your business license to post jobs. You can still browse candidates while we verify.'}
            </p>
          </div>
          {isVerified && (
            <span className="px-3 py-1.5 bg-[#2ECC71]/10 text-[#2ECC71] rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
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
              ? `Welcome${userProfile?.contactName ? `, ${userProfile.contactName}` : ''}. Post jobs and manage your talent pipeline.`
              : "Browse candidates and get started when ready."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
          <Button
            className="h-16 sm:h-20 md:h-24 px-8 sm:px-10 md:px-12 rounded-[2rem] shadow-xl shadow-[#0077BE]/20 text-base sm:text-lg md:text-xl whitespace-nowrap bg-[#0077BE] hover:bg-[#0077BE]/90"
            onClick={onShowPostJob}
          >
            <Plus size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" /> Post a Job
          </Button>
          <Button
            variant="secondary"
            className="h-16 sm:h-20 md:h-24 px-8 sm:px-10 md:px-12 rounded-[2rem] shadow-xl shadow-[#FF6B6B]/20 text-base sm:text-lg md:text-xl whitespace-nowrap"
            onClick={() => onNavigate("candidates")}
          >
            <Users size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" /> Browse Candidates
          </Button>
          {isLoggedIn && (
            <Button
              variant="outline"
              className="h-16 sm:h-20 md:h-24 px-6 sm:px-8 rounded-[2rem] border-gray-200 bg-white text-sm sm:text-base whitespace-nowrap"
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
            <p className="text-4xl sm:text-5xl font-black tracking-tighter group-hover:text-[#0077BE] transition-colors">{Math.min(jobs.length, 2)}</p>
            <Briefcase className="absolute -right-4 -bottom-4 text-white/5" size={80} />
          </div>
          <div className="p-6 sm:p-8 bg-gray-900 text-white rounded-[2rem] sm:rounded-[2.5rem] space-y-3 group relative overflow-hidden">
            <span className="text-white/40 font-black uppercase tracking-[0.3em] text-[9px]">Candidates Unlocked</span>
            <p className="text-4xl sm:text-5xl font-black tracking-tighter group-hover:text-[#2ECC71] transition-colors">{unlockedCandidates.length}</p>
            <Users className="absolute -right-4 -bottom-4 text-white/5" size={80} />
          </div>
          <button
            onClick={() => { setFilterByJobId(null); setTimeout(() => applicantsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}
            className="p-6 sm:p-8 bg-gray-900 text-white rounded-[2rem] sm:rounded-[2.5rem] space-y-3 group relative overflow-hidden text-left hover:ring-2 ring-[#FF6B6B]/40 transition-all"
          >
            <span className="text-white/40 font-black uppercase tracking-[0.3em] text-[9px] flex items-center gap-2">Applicants Received <ChevronDown size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" /></span>
            <p className="text-4xl sm:text-5xl font-black tracking-tighter group-hover:text-[#FF6B6B] transition-colors">{mockApplicants.length}</p>
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
              <Briefcase size={28} className="sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#0077BE]" /> Active Postings
            </h3>
            <Button
              variant="outline"
              className="h-10 sm:h-12 rounded-xl border-[#0077BE]/20 text-[#0077BE] font-black text-[10px] uppercase tracking-widest gap-2"
              onClick={onShowPostJob}
            >
              <Plus size={16} /> New Job
            </Button>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {jobs.slice(0, 2).map(j => {
              const jobApplicantCount = mockApplicants.filter(a => a.appliedToJob?.id === j.id).length;
              return (
              <div key={j.id} className="p-6 sm:p-8 md:p-10 bg-white border border-gray-100 rounded-[2.5rem] sm:rounded-[3rem] md:rounded-[3.5rem] shadow-sm space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight break-words">{j.title}</h4>
                    <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] pt-1">{j.location} • LIVE • {jobApplicantCount} applicant{jobApplicantCount !== 1 ? 's' : ''}</p>
                  </div>
                  <Button variant="outline" className="h-9 sm:h-10 border-none bg-gray-50 text-[10px] px-3 sm:px-4 font-black uppercase tracking-widest shrink-0">
                    Manage
                  </Button>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <Button variant="outline" className="flex-1 h-12 sm:h-14 md:h-16 rounded-[1.2rem] border-gray-100 bg-white text-xs font-black uppercase tracking-widest" onClick={() => {
                    setFilterByJobId(j.id);
                    setTimeout(() => applicantsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                  }}>
                    View Applicants
                  </Button>
                  <Button variant="outline" className="h-12 sm:h-14 md:h-16 px-5 rounded-[1.2rem] border-gray-100 bg-white text-xs font-black uppercase tracking-widest" onClick={() => onNavigate("candidates")}>
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
            <Star size={28} className="sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#FF6B6B]" /> Unlocked Talent
          </h3>

          {unlockedCandidates.length === 0 ? (
            <div className="p-12 sm:p-16 md:p-20 bg-gray-50 rounded-[3rem] sm:rounded-[3.5rem] md:rounded-[4rem] border-4 border-dashed border-gray-100 text-center space-y-4 sm:space-y-6">
              <Users size={40} className="sm:w-11 sm:h-11 md:w-12 md:h-12 mx-auto text-gray-200" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs sm:text-sm">No unlocked profiles yet</p>
              <Button variant="outline" className="h-12 sm:h-14 px-6 sm:px-8 mx-auto" onClick={() => onNavigate("candidates")}>
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
                      <div className="absolute inset-0 bg-[#0077BE]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <button className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-[#0077BE]/5 text-[#0077BE] flex items-center justify-center gap-2 hover:bg-[#0077BE] hover:text-white transition-all">
                      <Phone size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="font-black text-[10px] uppercase tracking-widest">Call</span>
                    </button>
                    <button className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-[#2ECC71]/5 text-[#2ECC71] flex items-center justify-center gap-2 hover:bg-[#2ECC71] hover:text-white transition-all">
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
                <Mail size={28} className="sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#FF6B6B]" /> {filterJobTitle ? 'Applicants' : 'Recent Applicants'}
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{filteredApplicants.length} total</span>
                <span className="text-xs font-black uppercase tracking-widest text-[#2ECC71]">{unlockedApplicants.length} unlocked</span>
                <span className="text-xs font-black uppercase tracking-widest text-[#FF6B6B]/60">{lockedApplicants.length} locked</span>
              </div>
            </div>

            {/* Job filter indicator */}
            {filterJobTitle && (
              <div className="flex items-center gap-3 p-3 bg-[#0077BE]/5 rounded-xl border border-[#0077BE]/10">
                <Filter size={14} className="text-[#0077BE] shrink-0" />
                <span className="text-xs font-bold text-[#0077BE] flex-1 truncate">Showing applicants for: {filterJobTitle}</span>
                <button
                  onClick={() => setFilterByJobId(null)}
                  className="p-1 rounded-lg hover:bg-[#0077BE]/10 transition-colors shrink-0"
                >
                  <X size={14} className="text-[#0077BE]" />
                </button>
              </div>
            )}
          </div>

          {/* Unlocked Applicants */}
          {unlockedApplicants.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2ECC71]/10 flex items-center justify-center">
                  <CheckCircle size={14} className="text-[#2ECC71]" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-[#2ECC71]">Unlocked Applicants</h4>
              </div>
              {unlockedApplicants.map((applicant, i) => {
                const statusStyle = STATUS_COLORS[applicant.status] || STATUS_COLORS['New'];
                return (
                  <motion.div
                    key={applicant.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-5 sm:p-6 bg-white border border-[#2ECC71]/10 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm hover:shadow-lg transition-all group cursor-pointer"
                    onClick={() => onSelectCandidate(applicant)}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                      {/* Avatar */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gray-100 overflow-hidden relative shrink-0">
                        <ImageWithFallback
                          src={applicant.video_thumbnail_url || applicant.thumbnail}
                          alt={applicant.name || applicant.display_title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[#0077BE]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={16} className="text-white fill-white" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <h4 className="text-base sm:text-lg font-black tracking-tight truncate">
                            {applicant.name || applicant.display_title}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit ${statusStyle.bg} ${statusStyle.text}`}>
                            {applicant.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <span className="flex items-center gap-1"><MapPin size={11} /> {applicant.location}</span>
                          <span className="flex items-center gap-1"><Clock size={11} /> {applicant.appliedAgo}</span>
                        </div>
                      </div>

                      {/* Applied-to Job Tag */}
                      <div className="sm:text-right shrink-0 space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Applied to</p>
                        <p className="text-xs sm:text-sm font-black text-[#0077BE] tracking-tight truncate max-w-[200px]">
                          {applicant.appliedToJob?.title || 'Your Job Post'}
                        </p>
                      </div>
                    </div>

                    {/* Skills + contact row */}
                    <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                      {applicant.skills && applicant.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {applicant.skills.slice(0, 4).map((s: string) => (
                            <span key={s} className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{s}</span>
                          ))}
                          {applicant.skills.length > 4 && (
                            <span className="px-2.5 py-1 text-gray-400 text-[9px] font-black uppercase tracking-widest">+{applicant.skills.length - 4} more</span>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="h-9 px-4 rounded-xl bg-[#0077BE]/5 text-[#0077BE] flex items-center gap-1.5 hover:bg-[#0077BE] hover:text-white transition-all"
                        >
                          <Phone size={13} />
                          <span className="font-black text-[9px] uppercase tracking-widest">Call</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="h-9 px-4 rounded-xl bg-[#2ECC71]/5 text-[#2ECC71] flex items-center gap-1.5 hover:bg-[#2ECC71] hover:text-white transition-all"
                        >
                          <Mail size={13} />
                          <span className="font-black text-[9px] uppercase tracking-widest">Email</span>
                        </button>
                      </div>
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
                <div className="w-6 h-6 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center">
                  <Lock size={14} className="text-[#FF6B6B]" />
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
                    className="p-5 sm:p-6 bg-white border border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm hover:shadow-lg transition-all group relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                      {/* Blurred Avatar */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gray-100 overflow-hidden relative shrink-0">
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
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <h4 className="text-base sm:text-lg font-black tracking-tight truncate text-gray-400">
                          {formatCandidateTitle(applicant)}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <span className="flex items-center gap-1"><MapPin size={11} /> {applicant.location}</span>
                          <span className="flex items-center gap-1"><Clock size={11} /> {applicant.appliedAgo}</span>
                        </div>
                      </div>

                      {/* Applied-to Job Tag */}
                      <div className="sm:text-right shrink-0 space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Applied to</p>
                        <p className="text-xs sm:text-sm font-black text-[#0077BE] tracking-tight truncate max-w-[200px]">
                          {applicant.appliedToJob?.title || 'Your Job Post'}
                        </p>
                      </div>
                    </div>

                    {/* Skills (visible) + Unlock row */}
                    <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                      {applicant.skills && applicant.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {applicant.skills.slice(0, 4).map((s: string) => (
                            <span key={s} className="px-2.5 py-1 bg-gray-50 text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-widest">{s}</span>
                          ))}
                          {applicant.skills.length > 4 && (
                            <span className="px-2.5 py-1 text-gray-300 text-[9px] font-black uppercase tracking-widest">+{applicant.skills.length - 4} more</span>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => onSelectCandidate(applicant)}
                          className="h-9 px-4 rounded-xl bg-gray-50 text-gray-400 flex items-center gap-1.5 hover:bg-gray-100 transition-all"
                        >
                          <Eye size={13} />
                          <span className="font-black text-[9px] uppercase tracking-widest">Preview</span>
                        </button>
                        <button
                          onClick={() => onShowPayment({ type: 'employer', items: [applicant] })}
                          className="h-9 px-4 rounded-xl bg-[#FF6B6B] text-white flex items-center gap-1.5 hover:bg-[#FF6B6B]/90 transition-all shadow-md shadow-[#FF6B6B]/20"
                        >
                          <Lock size={13} />
                          <span className="font-black text-[9px] uppercase tracking-widest">Unlock ${interactionFee.toFixed(2)}</span>
                        </button>
                      </div>
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
