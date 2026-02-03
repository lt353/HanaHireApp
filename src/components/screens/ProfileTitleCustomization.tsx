import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Info, 
  ChevronDown, 
  Plus, 
  Check, 
  Lock, 
  AlertCircle, 
  Edit3,
  ChevronUp
} from "lucide-react";
import { Button } from "../ui/Button";

interface ProfileTitleCustomizationProps {
  onBack: () => void;
  onSave: (title: string) => void;
  initialData?: {
    location: string;
    yearsExperience: string;
    suggestedTitle: string;
    skills: string[];
  };
}

const DESCRIPTORS = ["(None)", "Experienced", "Skilled", "Certified", "Professional", "Creative", "Licensed"];

const SKILL_CATEGORIES = [
  {
    category: "Food & Beverage",
    options: ["Line Cook", "Chef", "Barista", "Bartender", "Server", "Pastry Chef", "Kitchen Management"]
  },
  {
    category: "Customer Service",
    options: ["Customer Service", "Sales", "Hospitality", "Client Relations", "Team Leadership"]
  },
  {
    category: "Retail",
    options: ["Retail Sales", "Visual Merchandising", "Inventory Management", "Store Management"]
  },
  {
    category: "Office & Admin",
    options: ["Administrative Support", "Office Management", "Data Entry", "Bookkeeping", "Scheduling"]
  },
  {
    category: "Healthcare",
    options: ["Nursing", "Dental Assistant", "Medical Assistant", "Patient Care", "Therapy"]
  },
  {
    category: "Tech",
    options: ["Web Development", "Graphic Design", "IT Support", "Social Media", "Video Production"]
  },
  {
    category: "Trades",
    options: ["HVAC", "Electrical", "Plumbing", "Carpentry", "Welding", "Auto Mechanic"]
  },
  {
    category: "Construction",
    options: ["Construction Management", "Framing", "Project Coordination", "Equipment Operation"]
  },
  {
    category: "Tourism",
    options: ["Tour Guide", "Activity Coordination", "Event Planning", "Ocean Safety"]
  },
  {
    category: "Services",
    options: ["Landscaping", "Cleaning", "Pest Control", "Property Maintenance"]
  },
  {
    category: "Other",
    options: ["Teaching", "Childcare", "Photography", "Fitness Training", "Real Estate"]
  }
];

