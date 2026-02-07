import React from "react";
import { motion } from "motion/react";
import { Plus, Play, Briefcase, MapPin, Lock, LogIn, LogOut, Star, Users, Phone, Mail, BarChart3, Shield, Building2, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { formatCandidateTitle } from "../../utils/formatters";

interface EmployerDashboardProps {
  isLoggedIn: boolean;
  userProfile?: any;
  jobs: any[];
  candidates: any[];
  unlockedCandidateIds: number[];
  onNavigate: (tab: string) => void;
  onShowPostJob: () => void;
  onSelectCandidate: (candidate: any) => void;
  onShowAuth: (mode: "login" | "signup") => void;
  onLogout: () => void;
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
  onShowAuth,
  onLogout
}) => {
  const unlockedCandidates = candidates.filter(c => unlockedCandidateIds.includes(c.id));
  const isVerified = isLoggedIn && userProfile?.businessLicense;

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
            <p className="text-4xl sm:text-5xl font-black tracking-tighter group-hover:text-[#0077BE] transition-colors">{jobs.slice(0, 2).length}</p>
            <Briefcase className="absolute -right-4 -bottom-4 text-white/5" size={80} />
          </div>
          <div className="p-6 sm:p-8 bg-gray-900 text-white rounded-[2rem] sm:rounded-[2.5rem] space-y-3 group relative overflow-hidden">
            <span className="text-white/40 font-black uppercase tracking-[0.3em] text-[9px]">Candidates Unlocked</span>
            <p className="text-4xl sm:text-5xl font-black tracking-tighter group-hover:text-[#2ECC71] transition-colors">{unlockedCandidates.length}</p>
            <Users className="absolute -right-4 -bottom-4 text-white/5" size={80} />
          </div>
          <div className="p-6 sm:p-8 bg-gray-900 text-white rounded-[2rem] sm:rounded-[2.5rem] space-y-3 group relative overflow-hidden">
            <span className="text-white/40 font-black uppercase tracking-[0.3em] text-[9px]">Applicants Received</span>
            <p className="text-4xl sm:text-5xl font-black tracking-tighter group-hover:text-[#FF6B6B] transition-colors">18</p>
            <Mail className="absolute -right-4 -bottom-4 text-white/5" size={80} />
          </div>
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
            {jobs.slice(0, 2).map(j => (
              <div key={j.id} className="p-6 sm:p-8 md:p-10 bg-white border border-gray-100 rounded-[2.5rem] sm:rounded-[3rem] md:rounded-[3.5rem] shadow-sm space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight break-words">{j.title}</h4>
                    <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] pt-1">{j.location} • LIVE</p>
                  </div>
                  <Button variant="outline" className="h-9 sm:h-10 border-none bg-gray-50 text-[10px] px-3 sm:px-4 font-black uppercase tracking-widest shrink-0">
                    Manage
                  </Button>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <Button variant="outline" className="flex-1 h-12 sm:h-14 md:h-16 rounded-[1.2rem] border-gray-100 bg-white text-xs font-black uppercase tracking-widest" onClick={() => onNavigate("candidates")}>
                    Browse Matches
                  </Button>
                </div>
              </div>
            ))}
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
    </motion.div>
  );
};
