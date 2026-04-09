import React, { useEffect, useRef, useState } from "react";
import { Building2, Zap, CheckCircle, Upload, ChevronRight, Shield, Sparkles, BadgeCheck, Mic } from "lucide-react";
import { Button } from "../ui/Button.tsx";
import {
  JOB_CATEGORIES,
  DEMO_PROFILES,
  LOCATIONS_BY_ISLAND,
  INDUSTRIES_BY_GROUP,
} from "../../data/mockData";
import { ViewType } from '../../App';
import { supabase } from "../../utils/supabase/client";
import { formatPhoneInput } from "../../utils/formatters";
import { toast } from "sonner@2.0.3";

const COMPANY_SIZES = [
  "Solo / 1 person",
  "Micro (2-9)",
  "Small Business (10-25)",
  "Medium (26-100)",
  "Large (100+)",
];

interface EmployerOnboardingProps {
  userProfile: any;
  onComplete: (profileData: any) => void;
  onNavigate?: (view: ViewType) => void;
  isEditing?: boolean;
  /** Called after a logo file is uploaded and saved to `employers` (refreshes marketplace). */
  onMarketplaceRefresh?: () => void;
}

export const EmployerOnboarding: React.FC<EmployerOnboardingProps> = ({
  userProfile,
  onComplete,
  isEditing = false,
  onMarketplaceRefresh,
}) => {
  // Prefill bio when profile (or AI import) provides it.
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [industry, setIndustry] = useState(userProfile?.industry || "");
  const [companySize, setCompanySize] = useState(userProfile?.companySize || "");
  const [location, setLocation] = useState(userProfile?.location || "");
  const [island, setIsland] = useState<string>("");
  const [area, setArea] = useState<string>("");
  const [otherLocation, setOtherLocation] = useState<string>("");
  const [phone, setPhone] = useState(formatPhoneInput(userProfile?.phone || ""));
  const [website, setWebsite] = useState(userProfile?.website || "");
  const [companyLogoUrl, setCompanyLogoUrl] = useState(userProfile?.companyLogoUrl || "");
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [businessLicense, setBusinessLicense] = useState(userProfile?.businessLicense || "");
  const [wantsBadge, setWantsBadge] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);

  // --- Speech to Text (Web Speech API) for Business Description ---
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

  const normalizeForMatch = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[ʻ’']/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const MANUAL_TOWN_VALUE = "__manual__";

  // Initialize Island/Area selection from existing location string (AI import / saved profile).
  useEffect(() => {
    if (!location) return;
    const locNorm = normalizeForMatch(location);

    // If location is already in our "Area, Island" format, parse it.
    const parts = location.split(",").map((p: string) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const maybeArea = parts[0];
      const maybeIsland = parts.slice(1).join(", ").trim();
      if (LOCATIONS_BY_ISLAND[maybeIsland]) {
        setIsland(maybeIsland);
        const matchArea = LOCATIONS_BY_ISLAND[maybeIsland].find((a) => normalizeForMatch(a) === normalizeForMatch(maybeArea));
        if (matchArea) {
          setArea(matchArea);
          setOtherLocation("");
        } else {
          setArea(MANUAL_TOWN_VALUE);
          setOtherLocation(maybeArea);
        }
        return;
      }
    }

    // Otherwise, best-effort match: find an island+area that appears in the location string.
    for (const [isl, areas] of Object.entries(LOCATIONS_BY_ISLAND)) {
      for (const a of areas) {
        if (locNorm.includes(normalizeForMatch(a))) {
          setIsland(isl);
          setArea(a);
          setOtherLocation("");
          return;
        }
      }
    }

    // Next, see if the location includes an island name even without a known town.
    for (const isl of Object.keys(LOCATIONS_BY_ISLAND)) {
      if (locNorm.includes(normalizeForMatch(isl))) {
        setIsland(isl);
        setArea(MANUAL_TOWN_VALUE);
        const guessTown = parts.length >= 2 ? parts[0] : "";
        setOtherLocation(guessTown || "");
        return;
      }
    }

    // Otherwise, leave island unset and keep the full string as the manual town guess.
    setIsland("");
    setArea("");
    setOtherLocation(location);
  }, [location]);

  const islandOptions = Object.keys(LOCATIONS_BY_ISLAND);
  const areasForSelectedIsland = island ? LOCATIONS_BY_ISLAND[island] || [] : [];

  const setLocationFromPicker = (nextIsland: string, nextArea: string) => {
    if (!nextIsland) return;
    if (!nextArea) {
      setLocation(nextIsland);
      return;
    }
    setLocation(`${nextArea}, ${nextIsland}`);
  };

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
          setBio((prev: string) =>
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

  const [isDemoFilling, setIsDemoFilling] = useState(false);
  const handleDemoFill = async () => {
    setIsDemoFilling(true);
    try {
      const demoEmployerId = userProfile?.employerId || userProfile?.id;
      const demoEmployerEmail = userProfile?.email || DEMO_PROFILES.employer.email;

      // Pull from the same source-of-truth as JobPostingFlow (employers table)
      const query = supabase.from("employers").select("*");
      const { data: employer, error } = demoEmployerId
        ? await query.eq("id", demoEmployerId).single()
        : await query.eq("email", demoEmployerEmail).single();

      if (error || !employer) {
        // Fallback to local demo constants if DB isn't available
        const d = DEMO_PROFILES.employer;
        setBio(d.bio);
        setIndustry(d.industry);
        setCompanySize(d.companySize);
        setLocation(d.location);
        setPhone(d.phone);
        setWebsite(typeof d.website === "string" ? d.website : "");
        setCompanyLogoUrl(
          typeof d.companyLogoUrl === "string" ? d.companyLogoUrl : "",
        );
        setBusinessLicense(d.businessLicense);
        toast.info("Using local demo data (demo employer not found in Supabase).");
        return;
      }

      // Map DB fields → onboarding fields (keep consistent with App/JobPostingFlow mapping)
      setBio(employer.company_description || "");
      setIndustry(employer.industry || "");
      setCompanySize(employer.company_size || "");
      setLocation(employer.location || "");
      setPhone(formatPhoneInput(employer.phone || ""));
      setWebsite(employer.website || "");
      setCompanyLogoUrl(employer.company_logo_url || "");
      setBusinessLicense(employer.business_license_number || "");

      toast.success("Demo business info loaded from Supabase.");
    } finally {
      setIsDemoFilling(false);
    }
  };

  const handleSubmit = () => {
    if (website && !/^https?:\/\//i.test(website)) {
      toast.error("Website must start with http:// or https://");
      return;
    }

    if (!island) {
      toast.error("Please select an island.");
      return;
    }

    const manualTown = otherLocation.trim();
    const locationForSave = manualTown
      ? `${manualTown}, ${island}`
      : area
        ? `${area}, ${island}`
        : island;

    const profileData = {
      ...userProfile,
      bio,
      industry,
      companySize,
      location: locationForSave,
      phone,
      website,
      companyLogoUrl,
      businessLicense,
      wantsBadge: businessLicense.length > 0 ? wantsBadge : false,
    };
    onComplete(profileData);
  };

  const handleLogoFileChange = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, SVG, etc).");
      return;
    }
    setIsLogoUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "png";
      const path = `employer-logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
      const bucket = "candidate-videos";

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          contentType: file.type || "image/png",
          upsert: true,
        });

      if (uploadError) {
        toast.error(`Logo upload failed: ${uploadError.message}`);
        return;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      if (!data?.publicUrl) {
        toast.error("Logo uploaded but URL could not be generated.");
        return;
      }

      setCompanyLogoUrl(data.publicUrl);

      const employerId = userProfile?.employerId ?? userProfile?.id;
      if (employerId != null) {
        const { error: persistError } = await supabase
          .from("employers")
          .update({
            company_logo_url: data.publicUrl,
            profile_complete: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", employerId);
        if (persistError) {
          console.error("Failed to save logo to profile:", persistError);
          toast.error("Logo uploaded but could not save to your profile. Try saving the form.");
        } else {
          onMarketplaceRefresh?.();
        }
      }

      toast.success("Logo uploaded.");
    } catch (err: any) {
      toast.error(err?.message || "Logo upload failed.");
    } finally {
      setIsLogoUploading(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = "";
    }
  };

  const filledSections = [
    bio.length > 0,
    industry.length > 0,
    companySize.length > 0,
    location.length > 0,
    phone.length > 0,
  ].filter(Boolean).length;

  const totalSections = 5;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#A63F8E]/5 to-white pt-24 pb-32">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-10">
          <div className="w-20 h-20 rounded-[1.5rem] bg-[#A63F8E]/10 flex items-center justify-center mx-auto">
            <Building2 size={36} className="text-[#A63F8E]" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">{isEditing ? "Edit Your Business Profile" : "Set Up Your Business"}</h1>
          <p className="text-gray-500 font-medium text-lg max-w-md mx-auto">
            {isEditing
              ? "Update your business details to keep job posts and candidate communication accurate."
              : "Add your business details once and they'll auto-fill every job post you create."}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Business Profile Progress</span>
            <span className="text-sm font-black text-[#A63F8E]">{filledSections}/{totalSections} sections</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#A63F8E] rounded-full transition-all duration-500"
              style={{ width: `${(filledSections / totalSections) * 100}%` }}
            />
          </div>
        </div>

        {/* Demo Fill Button */}
        {!isEditing && (
          <button
            onClick={handleDemoFill}
            disabled={isDemoFilling}
            className="w-full mb-8 p-4 rounded-2xl border-2 border-[#A63F8E]/20 bg-[#A63F8E]/5 hover:bg-[#A63F8E]/10 transition-all flex items-center justify-center gap-3 group"
          >
            <Zap size={18} className="text-[#A63F8E] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest text-[#A63F8E]">
              {isDemoFilling ? "Loading Demo Business..." : "Auto-fill Demo Business"}
            </span>
          </button>
        )}

        <div className="space-y-8">
          {/* Business Description */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {bio.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Business Description</h2>
              </div>
              {hasSpeechSupport && (
                <button
                  type="button"
                  onClick={toggleBioSpeechToText}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black tracking-widest uppercase transition-all ${
                    isRecordingBio
                      ? "border-[#A63F8E] bg-[#A63F8E]/10 text-[#A63F8E]"
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
              placeholder="Tell job seekers about your business — your culture, mission, what makes it a great place to work..."
              rows={4}
              className="w-full min-h-[120px] p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#A63F8E]/10 outline-none font-medium text-base resize-y"
            />
          </div>

          {/* Industry & Company Size Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {industry.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Industry</h2>
              </div>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base"
              >
                <option value="">Select...</option>
                {INDUSTRIES_BY_GROUP.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.items.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {companySize.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Company Size</h2>
              </div>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base"
              >
                <option value="">Select...</option>
                {COMPANY_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location + Phone (stacked rows) */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {location.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Location</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={island}
                  onChange={(e) => {
                    const nextIsland = e.target.value;
                    setIsland(nextIsland);
                    setArea("");
                    if (!nextIsland) {
                      setOtherLocation("");
                      setLocation("");
                      return;
                    }
                    if (otherLocation.trim()) {
                      setLocation(`${otherLocation.trim()}, ${nextIsland}`);
                    } else {
                      setLocation(nextIsland);
                    }
                  }}
                  className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base"
                >
                  <option value="">Island...</option>
                  {islandOptions.map((isl) => (
                    <option key={isl} value={isl}>{isl}</option>
                  ))}
                </select>
                <select
                  value={area}
                  onChange={(e) => {
                    const nextArea = e.target.value;
                    setArea(nextArea);
                    if (nextArea !== MANUAL_TOWN_VALUE) setOtherLocation("");
                    if (nextArea === MANUAL_TOWN_VALUE) {
                      setLocation(otherLocation.trim() ? `${otherLocation.trim()}, ${island}` : island);
                      return;
                    }
                    setLocationFromPicker(island, nextArea);
                  }}
                  disabled={!island}
                  className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Select...</option>
                  <option value={MANUAL_TOWN_VALUE}>Manual Entry (Type your town)</option>
                  {areasForSelectedIsland.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              {area === MANUAL_TOWN_VALUE ? (
                <input
                  value={otherLocation}
                  onChange={(e) => {
                    const v = e.target.value;
                    setOtherLocation(v);
                    if (island) setLocation(v.trim() ? `${v.trim()}, ${island}` : island);
                    else setLocation("");
                  }}
                  placeholder="Town"
                  className="w-full p-4 rounded-xl bg-white border border-gray-100 focus:ring-4 ring-[#A63F8E]/10 outline-none font-bold text-base"
                />
              ) : null}
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {phone.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Business Phone</h2>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                placeholder="(808) 555-0000"
                className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#A63F8E]/10 outline-none font-bold text-base"
              />
            </div>
          </div>

          {/* Website */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Website (optional)</h2>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourcompany.com"
              className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#A63F8E]/10 outline-none font-bold text-base"
            />
          </div>

          {/* Business Verification — Now Optional */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              {businessLicense.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
                Business License Verification
                <span className="ml-2 normal-case font-medium tracking-normal text-gray-600">(optional)</span>
              </h2>
            </div>
            <input
              type="text"
              value={businessLicense}
              onChange={(e) => {
                setBusinessLicense(e.target.value);
                if (e.target.value.length === 0) setWantsBadge(false);
              }}
              placeholder="HI-BIZ-XXXX-XXXXX"
              className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#A63F8E]/10 outline-none font-bold text-base tracking-widest"
            />
            <div className="p-4 bg-[#A63F8E]/5 rounded-xl border border-[#A63F8E]/10 flex items-start gap-3">
              <Shield size={18} className="text-[#A63F8E] shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 font-medium">
                Skip for now or add your license to unlock a{' '}
                <span className="font-black text-[#A63F8E]">✓ Verified Business Badge</span>
                {' '}on your job posts — for a small fee. Helps candidates feel confident applying.
              </p>
            </div>

            {/* Verified Badge Upsell — shown only when license entered */}
            {businessLicense.length > 0 && (
              <div
                onClick={() => setWantsBadge(!wantsBadge)}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 ${
                  wantsBadge
                    ? 'bg-amber-50 border-amber-400'
                    : 'bg-gray-50 border-gray-200 hover:border-amber-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  wantsBadge ? 'bg-amber-400 border-amber-400' : 'border-gray-300'
                }`}>
                  {wantsBadge && <CheckCircle size={12} className="text-white" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BadgeCheck size={16} className="text-amber-500" />
                    <p className="text-xs font-black text-amber-700 uppercase tracking-widest">
                      Add Verified Business Badge — $9.99
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    Display a verified badge on all your job listings once your license is confirmed. Candidates are significantly more likely to apply to verified employers.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Logo Upload Placeholder */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Business Logo (optional)</h2>
            {companyLogoUrl ? (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-gray-100 shrink-0">
                  <img src={companyLogoUrl} alt="Business logo" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-gray-600 uppercase tracking-widest">Imported logo</p>
                  <p className="text-xs text-gray-500 font-medium truncate">{companyLogoUrl}</p>
                </div>
              </div>
            ) : null}
            <input
              type="url"
              value={companyLogoUrl}
              onChange={(e) => setCompanyLogoUrl(e.target.value)}
              placeholder="https://yourcompany.com/logo.png"
              className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#A63F8E]/10 outline-none font-bold text-base"
            />
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null)}
            />
            <button
              onClick={() => logoFileInputRef.current?.click()}
              disabled={isLogoUploading}
              className="w-full py-12 border-4 border-dashed border-gray-100 rounded-2xl flex flex-col items-center gap-3 text-gray-600 hover:text-[#A63F8E] hover:border-[#A63F8E]/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Upload size={36} />
              <span className="font-black text-xs uppercase tracking-widest">
                {isLogoUploading ? "Uploading Logo..." : "Upload Your Logo"}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">PNG, JPG, or SVG &middot; 500x500 recommended</span>
            </button>
          </div>

          {/* Submit */}
          <div className="pt-4 space-y-4">
            {/* Badge charge reminder */}
            {wantsBadge && businessLicense.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3">
                <BadgeCheck size={18} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                  A <span className="font-black">$9.99 badge fee</span> will be charged after your business license is confirmed.
                </p>
              </div>
            )}
            <Button
              onClick={handleSubmit}
              className="w-full h-20 rounded-[1.5rem] text-xl shadow-xl bg-[#A63F8E] hover:bg-[#A63F8E]/90 shadow-[#A63F8E]/20 flex items-center justify-center gap-3"
            >
              <Sparkles size={22} />
              {isEditing ? "Update Business Profile" : "Launch Business Profile"}
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