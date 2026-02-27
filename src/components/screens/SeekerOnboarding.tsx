import React, { useState, useMemo, useEffect, useRef } from "react";
import { User, Zap, CheckCircle, Camera, ChevronRight, Sparkles, Edit3, Lock, Mic } from "lucide-react";
import { Button } from "../ui/Button.tsx";
import { CANDIDATE_CATEGORIES, DEMO_PROFILES, JOB_CATEGORIES } from "../../data/mockData";
import { ViewType } from '../../App';

interface SeekerOnboardingProps {
  userProfile: any;
  onComplete: (profileData: any) => void;
  onNavigate?: (view: ViewType) => void;
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
  const [preferredJobCategories, setPreferredJobCategories] = useState<string[]>([]);
  const [useCustomTitle, setUseCustomTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState("");

  // Custom text entry for multi-select sections
  const [customSkill, setCustomSkill] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [customWorkStyle, setCustomWorkStyle] = useState("");
  const [customJobType, setCustomJobType] = useState("");

  // --- Speech to Text (Web Speech API) for "About You" bio ---
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [isRecordingBio, setIsRecordingBio] = useState(false);
  const bioRecognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onend = () => setIsRecordingBio(false);
      bioRecognitionRef.current = recognition;
      setHasSpeechSupport(true);
    } catch {
      setHasSpeechSupport(false);
    }
  }, []);

  const toggleBioSpeechToText = () => {
    if (!bioRecognitionRef.current || !hasSpeechSupport) return;

    try {
      const recognition = bioRecognitionRef.current as any;

      if (isRecordingBio) {
        recognition.stop();
        setIsRecordingBio(false);
        return;
      }

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            transcript += result[0].transcript;
          }
        }

        if (transcript) {
          setBio(prev =>
            prev ? `${prev.trim()} ${transcript.trim()}` : transcript.trim(),
          );
        }
      };

      recognition.start();
      setIsRecordingBio(true);
    } catch {
      setIsRecordingBio(false);
    }
  };

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
    // Prefer a rich profile (demo candidate loaded from Supabase) when available
    const isSeeker = userProfile && userProfile.role === "seeker";
    const hasRichData =
      isSeeker &&
      (
        userProfile.bio ||
        (userProfile.skills && userProfile.skills.length > 0) ||
        userProfile.experience !== undefined ||
        userProfile.education ||
        userProfile.availability ||
        userProfile.targetPay ||
        (userProfile.industries && userProfile.industries.length > 0)
      );

    if (hasRichData) {
      // Map numeric years_experience into the labeled ranges used in CANDIDATE_CATEGORIES.experience
      const mapExperience = (raw: any): string => {
        if (raw === null || raw === undefined) return "";
        const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
        if (isNaN(n)) return String(raw);
        if (n <= 2) return "0-2 years";
        if (n <= 5) return "2-5 years";
        if (n <= 10) return "5-10 years";
        return "10+ years";
      };

      setBio(userProfile.bio || "");
      setSelectedSkills(userProfile.skills || []);
      setExperience(mapExperience(userProfile.experience));
      // For education / availability / pay, keep the raw DB strings and let the user
      // either pick a preset or type their own in the companion text inputs.
      setEducation(userProfile.education || "");
      setAvailability(userProfile.availability || "");
      setTargetPay(userProfile.targetPay || "");
      setSelectedIndustries(userProfile.industries || []);
      setSelectedWorkStyles(userProfile.workStyles || []);
      setJobTypesSeeking(userProfile.jobTypesSeeking || []);
      setPreferredJobCategories(userProfile.preferredJobCategories || []);
      setUseCustomTitle(true);
      setCustomTitle(
        (userProfile.displayTitle as string | undefined)?.trim() || systemTitle,
      );
      return;
    }

    // Fallback: local demo constants if we don't have a rich profile yet
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
    setPreferredJobCategories(['Food Service', 'Hospitality Services']);
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
      preferredJobCategories,
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
    <div className="min-h-screen bg-gradient-to-b from-[#148F8B]/5 to-white pt-24 pb-32">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-10">
          <div className="w-20 h-20 rounded-[1.5rem] bg-[#148F8B]/10 flex items-center justify-center mx-auto">
            <User size={36} className="text-[#148F8B]" />
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
            <span className="text-sm font-black text-[#148F8B]">{filledSections}/7 sections</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#148F8B] rounded-full transition-all duration-500"
              style={{ width: `${(filledSections / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Demo Fill Button */}
        <button
          onClick={handleDemoFill}
          className="w-full mb-8 p-4 rounded-2xl border-2 border-[#148F8B]/20 bg-[#148F8B]/5 hover:bg-[#148F8B]/10 transition-all flex items-center justify-center gap-3 group"
        >
          <Zap size={18} className="text-[#148F8B] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest text-[#148F8B]">
            Auto-fill Demo Profile
          </span>
        </button>

        <div className="space-y-8">
          {/* Bio */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {bio.length > 0 && <CheckCircle size={18} className="text-[#A63F8B]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
                  About You
                </h2>
              </div>
              {hasSpeechSupport && (
                <button
                  type="button"
                  onClick={toggleBioSpeechToText}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black tracking-widest uppercase transition-all ${
                    isRecordingBio
                      ? "border-[#148F8B] bg-[#148F8B]/10 text-[#148F8B]"
                      : "border-gray-200 bg-white text-gray-500 hover:border-[#148F8B] hover:text-[#148F8B]"
                  }`}
                >
                  <Mic size={12} />
                  <span>{isRecordingBio ? "Stop" : "Speak"}</span>
                </button>
              )}
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell employers about yourself — your personality, work ethic, what drives you..."
              rows={4}
              className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#148F8B]/10 outline-none font-medium text-base resize-none"
            />
          </div>

          {/* Display Title */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Edit3 size={18} className="text-[#148F8B]" />
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Display Title</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              This is what employers see before unlocking your profile. Choose a system-generated title based on your skills, or write your own.
            </p>

            {/* System-generated preview */}
            <div className="p-4 bg-[#F3EAF5]/30 rounded-xl border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">System Generated</span>
                <div className="flex items-center gap-1 text-[9px] font-black text-gray-600 uppercase tracking-widest">
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
                  ? 'border-[#148F8B] bg-[#148F8B]/5 text-[#148F8B]'
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
                  className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-base"
                />
                <div className="flex justify-between items-center px-1">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">No names or contact info allowed</p>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${customTitle.length > 45 ? 'text-[#A63F8E]' : 'text-gray-600'}`}>{customTitle.length}/50</p>
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              {selectedSkills.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
                Skills ({selectedSkills.length} selected)
              </h2>
            </div>

            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleItem(selectedSkills, setSelectedSkills, skill)}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#148F8B] text-white shadow-md flex items-center gap-1"
                  >
                    <span>{skill}</span>
                    <span className="text-[9px] opacity-80">×</span>
                  </button>
                ))}
              </div>
            )}

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">
              Suggested Skills
            </p>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {CANDIDATE_CATEGORIES.skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleItem(selectedSkills, setSelectedSkills, skill)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedSkills.includes(skill)
                      ? "bg-[#148F8B] text-white shadow-md"
                      : "bg-[#F3EAF5]/30 text-gray-400 border border-gray-100 hover:border-[#148F8B]/30"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customSkill.trim()) {
                      const trimmed = customSkill.trim();
                      if (!selectedSkills.includes(trimmed)) {
                        setSelectedSkills([...selectedSkills, trimmed]);
                      }
                      setCustomSkill("");
                    }
                  }}
                  placeholder="Type your own skill and press Enter"
                  className="flex-1 p-3 rounded-xl bg-white border border-gray-100 focus:ring-2 ring-[#148F8B]/10 outline-none text-sm"
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium">
                Your custom skills will appear in the selected list above.
              </p>
            </div>
          </div>

          {/* Experience & Education Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {experience.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Experience</h2>
              </div>
              <select
                value={CANDIDATE_CATEGORIES.experience.includes(experience) ? experience : ""}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base mb-2"
              >
                <option value="">Select...</option>
                {CANDIDATE_CATEGORIES.experience.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Or type your own (e.g. 7 years line cook)"
                className="w-full p-3 rounded-xl bg-white border border-gray-100 focus:ring-2 ring-[#148F8B]/10 outline-none text-sm"
              />
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {education.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Education</h2>
              </div>
              <select
                value={CANDIDATE_CATEGORIES.education.includes(education) ? education : ""}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base mb-2"
              >
                <option value="">Select...</option>
                {CANDIDATE_CATEGORIES.education.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Or type your own (e.g. Culinary Arts Certificate...)"
                className="w-full p-3 rounded-xl bg-white border border-gray-100 focus:ring-2 ring-[#148F8B]/10 outline-none text-sm"
              />
            </div>
          </div>

          {/* Availability & Target Pay Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {availability.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Availability</h2>
              </div>
              <select
                value={CANDIDATE_CATEGORIES.availability.includes(availability) ? availability : ""}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base mb-2"
              >
                <option value="">Select...</option>
                {CANDIDATE_CATEGORIES.availability.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <input
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="Or type your own (e.g. Two weeks notice)"
                className="w-full p-3 rounded-xl bg-white border border-gray-100 focus:ring-2 ring-[#148F8B]/10 outline-none text-sm"
              />
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {targetPay.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Target Pay</h2>
              </div>
              <select
                value={CANDIDATE_CATEGORIES.targetPayRanges.includes(targetPay) ? targetPay : ""}
                onChange={(e) => setTargetPay(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base mb-2"
              >
                <option value="">Select...</option>
                {CANDIDATE_CATEGORIES.targetPayRanges.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="text"
                value={targetPay}
                onChange={(e) => setTargetPay(e.target.value)}
                placeholder="Or type your own (e.g. $24-30/hr)"
                className="w-full p-3 rounded-xl bg-white border border-gray-100 focus:ring-2 ring-[#148F8B]/10 outline-none text-sm"
              />
            </div>
          </div>

          {/* Industries */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              {selectedIndustries.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
                Industries of Interest ({selectedIndustries.length})
              </h2>
            </div>

            {selectedIndustries.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedIndustries.map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => toggleItem(selectedIndustries, setSelectedIndustries, ind)}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#148F8B] text-white shadow-md flex items-center gap-1"
                  >
                    <span>{ind}</span>
                    <span className="text-[9px] opacity-80">×</span>
                  </button>
                ))}
              </div>
            )}

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">
              Suggested Industries
            </p>
            <div className="flex flex-wrap gap-2">
              {CANDIDATE_CATEGORIES.industries.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => toggleItem(selectedIndustries, setSelectedIndustries, ind)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedIndustries.includes(ind)
                      ? "bg-[#148F8B] text-white shadow-md"
                      : "bg-[#F3EAF5]/30 text-gray-400 border border-gray-100 hover:border-[#148F8B]/30"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customIndustry.trim()) {
                      const trimmed = customIndustry.trim();
                      if (!selectedIndustries.includes(trimmed)) {
                        setSelectedIndustries([...selectedIndustries, trimmed]);
                      }
                      setCustomIndustry("");
                    }
                  }}
                  placeholder="Type your own industry and press Enter"
                  className="flex-1 p-3 rounded-xl bg-white border border-gray-100 focus:ring-2 ring-[#148F8B]/10 outline-none text-sm"
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium">
                Custom industries will appear in the selected list above.
              </p>
            </div>
          </div>

          {/* Preferred Job Types / Categories */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              {preferredJobCategories.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
                Preferred Job Types ({preferredJobCategories.length})
              </h2>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              What type of work are you looking for?
            </p>

            {preferredJobCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {preferredJobCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleItem(preferredJobCategories, setPreferredJobCategories, cat)}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#148F8B] text-white shadow-md flex items-center gap-1"
                  >
                    <span>{cat}</span>
                    <span className="text-[9px] opacity-80">×</span>
                  </button>
                ))}
              </div>
            )}

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">
              Job Categories
            </p>
            <div className="flex flex-wrap gap-2">
              {JOB_CATEGORIES.jobCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleItem(preferredJobCategories, setPreferredJobCategories, cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    preferredJobCategories.includes(cat)
                      ? "bg-[#148F8B] text-white shadow-md"
                      : "bg-[#F3EAF5]/30 text-gray-400 border border-gray-100 hover:border-[#148F8B]/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Work Styles */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
              Work Style ({selectedWorkStyles.length})
            </h2>

            {selectedWorkStyles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedWorkStyles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleItem(selectedWorkStyles, setSelectedWorkStyles, style)}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#148F8B] text-white shadow-md flex items-center gap-1"
                  >
                    <span>{style}</span>
                    <span className="text-[9px] opacity-80">×</span>
                  </button>
                ))}
              </div>
            )}

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">
              Suggested Work Styles
            </p>
            <div className="flex flex-wrap gap-2">
              {CANDIDATE_CATEGORIES.workStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleItem(selectedWorkStyles, setSelectedWorkStyles, style)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedWorkStyles.includes(style)
                      ? "bg-[#148F8B] text-white shadow-md"
                      : "bg-[#F3EAF5]/30 text-gray-400 border border-gray-100 hover:border-[#148F8B]/30"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customWorkStyle}
                  onChange={(e) => setCustomWorkStyle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customWorkStyle.trim()) {
                      const trimmed = customWorkStyle.trim();
                      if (!selectedWorkStyles.includes(trimmed)) {
                        setSelectedWorkStyles([...selectedWorkStyles, trimmed]);
                      }
                      setCustomWorkStyle("");
                    }
                  }}
                  placeholder="Type your own work style and press Enter"
                  className="flex-1 p-3 rounded-xl bg-white border border-gray-100 focus:ring-2 ring-[#148F8B]/10 outline-none text-sm"
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium">
                Custom work styles will appear in the selected list above.
              </p>
            </div>
          </div>

          {/* Job Types Seeking */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
              Job Types Seeking ({jobTypesSeeking.length})
            </h2>

            {jobTypesSeeking.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {jobTypesSeeking.map((jt) => (
                  <button
                    key={jt}
                    type="button"
                    onClick={() => toggleItem(jobTypesSeeking, setJobTypesSeeking, jt)}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#148F8B] text-white shadow-md flex items-center gap-1"
                  >
                    <span>{jt}</span>
                    <span className="text-[9px] opacity-80">×</span>
                  </button>
                ))}
              </div>
            )}

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">
              Suggested Job Types
            </p>
            <div className="flex flex-wrap gap-2">
              {CANDIDATE_CATEGORIES.jobTypesSeeking.map((jt) => (
                <button
                  key={jt}
                  type="button"
                  onClick={() => toggleItem(jobTypesSeeking, setJobTypesSeeking, jt)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    jobTypesSeeking.includes(jt)
                      ? "bg-[#148F8B] text-white shadow-md"
                      : "bg-[#F3EAF5]/30 text-gray-400 border border-gray-100 hover:border-[#148F8B]/30"
                  }`}
                >
                  {jt}
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customJobType}
                  onChange={(e) => setCustomJobType(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customJobType.trim()) {
                      const trimmed = customJobType.trim();
                      if (!jobTypesSeeking.includes(trimmed)) {
                        setJobTypesSeeking([...jobTypesSeeking, trimmed]);
                      }
                      setCustomJobType("");
                    }
                  }}
                  placeholder="Type your own job type and press Enter"
                  className="flex-1 p-3 rounded-xl bg-white border border-gray-100 focus:ring-2 ring-[#148F8B]/10 outline-none text-sm"
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium">
                Custom job types will appear in the selected list above.
              </p>
            </div>
          </div>

          {/* Video Intro Placeholder */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Video Intro (optional)</h2>
            <button
              onClick={() => {}}
              className="w-full py-12 border-4 border-dashed border-gray-100 rounded-2xl flex flex-col items-center gap-3 text-gray-600 hover:text-[#148F8B] hover:border-[#148F8B]/30 transition-all"
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
              className="w-full h-20 rounded-[1.5rem] text-xl shadow-xl shadow-[#148F8B]/20 flex items-center justify-center gap-3"
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
