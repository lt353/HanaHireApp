import React, { useState } from "react";
import { toast } from "sonner@2.0.3";
import {
  ArrowLeft,
  User,
  Briefcase,
  Target,
} from "lucide-react";
import { Button } from "../ui/Button.tsx";
import {
  JOB_CATEGORIES,
  CANDIDATE_CATEGORIES,
  INDUSTRIES_BY_GROUP,
  SKILLS_BY_GROUP,
} from "../../data/mockData";
import { formatPhoneInput } from '../../utils/formatters';

interface ProfileEditorProps {
  onBack: () => void;
  onSave: (profileData: any) => void;
  userProfile?: any;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  onBack,
  onSave,
  userProfile
}) => {
  // Basic Info
  const [name, setName] = useState(userProfile?.name || "");
  const [email, setEmail] = useState(userProfile?.email || "");
  const [phone, setPhone] = useState(formatPhoneInput(userProfile?.phone || ""));
  const [location, setLocation] = useState(userProfile?.location || "");

  // Professional Info
  const [profileTitle, setProfileTitle] = useState(userProfile?.displayTitle || userProfile?.customTitle || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(userProfile?.skills || []);
  const [experience, setExperience] = useState(userProfile?.experience || "");
  const [education, setEducation] = useState(userProfile?.education || "");

  // Job Preferences
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(userProfile?.industries || []);
  const [selectedWorkStyles, setSelectedWorkStyles] = useState<string[]>(userProfile?.workStyles || []);
  const [jobTypesSeeking, setJobTypesSeeking] = useState<string[]>(userProfile?.jobTypesSeeking || []);
  const [availability, setAvailability] = useState(userProfile?.availability || "");
  const [targetPay, setTargetPay] = useState(userProfile?.targetPay || "");
  const [preferredJobCategories, setPreferredJobCategories] = useState<string[]>(userProfile?.preferredJobCategories || []);

  const [isSaving, setIsSaving] = useState(false);

  // Custom text entry for multi-select sections
  const [customSkill, setCustomSkill] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [customWorkStyle, setCustomWorkStyle] = useState("");
  const [customJobType, setCustomJobType] = useState("");

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const handleSave = async () => {
    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }

    setIsSaving(true);
    const updatedProfile = {
      ...userProfile,
      name,
      email,
      phone,
      location,
      displayTitle: profileTitle,
      customTitle: profileTitle,
      bio,
      skills: selectedSkills,
      experience,
      education,
      industries: selectedIndustries,
      workStyles: selectedWorkStyles,
      jobTypesSeeking,
      availability,
      targetPay,
      preferredJobCategories,
    };
    try {
      await onSave(updatedProfile);
      // Success toast is shown by parent after Supabase update succeeds
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] pb-32">
      <div className="max-w-[900px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter">Edit Profile</h1>
            <p className="text-gray-500 font-medium">Update your information and preferences</p>
          </div>
        </div>

        <div className="space-y-12">

          {/* Basic Information */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <User size={20} className="text-[#148F8B]" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Basic Information</h2>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">
                    Full Name <span className="text-[#A63F8E]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-lg tracking-tight"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">
                    Email <span className="text-[#A63F8E]">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-lg tracking-tight"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                    placeholder="(808) 555-1234"
                    className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-base"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base focus:ring-4 ring-[#148F8B]/10 outline-none"
                  >
                    <option value="">Select location...</option>
                    {JOB_CATEGORIES.locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Professional Information */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Briefcase size={20} className="text-[#148F8B]" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Professional Information</h2>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">
                  Profile Title
                </label>
                <input
                  type="text"
                  value={profileTitle}
                  onChange={(e) => setProfileTitle(e.target.value)}
                  placeholder="e.g., Experienced Bartender & Customer Service"
                  maxLength={60}
                  className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-lg tracking-tight"
                />
                <p className="text-xs text-gray-400 ml-2">{profileTitle.length}/60 characters - This is what employers see first</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell employers about yourself, your experience, and what you're looking for..."
                  rows={4}
                  className="w-full min-h-[120px] p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#148F8B]/10 outline-none font-medium resize-y"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">
                  Skills
                </label>

                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleArrayItem(selectedSkills, setSelectedSkills, skill)}
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
                <div className="space-y-4">
                  {SKILLS_BY_GROUP.map((group) => (
                    <div key={group.label}>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                        {group.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleArrayItem(selectedSkills, setSelectedSkills, skill)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                              selectedSkills.includes(skill)
                                ? "bg-[#148F8B] text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 space-y-1">
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
                    className="w-full p-3 rounded-xl bg-white border border-gray-100 focus:ring-2 ring-[#148F8B]/10 outline-none text-sm"
                  />
                  <p className="text-[10px] text-gray-400 font-medium">
                    Custom skills will appear in the selected list above.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">
                    Experience
                  </label>
                  <select
                    value={CANDIDATE_CATEGORIES.experience.includes(experience) ? experience : ""}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base focus:ring-4 ring-[#148F8B]/10 outline-none mb-2"
                  >
                    <option value="">Select experience...</option>
                    {CANDIDATE_CATEGORIES.experience.map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
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

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">
                    Education
                  </label>
                  <select
                    value={CANDIDATE_CATEGORIES.education.includes(education) ? education : ""}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base focus:ring-4 ring-[#148F8B]/10 outline-none mb-2"
                  >
                    <option value="">Select education...</option>
                    {CANDIDATE_CATEGORIES.education.map((edu) => (
                      <option key={edu} value={edu}>
                        {edu}
                      </option>
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
            </div>
          </section>

          {/* Job Preferences */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Target size={20} className="text-[#148F8B]" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Job Preferences</h2>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">
                  Interested Industries
                </label>

                {selectedIndustries.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedIndustries.map((industry) => (
                      <button
                        key={industry}
                        type="button"
                        onClick={() => toggleArrayItem(selectedIndustries, setSelectedIndustries, industry)}
                        className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#148F8B] text-white shadow-md flex items-center gap-1"
                      >
                        <span>{industry}</span>
                        <span className="text-[9px] opacity-80">×</span>
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">
                  Suggested Industries
                </p>
                <div className="space-y-4">
                  {INDUSTRIES_BY_GROUP.map((group) => (
                    <div key={group.label}>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                        {group.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((industry) => (
                          <button
                            key={industry}
                            type="button"
                            onClick={() => toggleArrayItem(selectedIndustries, setSelectedIndustries, industry)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                              selectedIndustries.includes(industry)
                                ? "bg-[#148F8B] text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {industry}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 space-y-1">
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
                    className="w-full p-3 rounded-xl bg-white border border-gray-100 focus:ring-2 ring-[#148F8B]/10 outline-none text-sm"
                  />
                  <p className="text-[10px] text-gray-400 font-medium">
                    Custom industries will appear in the selected list above.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">
                  Preferred Job Types
                </label>
                <p className="text-xs text-gray-500 font-medium ml-2">
                  What type of work are you looking for?
                </p>

                {preferredJobCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {preferredJobCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleArrayItem(preferredJobCategories, setPreferredJobCategories, cat)}
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
                      onClick={() => toggleArrayItem(preferredJobCategories, setPreferredJobCategories, cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                        preferredJobCategories.includes(cat)
                          ? "bg-[#148F8B] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">
                  Work Styles
                </label>

                {selectedWorkStyles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedWorkStyles.map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleArrayItem(selectedWorkStyles, setSelectedWorkStyles, style)}
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
                      onClick={() => toggleArrayItem(selectedWorkStyles, setSelectedWorkStyles, style)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                        selectedWorkStyles.includes(style)
                          ? "bg-[#148F8B] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>

                <div className="mt-3 space-y-1">
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
                    className="w-full p-3 rounded-xl bg-white border border-gray-100 focus:ring-2 ring-[#148F8B]/10 outline-none text-sm"
                  />
                  <p className="text-[10px] text-gray-400 font-medium">
                    Custom work styles will appear in the selected list above.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">
                  Job Types Seeking
                </label>

                {jobTypesSeeking.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {jobTypesSeeking.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleArrayItem(jobTypesSeeking, setJobTypesSeeking, type)}
                        className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#148F8B] text-white shadow-md flex items-center gap-1"
                      >
                        <span>{type}</span>
                        <span className="text-[9px] opacity-80">×</span>
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">
                  Suggested Job Types
                </p>
                <div className="flex flex-wrap gap-2">
                  {JOB_CATEGORIES.jobTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleArrayItem(jobTypesSeeking, setJobTypesSeeking, type)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                        jobTypesSeeking.includes(type)
                          ? "bg-[#148F8B] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="mt-3 space-y-1">
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
                    className="w-full p-3 rounded-xl bg-white border border-gray-100 focus:ring-2 ring-[#148F8B]/10 outline-none text-sm"
                  />
                  <p className="text-[10px] text-gray-400 font-medium">
                    Custom job types will appear in the selected list above.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">
                    Availability
                  </label>
                  <select
                    value={CANDIDATE_CATEGORIES.availability.includes(availability) ? availability : ""}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base focus:ring-4 ring-[#148F8B]/10 outline-none mb-2"
                  >
                    <option value="">Select availability...</option>
                    {CANDIDATE_CATEGORIES.availability.map((avail) => (
                      <option key={avail} value={avail}>
                        {avail}
                      </option>
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

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">
                    Target Pay
                  </label>
                  <select
                    value={CANDIDATE_CATEGORIES.targetPayRanges.includes(targetPay) ? targetPay : ""}
                    onChange={(e) => setTargetPay(e.target.value)}
                    className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base focus:ring-4 ring-[#148F8B]/10 outline-none mb-2"
                  >
                    <option value="">Select target pay...</option>
                    {CANDIDATE_CATEGORIES.targetPayRanges.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
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
            </div>
          </section>

        </div>

        {/* Save Button */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Button
            disabled={isSaving}
            className="h-16 text-lg rounded-[1.5rem] shadow-2xl shadow-[#148F8B]/30 transition-all hover:scale-105 active:scale-95 duration-200 flex-1"
            onClick={handleSave}
          >
            {isSaving ? "SAVING..." : "SAVE CHANGES"}
          </Button>
          <button
            onClick={onBack}
            className="h-16 px-8 text-lg font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
