import React, { useEffect, useRef, useState } from "react";
import { Building2, Zap, CheckCircle, Upload, ChevronRight, Shield, Sparkles, BadgeCheck, Mic } from "lucide-react";
import { Button } from "../ui/Button.tsx";
import { JOB_CATEGORIES, DEMO_PROFILES } from "../../data/mockData";
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
}

export const EmployerOnboarding: React.FC<EmployerOnboardingProps> = ({ userProfile, onComplete }) => {
  const [bio, setBio] = useState("");
  const [industry, setIndustry] = useState(userProfile?.industry || "");
  const [companySize, setCompanySize] = useState("");
  const [location, setLocation] = useState(userProfile?.location || "");
  const [phone, setPhone] = useState(formatPhoneInput(userProfile?.phone || ""));
  const [website, setWebsite] = useState(userProfile?.website || "");
  const [businessLicense, setBusinessLicense] = useState(userProfile?.businessLicense || "");
  const [wantsBadge, setWantsBadge] = useState(false);

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
          setBio((prev) =>
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
        setWebsite("www.alohabistro.com");
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

    const profileData = {
      ...userProfile,
      bio,
      industry,
      companySize,
      location,
      phone,
      website,
      businessLicense,
      wantsBadge: businessLicense.length > 0 ? wantsBadge : false,
    };
    onComplete(profileData);
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
          <h1 className="text-4xl font-black tracking-tighter">Set Up Your Business</h1>
          <p className="text-gray-500 font-medium text-lg max-w-md mx-auto">
            Add your business details once and they'll auto-fill every job post you create.
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
                {JOB_CATEGORIES.industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
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

          {/* Location & Phone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {location.length > 0 && <CheckCircle size={18} className="text-[#A63F8E]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Location</h2>
              </div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base"
              >
                <option value="">Select...</option>
                {JOB_CATEGORIES.locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
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
            <button
              onClick={() => {}}
              className="w-full py-12 border-4 border-dashed border-gray-100 rounded-2xl flex flex-col items-center gap-3 text-gray-600 hover:text-[#A63F8E] hover:border-[#A63F8E]/30 transition-all"
            >
              <Upload size={36} />
              <span className="font-black text-xs uppercase tracking-widest">Upload Your Logo</span>
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
              Launch Business Profile
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