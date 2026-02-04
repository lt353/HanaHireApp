import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Pencil, 
  Mic, 
  X, 
  Plus, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronDown,
  Building2,
  Lock,
  Globe,
  Calendar,
  Video,
  Phone,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/Button";
import { toast } from "sonner@2.0.3";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { supabase } from '../../utils/supabase/client';

// API disabled - jobs stored locally
// const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-9b95b3f5`;

interface JobPostingFlowProps {
  onBack: () => void;
  onComplete: (job: any) => void;
}

type FlowStep = 'selection' | 'ai-input' | 'loading' | 'review' | 'confirmation';

const TEMPLATES: any = {
  "Line Cook": {
    industry: "Food & Beverage",
    job_type: "Full-time",
    description: "Fast-paced {location} restaurant seeking experienced line cook. Join our team preparing fresh, local ingredients in a high-volume kitchen environment.",
    responsibilities: [
      "Prepare menu items according to recipes and specifications",
      "Maintain clean and organized station throughout service",
      "Follow food safety protocols and sanitation standards",
      "Work efficiently during busy shifts"
    ],
    requirements: ["Kitchen experience", "Valid food handlers card", "Team player"],
    benefits: ["Employee meal discounts", "Flexible scheduling"],
    company_size: "Small (1-10)"
  },
  "Bartender": {
    industry: "Food & Beverage",
    job_type: "Full-time",
    description: "{location} establishment seeking skilled bartender. Create memorable drink experiences for guests in a vibrant atmosphere.",
    responsibilities: [
      "Prepare cocktails, beer, and wine service",
      "Provide excellent customer service",
      "Maintain organized and clean bar area",
      "Follow alcohol service regulations"
    ],
    requirements: ["Bartending experience", "TIPS certified", "Available nights/weekends"],
    benefits: ["Tips", "Flexible scheduling"],
    company_size: "Small (1-10)"
  },
  "Electrician": {
    industry: "Construction",
    job_type: "Full-time",
    description: "{location} electrical contractor seeking licensed electrician for residential and commercial projects.",
    responsibilities: [
      "Install and repair electrical systems",
      "Read and interpret blueprints",
      "Troubleshoot electrical problems",
      "Ensure code compliance"
    ],
    requirements: ["Licensed electrician", "Clean driving record", "Own tools"],
    benefits: ["Company vehicle", "Health insurance"],
    company_size: "Medium (11-50)"
  },
  "Retail Associate": {
    industry: "Retail",
    job_type: "Part-time",
    description: "{location} store seeking friendly associate to assist customers and manage inventory.",
    responsibilities: [
      "Greet and assist customers",
      "Process transactions at register",
      "Maintain store appearance"
    ],
    requirements: ["Customer service skills", "Reliable schedule"],
    benefits: ["Store discount", "Flexible hours"],
    company_size: "Small (1-10)"
  }
};

const INDUSTRIES = [
  "Food & Beverage", "Retail", "Tourism", "Hospitality", "Services", "Office", 
  "Healthcare", "Marketing", "Accounting", "Real Estate", "Insurance", 
  "Creative", "Tech", "Construction", "Manufacturing", "Automotive", 
  "HVAC", "Electrical", "Plumbing", "Solar", "Logistics", "Agriculture", "Other"
];

