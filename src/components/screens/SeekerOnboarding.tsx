import React, { useState, useMemo } from "react";
import { User, Zap, CheckCircle, Video, Camera, ChevronRight, Sparkles, Edit3, Lock } from "lucide-react";
import { Button } from "../ui/Button";
import { CANDIDATE_CATEGORIES, DEMO_PROFILES } from "../../data/mockData";

interface SeekerOnboardingProps {
  userProfile: any;
  onComplete: (profileData: any) => void;
}

export const SeekerOnboarding: React.FC<SeekerOnboardingProps> = ({ userProfile, onComplete }) => {
  const [bio, setBio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [availability, setAvailability] = useState("");
  const [targetPay, setTargetPay] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedWorkStyles, setSelectedWorkStyles] = useState<string[]>([]);
  const [jobTypesSeeking, setJobTypesSeeking] = useState<string[]>([]);
  const [useCustomTitle, setUseCustomTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState("");

  // System-generated title based on selected skills + experience
  const systemTitle = useMemo(() => {
    const parts: string[] = [];
    if (experience) {
      const years = parseInt(experience);
      if (years >= 5) parts.push("Experienced");
      else if (years >= 2) parts.push("Skilled");
    }
    if (selectedSkills.length > 0) {
      parts.push(selectedSkills[0]);
      if (selectedSkills.length > 1) parts.push(`& ${selectedSkills[1]}`);
    }
    return parts.length > 0 ? parts.join(" ") : "Professional Talent";
  }, [selectedSkills, experience]);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleDemoFill = () => {
    const d = DEMO_PROFILES.seeker;
    setBio(d.bio);
    setSelectedSkills(d.skills);
    setExperience(d.experience);
    setEducation(d.education);
    setAvailability(d.availability);
    setTargetPay(d.targetPay);
    setSelectedIndustries(d.industries);
    setSelectedWorkStyles(["Collaborative", "Outgoing", "Energetic"]);
    setJobTypesSeeking(["Full-time", "Part-time"]);
    setUseCustomTitle(true);
    setCustomTitle("Experienced Bartender & Hospitality Pro");
  };

  const handleSubmit = () => {
    const profileData = {
      ...userProfile,
      bio,
      skills: selectedSkills,
      experience,
      education,
      availability,
      targetPay,
      industries: selectedIndustries,
      workStyles: selectedWorkStyles,
      jobTypesSeeking,
      displayTitle: useCustomTitle && customTitle.trim() ? customTitle.trim() : systemTitle,
    };
    onComplete(profileData);
  };

  const filledSections = [
    bio.length > 0,
    selectedSkills.length > 0,
    experience.length > 0,
    education.length > 0,
    availability.length > 0,
    targetPay.length > 0,
    selectedIndustries.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0077BE]/5 to-white pt-24 pb-32">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-10">
          <div className="w-20 h-20 rounded-[1.5rem] bg-[#0077BE]/10 flex items-center justify-center mx-auto">
            <User size={36} className="text-[#0077BE]" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Set Up Your Profile</h1>
          <p className="text-gray-500 font-medium text-lg max-w-md mx-auto">
            Fill this out once and it auto-fills your future applications. Save time every time you apply.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Profile Progress</span>
            <span className="text-sm font-black text-[#0077BE]">{filledSections}/7 sections</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0077BE] rounded-full transition-all duration-500"
              style={{ width: `${(filledSections / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Demo Fill Button */}
        <button
          onClick={handleDemoFill}
          className="w-full mb-8 p-4 rounded-2xl border-2 border-[#0077BE]/20 bg-[#0077BE]/5 hover:bg-[#0077BE]/10 transition-all flex items-center justify-center gap-3 group"
        >
          <Zap size={18} className="text-[#0077BE] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest text-[#0077BE]">
            Auto-fill Demo Profile
          </span>
        </button>

        <div className="space-y-8">
          {/* Bio */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              {bio.length > 0 && <CheckCircle size={18} className="text-[#2ECC71]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">About You</h2>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell employers about yourself — your personality, work ethic, what drives you..."
              rows={4}
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:ring-4 ring-[#0077BE]/10 outline-none font-medium text-base resize-none"
            />
          </div>

          {/* Display Title */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Edit3 size={18} className="text-[#0077BE]" />
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Display Title</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              This is what employers see before unlocking your profile. Choose a system-generated title based on your skills, or write your own.
            </p>

            {/* System-generated preview */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">System Generated</span>
                <div className="flex items-center gap-1 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                  <Lock size={10} /> Employer view
                </div>
              </div>
              <p className="font-black text-lg tracking-tight text-gray-600">{systemTitle}</p>
            </div>

            {/* Toggle custom */}
            <button
              onClick={() => setUseCustomTitle(!useCustomTitle)}
              className={`w-full p-3 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all ${
                useCustomTitle
                  ? 'border-[#0077BE] bg-[#0077BE]/5 text-[#0077BE]'
                  : 'border-gray-100 text-gray-400 hover:border-gray-200'
              }`}
            >
              {useCustomTitle ? 'Using Custom Title' : 'Write My Own Title Instead'}
            </button>

            {useCustomTitle && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value.slice(0, 50))}
                  placeholder="e.g. Experienced Bartender & Hospitality Pro"
                  className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:ring-4 ring-[#0077BE]/10 outline-none font-bold text-base"
                />
                <div className="flex justify-between items-center px-1">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">No names or contact info allowed</p>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${customTitle.length > 45 ? 'text-[#FF6B6B]' : 'text-gray-300'}`}>{customTitle.length}/50</p>
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              {selectedSkills.length > 0 && <CheckCircle size={18} className="text-[#2ECC71]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Skills ({selectedSkills.length} selected)</h2>
            </div>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {CANDIDATE_CATEGORIES.skills.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleItem(selectedSkills, setSelectedSkills, skill)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedSkills.includes(skill)
                      ? "bg-[#0077BE] text-white shadow-md"
                      : "bg-gray-50 text-gray-400 border border-gray-100 hover:border-[#0077BE]/30"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Experience & Education Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {experience.length > 0 && <CheckCircle size={18} className="text-[#2ECC71]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Experience</h2>
              </div>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 font-bold text-base"
              >
                <option value="">Select...</option>
                {CANDIDATE_CATEGORIES.experienceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {education.length > 0 && <CheckCircle size={18} className="text-[#2ECC71]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Education</h2>
              </div>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 font-bold text-base"
              >
                <option value="">Select...</option>
                {CANDIDATE_CATEGORIES.educationLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability & Target Pay Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {availability.length > 0 && <CheckCircle size={18} className="text-[#2ECC71]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Availability</h2>
              </div>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 font-bold text-base"
              >
                <option value="">Select...</option>
                {CANDIDATE_CATEGORIES.availability.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {targetPay.length > 0 && <CheckCircle size={18} className="text-[#2ECC71]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Target Pay</h2>
              </div>
              <select
                value={targetPay}
                onChange={(e) => setTargetPay(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 font-bold text-base"
              >
                <option value="">Select...</option>
                {CANDIDATE_CATEGORIES.targetPayRanges.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Industries */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              {selectedIndustries.length > 0 && <CheckCircle size={18} className="text-[#2ECC71]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Industries of Interest ({selectedIndustries.length})</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {CANDIDATE_CATEGORIES.industries.map(ind => (
                <button
                  key={ind}
                  onClick={() => toggleItem(selectedIndustries, setSelectedIndustries, ind)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedIndustries.includes(ind)
                      ? "bg-[#0077BE] text-white shadow-md"
                      : "bg-gray-50 text-gray-400 border border-gray-100 hover:border-[#0077BE]/30"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* Work Styles */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Work Style ({selectedWorkStyles.length})</h2>
            <div className="flex flex-wrap gap-2">
              {CANDIDATE_CATEGORIES.workStyles.map(style => (
                <button
                  key={style}
                  onClick={() => toggleItem(selectedWorkStyles, setSelectedWorkStyles, style)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedWorkStyles.includes(style)
                      ? "bg-[#0077BE] text-white shadow-md"
                      : "bg-gray-50 text-gray-400 border border-gray-100 hover:border-[#0077BE]/30"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Job Types Seeking */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Job Types Seeking ({jobTypesSeeking.length})</h2>
            <div className="flex flex-wrap gap-2">
              {CANDIDATE_CATEGORIES.jobTypesSeeking.map(jt => (
                <button
                  key={jt}
                  onClick={() => toggleItem(jobTypesSeeking, setJobTypesSeeking, jt)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    jobTypesSeeking.includes(jt)
                      ? "bg-[#0077BE] text-white shadow-md"
                      : "bg-gray-50 text-gray-400 border border-gray-100 hover:border-[#0077BE]/30"
                  }`}
                >
                  {jt}
                </button>
              ))}
            </div>
          </div>

          {/* Video Intro Placeholder */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Video Intro (optional)</h2>
            <button
              onClick={() => {}}
              className="w-full py-12 border-4 border-dashed border-gray-100 rounded-2xl flex flex-col items-center gap-3 text-gray-300 hover:text-[#0077BE] hover:border-[#0077BE]/30 transition-all"
            >
              <Camera size={36} />
              <span className="font-black text-xs uppercase tracking-widest">Record Your 30-Second Intro</span>
              <span className="text-[10px] text-gray-400 font-medium">Show employers your personality</span>
            </button>
          </div>

          {/* Submit */}
          <div className="pt-4 space-y-4">
            <Button
              onClick={handleSubmit}
              className="w-full h-20 rounded-[1.5rem] text-xl shadow-xl shadow-[#0077BE]/20 flex items-center justify-center gap-3"
            >
              <Sparkles size={22} />
              Launch My Profile
              <ChevronRight size={22} />
            </Button>
            <p className="text-center text-xs text-gray-400 font-medium">
              You can always update this later from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
