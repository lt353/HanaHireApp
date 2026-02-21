import React, { useState } from "react";
import { Building2, Zap, CheckCircle, Upload, ChevronRight, Shield, Sparkles, BadgeCheck } from "lucide-react";
import { Button } from "../ui/button";
import { JOB_CATEGORIES, DEMO_PROFILES } from "../../data/mockData";
import { ViewType } from '../../App';

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
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [website, setWebsite] = useState("");
  const [businessLicense, setBusinessLicense] = useState(userProfile?.businessLicense || "");
  const [wantsBadge, setWantsBadge] = useState(false);

  const handleDemoFill = () => {
    const d = DEMO_PROFILES.employer;
    setBio(d.bio);
    setIndustry(d.industry);
    setCompanySize(d.companySize);
    setLocation(d.location);
    setPhone(d.phone);
    setWebsite("www.alohabistro.com");
    setBusinessLicense(d.businessLicense);
  };

  const handleSubmit = () => {
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
    <div className="min-h-screen bg-gradient-to-b from-[#D25B3A]/5 to-white pt-24 pb-32">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-10">
          <div className="w-20 h-20 rounded-[1.5rem] bg-[#D25B3A]/10 flex items-center justify-center mx-auto">
            <Building2 size={36} className="text-[#D25B3A]" />
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
            <span className="text-sm font-black text-[#D25B3A]">{filledSections}/{totalSections} sections</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D25B3A] rounded-full transition-all duration-500"
              style={{ width: `${(filledSections / totalSections) * 100}%` }}
            />
          </div>
        </div>

        {/* Demo Fill Button */}
        <button
          onClick={handleDemoFill}
          className="w-full mb-8 p-4 rounded-2xl border-2 border-[#D25B3A]/20 bg-[#D25B3A]/5 hover:bg-[#D25B3A]/10 transition-all flex items-center justify-center gap-3 group"
        >
          <Zap size={18} className="text-[#D25B3A] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest text-[#D25B3A]">
            Auto-fill Demo Business
          </span>
        </button>

        <div className="space-y-8">
          {/* Business Description */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              {bio.length > 0 && <CheckCircle size={18} className="text-[#D25B3A]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Business Description</h2>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell job seekers about your business — your culture, mission, what makes it a great place to work..."
              rows={4}
              className="w-full p-4 rounded-xl bg-[#F9EBDA]/30 border border-gray-100 focus:ring-4 ring-[#D25B3A]/10 outline-none font-medium text-base resize-none"
            />
          </div>

          {/* Industry & Company Size Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {industry.length > 0 && <CheckCircle size={18} className="text-[#D25B3A]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Industry</h2>
              </div>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#F9EBDA]/30 border border-gray-100 font-bold text-base"
              >
                <option value="">Select...</option>
                {JOB_CATEGORIES.industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {companySize.length > 0 && <CheckCircle size={18} className="text-[#D25B3A]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Company Size</h2>
              </div>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#F9EBDA]/30 border border-gray-100 font-bold text-base"
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
                {location.length > 0 && <CheckCircle size={18} className="text-[#D25B3A]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Location</h2>
              </div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#F9EBDA]/30 border border-gray-100 font-bold text-base"
              >
                <option value="">Select...</option>
                {JOB_CATEGORIES.locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {phone.length > 0 && <CheckCircle size={18} className="text-[#D25B3A]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Business Phone</h2>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(808) 555-0000"
                className="w-full p-4 rounded-xl bg-[#F9EBDA]/30 border border-gray-100 focus:ring-4 ring-[#D25B3A]/10 outline-none font-bold text-base"
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
              placeholder="www.yourbusiness.com"
              className="w-full p-4 rounded-xl bg-[#F9EBDA]/30 border border-gray-100 focus:ring-4 ring-[#D25B3A]/10 outline-none font-bold text-base"
            />
          </div>

          {/* Business Verification — Now Optional */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              {businessLicense.length > 0 && <CheckCircle size={18} className="text-[#D25B3A]" />}
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
              className="w-full p-4 rounded-xl bg-[#F9EBDA]/30 border border-gray-100 focus:ring-4 ring-[#D25B3A]/10 outline-none font-bold text-base tracking-widest"
            />
            <div className="p-4 bg-[#D25B3A]/5 rounded-xl border border-[#D25B3A]/10 flex items-start gap-3">
              <Shield size={18} className="text-[#D25B3A] shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 font-medium">
                Skip for now or add your license to unlock a{' '}
                <span className="font-black text-[#D25B3A]">✓ Verified Business Badge</span>
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
              className="w-full py-12 border-4 border-dashed border-gray-100 rounded-2xl flex flex-col items-center gap-3 text-gray-600 hover:text-[#D25B3A] hover:border-[#D25B3A]/30 transition-all"
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
              className="w-full h-20 rounded-[1.5rem] text-xl shadow-xl bg-[#D25B3A] hover:bg-[#D25B3A]/90 shadow-[#D25B3A]/20 flex items-center justify-center gap-3"
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