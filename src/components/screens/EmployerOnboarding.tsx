import React, { useState } from "react";
import { Building2, Zap, CheckCircle, Upload, ChevronRight, Shield, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";
import { JOB_CATEGORIES, DEMO_PROFILES } from "../../data/mockData";

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
}

export const EmployerOnboarding: React.FC<EmployerOnboardingProps> = ({ userProfile, onComplete }) => {
  const [bio, setBio] = useState("");
  const [industry, setIndustry] = useState(userProfile?.industry || "");
  const [companySize, setCompanySize] = useState("");
  const [location, setLocation] = useState(userProfile?.location || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [website, setWebsite] = useState("");
  const [businessLicense, setBusinessLicense] = useState(userProfile?.businessLicense || "");

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
    };
    onComplete(profileData);
  };

  const filledSections = [
    bio.length > 0,
    industry.length > 0,
    companySize.length > 0,
    location.length > 0,
    phone.length > 0,
    businessLicense.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2ECC71]/5 to-white pt-24 pb-32">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-10">
          <div className="w-20 h-20 rounded-[1.5rem] bg-[#2ECC71]/10 flex items-center justify-center mx-auto">
            <Building2 size={36} className="text-[#2ECC71]" />
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
            <span className="text-sm font-black text-[#2ECC71]">{filledSections}/6 sections</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2ECC71] rounded-full transition-all duration-500"
              style={{ width: `${(filledSections / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Demo Fill Button */}
        <button
          onClick={handleDemoFill}
          className="w-full mb-8 p-4 rounded-2xl border-2 border-[#2ECC71]/20 bg-[#2ECC71]/5 hover:bg-[#2ECC71]/10 transition-all flex items-center justify-center gap-3 group"
        >
          <Zap size={18} className="text-[#2ECC71] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest text-[#2ECC71]">
            Auto-fill Demo Business
          </span>
        </button>

        <div className="space-y-8">
          {/* Business Description */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              {bio.length > 0 && <CheckCircle size={18} className="text-[#2ECC71]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Business Description</h2>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell job seekers about your business — your culture, mission, what makes it a great place to work..."
              rows={4}
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:ring-4 ring-[#2ECC71]/10 outline-none font-medium text-base resize-none"
            />
          </div>

          {/* Industry & Company Size Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {industry.length > 0 && <CheckCircle size={18} className="text-[#2ECC71]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Industry</h2>
              </div>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 font-bold text-base"
              >
                <option value="">Select...</option>
                {JOB_CATEGORIES.industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {companySize.length > 0 && <CheckCircle size={18} className="text-[#2ECC71]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Company Size</h2>
              </div>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 font-bold text-base"
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
                {location.length > 0 && <CheckCircle size={18} className="text-[#2ECC71]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Location</h2>
              </div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 font-bold text-base"
              >
                <option value="">Select...</option>
                {JOB_CATEGORIES.locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {phone.length > 0 && <CheckCircle size={18} className="text-[#2ECC71]" />}
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Business Phone</h2>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(808) 555-0000"
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:ring-4 ring-[#2ECC71]/10 outline-none font-bold text-base"
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
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:ring-4 ring-[#2ECC71]/10 outline-none font-bold text-base"
            />
          </div>

          {/* Business Verification */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              {businessLicense.length > 0 && <CheckCircle size={18} className="text-[#2ECC71]" />}
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Business License Verification</h2>
            </div>
            <input
              type="text"
              value={businessLicense}
              onChange={(e) => setBusinessLicense(e.target.value)}
              placeholder="HI-BIZ-XXXX-XXXXX"
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:ring-4 ring-[#2ECC71]/10 outline-none font-bold text-base tracking-widest"
            />
            <div className="p-4 bg-[#2ECC71]/5 rounded-xl border border-[#2ECC71]/10 flex items-start gap-3">
              <Shield size={18} className="text-[#2ECC71] shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 font-medium">
                Verified businesses get a trust badge on their job posts. This helps attract quality candidates who feel safe applying.
              </p>
            </div>
          </div>

          {/* Logo Upload Placeholder */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Business Logo (optional)</h2>
            <button
              onClick={() => {}}
              className="w-full py-12 border-4 border-dashed border-gray-100 rounded-2xl flex flex-col items-center gap-3 text-gray-300 hover:text-[#2ECC71] hover:border-[#2ECC71]/30 transition-all"
            >
              <Upload size={36} />
              <span className="font-black text-xs uppercase tracking-widest">Upload Your Logo</span>
              <span className="text-[10px] text-gray-400 font-medium">PNG, JPG, or SVG &middot; 500x500 recommended</span>
            </button>
          </div>

          {/* Submit */}
          <div className="pt-4 space-y-4">
            <Button
              onClick={handleSubmit}
              className="w-full h-20 rounded-[1.5rem] text-xl shadow-xl bg-[#2ECC71] hover:bg-[#2ECC71]/90 shadow-[#2ECC71]/20 flex items-center justify-center gap-3"
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
