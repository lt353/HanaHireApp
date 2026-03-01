import React, { useState, useMemo, useEffect, useRef } from "react";
import { User, Zap, CheckCircle, Camera, ChevronRight, Sparkles, Edit3, Lock, Mic, ChevronDown, Check, X, Loader2 } from "lucide-react";
import { Button } from "../ui/Button.tsx";
import { CANDIDATE_CATEGORIES, DEMO_PROFILES, JOB_CATEGORIES } from "../../data/mockData";
import { ViewType } from '../../App';
import { VideoIntroModal } from "./VideoIntroModal";

/** Multi-select dropdown: trigger opens menu with checkboxes; selected items appear as removable pills outside; custom input below. */
function MultiSelectDropdown({
  label,
  selectedCount,
  options,
  selected,
  onToggle,
  onRemove,
  customPlaceholder,
  customValue,
  onCustomChange,
  onCustomKeyDown,
  id,
}: {
  label: string;
  selectedCount: number;
  options: string[];
  selected: string[];
  onToggle: (item: string) => void;
  onRemove: (item: string) => void;
  customPlaceholder: string;
  customValue: string;
  onCustomChange: (v: string) => void;
  onCustomKeyDown: (e: React.KeyboardEvent) => void;
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="space-y-3">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{label}</p>
      {/* Pills outside dropdown */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#148F8B] text-white shadow-md"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="p-0.5 rounded hover:bg-white/20 transition-colors"
                aria-label={`Remove ${item}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* Dropdown trigger */}
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 hover:border-[#148F8B]/30 font-bold text-base text-left"
      >
        <span className={selected.length > 0 ? "text-gray-800" : "text-gray-500"}>
          {selected.length > 0 ? `${selectedCount} selected` : "Select..."}
        </span>
        <ChevronDown size={18} className={`text-gray-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {/* Dropdown panel - multi-column grid */}
      {open && (
        <div className="border border-[#148F8B]/20 rounded-xl bg-white shadow-xl shadow-[#148F8B]/5 max-h-64 overflow-y-auto p-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onToggle(opt)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all ${
                  selected.includes(opt)
                    ? "bg-[#148F8B]/15 text-[#148F8B] font-semibold"
                    : "hover:bg-[#148F8B]/5 text-gray-700 font-medium"
                }`}
              >
                <span className="w-5 h-5 rounded-md border-2 border-current flex items-center justify-center shrink-0">
                  {selected.includes(opt) ? <Check size={12} strokeWidth={3} /> : null}
                </span>
                <span className="text-xs truncate">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Custom input below */}
      <div className="space-y-1">
        <input
          type="text"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          onKeyDown={onCustomKeyDown}
          placeholder={customPlaceholder}
          className="w-full p-3 rounded-xl bg-white border border-gray-100 focus:ring-2 ring-[#148F8B]/10 outline-none text-sm"
        />
        <p className="text-[10px] text-gray-400 font-medium">Custom entries will appear as pills above.</p>
      </div>
    </div>
  );
}

interface SeekerOnboardingProps {
  userProfile: any;
  onComplete: (profileData: any) => void;
  onNavigate?: (view: ViewType) => void;
}

export const SeekerOnboarding: React.FC<SeekerOnboardingProps> = ({ userProfile, onComplete }) => {
  const [bio, setBio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [selectedTargetPays, setSelectedTargetPays] = useState<string[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<string[]>([]);
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
  const [customJobCategory, setCustomJobCategory] = useState("");
  const [customTargetPay, setCustomTargetPay] = useState("");
  const [customEducation, setCustomEducation] = useState("");

  // Video intro (required)
  const [videoUrl, setVideoUrl] = useState("");
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoUploadStatus, setVideoUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [visibilityPreference, setVisibilityPreference] = useState<"broad" | "limited">("broad");
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Validation: highlight first missing required field
  const [validationError, setValidationError] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
      setAvailability(userProfile.availability || "");
      setSelectedTargetPays(userProfile.targetPay ? (Array.isArray(userProfile.targetPay) ? userProfile.targetPay : [userProfile.targetPay]) : []);
      setSelectedEducation(userProfile.education ? (Array.isArray(userProfile.education) ? userProfile.education : [userProfile.education]) : []);
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
    setAvailability(d.availability);
    setSelectedTargetPays(d.targetPay ? [d.targetPay] : []);
    setSelectedEducation(d.education ? [d.education] : []);
    setSelectedIndustries(d.industries);
    setSelectedWorkStyles(["Collaborative", "Outgoing", "Energetic"]);
    setJobTypesSeeking(["Full-time", "Part-time"]);
    setPreferredJobCategories(['Food Service', 'Hospitality Services']);
    setUseCustomTitle(true);
    setCustomTitle("Experienced Bartender & Hospitality Pro");
  };

  const handleSubmit = () => {
    setValidationError(null);

    const required = [
      { key: "video", ok: !!videoUrl, ref: "video" },
      { key: "bio", ok: bio.length > 0, ref: "bio" },
      { key: "skills", ok: selectedSkills.length > 0, ref: "skills" },
      { key: "experience", ok: experience.length > 0, ref: "experience" },
      { key: "industries", ok: selectedIndustries.length > 0, ref: "industries" },
      { key: "preferredJobTypes", ok: preferredJobCategories.length > 0, ref: "preferredJobTypes" },
      { key: "availability", ok: availability.length > 0, ref: "availability" },
      { key: "targetPay", ok: selectedTargetPays.length > 0, ref: "targetPay" },
      { key: "jobTypesSeeking", ok: jobTypesSeeking.length > 0, ref: "jobTypesSeeking" },
    ];
    const firstMissing = required.find((r) => !r.ok);
    if (firstMissing) {
      const labels: Record<string, string> = {
        video: "Video Intro",
        bio: "About You",
        skills: "Skills",
        experience: "Experience",
        industries: "Industries of Interest",
        preferredJobTypes: "Preferred Job Types",
        availability: "Availability",
        targetPay: "Target Pay",
        jobTypesSeeking: "Job Types Seeking",
      };
      setValidationError(`Please complete: ${labels[firstMissing.key] || firstMissing.key}`);
      sectionRefs.current[firstMissing.ref]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const profileData = {
      ...userProfile,
      bio,
      skills: selectedSkills,
      experience,
      education: selectedEducation.join(", ") || undefined,
      availability,
      targetPay: selectedTargetPays.join(", ") || undefined,
      industries: selectedIndustries,
      workStyles: selectedWorkStyles,
      jobTypesSeeking,
      preferredJobCategories,
      displayTitle: useCustomTitle && customTitle.trim() ? customTitle.trim() : systemTitle,
      video_url: videoUrl || undefined,
      video_thumbnail_url: videoThumbnailUrl || undefined,
      visibility_preference: visibilityPreference,
    };
    onComplete(profileData);
  };

  const filledSections = [
    !!videoUrl,
    bio.length > 0,
    selectedSkills.length > 0,
    experience.length > 0,
    selectedIndustries.length > 0,
    preferredJobCategories.length > 0,
    availability.length > 0,
    selectedTargetPays.length > 0,
    jobTypesSeeking.length > 0,
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
            <span className="text-sm font-black text-[#148F8B]">{filledSections} of 9 sections complete</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#148F8B] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(filledSections / 9) * 100}%` }}
              role="progressbar"
              aria-valuenow={filledSections}
              aria-valuemin={0}
              aria-valuemax={9}
              aria-label="Profile sections complete"
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
          {/* Video Intro (Required) - first */}
          <div
            ref={(el) => { sectionRefs.current["video"] = el; }}
            className={`bg-white rounded-[2rem] border-2 p-6 space-y-4 shadow-sm transition-colors ${validationError && !videoUrl ? "border-red-400" : "border-gray-100"}`}
          >
            <div className="flex items-center gap-3">
              {videoUrl && <CheckCircle size={18} className="text-[#148F8B]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Video Intro (Required)</h2>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Here is where you sell yourself as an applicant—make it count!
            </p>
            {videoUrl ? (
              <div className="space-y-3">
                <div className="flex gap-4 items-start">
                  {videoThumbnailUrl && (
                    <div className="w-32 aspect-video rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img src={videoThumbnailUrl} alt="Intro thumbnail" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                      {videoDuration >= 60 ? "1:00" : `${Math.floor(videoDuration / 60)}:${String(videoDuration % 60).padStart(2, "0")}`} video
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoUploadStatus("idle");
                        setVideoUploadError(null);
                        setShowVideoModal(true);
                      }}
                      className="mt-2 text-sm font-bold text-[#148F8B] hover:underline"
                    >
                      Re-record
                    </button>
                  </div>
                </div>
                {videoUploadStatus === "uploading" && (
                  <div className="mt-3 rounded-2xl bg-[#148F8B]/5 px-4 py-3.5 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="text-[#148F8B] animate-spin shrink-0" />
                      <p className="text-sm font-medium text-[#148F8B] tracking-tight">Uploading your video in the background…</p>
                    </div>
                    <div className="h-1 w-full rounded-full bg-[#148F8B]/15 overflow-hidden">
                      <div className="h-full w-1/3 rounded-full bg-[#148F8B] animate-indeterminate" />
                    </div>
                    <p className="text-xs text-gray-400">Keep filling out your profile — we'll let you know when it's ready.</p>
                  </div>
                )}
                {videoUploadStatus === "error" && videoUploadError && (
                  <p className="mt-2 text-xs text-red-500 font-medium">
                    We couldn&apos;t save your latest video: {videoUploadError}
                  </p>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setVideoUploadStatus("idle");
                    setVideoUploadError(null);
                    setShowVideoModal(true);
                  }}
                  className="w-full py-12 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-3 text-gray-600 hover:text-[#148F8B] hover:border-[#148F8B]/50 hover:bg-[#148F8B]/5 transition-all"
                >
                  <Camera size={36} />
                  <span className="font-black text-xs uppercase tracking-widest">Record or upload your 30–60 second intro</span>
                  <span className="text-[10px] text-gray-400 font-medium">Tap to get started</span>
                </button>
                <p className="text-xs text-gray-500">
                  You can record with your camera or upload a video file (up to 60 seconds, max 50 MB).
                </p>
                {videoUploadStatus === "uploading" && (
                  <div className="mt-3 rounded-2xl bg-[#148F8B]/5 px-4 py-3.5 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="text-[#148F8B] animate-spin shrink-0" />
                      <p className="text-sm font-medium text-[#148F8B] tracking-tight">Uploading your video in the background…</p>
                    </div>
                    <div className="h-1 w-full rounded-full bg-[#148F8B]/15 overflow-hidden">
                      <div className="h-full w-1/3 rounded-full bg-[#148F8B] animate-indeterminate" />
                    </div>
                    <p className="text-xs text-gray-400">Keep filling out your profile — we'll let you know when it's ready.</p>
                  </div>
                )}
                {videoUploadStatus === "error" && videoUploadError && (
                  <p className="mt-2 text-xs text-red-500 font-medium">
                    We couldn&apos;t save your video: {videoUploadError}
                  </p>
                )}
              </>
            )}
          </div>

          {/* About You (Bio) */}
          <div
            ref={(el) => { sectionRefs.current["bio"] = el; }}
            className={`bg-white rounded-[2rem] border-2 p-6 space-y-4 shadow-sm transition-colors ${validationError && !bio.length ? "border-red-400" : "border-gray-100"}`}
          >
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
          <div
            ref={(el) => { sectionRefs.current["skills"] = el; }}
            className={`bg-white rounded-[2rem] border-2 p-6 space-y-4 shadow-sm transition-colors ${validationError && selectedSkills.length === 0 ? "border-red-400" : "border-gray-100"}`}
          >
            <div className="flex items-center gap-3">
              {selectedSkills.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
                Skills
              </h2>
            </div>
            <MultiSelectDropdown
              id="skills"
              label="Select or add skills"
              selectedCount={selectedSkills.length}
              options={CANDIDATE_CATEGORIES.skills}
              selected={selectedSkills}
              onToggle={(item) => toggleItem(selectedSkills, setSelectedSkills, item)}
              onRemove={(item) => setSelectedSkills(selectedSkills.filter((s) => s !== item))}
              customPlaceholder="Type your own skill and press Enter"
              customValue={customSkill}
              onCustomChange={setCustomSkill}
              onCustomKeyDown={(e) => {
                if (e.key === "Enter" && customSkill.trim()) {
                  e.preventDefault();
                  const trimmed = customSkill.trim();
                  if (!selectedSkills.includes(trimmed)) setSelectedSkills([...selectedSkills, trimmed]);
                  setCustomSkill("");
                }
              }}
            />
          </div>

          {/* Experience - single select, shows as tag when selected */}
          <div
            ref={(el) => { sectionRefs.current["experience"] = el; }}
            className={`bg-white rounded-[2rem] border-2 p-6 space-y-4 shadow-sm transition-colors ${validationError && !experience.length ? "border-red-400" : "border-gray-100"}`}
          >
            <div className="flex items-center gap-3">
              {experience.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Experience</h2>
            </div>
            {experience.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#148F8B] text-white shadow-md">
                  <span>{experience}</span>
                  <button
                    type="button"
                    onClick={() => setExperience("")}
                    className="p-0.5 rounded hover:bg-white/20 transition-colors"
                    aria-label="Remove experience"
                  >
                    <X size={12} />
                  </button>
                </span>
              </div>
            )}
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

          {/* Availability - single select, shows as tag when selected */}
          <div
            ref={(el) => { sectionRefs.current["availability"] = el; }}
            className={`bg-white rounded-[2rem] border-2 p-6 space-y-4 shadow-sm transition-colors ${validationError && !availability.length ? "border-red-400" : "border-gray-100"}`}
          >
            <div className="flex items-center gap-3">
              {availability.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Availability</h2>
            </div>
            {availability.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#148F8B] text-white shadow-md">
                  <span>{availability}</span>
                  <button
                    type="button"
                    onClick={() => setAvailability("")}
                    className="p-0.5 rounded hover:bg-white/20 transition-colors"
                    aria-label="Remove availability"
                  >
                    <X size={12} />
                  </button>
                </span>
              </div>
            )}
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

          {/* Target Pay - multi-select */}
          <div
            ref={(el) => { sectionRefs.current["targetPay"] = el; }}
            className={`bg-white rounded-[2rem] border-2 p-6 space-y-4 shadow-sm transition-colors ${validationError && selectedTargetPays.length === 0 ? "border-red-400" : "border-gray-100"}`}
          >
            <div className="flex items-center gap-3">
              {selectedTargetPays.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Target Pay</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium">Select one or more pay ranges you’re open to.</p>
            <MultiSelectDropdown
              id="target-pay"
              label="Select or add pay ranges"
              selectedCount={selectedTargetPays.length}
              options={CANDIDATE_CATEGORIES.targetPayRanges}
              selected={selectedTargetPays}
              onToggle={(item) => toggleItem(selectedTargetPays, setSelectedTargetPays, item)}
              onRemove={(item) => setSelectedTargetPays(selectedTargetPays.filter((p) => p !== item))}
              customPlaceholder="Type your own (e.g. $24-30/hr) and press Enter"
              customValue={customTargetPay}
              onCustomChange={setCustomTargetPay}
              onCustomKeyDown={(e) => {
                if (e.key === "Enter" && customTargetPay.trim()) {
                  e.preventDefault();
                  const trimmed = customTargetPay.trim();
                  if (!selectedTargetPays.includes(trimmed)) setSelectedTargetPays([...selectedTargetPays, trimmed]);
                  setCustomTargetPay("");
                }
              }}
            />
          </div>

          {/* Industries of Interest */}
          <div
            ref={(el) => { sectionRefs.current["industries"] = el; }}
            className={`bg-white rounded-[2rem] border-2 p-6 space-y-4 shadow-sm transition-colors ${validationError && selectedIndustries.length === 0 ? "border-red-400" : "border-gray-100"}`}
          >
            <div className="flex items-center gap-3">
              {selectedIndustries.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
                Industries of Interest
              </h2>
            </div>
            <MultiSelectDropdown
              id="industries"
              label="Select or add industries"
              selectedCount={selectedIndustries.length}
              options={CANDIDATE_CATEGORIES.industries}
              selected={selectedIndustries}
              onToggle={(item) => toggleItem(selectedIndustries, setSelectedIndustries, item)}
              onRemove={(item) => setSelectedIndustries(selectedIndustries.filter((i) => i !== item))}
              customPlaceholder="Type your own industry and press Enter"
              customValue={customIndustry}
              onCustomChange={setCustomIndustry}
              onCustomKeyDown={(e) => {
                if (e.key === "Enter" && customIndustry.trim()) {
                  e.preventDefault();
                  const trimmed = customIndustry.trim();
                  if (!selectedIndustries.includes(trimmed)) setSelectedIndustries([...selectedIndustries, trimmed]);
                  setCustomIndustry("");
                }
              }}
            />
          </div>

          {/* Preferred Job Types (job categories) */}
          <div
            ref={(el) => { sectionRefs.current["preferredJobTypes"] = el; }}
            className={`bg-white rounded-[2rem] border-2 p-6 space-y-4 shadow-sm transition-colors ${validationError && preferredJobCategories.length === 0 ? "border-red-400" : "border-gray-100"}`}
          >
            <div className="flex items-center gap-3">
              {preferredJobCategories.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
                Preferred Job Types
              </h2>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              What type of work are you looking for?
            </p>
            <MultiSelectDropdown
              id="job-categories"
              label="Select job categories"
              selectedCount={preferredJobCategories.length}
              options={JOB_CATEGORIES.jobCategories}
              selected={preferredJobCategories}
              onToggle={(item) => toggleItem(preferredJobCategories, setPreferredJobCategories, item)}
              onRemove={(item) => setPreferredJobCategories(preferredJobCategories.filter((c) => c !== item))}
              customPlaceholder="Type your own and press Enter"
              customValue={customJobCategory}
              onCustomChange={setCustomJobCategory}
              onCustomKeyDown={(e) => {
                if (e.key === "Enter" && customJobCategory.trim()) {
                  e.preventDefault();
                  const trimmed = customJobCategory.trim();
                  if (!preferredJobCategories.includes(trimmed)) setPreferredJobCategories([...preferredJobCategories, trimmed]);
                  setCustomJobCategory("");
                }
              }}
            />
          </div>

          {/* Job Types Seeking (full-time, part-time, etc.) */}
          <div
            ref={(el) => { sectionRefs.current["jobTypesSeeking"] = el; }}
            className={`bg-white rounded-[2rem] border-2 p-6 space-y-4 shadow-sm transition-colors ${validationError && jobTypesSeeking.length === 0 ? "border-red-400" : "border-gray-100"}`}
          >
            <div className="flex items-center gap-3">
              {jobTypesSeeking.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
                Job Types Seeking
              </h2>
            </div>
            <MultiSelectDropdown
              id="job-types-seeking"
              label="Select job types (e.g. full-time, part-time)"
              selectedCount={jobTypesSeeking.length}
              options={CANDIDATE_CATEGORIES.jobTypesSeeking}
              selected={jobTypesSeeking}
              onToggle={(item) => toggleItem(jobTypesSeeking, setJobTypesSeeking, item)}
              onRemove={(item) => setJobTypesSeeking(jobTypesSeeking.filter((j) => j !== item))}
              customPlaceholder="Type your own job type and press Enter"
              customValue={customJobType}
              onCustomChange={setCustomJobType}
              onCustomKeyDown={(e) => {
                if (e.key === "Enter" && customJobType.trim()) {
                  e.preventDefault();
                  const trimmed = customJobType.trim();
                  if (!jobTypesSeeking.includes(trimmed)) setJobTypesSeeking([...jobTypesSeeking, trimmed]);
                  setCustomJobType("");
                }
              }}
            />
          </div>

          {/* Additional Information (Optional) */}
          <div className="bg-gray-50/80 rounded-[2rem] border border-gray-100 p-6 space-y-6 shadow-sm">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">
              Additional Information <span className="text-gray-400 font-bold normal-case">(Optional)</span>
            </h2>
            <p className="text-xs text-gray-500 -mt-2">
              Not required for matching. Add if you’d like.
            </p>

            {/* Education - Optional, multi-select with pills */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                Education <span className="text-gray-400 font-bold normal-case">(Optional)</span>
              </h3>
              <MultiSelectDropdown
                id="education"
                label="Select or add education"
                selectedCount={selectedEducation.length}
                options={CANDIDATE_CATEGORIES.education}
                selected={selectedEducation}
                onToggle={(item) => toggleItem(selectedEducation, setSelectedEducation, item)}
                onRemove={(item) => setSelectedEducation(selectedEducation.filter((e) => e !== item))}
                customPlaceholder="Type your own (e.g. Culinary Arts Certificate) and press Enter"
                customValue={customEducation}
                onCustomChange={setCustomEducation}
                onCustomKeyDown={(e) => {
                  if (e.key === "Enter" && customEducation.trim()) {
                    e.preventDefault();
                    const trimmed = customEducation.trim();
                    if (!selectedEducation.includes(trimmed)) setSelectedEducation([...selectedEducation, trimmed]);
                    setCustomEducation("");
                  }
                }}
              />
            </div>

            {/* Work Styles - Optional */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                Work Styles <span className="text-gray-400 font-bold normal-case">(Optional)</span>
              </h3>
              <MultiSelectDropdown
                id="work-styles"
                label="Select or add work styles"
                selectedCount={selectedWorkStyles.length}
                options={CANDIDATE_CATEGORIES.workStyles}
                selected={selectedWorkStyles}
                onToggle={(item) => toggleItem(selectedWorkStyles, setSelectedWorkStyles, item)}
                onRemove={(item) => setSelectedWorkStyles(selectedWorkStyles.filter((s) => s !== item))}
                customPlaceholder="Type your own work style and press Enter"
                customValue={customWorkStyle}
                onCustomChange={setCustomWorkStyle}
                onCustomKeyDown={(e) => {
                  if (e.key === "Enter" && customWorkStyle.trim()) {
                    e.preventDefault();
                    const trimmed = customWorkStyle.trim();
                    if (!selectedWorkStyles.includes(trimmed)) setSelectedWorkStyles([...selectedWorkStyles, trimmed]);
                    setCustomWorkStyle("");
                  }
                }}
              />
            </div>
          </div>

          {/* Talent pool visibility - before launch */}
          <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={visibilityPreference === "broad"}
                onChange={(e) => setVisibilityPreference(e.target.checked ? "broad" : "limited")}
                className="rounded border-gray-300 text-[#148F8B] focus:ring-[#148F8B] w-4 h-4 mt-0.5"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Make my profile appear in talent pool</span>
                <p className="text-xs text-gray-500 mt-1">
                  If unchecked, your profile will only be visible to jobs you&apos;ve applied to.
                </p>
              </div>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4 space-y-4">
            {validationError && (
              <p className="text-center text-red-500 font-bold text-sm" role="alert">
                {validationError}
              </p>
            )}
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

      {/* Floating upload progress banner — fixed above submit button, visible while uploading */}
      {videoUploadStatus === "uploading" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[320px] pointer-events-none">
          <div className="rounded-full bg-white border border-[#148F8B]/25 shadow-lg shadow-[#148F8B]/15 px-5 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 size={13} className="text-[#148F8B] animate-spin shrink-0" />
              <p className="text-xs font-semibold text-[#148F8B] tracking-tight truncate">Uploading video…</p>
            </div>
            <div className="h-0.5 w-full rounded-full bg-[#148F8B]/15 overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-[#148F8B] animate-indeterminate" />
            </div>
          </div>
        </div>
      )}

      <VideoIntroModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        onComplete={(url, thumbUrl, duration) => {
          setVideoUrl(url);
          setVideoThumbnailUrl(thumbUrl);
          setVideoDuration(duration);
          setVideoUploadStatus("success");
          setVideoUploadError(null);
          setShowVideoModal(false);
        }}
        onThumbnailReady={(thumbUrl) => setVideoThumbnailUrl(thumbUrl)}
        onUploadStart={() => {
          setVideoUploadStatus("uploading");
          setVideoUploadError(null);
        }}
        onUploadError={(message) => {
          setVideoUploadStatus("error");
          setVideoUploadError(message);
        }}
        candidateId={userProfile?.candidateId ?? userProfile?.id}
      />
    </div>
  );
};