export const ProfileTitleCustomization: React.FC<ProfileTitleCustomizationProps> = ({ 
  onBack, 
  onSave,
  initialData = {
    location: "Honolulu, HI",
    yearsExperience: "3-5 Years",
    suggestedTitle: "Customer Service & Team Leadership",
    skills: ["Customer Service", "Team Leadership", "Hospitality"]
  }
}) => {
  const [descriptor, setDescriptor] = useState("(None)");
  const [primarySkill, setPrimarySkill] = useState("");
  const [secondarySkill, setSecondarySkill] = useState("");
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Generated Title logic
  const generatedTitle = useMemo(() => {
    let parts = [];
    if (descriptor !== "(None)") parts.push(descriptor);
    if (primarySkill) parts.push(primarySkill);
    if (secondarySkill) parts.push(`+ ${secondarySkill}`);
    
    return parts.join(" ");
  }, [descriptor, primarySkill, secondarySkill]);

  const charCount = generatedTitle.length;
  const isTooLong = charCount > 50;
  const noPrimarySkill = !primarySkill;
  const hasBlockedContent = /(@|\d{7,}|http|\.com|www)/i.test(generatedTitle); // Basic check for contact info

  const errors = {
    primary: noPrimarySkill ? "Please select a primary skill to continue" : null,
    length: isTooLong ? "Title must be 50 characters or less" : null,
    blocked: hasBlockedContent ? "Profile titles cannot include names or contact information" : null
  };

  const isValid = !noPrimarySkill && !isTooLong && !hasBlockedContent;

  const handleSave = () => {
    if (!isValid) return;
    setIsSaving(true);
    setTimeout(() => {
      onSave(generatedTitle);
      setIsSaving(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter">Customize Your Profile Title</h1>
            <p className="text-gray-500 font-medium">This is what employers see before unlocking your profile</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Customization Form */}
          <div className="space-y-10 order-2 lg:order-1">
            
            {/* Suggestion Box */}
            <div className="p-6 bg-[#0077BE]/5 border border-[#0077BE]/10 rounded-3xl flex gap-4 items-start">
              <div className="p-2 bg-[#0077BE] rounded-xl text-white">
                <Info size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-[#0077BE] uppercase tracking-widest">Based on your skills, we suggest:</p>
                <p className="font-black text-xl tracking-tight">"{initialData.suggestedTitle}"</p>
              </div>
            </div>

            {/* Form Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-[#0077BE]" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Customize (optional)</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Descriptor */}
                <div className="w-full md:flex-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Descriptor</label>
                  <div className="relative">
                    <select 
                      value={descriptor}
                      onChange={(e) => setDescriptor(e.target.value)}
                      className="w-full appearance-none p-5 rounded-2xl bg-white border border-gray-200 font-bold focus:ring-4 ring-[#0077BE]/10 outline-none transition-all"
                    >
                      {DESCRIPTORS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Primary Skill */}
                <div className="w-full md:flex-[1.5] space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center gap-1">
                    Primary Skill <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={primarySkill}
                      onChange={(e) => setPrimarySkill(e.target.value)}
                      className={`w-full appearance-none p-5 rounded-2xl bg-white border-2 font-black focus:ring-4 ring-[#0077BE]/10 outline-none transition-all ${noPrimarySkill ? 'border-[#FF6B6B]' : 'border-gray-200'}`}
                    >
                      <option value="">Select primary skill</option>
                      {SKILL_CATEGORIES.map(cat => (
                        <optgroup key={cat.category} label={cat.category}>
                          {cat.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="hidden md:flex text-gray-300">
                  <Plus size={20} />
                </div>
                <div className="md:hidden text-gray-300 py-2">
                  <Plus size={24} />
                </div>

                {/* Secondary Skill */}
                <div className="w-full md:flex-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Secondary Skill</label>
                  <div className="relative">
                    <select 
                      value={secondarySkill}
                      onChange={(e) => setSecondarySkill(e.target.value)}
                      className="w-full appearance-none p-5 rounded-2xl bg-white border border-gray-200 font-bold focus:ring-4 ring-[#0077BE]/10 outline-none transition-all"
                    >
                      <option value="">Add skill (optional)</option>
                      {SKILL_CATEGORIES.map(cat => (
                        <optgroup key={cat.category} label={cat.category}>
                          {cat.options.map(opt => (
                            <option key={opt} value={opt} disabled={opt === primarySkill}>{opt}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Live Preview of Title */}
              <div className="pt-6 border-t border-gray-50 space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Live Preview</h3>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isTooLong ? 'text-[#FF6B6B]' : 'text-gray-300'}`}>
                    {charCount}/50 characters
                  </span>
                </div>
                <p className="text-2xl font-black tracking-tight leading-tight min-h-[3rem]">
                  {generatedTitle || "Waiting for selections..."}
                </p>
              </div>

              {/* Validation Warnings */}
              <AnimatePresence>
                {(errors.primary || errors.length || errors.blocked) && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-5 bg-[#FF6B6B]/5 border border-[#FF6B6B]/10 rounded-2xl flex gap-3 items-center text-[#FF6B6B]"
                  >
                    <AlertCircle size={20} />
                    <p className="text-sm font-black uppercase tracking-tight">
                      {errors.primary || errors.length || errors.blocked}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Guidelines */}
            <div className="border border-gray-100 rounded-[2rem] overflow-hidden">
              <button 
                onClick={() => setIsGuidelinesOpen(!isGuidelinesOpen)}
                className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2ECC71]/10 flex items-center justify-center text-[#2ECC71]">
                    <Check size={16} />
                  </div>
                  <span className="font-black text-sm uppercase tracking-widest">Guidelines</span>
                </div>
                {isGuidelinesOpen ? <ChevronUp size={20} className="text-gray-300" /> : <ChevronDown size={20} className="text-gray-300" />}
              </button>
              <AnimatePresence>
                {isGuidelinesOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="p-8 pt-0 space-y-4 text-sm font-medium text-gray-500">
                      <div className="flex gap-3"><span className="text-[#2ECC71]">✓</span> Choose skills that match jobs you want</div>
                      <div className="flex gap-3"><span className="text-[#2ECC71]">✓</span> Be specific but not too narrow</div>
                      <div className="flex gap-3"><span className="text-[#FF6B6B]">✗</span> Don't include your name</div>
                      <div className="flex gap-3"><span className="text-[#FF6B6B]">✗</span> Don't include contact information</div>
                      <div className="flex gap-3"><span className="text-[#FF6B6B]">✗</span> Don't include company names</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Employer Preview Card */}
          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Employer Preview</h2>
            
            <div className="relative group">
              {/* Actual Locked Card Preview */}
              <div className="bg-white border border-gray-100 rounded-[3.5rem] overflow-hidden shadow-2xl p-1 shadow-[#0077BE]/10">
                <div className="aspect-video relative bg-gray-100">
                  <div className="absolute inset-0 bg-[#0077BE]/20 flex items-center justify-center backdrop-blur-[60px]">
                    <div className="w-24 h-24 rounded-full bg-white/30 border-4 border-white/50 flex items-center justify-center">
                      <Lock size={40} className="text-white" />
                    </div>
                  </div>
                  <div className="absolute top-8 right-8 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
                     <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                       <Lock size={12} /> Locked Profile
                     </span>
                  </div>
                </div>

                <div className="p-12 space-y-8">
                  <div className="space-y-4">
                    <p className="text-4xl font-black tracking-tighter leading-tight">
                      {generatedTitle || "Active Seeker Profile"}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <span className="px-4 py-2 bg-gray-100 text-[10px] font-black text-gray-500 rounded-xl uppercase tracking-widest flex items-center gap-2">
                        <Lock size={12} className="opacity-50" /> {initialData.location}
                      </span>
                      <span className="px-4 py-2 bg-[#0077BE]/5 text-[10px] font-black text-[#0077BE] rounded-xl uppercase tracking-widest flex items-center gap-2">
                        <Lock size={12} className="opacity-50" /> {initialData.yearsExperience} EXP
                      </span>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-50 flex gap-4">
                    <div className="h-16 w-16 bg-gray-50 rounded-2xl shrink-0" />
                    <div className="flex-1 h-16 bg-[#0077BE] rounded-2xl shadow-xl shadow-[#0077BE]/20" />
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-[#FF6B6B] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#FF6B6B]/30 rotate-3 group-hover:rotate-0 transition-transform">
                Live Preview
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-[2rem] text-center">
              <p className="text-xs font-medium text-gray-400 italic">"First impressions happen in less than 3 seconds. Make your title count."</p>
            </div>
          </div>

        </div>

        {/* Fixed Action Bar for Mobile / Bottom Actions */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col gap-4 max-w-xl mx-auto lg:mx-0">
          <Button 
            disabled={!isValid || isSaving}
            className={`h-20 text-xl rounded-[1.5rem] shadow-2xl transition-all ${isValid ? 'shadow-[#0077BE]/30' : 'bg-gray-200 shadow-none'}`}
            onClick={handleSave}
          >
            {isSaving ? "SAVING..." : "SAVE TITLE"}
          </Button>
          <button 
            onClick={() => {
              const suggested = initialData.suggestedTitle.split(" & ");
              setPrimarySkill(suggested[0]);
              if (suggested[1]) setSecondarySkill(suggested[1]);
              setDescriptor("(None)");
              toast.info("Suggested title applied");
            }}
            className="py-4 text-sm font-black text-[#0077BE] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
          >
            Use Suggested Title
          </button>
        </div>
      </div>
    </div>
  );
};
