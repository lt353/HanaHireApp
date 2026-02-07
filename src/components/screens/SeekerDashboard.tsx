import React from "react";
import { motion } from "motion/react";
import { Plus, Play, Video, Settings as SettingsIcon, Users, Edit3, LogIn, LogOut, Briefcase, MapPin, DollarSign, Building2, ExternalLink, Eye, FileText, BarChart3 } from "lucide-react";
import { Button } from "../ui/Button";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface SeekerDashboardProps {
  isLoggedIn: boolean;
  userProfile?: any;
  onNavigate: (tab: string) => void;
  onShowMedia: () => void;
  onShowVisibility: () => void;
  onShowAuth: (mode: "login" | "signup") => void;
  onLogout: () => void;
  unlockedJobs?: any[];
  onSelectJob?: (job: any) => void;
  applicationCount?: number;
}

export const SeekerDashboard: React.FC<SeekerDashboardProps> = ({
  isLoggedIn,
  userProfile,
  onNavigate,
  onShowMedia,
  onShowVisibility,
  onShowAuth,
  onLogout,
  unlockedJobs,
  onSelectJob,
  applicationCount = 0
}) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 space-y-12 sm:space-y-16">
      {/* Browse anonymously banner */}
      {!isLoggedIn && (
        <div className="p-6 sm:p-8 bg-gradient-to-r from-[#0077BE]/5 to-[#2ECC71]/5 rounded-[2rem] sm:rounded-[3rem] border border-[#0077BE]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 flex-1">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">Browse Jobs Anonymously</h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium">No sign-up required to explore. Create an account to save your info for future applications.</p>
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
              className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl whitespace-nowrap"
              onClick={() => onShowAuth("signup")}
            >
              Sign Up
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 sm:gap-10">
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none">Seeker Hub</h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-500 font-medium">
            {isLoggedIn
              ? `Welcome back${userProfile?.name ? `, ${userProfile.name}` : ''}. Manage your profile and track activity.`
              : "Browse jobs and get started when ready."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
          <Button
            variant="secondary"
            className="h-16 sm:h-20 md:h-24 px-8 sm:px-10 md:px-12 rounded-[2rem] shadow-2xl shadow-[#FF6B6B]/20 text-base sm:text-lg md:text-xl whitespace-nowrap"
            onClick={() => onNavigate("jobs")}
          >
            <Plus size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" /> Browse Jobs
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

      {isLoggedIn && (
        <div className="grid lg:grid-cols-3 gap-8 sm:gap-12 md:gap-20">
          <div className="lg:col-span-2 space-y-8 sm:space-y-12">
            <div className="p-6 sm:p-10 md:p-12 bg-white rounded-[2.5rem] sm:rounded-[3.5rem] md:rounded-[4.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 sm:gap-12 md:gap-16 group relative overflow-hidden">
              <div className="w-40 sm:w-48 md:w-52 aspect-[9/16] bg-gray-900 rounded-[2.5rem] sm:rounded-[3rem] md:rounded-[3.5rem] overflow-hidden relative shadow-2xl shrink-0">
                <ImageWithFallback src="https://images.unsplash.com/photo-1758598304204-5bec31342d05?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-full bg-white/20 backdrop-blur-2xl flex items-center justify-center text-white border-2 border-white/40 shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                    <Play fill="white" size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  </div>
                </div>
              </div>
              <div className="space-y-6 sm:space-y-8 text-center md:text-left flex-1 relative z-10">
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">Your Intro Video</h3>
                  <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">RECORDED IN SECONDS</p>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 md:gap-5 justify-center md:justify-start">
                  <Button variant="outline" className="h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 rounded-2xl bg-white border-gray-100" onClick={onShowMedia}>
                    <Video size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#0077BE]" /> Update Video
                  </Button>
                  <Button variant="outline" className="h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 rounded-2xl bg-white border-gray-100" onClick={() => onNavigate("profile-title-customization")}>
                    <Edit3 size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#0077BE]" /> Profile Title
                  </Button>
                  <Button variant="ghost" className="h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 rounded-2xl text-gray-400 font-black uppercase tracking-widest text-[10px]" onClick={onShowVisibility}>
                    <SettingsIcon size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" /> Visibility
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <aside className="space-y-6 sm:space-y-8">
            <div className="p-8 sm:p-10 md:p-12 bg-gray-900 text-white rounded-[2.5rem] sm:rounded-[3.5rem] md:rounded-[4.5rem] space-y-6 sm:space-y-8 shadow-2xl relative overflow-hidden group">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tighter leading-none flex items-center gap-3">
                <BarChart3 size={24} className="text-[#0077BE]" /> Activity
              </h3>
              <div className="space-y-5">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="text-white/40 font-black uppercase tracking-[0.3em] text-[9px]">Profile Views</span>
                  <span className="text-4xl sm:text-5xl font-black tracking-tighter transition-all group-hover:text-[#0077BE]">42</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="text-white/40 font-black uppercase tracking-[0.3em] text-[9px]">Applications</span>
                  <span className="text-4xl sm:text-5xl font-black tracking-tighter transition-all group-hover:text-[#2ECC71]">{applicationCount}</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="text-white/40 font-black uppercase tracking-[0.3em] text-[9px]">Unlocked Profiles</span>
                  <span className="text-4xl sm:text-5xl font-black tracking-tighter transition-all group-hover:text-[#FF6B6B]">{unlockedJobs?.length || 0}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-white/40 font-black uppercase tracking-[0.3em] text-[9px]">Employers Seen You</span>
                  <span className="text-4xl sm:text-5xl font-black tracking-tighter transition-all group-hover:text-yellow-400">7</span>
                </div>
              </div>
              <Users className="absolute -right-20 -bottom-20 text-white/5 rotate-12" size={350} />
            </div>

            {/* Quick Profile Summary */}
            {userProfile?.name && (
              <div className="p-6 sm:p-8 bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Your Profile</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-[#0077BE] shrink-0" />
                    <span className="font-bold text-gray-900 text-sm">{userProfile.name}</span>
                  </div>
                  {userProfile.location && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-600 text-sm">{userProfile.location}</span>
                    </div>
                  )}
                  {userProfile.skills && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {userProfile.skills.slice(0, 4).map((s: string) => (
                        <span key={s} className="px-2.5 py-1 bg-[#0077BE]/5 text-[#0077BE] rounded-lg text-[10px] font-black uppercase tracking-widest">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Unlocked Jobs Section - Always visible when there are unlocked jobs */}
      {unlockedJobs && unlockedJobs.length > 0 && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">Your Unlocked Jobs</h3>
            <span className="text-sm font-black uppercase tracking-widest text-gray-400">
              {unlockedJobs.length} {unlockedJobs.length === 1 ? 'Job' : 'Jobs'}
            </span>
          </div>

          <div className="grid gap-6">
            {unlockedJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-8 md:p-10 bg-white border-2 border-[#2ECC71]/20 rounded-[2rem] sm:rounded-[3rem] shadow-lg hover:shadow-2xl transition-all group cursor-pointer"
                onClick={() => onSelectJob && onSelectJob(job)}
              >
                <div className="space-y-6">
                  {/* Header with company name - ONLY VISIBLE WHEN UNLOCKED */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2ECC71]/10 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest text-[#2ECC71]">Unlocked</span>
                      </div>
                      <h4 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight group-hover:text-[#0077BE] transition-colors">
                        {job.title}
                      </h4>
                      {/* Company Name - REVEALED ONLY WHEN UNLOCKED */}
                      <div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900">
                        <Building2 size={20} className="text-[#0077BE]" />
                        <span>{job.company_name || 'Company Name Hidden'}</span>
                      </div>
                    </div>
                    <ExternalLink size={24} className="text-gray-300 group-hover:text-[#0077BE] transition-colors shrink-0" />
                  </div>

                  {/* Job Details Grid */}
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-gray-100">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm sm:text-base">
                        <MapPin size={18} className="text-gray-400 shrink-0" />
                        <span className="font-bold text-gray-900">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm sm:text-base">
                        <DollarSign size={18} className="text-gray-400 shrink-0" />
                        <span className="font-bold text-gray-900">{job.pay_range}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm sm:text-base">
                        <Briefcase size={18} className="text-gray-400 shrink-0" />
                        <span className="font-bold text-gray-900">{job.job_type}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Industry</p>
                        <p className="font-bold text-gray-900">{job.company_industry}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Company Size</p>
                        <p className="font-bold text-gray-900">{job.company_size || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Job Description - FULL TEXT WHEN UNLOCKED */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Job Description</p>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{job.description}</p>
                  </div>

                  {/* Requirements - ONLY VISIBLE WHEN UNLOCKED */}
                  {job.requirements && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Requirements</p>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{job.requirements}</p>
                    </div>
                  )}

                  {/* Contact Info - ONLY VISIBLE WHEN UNLOCKED */}
                  {(job.contact_email || job.contact_phone) && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Contact Information</p>
                      <div className="space-y-2">
                        {job.contact_email && (
                          <p className="text-sm font-bold text-gray-900">
                            Email: <a href={`mailto:${job.contact_email}`} className="text-[#0077BE] hover:underline">{job.contact_email}</a>
                          </p>
                        )}
                        {job.contact_phone && (
                          <p className="text-sm font-bold text-gray-900">
                            Phone: <span className="text-[#0077BE]">{job.contact_phone}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
