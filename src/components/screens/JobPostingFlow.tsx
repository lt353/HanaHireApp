import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Pencil,
  Mic,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Lock,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/Button";
import { toast } from "sonner@2.0.3";
import { supabase } from '../../utils/supabase/client';
import { ViewType } from '../../App';

// API disabled - jobs stored locally
// const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-9b95b3f5`;

interface JobPostingFlowProps {
  onBack: () => void;
  onComplete: (job: any) => void;
  onNavigate?: (view: ViewType) => void;
  userProfile?: any;
  existingJob?: any;
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

export function JobPostingFlow({ userProfile, existingJob, onBack, onComplete }: JobPostingFlowProps) {
  console.log("🔷 JobPostingFlow MOUNTED/RENDERED with userProfile:", userProfile);
  const [step, setStep] = useState<FlowStep>('selection');
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postedJob, setPostedJob] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState<'public' | 'private'>('public');

  // --- Speech to Text (Web Speech API) ---
  // One recognizer instance; we switch which form field we append into.
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [speechActiveField, setSpeechActiveField] = useState<"description" | "company_description" | null>(null);
  const recognitionRef = useRef<any | null>(null);

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

      recognition.onend = () => {
        setSpeechActiveField(null);
      };

      recognitionRef.current = recognition;
      setHasSpeechSupport(true);
    } catch {
      setHasSpeechSupport(false);
    }
  }, []);

  const handleStartSpeechToText = (field: "description" | "company_description") => {
    if (!recognitionRef.current) return;
    try {
      const recognition = recognitionRef.current as any;

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            transcript += result[0].transcript;
          }
        }

        if (transcript) {
          setFormData((prev: any) => ({
            ...prev,
            [field]: prev[field]
              ? `${String(prev[field]).trim()} ${transcript.trim()}`
              : transcript.trim(),
          }));
        }
      };

      recognition.start();
      setSpeechActiveField(field);
    } catch {
      setSpeechActiveField(null);
    }
  };

  const handleStopSpeechToText = () => {
    if (!recognitionRef.current) return;
    try {
      (recognitionRef.current as any).stop();
    } catch {
      // ignore
    }
    setSpeechActiveField(null);
  };

  const toggleSpeechToText = (field: "description" | "company_description") => {
    if (!hasSpeechSupport) return;
    if (speechActiveField) {
      handleStopSpeechToText();
    } else {
      handleStartSpeechToText(field);
    }
  };

  console.log("🔷 Current formData state:", formData);

  // Debug: Log formData changes
  useEffect(() => {
    console.log("📊 formData changed:", {
      company_name: formData.company_name,
      contact_email: formData.contact_email,
      contact_phone: formData.contact_phone,
      company_description: formData.company_description
    });
  }, [formData]);

  // Auto-populate from existing job OR business info from userProfile
  useEffect(() => {
    console.log("🔄 useEffect triggered - userProfile:", userProfile, "existingJob:", existingJob);
    console.log("🔄 Condition check:", {
      hasUserProfile: !!userProfile,
      userProfileRole: userProfile?.role,
      isEmployer: userProfile?.role === 'employer',
      hasExistingJob: !!existingJob
    });

    if (existingJob) {
      // Editing mode - pre-fill with existing job data
      // NOTE: Company info comes from userProfile (employers table), not from existingJob
      console.log("✏️ Pre-filling form with existing job:", existingJob);
      const payMatch = existingJob.pay_range?.match(/\$(\d+)-(\d+)\/(hr|yr)/);
      setFormData({
        title: existingJob.title || "",
        industry: userProfile?.industry || "Food & Beverage",  // From employers table via userProfile
        custom_industry: "",
        location: existingJob.location || "Honolulu, HI",
        pay_min: payMatch ? payMatch[1] : "20",
        pay_max: payMatch ? payMatch[2] : "25",
        pay_type: payMatch?.[3] === 'yr' ? 'Yearly' : 'Hourly',
        job_type: existingJob.job_type || "Full-time",
        description: existingJob.description || "",
        responsibilities: Array.isArray(existingJob.responsibilities) ? existingJob.responsibilities : ["", "", ""],
        requirements: Array.isArray(existingJob.requirements) ? existingJob.requirements : ["", ""],
        benefits: Array.isArray(existingJob.benefits) ? existingJob.benefits : ["", ""],
        start_date: existingJob.start_date || "",
        company_size: userProfile?.companySize || "Small (1-10)",  // From employers table via userProfile
        is_anonymous: existingJob.is_anonymous !== false,
        company_name: userProfile?.businessName || "",  // From employers table via userProfile
        contact_email: userProfile?.email || "",  // From employers table via userProfile
        contact_phone: userProfile?.phone || "",  // From employers table via userProfile
        company_description: userProfile?.bio || "",  // From employers table via userProfile
        video_url: existingJob.video_url || "",
        image_url: userProfile?.companyLogoUrl || ""  // From employers table via userProfile
      });
      setStep('review'); // Skip to review screen when editing
    } else if (userProfile && userProfile.role === 'employer') {
      // New job - auto-populate business info from userProfile
      console.log("🔵 Auto-populating job form with userProfile:", userProfile);
      console.log("🔵 Available fields:", {
        businessName: userProfile.businessName,
        email: userProfile.email,
        phone: userProfile.phone,
        industry: userProfile.industry,
        companySize: userProfile.companySize,
        location: userProfile.location,
        bio: userProfile.bio,
        companyLogoUrl: userProfile.companyLogoUrl
      });
      setFormData((prev: any) => {
        const updated = {
          ...prev,
          company_name: userProfile.businessName || prev.company_name || "",
          contact_email: userProfile.email || prev.contact_email || "",
          contact_phone: userProfile.phone || prev.contact_phone || "",
          industry: userProfile.industry || prev.industry,
          company_size: userProfile.companySize || prev.company_size,
          location: userProfile.location || prev.location,
          company_description: userProfile.bio || prev.company_description || "",
          image_url: userProfile.companyLogoUrl || prev.image_url || ""
        };
        console.log("🟢 Updated formData with:", updated);
        return updated;
      });
    } else {
      console.log("⚠️ Skipping auto-populate - userProfile:", userProfile);
    }
  }, [userProfile, existingJob]);
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
    console.log("🔵 handleGenerate called, current formData:", formData);
    setStep('loading');
    setTimeout(() => {
      const generatedData = parsePrompt(prompt);
      console.log("🟢 Generated data from AI:", generatedData);
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

      // Update employer information first (company info)
      if (userProfile?.employerId) {
        const employerData: any = {
          company_name: formData.company_name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          company_description: formData.company_description,
          industry: formData.industry === "Other" ? formData.custom_industry : formData.industry
        };

        // Only add image_url if it's provided
        if (formData.image_url) {
          employerData.image_url = formData.image_url;
        }

        const { error: employerError } = await supabase
          .from('employers')
          .update(employerData)
          .eq('id', userProfile.employerId);

        if (employerError) {
          console.error("Error updating employer info:", employerError);
          toast.error("Failed to update company information");
          // Continue anyway - don't block job posting
        }
      }

      // Prepare job data for Supabase
      // NOTE: Company info (name, email, phone, description, industry) is stored in employers table
      // Jobs table only stores job-specific information and links to employer via employer_id
      // Industry is NOT stored in jobs table - it comes from the employers table via JOIN
      const jobData: any = {
        title: formData.title,
        location: formData.location,
        pay_range: payRangeStr,
        job_type: formData.job_type,
        requirements: formData.requirements.filter((r:string) => r),
        description: formData.description,
        responsibilities: formData.responsibilities.filter((r:string) => r),
        benefits: formData.benefits.filter((b:string) => b),
        is_anonymous: true,
        status: 'active',
        applicant_count: existingJob?.applicant_count || 0,
        employer_id: userProfile?.employerId  // Link to employer
      };

      // Add optional fields if provided
      if (formData.video_url) {
        jobData.video_url = formData.video_url;
      }
      if (formData.start_date) {
        jobData.start_date = formData.start_date;
      }

      let data;
      if (existingJob?.id) {
        // Update existing job
        const { data: updatedData, error: updateError } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', existingJob.id)
          .select()
          .single();

        if (updateError) {
          console.error("Supabase update error:", updateError);
          throw new Error(updateError.message || "Failed to update job in database");
        }
        data = updatedData;
        toast.success("Job updated successfully!");
        // Skip confirmation screen and go directly to dashboard
        onComplete(data);
      } else {
        // Insert new job
        const { data: insertedData, error: insertError } = await supabase
          .from('jobs')
          .insert([jobData])
          .select()
          .single();

        if (insertError) {
          console.error("Supabase insert error:", insertError);
          throw new Error(insertError.message || "Failed to save job to database");
        }
        data = insertedData;
        setPostedJob(data);
        setStep('confirmation');
        toast.success("Listing published successfully!");
      }
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
        <button onClick={handleManualEntry} className="p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] border-2 sm:border-4 border-gray-50 bg-white hover:border-[#148F8B]/20 hover:shadow-2xl transition-all text-left space-y-4 sm:space-y-6 group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-[#F3EAF5]/30 flex items-center justify-center text-gray-600 group-hover:bg-[#148F8B]/5 group-hover:text-[#148F8B]">
            <Pencil size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">Manual Entry</h3>
            <p className="text-sm sm:text-base text-gray-500 font-medium">Build your listing from scratch</p>
          </div>
          <div className="pt-2 sm:pt-4 text-gray-400 group-hover:text-[#148F8B] font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2">
            Start Now <ArrowRight size={14} className="sm:w-4 sm:h-4" />
          </div>
        </button>
        <button onClick={() => setStep('ai-input')} className="p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] border-2 sm:border-4 border-[#148F8B]/10 bg-white hover:border-[#148F8B]/30 hover:shadow-2xl transition-all text-left space-y-4 sm:space-y-6 relative group">
          <div className="absolute top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8"><span className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-[#A63F8E]/10 text-[#A63F8E] rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest">Recommended</span></div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-[#148F8B]/5 flex items-center justify-center text-[#148F8B]"><Sparkles size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" /></div>
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">AI Assisted</h3>
            <p className="text-sm sm:text-base text-gray-500 font-medium">Just describe what you need</p>
          </div>
          <div className="pt-2 sm:pt-4 text-[#148F8B] font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2">
            Try AI <ArrowRight size={14} className="sm:w-4 sm:h-4" />
          </div>
        </button>
      </div>
    </div>
  );

  const renderReview = () => {
    const PublicPreview = () => (
      <div className="bg-white rounded-[2.5rem] border-2 border-[#148F8B]/10 shadow-xl overflow-hidden">
        <div className="bg-[#148F8B]/5 px-8 py-4 border-b border-[#148F8B]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={12} className="text-[#148F8B]" />
            <span className="text-[10px] font-black text-[#148F8B] uppercase tracking-widest">Seeker View (Locked)</span>
          </div>
          <span className="px-3 py-1 bg-[#148F8B]/10 rounded-full text-[8px] font-black text-[#148F8B] uppercase tracking-widest">Public</span>
        </div>
        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{formData.industry} — {formData.company_size}</p>
              <p className="text-xs text-gray-400 font-medium">{formData.location}</p>
            </div>
            <h4 className="text-4xl font-black tracking-tighter uppercase text-gray-900">{formData.title || "Job Title"}</h4>
            <div className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-[#A63F8E]">
              <span>{formData.pay_type === 'Hourly' ? `$${formData.pay_min}-${formData.pay_max}/hr` : `$${formData.pay_min}-${formData.pay_max}/yr`}</span>
            </div>
          </div>
          <div className="space-y-6">
             <div className="p-6 bg-[#F3EAF5]/30 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center gap-3">
                <Building2 size={24} className="text-gray-600" />
                <span className="text-xs font-black text-gray-600 uppercase tracking-widest italic">Business Identity Blurred</span>
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
                    <div className="flex flex-wrap gap-2">{formData.benefits.map((b: string, i: number) => b && <span key={i} className="px-3 py-1 bg-green-50 text-[#A63F8E] rounded-full text-[9px] font-black uppercase tracking-widest">{b}</span>)}</div>
                  </div>
                )}
             </div>
          </div>
          <Button className="w-full h-16 rounded-2xl bg-[#148F8B]/10 text-[#148F8B] border-0 text-sm">Unlock — $2.00</Button>
        </div>
      </div>
    );

    const PrivatePreview = () => (
      <div className="bg-white rounded-[2.5rem] border-2 border-[#A63F8E]/10 shadow-xl overflow-hidden ring-4 ring-[#A63F8E]/5">
        <div className="bg-[#A63F8E]/5 px-8 py-4 border-b border-[#A63F8E]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-[#A63F8E]" />
            <span className="text-[10px] font-black text-[#A63F8E] uppercase tracking-widest">Seeker View (Unlocked)</span>
          </div>
          <span className="px-3 py-1 bg-[#A63F8E]/10 rounded-full text-[8px] font-black text-[#A63F8E] uppercase tracking-widest">Revealed</span>
        </div>
        <div className="p-10 space-y-8">
          {/* Company Brand Reveal */}
          <div className="flex gap-6 items-center p-6 bg-[#A63F8E]/5 rounded-[2rem] border border-[#A63F8E]/10">
             <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#A63F8E] overflow-hidden">
                {formData.image_url ? <img src={formData.image_url} className="w-full h-full object-cover" /> : <Building2 size={32} />}
             </div>
             <div className="space-y-1 flex-1 min-w-0">
                <h5 className="font-black text-xl tracking-tight leading-none uppercase truncate text-gray-900">{formData.company_name || "Legal Business Name"}</h5>
                <p className="text-[10px] font-black text-[#148F8B] uppercase tracking-[0.2em]">{formData.industry} • {formData.company_size}</p>
             </div>
          </div>

          {/* Core Job Details */}
          <div className="space-y-6">
            <div className="space-y-1">
              <h4 className="text-4xl font-black tracking-tighter uppercase text-gray-900">{formData.title || "Job Title"}</h4>
              <div className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-[#A63F8E]">
                <span>{formData.pay_type === 'Hourly' ? `$${formData.pay_min}-${formData.pay_max}/hr` : `$${formData.pay_min}-${formData.pay_max}/yr`}</span>
                <span className="text-gray-200">•</span>
                <span className="text-gray-400 font-medium">{formData.location}</span>
              </div>
            </div>

            {/* Direct Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#A63F8E] font-black text-[10px] uppercase tracking-widest"><Globe size={14} /> Direct Connection revealed</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F3EAF5]/30 rounded-2xl space-y-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Hiring Email</p>
                   <p className="text-xs font-bold truncate text-[#148F8B]">{formData.contact_email || "hiring@example.com"}</p>
                </div>
                <div className="p-4 bg-[#F3EAF5]/30 rounded-2xl space-y-1">
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
               <p className="text-sm text-gray-600 font-medium leading-relaxed bg-[#A63F8E]/5 p-4 rounded-2xl">
                 {formData.company_description || "Culture and mission details visible only to unlocked applicants."}
               </p>
            </div>

            {/* Dynamic Meta */}
            <div className="flex flex-col gap-2">
              {formData.benefits.some((b:string) => b) && (
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((b: string, i: number) => (
                    b && <span key={i} className="px-3 py-1 bg-green-50 text-[#A63F8E] rounded-full text-[9px] font-black uppercase tracking-widest">{b}</span>
                  ))}
                </div>
              )}
              {formData.start_date && (
                <div className="p-4 bg-[#148F8B]/5 rounded-xl flex items-center justify-between border border-[#148F8B]/20">
                   <span className="text-[10px] font-black text-[#148F8B] uppercase tracking-widest">Target Start Date</span>
                   <span className="text-xs font-bold text-gray-900">{formData.start_date}</span>
                </div>
              )}
            </div>
          </div>

          <Button className="w-full h-16 rounded-2xl bg-[#A63F8E] text-white hover:bg-[#5C014A] border-0 text-sm shadow-lg shadow-[#A63F8E]/20">
            Apply with Video
          </Button>
        </div>
      </div>
    );

    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-12 flex flex-col lg:grid lg:grid-cols-[1fr_450px] gap-8 lg:gap-16 items-start">
        <div className="w-full space-y-8 sm:space-y-12 order-2 lg:order-1">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => existingJob ? onBack() : setStep('selection')} className="p-2 sm:p-3 md:p-4 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-colors">
              <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            <div className="space-y-0.5 sm:space-y-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">{existingJob ? 'Edit Job Listing' : 'Review Job Listing'}</h2>
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
                      <input
                        type="text"
                        className="w-full p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-white border-2 border-gray-100 focus:border-[#148F8B]/30 outline-none font-black text-base sm:text-lg md:text-xl text-gray-900 shadow-sm"
                        value={formData.title}
                        onChange={(e) => setFormData((prev: any) => ({...prev, title: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Industry *</label>
                      <div className="space-y-3">
                        <select
                          className="w-full p-5 rounded-2xl bg-white border border-gray-200 outline-none font-bold text-gray-900 appearance-none shadow-sm"
                          value={formData.industry}
                          onChange={(e) => setFormData((prev: any) => ({...prev, industry: e.target.value}))}
                        >
                          {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                        {formData.industry === "Other" && (
                          <input
                            type="text"
                            className="w-full p-5 rounded-2xl bg-white border-2 border-[#148F8B]/10 outline-none font-bold text-gray-900"
                            placeholder="Enter custom industry..."
                            value={formData.custom_industry}
                            onChange={(e) => setFormData((prev: any) => ({...prev, custom_industry: e.target.value}))}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Location *</label>
                      <input
                        type="text"
                        className="w-full p-5 rounded-2xl bg-white border border-gray-200 outline-none font-bold text-gray-900 shadow-sm"
                        value={formData.location}
                        onChange={(e) => setFormData((prev: any) => ({...prev, location: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Pay Range *</label>
                      <div className="flex gap-3">
                        <div className="flex-1 flex items-center gap-2 px-5 py-4 bg-white rounded-2xl border-2 border-gray-100 focus-within:border-[#148F8B]/30 transition-all shadow-sm">
                          <span className="text-gray-400 font-black">$</span>
                          <input
                            type="text"
                            className="w-full bg-transparent font-black text-lg outline-none text-gray-900 placeholder:text-gray-300"
                            value={formData.pay_min}
                            onChange={(e) => setFormData((prev: any) => ({...prev, pay_min: e.target.value}))}
                            placeholder="Min"
                          />
                        </div>
                        <div className="flex-1 flex items-center gap-2 px-5 py-4 bg-white rounded-2xl border-2 border-gray-100 focus-within:border-[#148F8B]/30 transition-all shadow-sm">
                          <span className="text-gray-400 font-black">$</span>
                          <input
                            type="text"
                            className="w-full bg-transparent font-black text-lg outline-none text-gray-900 placeholder:text-gray-300"
                            value={formData.pay_max}
                            onChange={(e) => setFormData((prev: any) => ({...prev, pay_max: e.target.value}))}
                            placeholder="Max"
                          />
                        </div>
                        <select
                          className="p-4 bg-white rounded-2xl border border-gray-200 font-black text-xs uppercase tracking-widest text-gray-900 outline-none cursor-pointer shadow-sm"
                          value={formData.pay_type}
                          onChange={(e) => setFormData((prev: any) => ({...prev, pay_type: e.target.value}))}
                        >
                          <option>Hourly</option>
                          <option>Yearly</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        Marketplace Description *
                      </label>
                      {hasSpeechSupport && (
                        <button
                          type="button"
                          onClick={() => toggleSpeechToText("description")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black tracking-widest uppercase transition-all ${
                            speechActiveField === "description"
                              ? "border-[#A63F8E] bg-[#A63F8E]/10 text-[#A63F8E]"
                              : "border-gray-200 bg-white text-gray-500 hover:border-[#148F8B] hover:text-[#148F8B]"
                          }`}
                        >
                          <Mic size={12} />
                          <span>{speechActiveField === "description" ? "Stop" : "Speak"}</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={4}
                      className="w-full p-6 rounded-[2rem] bg-white border border-gray-200 outline-none font-medium leading-relaxed text-gray-900 shadow-sm"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev: any) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Responsibilities */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                          Responsibilities (Public)
                        </label>
                        <button
                          onClick={() =>
                            setFormData((prev: any) => ({
                              ...prev,
                              responsibilities: [...prev.responsibilities, ""],
                            }))
                          }
                          className="text-[#148F8B] hover:text-[#136068] transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Preset responsibilities dropdown */}
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          Quick Add from Common Responsibilities
                        </p>
                        <select
                          className="w-full p-3 rounded-2xl bg-white border border-gray-200 text-[11px] font-bold text-gray-700 shadow-sm"
                          value=""
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!value) return;
                            setFormData((prev: any) => ({
                              ...prev,
                              responsibilities: prev.responsibilities.includes(value)
                                ? prev.responsibilities
                                : [...prev.responsibilities, value],
                            }));
                          }}
                        >
                          <option value="">Select a responsibility to add…</option>
                          <optgroup label="Customer Service & Retail">
                            <option value="Greet and assist customers on the floor">
                              Greet and assist customers on the floor
                            </option>
                            <option value="Process sales and handle cash and card transactions">
                              Process sales and handle cash and card transactions
                            </option>
                            <option value="Maintain product displays and restock shelves">
                              Maintain product displays and restock shelves
                            </option>
                            <option value="Answer customer questions and resolve complaints">
                              Answer customer questions and resolve complaints
                            </option>
                            <option value="Track inventory and flag low stock">
                              Track inventory and flag low stock
                            </option>
                            <option value="Open and/or close the store">Open and/or close the store</option>
                          </optgroup>
                          <optgroup label="Food & Beverage">
                            <option value="Deliver attentive service throughout the dining experience">
                              Deliver attentive service throughout the dining experience
                            </option>
                            <option value="Guide guests through menu and daily specials">
                              Guide guests through menu and daily specials
                            </option>
                            <option value="Make beverage and pairing recommendations">
                              Make beverage and pairing recommendations
                            </option>
                            <option value="Coordinate with kitchen and bar for smooth service">
                              Coordinate with kitchen and bar for smooth service
                            </option>
                            <option value="Handle guest questions and feedback professionally">
                              Handle guest questions and feedback professionally
                            </option>
                            <option value="Support table turns and side work">
                              Support table turns and side work
                            </option>
                            <option value="Attend pre-shift tastings and menu education">
                              Attend pre-shift tastings and menu education
                            </option>
                            <option value="Process payments and manage cash drawer">
                              Process payments and manage cash drawer
                            </option>
                            <option value="Prep ingredients daily to mise en place standards">
                              Prep ingredients daily to mise en place standards
                            </option>
                            <option value="Execute service on assigned station">
                              Execute service on assigned station
                            </option>
                            <option value="Maintain a clean and organized workstation">
                              Maintain a clean and organized workstation
                            </option>
                            <option value="Follow all food safety and sanitation standards">
                              Follow all food safety and sanitation standards
                            </option>
                            <option value="Receive and inspect deliveries">Receive and inspect deliveries</option>
                          </optgroup>
                          <optgroup label="Hospitality & Hotel">
                            <option value="Check guests in and out efficiently and warmly">
                              Check guests in and out efficiently and warmly
                            </option>
                            <option value="Handle reservations, cancellations, and special requests">
                              Handle reservations, cancellations, and special requests
                            </option>
                            <option value="Coordinate with housekeeping and maintenance">
                              Coordinate with housekeeping and maintenance
                            </option>
                            <option value="Respond to guest inquiries in person, by phone, and email">
                              Respond to guest inquiries in person, by phone, and email
                            </option>
                            <option value="Maintain accurate guest records in PMS">
                              Maintain accurate guest records in PMS
                            </option>
                            <option value="Assist with concierge and local recommendations">
                              Assist with concierge and local recommendations
                            </option>
                          </optgroup>
                          <optgroup label="Trades & Construction">
                            <option value="Read and interpret blueprints and work orders">
                              Read and interpret blueprints and work orders
                            </option>
                            <option value="Perform installations, repairs, and maintenance">
                              Perform installations, repairs, and maintenance
                            </option>
                            <option value="Operate tools and equipment safely">
                              Operate tools and equipment safely
                            </option>
                            <option value="Inspect completed work for quality and code compliance">
                              Inspect completed work for quality and code compliance
                            </option>
                            <option value="Maintain a clean and safe job site">
                              Maintain a clean and safe job site
                            </option>
                            <option value="Communicate progress and issues to supervisor">
                              Communicate progress and issues to supervisor
                            </option>
                            <option value="Order and track materials and supplies">
                              Order and track materials and supplies
                            </option>
                          </optgroup>
                          <optgroup label="Services">
                            <option value="Complete assigned jobs on schedule and to standard">
                              Complete assigned jobs on schedule and to standard
                            </option>
                            <option value="Maintain and care for equipment and vehicles">
                              Maintain and care for equipment and vehicles
                            </option>
                            <option value="Communicate with clients professionally">
                              Communicate with clients professionally
                            </option>
                            <option value="Document work completed and report issues">
                              Document work completed and report issues
                            </option>
                            <option value="Follow safety protocols at all times">
                              Follow safety protocols at all times
                            </option>
                          </optgroup>
                          <optgroup label="Office & Admin">
                            <option value="Answer phones and respond to emails promptly">
                              Answer phones and respond to emails promptly
                            </option>
                            <option value="Schedule appointments and manage calendars">
                              Schedule appointments and manage calendars
                            </option>
                            <option value="Maintain filing systems and records">
                              Maintain filing systems and records
                            </option>
                            <option value="Assist with invoicing, billing, and data entry">
                              Assist with invoicing, billing, and data entry
                            </option>
                            <option value="Support team with general administrative tasks">
                              Support team with general administrative tasks
                            </option>
                          </optgroup>
                          <optgroup label="Healthcare & Wellness">
                            <option value="Provide safe, high-quality care to clients and patients">
                              Provide safe, high-quality care to clients and patients
                            </option>
                            <option value="Document sessions and maintain accurate records">
                              Document sessions and maintain accurate records
                            </option>
                            <option value="Maintain a clean and sanitized workspace">
                              Maintain a clean and sanitized workspace
                            </option>
                            <option value="Communicate clearly with clients about treatment plans">
                              Communicate clearly with clients about treatment plans
                            </option>
                            <option value="Uphold client confidentiality at all times">
                              Uphold client confidentiality at all times
                            </option>
                          </optgroup>
                          <optgroup label="Management (Any Industry)">
                            <option value="Train and mentor new team members">
                              Train and mentor new team members
                            </option>
                            <option value="Create and manage staff schedules">
                              Create and manage staff schedules
                            </option>
                            <option value="Handle opening and closing procedures">
                              Handle opening and closing procedures
                            </option>
                            <option value="Monitor inventory and place orders">
                              Monitor inventory and place orders
                            </option>
                            <option value="Resolve guest or client complaints and escalations">
                              Resolve guest or client complaints and escalations
                            </option>
                            <option value="Ensure health and safety compliance">
                              Ensure health and safety compliance
                            </option>
                            <option value="Report to ownership on performance and operations">
                              Report to ownership on performance and operations
                            </option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Editable responsibility lines */}
                      <div className="flex flex-col gap-3">
                        {formData.responsibilities.map((r: string, idx: number) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 p-4 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm shadow-sm"
                              value={r}
                              onChange={(e) => {
                                const n = [...formData.responsibilities];
                                n[idx] = e.target.value;
                                setFormData((prev: any) => ({ ...prev, responsibilities: n }));
                              }}
                            />
                            {formData.responsibilities.length > 1 && (
                              <button
                                onClick={() => {
                                  const n = formData.responsibilities.filter((_: any, i: number) => i !== idx);
                                  setFormData((prev: any) => ({ ...prev, responsibilities: n }));
                                }}
                                className="text-gray-500 hover:text-red-400"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                          Requirements (Public)
                        </label>
                        <button
                          onClick={() =>
                            setFormData((prev: any) => ({
                              ...prev,
                              requirements: [...prev.requirements, ""],
                            }))
                          }
                          className="text-[#148F8B] hover:text-[#136068] transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Preset requirements dropdown */}
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          Quick Add from Common Requirements
                        </p>
                        <select
                          className="w-full p-3 rounded-2xl bg-white border border-gray-200 text-[11px] font-bold text-gray-700 shadow-sm"
                          value=""
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!value) return;
                            setFormData((prev: any) => ({
                              ...prev,
                              requirements: prev.requirements.includes(value)
                                ? prev.requirements
                                : [...prev.requirements, value],
                            }));
                          }}
                        >
                          <option value="">Select a requirement to add…</option>
                          <optgroup label="Experience">
                            <option value="1+ year experience in a similar role">
                              1+ year experience in a similar role
                            </option>
                            <option value="2+ years experience in a relevant field">
                              2+ years experience in a relevant field
                            </option>
                            <option value="Previous supervisory or management experience">
                              Previous supervisory or management experience
                            </option>
                            <option value="Hotel or resort experience preferred">
                              Hotel or resort experience preferred
                            </option>
                            <option value="Customer-facing experience required">
                              Customer-facing experience required
                            </option>
                          </optgroup>
                          <optgroup label="Certifications & Licenses">
                            <option value="Food handlers card required">Food handlers card required</option>
                            <option value="ServSafe certification">ServSafe certification</option>
                            <option value="TIPS / RBS alcohol certification">TIPS / RBS alcohol certification</option>
                            <option value="Valid Hawaii driver's license">Valid Hawaii driver's license</option>
                            <option value="Clean driving record required">Clean driving record required</option>
                            <option value="CPR and First Aid certified">CPR and First Aid certified</option>
                            <option value="Cosmetology or esthetician license">
                              Cosmetology or esthetician license
                            </option>
                            <option value="Contractor's license">Contractor's license</option>
                            <option value="OSHA 10 certification">OSHA 10 certification</option>
                          </optgroup>
                          <optgroup label="Availability">
                            <option value="Available weekends and holidays">
                              Available weekends and holidays
                            </option>
                            <option value="Available for early morning shifts">
                              Available for early morning shifts
                            </option>
                            <option value="Available for late night / closing shifts">
                              Available for late night / closing shifts
                            </option>
                            <option value="Open availability preferred">Open availability preferred</option>
                            <option value="Reliable transportation to job site">
                              Reliable transportation to job site
                            </option>
                          </optgroup>
                          <optgroup label="Skills & Traits">
                            <option value="Warm and professional communication">
                              Warm and professional communication
                            </option>
                            <option value="Comfortable in a fast-paced environment">
                              Comfortable in a fast-paced environment
                            </option>
                            <option value="Strong attention to detail">Strong attention to detail</option>
                            <option value="Ability to stand for extended periods">
                              Ability to stand for extended periods
                            </option>
                            <option value="Ability to lift 30+ lbs">Ability to lift 30+ lbs</option>
                            <option value="Ability to lift 50+ lbs">Ability to lift 50+ lbs</option>
                            <option value="Comfortable working outdoors in Hawaii weather">
                              Comfortable working outdoors in Hawaii weather
                            </option>
                            <option value="Team-oriented attitude">Team-oriented attitude</option>
                            <option value="Ability to work independently with minimal supervision">
                              Ability to work independently with minimal supervision
                            </option>
                            <option value="Bilingual English / Spanish preferred">
                              Bilingual English / Spanish preferred
                            </option>
                            <option value="Bilingual English / Japanese preferred">
                              Bilingual English / Japanese preferred
                            </option>
                            <option value="Bilingual English / Tagalog preferred">
                              Bilingual English / Tagalog preferred
                            </option>
                            <option value="Basic computer skills required">Basic computer skills required</option>
                            <option value="Proficiency with POS systems">Proficiency with POS systems</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Editable requirement lines */}
                      <div className="flex flex-col gap-3">
                        {formData.requirements.map((r: string, idx: number) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 p-4 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm shadow-sm"
                              value={r}
                              onChange={(e) => {
                                const n = [...formData.requirements];
                                n[idx] = e.target.value;
                                setFormData((prev: any) => ({ ...prev, requirements: n }));
                              }}
                            />
                            {formData.requirements.length > 1 && (
                              <button
                                onClick={() => {
                                  const n = formData.requirements.filter((_: any, i: number) => i !== idx);
                                  setFormData((prev: any) => ({ ...prev, requirements: n }));
                                }}
                                className="text-gray-500 hover:text-red-400"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Intro Video URL</label>
                      <input
                        type="url"
                        className="w-full p-5 rounded-2xl bg-white border border-gray-200 text-gray-900 font-bold shadow-sm"
                        value={formData.video_url}
                        onChange={(e) => setFormData((prev: any) => ({...prev, video_url: e.target.value}))}
                        placeholder="YouTube/Vimeo link"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Start Date</label>
                      <input
                        type="date"
                        className="w-full p-5 rounded-2xl bg-white border border-gray-200 text-gray-900 font-bold shadow-sm"
                        value={formData.start_date}
                        onChange={(e) => setFormData((prev: any) => ({...prev, start_date: e.target.value}))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                      Benefits (Public)
                    </label>

                    {/* Preset benefits dropdown */}
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Quick Add from Common Benefits
                      </p>
                      <select
                        className="w-full p-4 rounded-2xl bg-white border border-gray-200 text-[11px] font-bold text-gray-700 shadow-sm"
                        value=""
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!value) return;
                          setFormData((prev: any) => ({
                            ...prev,
                            benefits: prev.benefits.includes(value)
                              ? prev.benefits
                              : [...prev.benefits, value],
                          }));
                        }}
                      >
                        <option value="">Select a benefit to add…</option>
                        <optgroup label="Compensation">
                          <option value="Tips included">Tips included</option>
                          <option value="Tip pooling with kitchen">Tip pooling with kitchen</option>
                          <option value="Commission">Commission</option>
                          <option value="Performance bonuses">Performance bonuses</option>
                          <option value="Annual merit review">Annual merit review</option>
                          <option value="Overtime available">Overtime available</option>
                        </optgroup>
                        <optgroup label="Health & Wellness">
                          <option value="Health insurance">Health insurance</option>
                          <option value="Dental insurance">Dental insurance</option>
                          <option value="Vision insurance">Vision insurance</option>
                          <option value="Mental health coverage">Mental health coverage</option>
                        </optgroup>
                        <optgroup label="Time Off">
                          <option value="Paid time off">Paid time off</option>
                          <option value="Sick leave">Sick leave</option>
                          <option value="Holiday pay">Holiday pay</option>
                          <option value="Flexible scheduling">Flexible scheduling</option>
                          <option value="Weekends off">Weekends off</option>
                        </optgroup>
                        <optgroup label="Food & Perks">
                          <option value="Employee meal / family meal">Employee meal / family meal</option>
                          <option value="Employee dining discount">Employee dining discount</option>
                          <option value="Staff drinks">Staff drinks</option>
                          <option value="Uniform provided">Uniform provided</option>
                        </optgroup>
                        <optgroup label="Growth">
                          <option value="Promote from within">Promote from within</option>
                          <option value="Training provided">Training provided</option>
                          <option value="Professional development">Professional development</option>
                          <option value="Certification reimbursement">Certification reimbursement</option>
                        </optgroup>
                        <optgroup label="Work Environment">
                          <option value="Small tight-knit team">Small tight-knit team</option>
                          <option value="Locally owned">Locally owned</option>
                          <option value="Dog-friendly workplace">Dog-friendly workplace</option>
                          <option value="Parking provided">Parking provided</option>
                        </optgroup>
                        <optgroup label="Other">
                          <option value="Retirement / 401k">Retirement / 401k</option>
                          <option value="Relocation assistance">Relocation assistance</option>
                          <option value="Housing assistance">Housing assistance</option>
                          <option value="Transportation stipend">Transportation stipend</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Editable benefit lines (including custom) */}
                    <div className="flex flex-col gap-3">
                      {formData.benefits.map((b: string, idx: number) => (
                        <div key={idx} className="flex flex-1 min-w-[260px] gap-2">
                          <input
                            type="text"
                            className="flex-1 p-4 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm shadow-sm"
                            value={b}
                            onChange={(e) => {
                              const n = [...formData.benefits];
                              n[idx] = e.target.value;
                              setFormData((prev: any) => ({ ...prev, benefits: n }));
                            }}
                            placeholder="e.g. Health insurance"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const n = formData.benefits.filter((_: any, i: number) => i !== idx);
                              setFormData((prev: any) => ({ ...prev, benefits: n }));
                            }}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev: any) => ({
                            ...prev,
                            benefits: [...prev.benefits, ""],
                          }))
                        }
                        className="p-4 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <Plus size={16} /> Add Benefit
                      </button>
                    </div>
                  </div>
               </div>
            </section>

            <section className="space-y-8 p-10 bg-[#F3EAF5]/30 rounded-[3rem] border-2 border-dashed border-gray-100">
               <div className="space-y-2">
                  <h3 className="text-xl font-black tracking-tight">Private Identity Details</h3>
                  <p className="text-xs text-[#F39C12] font-black uppercase tracking-widest flex items-center gap-2"><Lock size={12} /> Only revealed to candidates after payment</p>
               </div>
               <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Legal Company Name *</label>
                      <input
                        type="text"
                        className="w-full p-5 rounded-2xl bg-white border border-gray-200 text-gray-900 font-bold shadow-sm"
                        value={formData.company_name}
                        onChange={(e) => setFormData((prev: any) => ({...prev, company_name: e.target.value}))}
                        placeholder="Blue Hawaii Surf Co."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Contact Email *</label>
                      <input
                        type="email"
                        className="w-full p-5 rounded-2xl bg-white border border-gray-200 text-gray-900 font-bold shadow-sm"
                        value={formData.contact_email}
                        onChange={(e) => setFormData((prev: any) => ({...prev, contact_email: e.target.value}))}
                        placeholder="hiring@company.com"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Hiring Phone *</label>
                      <input
                        type="tel"
                        className="w-full p-5 rounded-2xl bg-white border border-gray-200 text-gray-900 font-bold shadow-sm"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData((prev: any) => ({...prev, contact_phone: e.target.value}))}
                        placeholder="(808) 555-0123"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Business Logo URL</label>
                      <input
                        type="url"
                        className="w-full p-5 rounded-2xl bg-white border border-gray-200 text-gray-900 font-bold shadow-sm"
                        value={formData.image_url}
                        onChange={(e) => setFormData((prev: any) => ({...prev, image_url: e.target.value}))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        Private Mission/Culture
                      </label>
                      {hasSpeechSupport && (
                        <button
                          type="button"
                          onClick={() => toggleSpeechToText("company_description")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black tracking-widest uppercase transition-all ${
                            speechActiveField === "company_description"
                              ? "border-[#A63F8E] bg-[#A63F8E]/10 text-[#A63F8E]"
                              : "border-gray-200 bg-white text-gray-500 hover:border-[#148F8B] hover:text-[#148F8B]"
                          }`}
                        >
                          <Mic size={12} />
                          <span>{speechActiveField === "company_description" ? "Stop" : "Speak"}</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      className="w-full p-6 rounded-[2rem] bg-white text-gray-900 outline-none"
                      value={formData.company_description}
                      onChange={(e) =>
                        setFormData((prev: any) => ({ ...prev, company_description: e.target.value }))
                      }
                      placeholder="Tell seekers why they should join you..."
                    />
                  </div>
               </div>
            </section>
          </div>

          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <button onClick={() => existingJob ? onBack() : setStep('selection')} className="text-gray-400 font-black text-[10px] sm:text-xs uppercase tracking-widest hover:text-gray-600 text-left">← Back</button>
            <Button disabled={isSubmitting} className="px-8 sm:px-12 md:px-16 h-14 sm:h-16 md:h-20 rounded-xl sm:rounded-2xl shadow-2xl shadow-[#148F8B]/20 text-base sm:text-lg md:text-xl w-full sm:w-auto" onClick={handlePostJob}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <>{existingJob ? 'Update Listing' : 'Publish Listing'} <ArrowRight size={20} className="ml-2 sm:w-6 sm:h-6" /></>}
            </Button>
          </div>
        </div>

        <aside className="w-full lg:sticky lg:top-8 space-y-6 sm:space-y-8 order-1 lg:order-2">
           <div className="space-y-4 sm:space-y-6">
              <div className="flex bg-gray-100 p-1 rounded-xl sm:rounded-2xl">
                 <button onClick={() => setPreviewMode('public')} className={`flex-1 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${previewMode === 'public' ? 'bg-white text-[#148F8B] shadow-sm' : 'text-gray-700'}`}>Locked</button>
                 <button onClick={() => setPreviewMode('private')} className={`flex-1 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${previewMode === 'private' ? 'bg-white text-[#A63F8E] shadow-sm' : 'text-gray-700'}`}>Unlocked</button>
              </div>
              <AnimatePresence mode="wait">
                 <motion.div key={previewMode} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                    {previewMode === 'public' ? <PublicPreview /> : <PrivatePreview />}
                 </motion.div>
              </AnimatePresence>
           </div>
           <div className="p-6 bg-[#148F8B]/5 rounded-2xl border border-[#148F8B]/20 flex gap-4">
              <AlertCircle size={20} className="text-[#148F8B] shrink-0" /><p className="text-[10px] text-[#148F8B]/70 font-medium leading-relaxed">Identity revealed only after interaction fee.</p>
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
          <textarea rows={6} className="w-full p-4 sm:p-6 md:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-[#F3EAF5]/30 outline-none font-medium text-base sm:text-lg md:text-xl resize-none text-gray-900" placeholder="e.g. Experienced line cook for Waikiki resort. $22/hr, must work weekends." value={prompt} onChange={(e) => setPrompt(e.target.value.slice(0, 500))} />
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-8 flex items-center gap-4"><Mic size={18} className="sm:w-5 sm:h-5 text-gray-600" /></div>
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
      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-[#A63F8E]/10 rounded-full flex items-center justify-center text-[#A63F8E] mx-auto">
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
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-3 sm:border-4 border-dashed border-[#148F8B]/20" />
          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-center">Building your listing...</h3>
        </div>
      )}
      {step === 'review' && renderReview()}
      {step === 'confirmation' && renderConfirmation()}
    </div>
  );
}