export function JobPostingFlow({ onBack, onComplete }: JobPostingFlowProps) {
  const [step, setStep] = useState<FlowStep>('selection');
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postedJob, setPostedJob] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState<'public' | 'private'>('public');

  const [formData, setFormData] = useState<any>({
    title: "",
    industry: "Food & Beverage",
    custom_industry: "",
    location: "Honolulu, HI",
    pay_min: "20",
    pay_max: "25",
    pay_type: "Hourly",
    job_type: "Full-time",
    description: "",
    responsibilities: ["", "", ""],
    requirements: ["", ""],
    benefits: ["", ""],
    start_date: "",
    company_size: "Small (1-10)",
    is_anonymous: true,
    company_name: "",
    contact_email: "",
    contact_phone: "",
    company_description: "",
    video_url: "",
    image_url: ""
  });

  const parsePrompt = (input: string) => {
    const text = input.toLowerCase();
    let selectedTemplate: any = null;
    let title = "General Staff";

    if (text.includes("cook") || text.includes("chef") || text.includes("kitchen")) {
      selectedTemplate = TEMPLATES["Line Cook"];
      title = "Line Cook";
    } else if (text.includes("bartender") || text.includes("bar") || text.includes("mixologist")) {
      selectedTemplate = TEMPLATES["Bartender"];
      title = "Bartender";
    } else if (text.includes("electrician") || text.includes("electrical")) {
      selectedTemplate = TEMPLATES["Electrician"];
      title = "Electrician";
    } else if (text.includes("retail") || text.includes("sales") || text.includes("store")) {
      selectedTemplate = TEMPLATES["Retail Associate"];
      title = "Retail Associate";
    } else {
      selectedTemplate = TEMPLATES["Line Cook"];
    }

    const locations = ["Honolulu", "Kona", "Hilo", "Kihei", "Lahaina", "Waikiki", "Kapolei", "Kailua", "Kahului", "Lihue"];
    let location = "Honolulu, HI";
    for (const loc of locations) {
      if (text.includes(loc.toLowerCase())) {
        location = `${loc}, HI`;
        break;
      }
    }

    const payMatch = text.match(/\$(\d+)(-(\d+))?(\/hr|\/hour|k)/);
    let payMin = selectedTemplate.pay_min || "20";
    let payMax = selectedTemplate.pay_max || "25";
    let payType = "Hourly";

    if (payMatch) {
      payMin = payMatch[1];
      payMax = payMatch[3] || payMin;
      if (payMatch[4] === "k") payType = "Yearly";
    }

    return {
      ...formData,
      title,
      industry: selectedTemplate.industry,
      location,
      pay_min: payMin,
      pay_max: payMax,
      pay_type: payType,
      description: selectedTemplate.description.replace("{location}", location.split(',')[0]),
      responsibilities: selectedTemplate.responsibilities,
      requirements: selectedTemplate.requirements,
      benefits: selectedTemplate.benefits,
      company_size: selectedTemplate.company_size
    };
  };

  const handleGenerate = () => {
    setStep('loading');
    setTimeout(() => {
      const generatedData = parsePrompt(prompt);
      setFormData(generatedData);
      setStep('review');
    }, 2000);
  };

  const handleManualEntry = () => {
    setFormData({
      ...formData,
      title: "",
      description: "",
      responsibilities: ["", "", ""],
      requirements: ["", ""],
      benefits: ["", ""],
      is_anonymous: true
    });
    setStep('review');
  };

  const validateForm = () => {
    if (!formData.title) return "Job title is required";
    if (formData.industry === "Other" && !formData.custom_industry) return "Please specify your industry";
    if (!formData.industry) return "Industry is required";
    if (!formData.location) return "Location is required";
    if (formData.description.length < 20) return "Description is too short";
    if (!formData.company_name) return "Legal company name is required (private)";
    if (!formData.contact_email) return "Contact email is required";
    if (!formData.contact_phone) return "Hiring phone is required";
    return null;
  };

  const handlePostJob = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSubmitting(true);
    try {
      const payRangeStr = formData.pay_type === 'Hourly'
        ? `$${formData.pay_min}-${formData.pay_max}/hr`
        : `$${formData.pay_min}-${formData.pay_max}/yr`;

      // Prepare job data for Supabase
      const jobData = {
        title: formData.title,
        company_name: formData.company_name,
        company_industry: formData.industry === "Other" ? formData.custom_industry : formData.industry,
        location: formData.location,
        pay_range: payRangeStr,
        job_type: formData.job_type,
        requirements: formData.requirements.filter((r:string) => r),
        description: formData.description,
        responsibilities: formData.responsibilities.filter((r:string) => r),
        benefits: formData.benefits.filter((b:string) => b),
        company_size: formData.company_size,
        company_description: formData.company_description,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        is_anonymous: true,
        status: 'active',
        applicant_count: 0
      };

      // Insert job into Supabase
      const { data, error: insertError } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw new Error(insertError.message || "Failed to save job to database");
      }

      setPostedJob(data);
      setStep('confirmation');
      toast.success("Listing published successfully!");
    } catch (err: any) {
      console.error("Error posting job:", err);
      toast.error(err.message || "Failed to post job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSelection = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
      <div className="text-center space-y-3 sm:space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">Post a Job</h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-500 font-medium tracking-tight">Hire with speed and privacy</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <button onClick={handleManualEntry} className="p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] border-2 sm:border-4 border-gray-50 bg-white hover:border-[#0077BE]/20 hover:shadow-2xl transition-all text-left space-y-4 sm:space-y-6 group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#0077BE]/5 group-hover:text-[#0077BE]">
            <Pencil size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">Manual Entry</h3>
            <p className="text-sm sm:text-base text-gray-500 font-medium">Build your listing from scratch</p>
          </div>
          <div className="pt-2 sm:pt-4 text-gray-400 group-hover:text-[#0077BE] font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2">
            Start Now <ArrowRight size={14} className="sm:w-4 sm:h-4" />
          </div>
        </button>
        <button onClick={() => setStep('ai-input')} className="p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] border-2 sm:border-4 border-[#0077BE]/10 bg-white hover:border-[#0077BE]/30 hover:shadow-2xl transition-all text-left space-y-4 sm:space-y-6 relative group">
          <div className="absolute top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8"><span className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-[#2ECC71]/10 text-[#2ECC71] rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest">Recommended</span></div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-[#0077BE]/5 flex items-center justify-center text-[#0077BE]"><Sparkles size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" /></div>
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">AI Assisted</h3>
            <p className="text-sm sm:text-base text-gray-500 font-medium">Just describe what you need</p>
          </div>
          <div className="pt-2 sm:pt-4 text-[#0077BE] font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2">
            Try AI <ArrowRight size={14} className="sm:w-4 sm:h-4" />
          </div>
        </button>
      </div>
    </div>
  );

  const renderReview = () => {
    const PublicPreview = () => (
      <div className="bg-white rounded-[2.5rem] border-2 border-[#0077BE]/10 shadow-xl overflow-hidden">
        <div className="bg-[#0077BE]/5 px-8 py-4 border-b border-[#0077BE]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={12} className="text-[#0077BE]" />
            <span className="text-[10px] font-black text-[#0077BE] uppercase tracking-widest">Seeker View (Locked)</span>
          </div>
          <span className="px-3 py-1 bg-[#0077BE]/10 rounded-full text-[8px] font-black text-[#0077BE] uppercase tracking-widest">Public</span>
        </div>
        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{formData.industry} — {formData.company_size}</p>
              <p className="text-xs text-gray-400 font-medium">{formData.location}</p>
            </div>
            <h4 className="text-4xl font-black tracking-tighter uppercase text-gray-900">{formData.title || "Job Title"}</h4>
            <div className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-[#2ECC71]">
              <span>{formData.pay_type === 'Hourly' ? `$${formData.pay_min}-${formData.pay_max}/hr` : `$${formData.pay_min}-${formData.pay_max}/yr`}</span>
            </div>
          </div>
          <div className="space-y-6">
             <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center gap-3">
                <Building2 size={24} className="text-gray-300" />
                <span className="text-xs font-black text-gray-300 uppercase tracking-widest italic">Business Identity Blurred</span>
             </div>
             <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</p>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed italic border-l-2 border-gray-100 pl-4">"{formData.description || "Listing description..."}"</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tasks</p>
                    <div className="space-y-1">{formData.responsibilities.slice(0, 3).map((r: string, i: number) => r && <p key={i} className="text-[10px] font-bold text-gray-500">• {r}</p>)}</div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Requirements</p>
                    <div className="space-y-1">{formData.requirements.slice(0, 3).map((r: string, i: number) => r && <p key={i} className="text-[10px] font-bold text-gray-500">• {r}</p>)}</div>
                  </div>
                </div>
                {formData.benefits.some((b:string) => b) && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Benefits</p>
                    <div className="flex flex-wrap gap-2">{formData.benefits.map((b: string, i: number) => b && <span key={i} className="px-3 py-1 bg-green-50 text-[#2ECC71] rounded-full text-[9px] font-black uppercase tracking-widest">{b}</span>)}</div>
                  </div>
                )}
             </div>
          </div>
          <Button className="w-full h-16 rounded-2xl bg-[#0077BE]/10 text-[#0077BE] border-0 text-sm">Unlock — $2.00</Button>
        </div>
      </div>
    );

    const PrivatePreview = () => (
      <div className="bg-white rounded-[2.5rem] border-2 border-[#2ECC71]/10 shadow-xl overflow-hidden ring-4 ring-[#2ECC71]/5">
        <div className="bg-[#2ECC71]/5 px-8 py-4 border-b border-[#2ECC71]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-[#2ECC71]" />
            <span className="text-[10px] font-black text-[#2ECC71] uppercase tracking-widest">Seeker View (Unlocked)</span>
          </div>
          <span className="px-3 py-1 bg-[#2ECC71]/10 rounded-full text-[8px] font-black text-[#2ECC71] uppercase tracking-widest">Revealed</span>
        </div>
        <div className="p-10 space-y-8">
          {/* Company Brand Reveal */}
          <div className="flex gap-6 items-center p-6 bg-[#2ECC71]/5 rounded-[2rem] border border-[#2ECC71]/10">
             <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#2ECC71] overflow-hidden">
                {formData.image_url ? <img src={formData.image_url} className="w-full h-full object-cover" /> : <Building2 size={32} />}
             </div>
             <div className="space-y-1 flex-1 min-w-0">
                <h5 className="font-black text-xl tracking-tight leading-none uppercase truncate text-gray-900">{formData.company_name || "Legal Business Name"}</h5>
                <p className="text-[10px] font-black text-[#0077BE] uppercase tracking-[0.2em]">{formData.industry} • {formData.company_size}</p>
             </div>
          </div>

          {/* Core Job Details */}
          <div className="space-y-6">
            <div className="space-y-1">
              <h4 className="text-4xl font-black tracking-tighter uppercase text-gray-900">{formData.title || "Job Title"}</h4>
              <div className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-[#2ECC71]">
                <span>{formData.pay_type === 'Hourly' ? `$${formData.pay_min}-${formData.pay_max}/hr` : `$${formData.pay_min}-${formData.pay_max}/yr`}</span>
                <span className="text-gray-200">•</span>
                <span className="text-gray-400 font-medium">{formData.location}</span>
              </div>
            </div>

            {/* Direct Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#2ECC71] font-black text-[10px] uppercase tracking-widest"><Globe size={14} /> Direct Connection revealed</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Hiring Email</p>
                   <p className="text-xs font-bold truncate text-[#0077BE]">{formData.contact_email || "hiring@example.com"}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone</p>
                   <p className="text-xs font-bold truncate text-gray-900">{formData.contact_phone || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Public Description & Details */}
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Description</p>
                <p className="text-sm text-gray-600 font-medium leading-relaxed italic border-l-2 border-gray-100 pl-4">
                  "{formData.description || "Listing description..."}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tasks</p>
                  <div className="space-y-1">
                    {formData.responsibilities.slice(0, 3).map((r: string, i: number) => (
                      r && <p key={i} className="text-[10px] font-bold text-gray-500">• {r}</p>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Requirements</p>
                  <div className="space-y-1">
                    {formData.requirements.slice(0, 3).map((r: string, i: number) => (
                      r && <p key={i} className="text-[10px] font-bold text-gray-500">• {r}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Private Mission Reveal */}
            <div className="space-y-2">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Private Mission & Culture</p>
               <p className="text-sm text-gray-600 font-medium leading-relaxed bg-[#2ECC71]/5 p-4 rounded-2xl">
                 {formData.company_description || "Culture and mission details visible only to unlocked applicants."}
               </p>
            </div>

            {/* Dynamic Meta */}
            <div className="flex flex-col gap-2">
              {formData.benefits.some((b:string) => b) && (
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((b: string, i: number) => (
                    b && <span key={i} className="px-3 py-1 bg-green-50 text-[#2ECC71] rounded-full text-[9px] font-black uppercase tracking-widest">{b}</span>
                  ))}
                </div>
              )}
              {formData.start_date && (
                <div className="p-4 bg-blue-50/50 rounded-xl flex items-center justify-between border border-blue-100">
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Target Start Date</span>
                   <span className="text-xs font-bold text-gray-900">{formData.start_date}</span>
                </div>
              )}
            </div>
          </div>

          <Button className="w-full h-16 rounded-2xl bg-[#2ECC71] text-white hover:bg-[#27ae60] border-0 text-sm shadow-lg shadow-[#2ECC71]/20">
            Apply with Video
          </Button>
        </div>
      </div>
    );

    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-12 flex flex-col lg:grid lg:grid-cols-[1fr_450px] gap-8 lg:gap-16 items-start">
        <div className="w-full space-y-8 sm:space-y-12 order-2 lg:order-1">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setStep('selection')} className="p-2 sm:p-3 md:p-4 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-colors">
              <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            <div className="space-y-0.5 sm:space-y-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">Review Job Listing</h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">Mandatory anonymity — identity is private until unlocked.</p>
            </div>
          </div>

          <div className="space-y-10">
            <section className="space-y-6 sm:space-y-8">
               <h3 className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] border-b border-gray-100 pb-3 sm:pb-4">Public Marketplace Data</h3>
               <div className="space-y-4 sm:space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Job Title *</label>
                      <input type="text" className="w-full p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#0077BE]/20 outline-none font-black text-base sm:text-lg md:text-xl text-gray-900" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Industry *</label>
                      <div className="space-y-3">
                        <select 
                          className="w-full p-5 rounded-2xl bg-gray-50 outline-none font-bold text-gray-900 appearance-none" 
                          value={formData.industry} 
                          onChange={(e) => setFormData({...formData, industry: e.target.value})}
                        >
                          {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                        {formData.industry === "Other" && (
                          <input 
                            type="text" 
                            className="w-full p-5 rounded-2xl bg-white border-2 border-[#0077BE]/10 outline-none font-bold text-gray-900" 
                            placeholder="Enter custom industry..." 
                            value={formData.custom_industry} 
                            onChange={(e) => setFormData({...formData, custom_industry: e.target.value})}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Location *</label>
                      <input type="text" className="w-full p-5 rounded-2xl bg-gray-50 outline-none font-bold text-gray-900" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Pay Range *</label>
                      <div className="flex gap-3">
                        <div className="flex-1 flex items-center gap-2 px-5 py-4 bg-gray-100 rounded-2xl border-2 border-transparent focus-within:border-[#0077BE]/20 transition-all">
                          <span className="text-gray-400 font-black">$</span>
                          <input 
                            type="text" 
                            className="w-full bg-transparent font-black text-lg outline-none text-gray-900 placeholder:text-gray-300" 
                            value={formData.pay_min} 
                            onChange={(e) => setFormData({...formData, pay_min: e.target.value})} 
                            placeholder="Min"
                          />
                        </div>
                        <div className="flex-1 flex items-center gap-2 px-5 py-4 bg-gray-100 rounded-2xl border-2 border-transparent focus-within:border-[#0077BE]/20 transition-all">
                          <span className="text-gray-400 font-black">$</span>
                          <input 
                            type="text" 
                            className="w-full bg-transparent font-black text-lg outline-none text-gray-900 placeholder:text-gray-300" 
                            value={formData.pay_max} 
                            onChange={(e) => setFormData({...formData, pay_max: e.target.value})} 
                            placeholder="Max"
                          />
                        </div>
                        <select className="p-4 bg-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-900 outline-none cursor-pointer" value={formData.pay_type} onChange={(e) => setFormData({...formData, pay_type: e.target.value})}>
                          <option>Hourly</option>
                          <option>Yearly</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Marketplace Description *</label>
                    <textarea rows={4} className="w-full p-6 rounded-[2rem] bg-gray-50 outline-none font-medium leading-relaxed text-gray-900" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Responsibilities (Public)</label>
                        <button onClick={() => setFormData({...formData, responsibilities: [...formData.responsibilities, ""]})} className="text-[#0077BE] hover:text-[#005a91] transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                      {formData.responsibilities.map((r: string, idx: number) => (
                        <div key={idx} className="flex gap-2">
                          <input type="text" className="flex-1 p-4 bg-gray-50 rounded-xl text-gray-900 text-sm" value={r} onChange={(e) => {
                            const n = [...formData.responsibilities]; n[idx] = e.target.value; setFormData({...formData, responsibilities: n});
                          }} />
                          {formData.responsibilities.length > 1 && (
                            <button onClick={() => {
                              const n = formData.responsibilities.filter((_:any, i:number) => i !== idx);
                              setFormData({...formData, responsibilities: n});
                            }} className="text-gray-300 hover:text-red-400">
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Requirements (Public)</label>
                        <button onClick={() => setFormData({...formData, requirements: [...formData.requirements, ""]})} className="text-[#0077BE] hover:text-[#005a91] transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                      {formData.requirements.map((r: string, idx: number) => (
                        <div key={idx} className="flex gap-2">
                          <input type="text" className="flex-1 p-4 bg-gray-50 rounded-xl text-gray-900 text-sm" value={r} onChange={(e) => {
                            const n = [...formData.requirements]; n[idx] = e.target.value; setFormData({...formData, requirements: n});
                          }} />
                          {formData.requirements.length > 1 && (
                            <button onClick={() => {
                              const n = formData.requirements.filter((_:any, i:number) => i !== idx);
                              setFormData({...formData, requirements: n});
                            }} className="text-gray-300 hover:text-red-400">
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Intro Video URL</label>
                      <input type="url" className="w-full p-5 rounded-2xl bg-gray-50 text-gray-900 font-bold" value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} placeholder="YouTube/Vimeo link" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Start Date</label>
                      <input type="date" className="w-full p-5 rounded-2xl bg-gray-50 text-gray-900 font-bold" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Benefits (Public)</label>
                    <div className="flex flex-wrap gap-2">
                      {formData.benefits.map((b: string, idx: number) => (
                        <div key={idx} className="flex-1 min-w-[200px] flex gap-2">
                          <input type="text" className="flex-1 p-4 bg-gray-50 rounded-xl text-gray-900 text-sm" value={b} onChange={(e) => {
                            const n = [...formData.benefits]; n[idx] = e.target.value; setFormData({...formData, benefits: n});
                          }} placeholder="e.g. Health Insurance" />
                        </div>
                      ))}
                      <button onClick={() => setFormData({...formData, benefits: [...formData.benefits, ""]})} className="p-4 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"><Plus size={16} /> Add Benefit</button>
                    </div>
                  </div>
               </div>
            </section>

            <section className="space-y-8 p-10 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
               <div className="space-y-2">
                  <h3 className="text-xl font-black tracking-tight">Private Identity Details</h3>
                  <p className="text-xs text-[#F39C12] font-black uppercase tracking-widest flex items-center gap-2"><Lock size={12} /> Only revealed to candidates after payment</p>
               </div>
               <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Legal Company Name *</label>
                      <input type="text" className="w-full p-5 rounded-2xl bg-white text-gray-900 font-bold" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} placeholder="Blue Hawaii Surf Co." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Contact Email *</label>
                      <input type="email" className="w-full p-5 rounded-2xl bg-white text-gray-900 font-bold" value={formData.contact_email} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} placeholder="hiring@company.com" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Hiring Phone *</label>
                      <input type="tel" className="w-full p-5 rounded-2xl bg-white text-gray-900 font-bold" value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} placeholder="(808) 555-0123" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Business Logo URL</label>
                      <input type="url" className="w-full p-5 rounded-2xl bg-white text-gray-900 font-bold" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Private Mission/Culture</label>
                    <textarea rows={3} className="w-full p-6 rounded-[2rem] bg-white text-gray-900 outline-none" value={formData.company_description} onChange={(e) => setFormData({...formData, company_description: e.target.value})} placeholder="Tell seekers why they should join you..." />
                  </div>
               </div>
            </section>
          </div>

          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <button onClick={() => setStep('selection')} className="text-gray-400 font-black text-[10px] sm:text-xs uppercase tracking-widest hover:text-gray-600 text-left">← Back</button>
            <Button disabled={isSubmitting} className="px-8 sm:px-12 md:px-16 h-14 sm:h-16 md:h-20 rounded-xl sm:rounded-2xl shadow-2xl shadow-[#0077BE]/20 text-base sm:text-lg md:text-xl w-full sm:w-auto" onClick={handlePostJob}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <>Publish Listing <ArrowRight size={20} className="ml-2 sm:w-6 sm:h-6" /></>}
            </Button>
          </div>
        </div>

        <aside className="w-full lg:sticky lg:top-8 space-y-6 sm:space-y-8 order-1 lg:order-2">
           <div className="space-y-4 sm:space-y-6">
              <div className="flex bg-gray-100 p-1 rounded-xl sm:rounded-2xl">
                 <button onClick={() => setPreviewMode('public')} className={`flex-1 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${previewMode === 'public' ? 'bg-white text-[#0077BE] shadow-sm' : 'text-gray-400'}`}>Locked</button>
                 <button onClick={() => setPreviewMode('private')} className={`flex-1 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${previewMode === 'private' ? 'bg-white text-[#2ECC71] shadow-sm' : 'text-gray-400'}`}>Unlocked</button>
              </div>
              <AnimatePresence mode="wait">
                 <motion.div key={previewMode} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                    {previewMode === 'public' ? <PublicPreview /> : <PrivatePreview />}
                 </motion.div>
              </AnimatePresence>
           </div>
           <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
              <AlertCircle size={20} className="text-[#0077BE] shrink-0" /><p className="text-[10px] text-[#0077BE]/70 font-medium leading-relaxed">Identity revealed only after interaction fee.</p>
           </div>
        </aside>
      </div>
    );
  };

  const renderAIInput = () => (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
      <div className="flex items-center gap-3 sm:gap-4">
        <button onClick={() => setStep('selection')} className="p-2 sm:p-3 md:p-4 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-colors">
          <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
        </button>
        <div className="space-y-0.5 sm:space-y-1">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">AI Assistant</h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">Describe your role and we'll format the listing</p>
        </div>
      </div>
      <div className="space-y-4 sm:space-y-6">
        <div className="relative">
          <textarea rows={6} className="w-full p-4 sm:p-6 md:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-gray-50 outline-none font-medium text-base sm:text-lg md:text-xl resize-none text-gray-900" placeholder="e.g. Experienced line cook for Waikiki resort. $22/hr, must work weekends." value={prompt} onChange={(e) => setPrompt(e.target.value.slice(0, 500))} />
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-8 flex items-center gap-4"><Mic size={18} className="sm:w-5 sm:h-5 text-gray-300" /></div>
        </div>
        <div className="space-y-2 sm:space-y-3">
          <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Quick Templates</p>
          <div className="flex flex-wrap gap-2">
            {["Line cook, Waikiki, $22/hr, weekends", "Bartender, Lahaina, $18/hr + tips", "Electrician, Kona, 5+ years, $40/hr"].map(chip => (
              <button key={chip} onClick={() => setPrompt(chip)} className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-[10px] sm:text-xs font-black text-gray-600 transition-colors">{chip}</button>
            ))}
          </div>
        </div>
        <Button disabled={!prompt} className="w-full h-14 sm:h-16 md:h-20 rounded-xl sm:rounded-[1.5rem] text-base sm:text-lg md:text-xl" onClick={handleGenerate}>
          Generate Listing <Sparkles size={20} className="ml-2 sm:w-6 sm:h-6" />
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center space-y-8 sm:space-y-10 md:space-y-12">
      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-[#2ECC71]/10 rounded-full flex items-center justify-center text-[#2ECC71] mx-auto">
        <CheckCircle2 size={40} className="sm:w-12 sm:h-12 md:w-16 md:h-16" />
      </div>
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">Job is Live!</h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-500 font-medium tracking-tight px-4">Your listing is establishing matches in the marketplace.</p>
      </div>
      <Button className="w-full h-14 sm:h-16 md:h-20 rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-xl" onClick={() => onComplete(postedJob)}>
        Go to Dashboard
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {step === 'selection' && renderSelection()}
      {step === 'ai-input' && renderAIInput()}
      {step === 'loading' && (
        <div className="h-[70vh] flex flex-col items-center justify-center space-y-6 sm:space-y-8 px-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-3 sm:border-4 border-dashed border-[#0077BE]/20" />
          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-center">Building your listing...</h3>
        </div>
      )}
      {step === 'review' && renderReview()}
      {step === 'confirmation' && renderConfirmation()}
    </div>
  );
}