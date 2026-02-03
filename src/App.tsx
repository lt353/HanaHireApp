import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  ArrowRight, 
  Settings as SettingsIcon,
  Video,
  Mic,
  FileText,
  Camera,
  Eye,
  Briefcase,
  User,
  ShoppingCart,
  Lock,
  MapPin,
  DollarSign,
  Play,
  Mail
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from './utils/supabase/info';

// Components
import { Header } from './components/layout/Header';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { CollapsibleFilter } from './components/CollapsibleFilter';
import { Home } from './components/screens/Home';
import { About } from './components/screens/About';
import { Settings } from './components/screens/Settings';
import { JobsList } from './components/screens/JobsList';
import { CandidatesList } from './components/screens/CandidatesList';
import { Cart } from './components/screens/Cart';
import { SeekerDashboard } from './components/screens/SeekerDashboard';
import { EmployerDashboard } from './components/screens/EmployerDashboard';
import { JobPostingFlow } from './components/screens/JobPostingFlow';
import { ProfileTitleCustomization } from './components/screens/ProfileTitleCustomization';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

// Data
import { JOB_CATEGORIES, CANDIDATE_CATEGORIES, INTERACTION_FEE } from './data/mockData';

// Utils
import { formatCandidateTitle } from "./utils/formatters";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-9b95b3f5`;

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "jobs" | "candidates" | "employer" | "seeker" | "job-posting" | "cart" | "about" | "settings" | "profile-title-customization">("landing");
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeeded, setHasSeeded] = useState(false);
  const [userRole, setUserRole] = useState<'seeker' | 'employer'>('seeker');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  
  // App State
  const [seekerQueue, setSeekerQueue] = useState<any[]>([]);
  const [employerQueue, setEmployerQueue] = useState<any[]>([]);
  const [unlockedJobIds, setUnlockedJobIds] = useState<any[]>([]);
  const [unlockedCandidateIds, setUnlockedCandidateIds] = useState<any[]>([]);
  const [paymentTarget, setPaymentTarget] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ 
    industries: [] as string[], 
    locations: [] as string[],
    payRanges: [] as string[],
    experienceLevels: [] as string[],
    educationLevels: [] as string[],
    skills: [] as string[]
  });
  const [userVisibility, setUserVisibility] = useState("broader");
  const [mediaType, setMediaType] = useState<"video" | "voice">("video");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch data from server
      const response = await fetch(`${API_BASE}/data`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // If data doesn't exist, seed the database
      if (!data.jobs || !data.candidates || data.jobs.length === 0 || data.candidates.length === 0) {
        console.log('No data found in KV store, seeding database...');
        toast.info('Initializing marketplace data...');
        
        // Use ?force=true to ensure we overwrite if something went wrong
        const seedResponse = await fetch(`${API_BASE}/seed?force=true`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!seedResponse.ok) {
          throw new Error('Seeding failed');
        }
        
        // Fetch again after seeding
        const newResponse = await fetch(`${API_BASE}/data`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        const newData = await newResponse.json();
        setJobs(newData.jobs || []);
        setCandidates(newData.candidates || []);
        console.log(`Successfully seeded and loaded ${newData.jobs?.length || 0} jobs and ${newData.candidates?.length || 0} candidates from KV store`);
        toast.success('Marketplace initialized!');
      } else {
        setJobs(data.jobs);
        setCandidates(data.candidates);
        console.log(`Loaded ${data.jobs.length} jobs and ${data.candidates.length} candidates from Supabase KV store (kv_store_9b95b3f5 table)`);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Failed to load marketplace data");
      setJobs([]);
      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnlocks = async (id: string) => {
    // API disabled - unlocks stored in local state only
    console.log("Unlocks loaded from local state for user:", id);
  };

  const handleNavigate = (view: "landing" | "jobs" | "candidates" | "employer" | "seeker" | "job-posting" | "cart" | "about" | "settings" | "profile-title-customization") => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const selectRole = (selectedRole: 'seeker' | 'employer') => {
    if (selectedRole === 'employer') {
      handleNavigate("employer");
    } else {
      handleNavigate("jobs");
    }
    setUserRole(selectedRole);
  };

  const toggleRole = () => {
    const newRole = currentView === 'seeker' ? 'employer' : 'seeker';
    selectRole(newRole);
    toast.success(`Switched to ${newRole === 'seeker' ? 'Job Seeker' : 'Employer'} view`);
  };

  const processPayment = async () => {
    if (!paymentTarget) return;
    
    try {
      // Process payment locally without API
      const itemIds = paymentTarget.items.map((i: any) => i.id);
      
      if (paymentTarget.type === 'seeker') {
        setUnlockedJobIds([...unlockedJobIds, ...itemIds]);
        setSeekerQueue(seekerQueue.filter(q => !paymentTarget.items.find((i:any) => i.id === q.id)));
        setShowPaymentModal(false);
        toast.success("Success!", { description: "Unlocks reveal immediately." });
        handleNavigate("seeker");
      } else {
        setUnlockedCandidateIds([...unlockedCandidateIds, ...itemIds]);
        setEmployerQueue(employerQueue.filter(q => !paymentTarget.items.find((i:any) => i.id === q.id)));
        setShowPaymentModal(false);
        toast.success("Success!", { description: "Unlocks reveal immediately." });
        handleNavigate("employer");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Unlock failed. Please try again.");
    }
  };

  const educationLevels = [
    'High School',
    'Vocational Training',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Doctorate'
  ];

  const getEducationRank = (edu: string) => {
    if (!edu) return -1;
    // Handle cases where data might have slightly different strings
    if (edu.includes('Doctorate')) return 5;
    if (edu.includes('Master')) return 4;
    if (edu.includes('Bachelor')) return 3;
    if (edu.includes('Associate')) return 2;
    if (edu.includes('Vocational')) return 1;
    if (edu.includes('High School')) return 0;
    return -1;
  };

  const matchesEducation = (candidateEdu: string, selectedLevels: string[]) => {
    if (selectedLevels.length === 0) return true;
    const candidateRank = getEducationRank(candidateEdu);
    
    // If a candidate has a Master's (Rank 4), they should match if the filter is 
    // "High School" (Rank 0), "Bachelor's" (Rank 3), or "Master's" (Rank 4).
    // So for each selected filter, we check if the candidate's rank is >= that filter's rank.
    return selectedLevels.some(level => {
      const filterRank = getEducationRank(level);
      return candidateRank >= filterRank;
    });
  };

  const matchesExperience = (years: number | string, levels: string[]) => {
    if (levels.length === 0) return true;
    
    // Normalize years to a number
    let y = 0;
    if (typeof years === 'number') {
      y = years;
    } else if (typeof years === 'string') {
      const match = years.match(/\d+/);
      y = match ? parseInt(match[0]) : 0;
    }

    return levels.some(level => {
      if (level === '0-2 years') return y <= 2;
      if (level === '2-5 years') return y > 2 && y <= 5;
      if (level === '5-10 years') return y > 5 && y <= 10;
      if (level === '10+ years') return y > 10;
      return false;
    });
  };

  const filteredJobs = jobs.filter(j => 
    (filters.industries.length === 0 || filters.industries.includes(j.company_industry)) &&
    (filters.locations.length === 0 || filters.locations.includes(j.location)) &&
    (filters.payRanges.length === 0 || filters.payRanges.includes(j.pay_range)) &&
    (searchQuery === "" || 
      (j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) || 
      (j.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    )
  );

  const filteredCandidates = candidates.filter(c => 
    (filters.locations.length === 0 || filters.locations.includes(c.location)) &&
    (filters.payRanges.length === 0 || filters.payRanges.includes(c.preferred_pay_range) || filters.payRanges.includes(c.target_pay)) &&
    (filters.skills.length === 0 || filters.skills.some(s => c.skills?.includes(s))) &&
    (filters.industries.length === 0 || (c.industries_interested && c.industries_interested.some((ind: string) => filters.industries.includes(ind)))) &&
    matchesExperience(c.years_experience, filters.experienceLevels) &&
    matchesEducation(c.education, filters.educationLevels) &&
    (searchQuery === "" || 
      (c.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) || 
      (c.skills?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())) ?? false)
    )
  );

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const current = prev[category] as string[];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      industries: [],
      locations: [],
      payRanges: [],
      experienceLevels: [],
      educationLevels: [],
      skills: [],
    });
  };

  const renderScreen = () => {
    if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-gray-200 uppercase tracking-[0.5em]">Loading Market...</div>;

    switch (currentView) {
      case "landing":
        return <Home onSelectRole={selectRole} />;
      case "about":
        return <About onSelectRole={selectRole} onNavigate={handleNavigate} />;
      case "settings":
        return <Settings onRefreshData={fetchInitialData} />;
      case "jobs":
        return (
          <JobsList 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredJobs={filteredJobs}
            unlockedJobIds={unlockedJobIds}
            seekerQueue={seekerQueue}
            onAddToQueue={(j) => {
              if (seekerQueue.find(q => q.id === j.id)) return;
              setSeekerQueue([...seekerQueue, j]);
              toast.success("Added to Queue");
            }}
            onShowPayment={(t) => { setPaymentTarget(t); setShowPaymentModal(true); }}
            onShowFilters={() => setShowFilterModal(true)}
            onSelectJob={(job) => setSelectedJob(job)}
            interactionFee={INTERACTION_FEE}
          />
        );
      case "candidates":
        return (
          <CandidatesList 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredCandidates={filteredCandidates}
            unlockedCandidateIds={unlockedCandidateIds}
            employerQueue={employerQueue}
            onAddToQueue={(c) => {
              if (employerQueue.find(q => q.id === c.id)) return;
              setEmployerQueue([...employerQueue, c]);
              toast.success("Added to Queue");
            }}
            onShowPayment={(t) => { setPaymentTarget(t); setShowPaymentModal(true); }}
            onShowFilters={() => setShowFilterModal(true)}
            onSelectCandidate={(c) => setSelectedCandidate(c)}
            interactionFee={INTERACTION_FEE}
          />
        );
      case "cart":
        return (
          <Cart 
            role={userRole}
            queue={userRole === 'seeker' ? seekerQueue : employerQueue}
            onRemoveFromQueue={(id) => {
              if (userRole === 'seeker') setSeekerQueue(seekerQueue.filter(q => q.id !== id));
              else setEmployerQueue(employerQueue.filter(q => q.id !== id));
            }}
            onNavigate={handleNavigate}
            onShowPayment={(t) => { setPaymentTarget(t); setShowPaymentModal(true); }}
            interactionFee={INTERACTION_FEE}
          />
        );
      case "seeker":
        return (
          <SeekerDashboard 
            isLoggedIn={isLoggedIn}
            onNavigate={handleNavigate}
            onShowMedia={() => setShowMediaModal(true)}
            onShowVisibility={() => setShowVisibilityModal(true)}
            onShowAuth={handleShowAuth}
            onLogout={handleLogout}
            unlockedJobs={jobs.filter(j => unlockedJobIds.includes(j.id))}
            onSelectJob={setSelectedJob}
          />
        );
      case "employer":
        return (
          <EmployerDashboard 
            isLoggedIn={isLoggedIn}
            jobs={jobs}
            candidates={candidates}
            unlockedCandidateIds={unlockedCandidateIds}
            onNavigate={handleNavigate}
            onShowPostJob={() => handleNavigate("job-posting")}
            onSelectCandidate={(c) => setSelectedCandidate(c)}
            onShowAuth={handleShowAuth}
            onLogout={handleLogout}
          />
        );
      case "job-posting":
        return (
          <JobPostingFlow 
            onBack={() => handleNavigate("employer")}
            onComplete={(newJob) => {
              setJobs([newJob, ...jobs]);
              handleNavigate("employer");
            }}
          />
        );
      case "profile-title-customization":
        return (
          <ProfileTitleCustomization 
            onBack={() => handleNavigate("seeker")}
            onSave={(title) => {
              toast.success("Profile Title Updated!");
              handleNavigate("seeker");
            }}
          />
        );
      default:
        return <Home onSelectRole={selectRole} />;
    }
  };

  const handleShowAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView("landing");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900 selection:bg-[#0077BE]/10">
      
      <Header 
        isRoleSelected={currentView !== "landing"}
        role={userRole}
        currentTab={currentView}
        isLoggedIn={isLoggedIn}
        seekerQueueCount={seekerQueue.length}
        employerQueueCount={employerQueue.length}
        onNavigate={handleNavigate}
        onSelectRole={selectRole}
        onToggleRole={toggleRole}
        onLogout={handleLogout}
        onShowAuth={handleShowAuth}
        onReset={() => { setCurrentView("landing"); }}
      />

      <main>
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </main>

      {/* --- Modals --- */}
      
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} title={authMode === 'login' ? "Access My Hub" : "Create Profile"}>
         <div className="space-y-8">
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              const email = new FormData(e.currentTarget).get('email') as string;
              fetchUnlocks(email);
              setIsLoggedIn(true);
              setShowAuthModal(false); 
              if (currentView === 'employer') handleNavigate("employer"); 
              else handleNavigate("seeker"); 
              toast.success("Welcome back!"); 
            }} className="space-y-8">
               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Email Identity</label>
                     <input required name="email" type="email" placeholder="name@region.com" className="w-full p-6 rounded-3xl bg-gray-50 border border-gray-100 focus:ring-4 ring-[#0077BE]/10 outline-none font-black text-xl tracking-tight" />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Access Key</label>
                     <input required type="password" placeholder="••••••••" className="w-full p-6 rounded-3xl bg-gray-50 border border-gray-100 focus:ring-4 ring-[#0077BE]/10 outline-none font-black text-xl tracking-tighter" />
                  </div>
               </div>
               <Button type="submit" className="w-full h-20 rounded-[1.5rem] text-xl shadow-xl shadow-[#0077BE]/20">{authMode === 'login' ? "Log In to Hub" : "Launch My Profile"}</Button>
            </form>
            <div className="flex flex-col items-center gap-6 pt-8 border-t border-gray-50">
               {authMode === 'login' ? (
                 <p className="text-sm text-gray-400 font-black uppercase tracking-widest">First time here? <button onClick={() => setAuthMode('signup')} className="text-[#0077BE] hover:underline">Create Account</button></p>
               ) : (
                 <p className="text-sm text-gray-400 font-black uppercase tracking-widest">Already a member? <button onClick={() => setAuthMode('login')} className="text-[#0077BE] hover:underline">Sign In</button></p>
               )}
            </div>
         </div>
      </Modal>

      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Secure Checkout">
         <div className="space-y-12">
            <div className="bg-gray-50 p-12 rounded-[4rem] border border-gray-100 shadow-inner text-center space-y-6">
               <span className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Total Unlocks: {paymentTarget?.items?.length || 0}</span>
               <p className="text-6xl font-black tracking-tighter">${((paymentTarget?.items?.length || 0) * INTERACTION_FEE).toFixed(2)}</p>
            </div>
            <div className="space-y-8">
               <div className="p-8 bg-white border-2 border-gray-100 rounded-[2.5rem] flex items-center gap-6">
                  <CreditCard size={32} className="text-gray-300" />
                  <input type="text" placeholder="1234 5678 1234 5678" className="flex-1 focus:outline-none font-black text-2xl tracking-widest uppercase" />
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="p-8 bg-white border-2 border-gray-100 rounded-[2.5rem]"><input type="text" placeholder="MM / YY" className="w-full focus:outline-none text-center font-black text-2xl tracking-widest uppercase" /></div>
                  <div className="p-8 bg-white border-2 border-gray-100 rounded-[2.5rem]"><input type="text" placeholder="CVC" className="w-full focus:outline-none text-center font-black text-2xl tracking-widest uppercase" /></div>
               </div>
            </div>
            <Button className="w-full h-28 text-3xl rounded-[2rem] shadow-2xl shadow-[#0077BE]/30 tracking-tighter group" onClick={processPayment}>Pay & Unlock Results <ArrowRight size={32} /></Button>
         </div>
      </Modal>

      <Modal isOpen={showPostJobModal} onClose={() => setShowPostJobModal(false)} title="Post Job">
         <form onSubmit={(e) => { 
            e.preventDefault(); 
            const formData = new FormData(e.currentTarget); 
            const newJob = { 
              id: Date.now(), 
              title: formData.get("title") as string, 
              company_name: "Your Business", 
              company_industry: formData.get("type") as string, 
              location: "Honolulu, HI", 
              pay_range: formData.get("pay") as string, 
              posted_at: new Date().toISOString(), 
              description: formData.get("description") as string, 
              is_anonymous: true,
              company_size: "Small Business"
            }; 
            setJobs([newJob, ...jobs]); 
            setShowPostJobModal(false); 
            toast.success("Job Live!"); 
         }} className="space-y-8">
            <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Job Title</label><input required name="title" type="text" placeholder="e.g. Server" className="w-full p-6 rounded-3xl bg-gray-50 border border-gray-100 font-black text-xl" /></div>
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Type</label><select name="type" className="w-full p-6 rounded-3xl bg-gray-50 border border-gray-100 font-bold">
                  {JOB_CATEGORIES.industries.map(ind => <option key={ind}>{ind}</option>)}
               </select></div>
               <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Pay Range</label><select name="pay" className="w-full p-6 rounded-3xl bg-gray-50 border border-gray-100 font-bold">
                  {JOB_CATEGORIES.payRanges.map(pay => <option key={pay}>{pay}</option>)}
               </select></div>
            </div>
            
            <div className="space-y-4">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Job Intro Format</label>
               <div className="flex gap-4">
                  <button type="button" onClick={() => setMediaType("video")} className={`flex-1 p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${mediaType === 'video' ? 'border-[#0077BE] bg-[#0077BE]/5 text-[#0077BE]' : 'border-gray-50 text-gray-400'}`}>
                     <Video size={24} />
                     <span className="font-black text-[10px]">VIDEO INTRO</span>
                  </button>
                  <button type="button" onClick={() => setMediaType("voice")} className={`flex-1 p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${mediaType === 'voice' ? 'border-[#0077BE] bg-[#0077BE]/5 text-[#0077BE]' : 'border-gray-50 text-gray-400'}`}>
                     <Mic size={24} />
                     <span className="font-black text-[10px]">VOICE ONLY</span>
                  </button>
               </div>
               <button type="button" onClick={() => toast.info(`Starting ${mediaType} recorder...`)} className="w-full py-10 border-4 border-dashed border-gray-100 rounded-3xl flex flex-col items-center gap-2 text-gray-300 hover:text-[#0077BE] hover:border-[#0077BE] transition-all">
                  {mediaType === 'video' ? <Camera size={32} /> : <Mic size={32} />}
                  <span className="font-black text-[10px] uppercase">Record Job Intro</span>
               </button>
            </div>

            <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Overview</label><textarea required name="description" rows={4} className="w-full p-6 rounded-3xl bg-gray-50 border border-gray-100 font-medium text-lg" /></div>
            <Button type="submit" className="w-full h-24 text-3xl rounded-[2rem] shadow-2xl shadow-[#0077BE]/20">Go Live ($0 Post Fee)</Button>
         </form>
      </Modal>

      <Modal isOpen={showVisibilityModal} onClose={() => setShowVisibilityModal(false)} title="Visibility Preferences">
         <div className="space-y-12">
            <div className="space-y-6">
               <button onClick={() => { setUserVisibility("broader"); toast.success("Visibility Updated"); setShowVisibilityModal(false); }} className={`w-full p-10 rounded-[4rem] border-4 text-left transition-all flex gap-10 items-center ${userVisibility === "broader" ? "border-[#0077BE] bg-[#0077BE]/5 shadow-xl" : "border-gray-50"}`}>
                  <div className={`w-12 h-12 rounded-full border-4 shrink-0 flex items-center justify-center ${userVisibility === "broader" ? "border-[#0077BE]" : "border-gray-200"}`}>{userVisibility === "broader" && <div className="w-6 h-6 rounded-full bg-[#0077BE]" />}</div>
                  <div className="space-y-2"><span className="font-black text-3xl text-gray-900 block tracking-tighter leading-none uppercase">Public Discovery</span><p className="text-lg text-gray-500 font-medium leading-tight">Businesses can find you in the pool.</p></div>
               </button>
               <button onClick={() => { setUserVisibility("limited"); toast.success("Visibility Updated"); setShowVisibilityModal(false); }} className={`w-full p-10 rounded-[4rem] border-4 text-left transition-all flex gap-10 items-center ${userVisibility === "limited" ? "border-[#0077BE] bg-[#0077BE]/5 shadow-xl" : "border-gray-50"}`}>
                   <div className={`w-12 h-12 rounded-full border-4 shrink-0 flex items-center justify-center ${userVisibility === "limited" ? "border-[#0077BE]" : "border-gray-200"}`}>{userVisibility === "limited" && <div className="w-6 h-6 rounded-full bg-[#0077BE]" />}</div>
                  <div className="space-y-2"><span className="font-black text-3xl text-gray-900 block tracking-tighter leading-none uppercase">Direct Only</span><p className="text-lg text-gray-500 font-medium leading-tight">Only jobs you apply to see your profile.</p></div>
               </button>
            </div>
         </div>
      </Modal>

      <Modal isOpen={showMediaModal} onClose={() => setShowMediaModal(false)} title="Update Intro">
         <div className="space-y-10">
            <p className="text-center text-gray-500 font-medium">Choose how you want to show your personality.</p>
            <div className="grid grid-cols-2 gap-6">
               <button onClick={() => { setMediaType("video"); toast.info("Starting Video Recorder..."); }} className="p-10 border-2 border-gray-100 rounded-[3rem] flex flex-col items-center gap-4 hover:border-[#0077BE] hover:bg-[#0077BE]/5 transition-all">
                  <Video size={48} className="text-[#0077BE]" />
                  <span className="font-black text-xs uppercase tracking-widest">VIDEO INTRO</span>
               </button>
               <button onClick={() => { setMediaType("voice"); toast.info("Starting Voice Recorder..."); }} className="p-10 border-2 border-gray-100 rounded-[3rem] flex flex-col items-center gap-4 hover:border-[#0077BE] hover:bg-[#0077BE]/5 transition-all">
                  <Mic size={48} className="text-[#0077BE]" />
                  <span className="font-black text-xs uppercase tracking-widest">VOICE ONLY</span>
               </button>
            </div>
            <div className="p-8 bg-gray-50 rounded-3xl space-y-4">
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> Transcript Mode</p>
               <p className="text-sm text-gray-500">Your recording automatically generates a transcript for employers.</p>
            </div>
         </div>
      </Modal>

      <Modal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)} title="Refine Results">
         <div className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {currentView === 'seeker' ? 'Job Filters' : 'Talent Filters'}
              </span>
              <button 
                onClick={clearFilters}
                className="text-[10px] font-black text-[#FF6B6B] uppercase tracking-widest hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Industry Filter: Always available now, matching interested industries for candidates */}
            <CollapsibleFilter title="Industry" isOpen={true}>
              {(currentView === 'seeker' ? JOB_CATEGORIES.industries : CANDIDATE_CATEGORIES.industries).map(t => (
                <button 
                  key={t} 
                  onClick={() => toggleFilter('industries', t)} 
                  className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${filters.industries.includes(t) ? 'border-[#0077BE] text-[#0077BE] bg-[#0077BE]/5' : 'border-gray-50 text-gray-400 bg-gray-50/30'}`}
                >
                  {t}
                </button>
              ))}
            </CollapsibleFilter>

            {/* Common Filter: Location */}
            <CollapsibleFilter title="Location" isOpen={currentView === 'employer'}>
              {(currentView === 'seeker' ? JOB_CATEGORIES.locations : CANDIDATE_CATEGORIES.locations).map(l => (
                <button 
                  key={l} 
                  onClick={() => toggleFilter('locations', l)} 
                  className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${filters.locations.includes(l) ? 'border-[#0077BE] text-[#0077BE] bg-[#0077BE]/5' : 'border-gray-50 text-gray-400 bg-gray-50/30'}`}
                >
                  {l}
                </button>
              ))}
            </CollapsibleFilter>

            {/* Role Specific Filters */}
            {currentView === 'seeker' ? (
              <CollapsibleFilter title="Pay Range">
                {JOB_CATEGORIES.payRanges.map(p => (
                  <button 
                    key={p} 
                    onClick={() => toggleFilter('payRanges', p)} 
                    className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${filters.payRanges.includes(p) ? 'border-[#0077BE] text-[#0077BE] bg-[#0077BE]/5' : 'border-gray-50 text-gray-400 bg-gray-50/30'}`}
                  >
                    {p}
                  </button>
                ))}
              </CollapsibleFilter>
            ) : (
              <>
                <CollapsibleFilter title="Experience Level" isOpen={true}>
                  {CANDIDATE_CATEGORIES.experienceLevels.map(e => (
                    <button 
                      key={e} 
                      onClick={() => toggleFilter('experienceLevels', e)} 
                      className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${filters.experienceLevels.includes(e) ? 'border-[#0077BE] text-[#0077BE] bg-[#0077BE]/5' : 'border-gray-50 text-gray-400 bg-gray-50/30'}`}
                    >
                      {e}
                    </button>
                  ))}
                </CollapsibleFilter>

                <CollapsibleFilter title="Skills">
                  {CANDIDATE_CATEGORIES.skills.map(s => (
                    <button 
                      key={s} 
                      onClick={() => toggleFilter('skills', s)} 
                      className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${filters.skills.includes(s) ? 'border-[#0077BE] text-[#0077BE] bg-[#0077BE]/5' : 'border-gray-50 text-gray-400 bg-gray-50/30'}`}
                    >
                      {s}
                    </button>
                  ))}
                </CollapsibleFilter>

                <CollapsibleFilter title="Education">
                  {CANDIDATE_CATEGORIES.educationLevels.map(edu => (
                    <button 
                      key={edu} 
                      onClick={() => toggleFilter('educationLevels', edu)} 
                      className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${filters.educationLevels.includes(edu) ? 'border-[#0077BE] text-[#0077BE] bg-[#0077BE]/5' : 'border-gray-50 text-gray-400 bg-gray-50/30'}`}
                    >
                      {edu}
                    </button>
                  ))}
                </CollapsibleFilter>

                <CollapsibleFilter title="Target Pay">
                  {CANDIDATE_CATEGORIES.targetPayRanges.map(p => (
                    <button 
                      key={p} 
                      onClick={() => toggleFilter('payRanges', p)} 
                      className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${filters.payRanges.includes(p) ? 'border-[#0077BE] text-[#0077BE] bg-[#0077BE]/5' : 'border-gray-50 text-gray-400 bg-gray-50/30'}`}
                    >
                      {p}
                    </button>
                  ))}
                </CollapsibleFilter>
              </>
            )}

            <div className="pt-6">
              <Button className="w-full h-16 rounded-2xl text-lg" onClick={() => setShowFilterModal(false)}>
                Show {currentView === 'seeker' ? filteredJobs.length : filteredCandidates.length} Results
              </Button>
            </div>
         </div>
      </Modal>

      {/* Mobile Nav */}
      {currentView !== "landing" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 md:hidden grid grid-cols-4 z-50 shadow-2xl">
           <button onClick={() => handleNavigate("landing")} className={`flex flex-col items-center gap-2 ${currentView === 'landing' ? 'text-[#0077BE]' : 'text-gray-300'}`}><Eye size={24} /><span className="text-[9px] font-black uppercase tracking-widest">EXPLORE</span></button>
           <button onClick={() => handleNavigate(userRole === 'seeker' ? "jobs" : "candidates")} className={`flex flex-col items-center gap-2 ${(currentView === "jobs" || currentView === "candidates") ? 'text-[#0077BE]' : 'text-gray-300'}`}><Briefcase size={24} /><span className="text-[9px] font-black uppercase tracking-widest">{userRole === 'seeker' ? 'JOBS' : 'TALENT'}</span></button>
           <button onClick={() => handleNavigate(userRole === 'seeker' ? "seeker" : "employer")} className={`flex flex-col items-center gap-2 ${(currentView === "seeker" || currentView === "employer") ? 'text-[#0077BE]' : 'text-gray-300'}`}><User size={24} /><span className="text-[9px] font-black uppercase tracking-widest">HUB</span></button>
           <button onClick={() => handleNavigate("cart")} className={`flex flex-col items-center gap-2 relative ${currentView === 'cart' ? 'text-[#0077BE]' : 'text-gray-300'}`}><ShoppingCart size={24} /><span className="text-[9px] font-black uppercase tracking-widest">CART</span>{(userRole === 'seeker' ? seekerQueue.length : employerQueue.length) > 0 && <span className="absolute top-0 right-2 bg-[#FF6B6B] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">{(userRole === 'seeker' ? seekerQueue.length : employerQueue.length)}</span>}</button>
        </div>
      )}

      {/* --- Detail Modals --- */}
      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title="Role Intelligence">
        {selectedJob && (
          <div className="space-y-10">
            <div className="space-y-4">
              <h3 className="text-5xl font-black tracking-tighter leading-none">{selectedJob.title}</h3>
              <div className="flex flex-wrap gap-6 text-sm font-black uppercase tracking-widest text-[#0077BE]">
                <span>{selectedJob.location}</span>
                <span className="text-[#2ECC71]">{selectedJob.pay_range}</span>
                <span className="text-gray-400">{selectedJob.job_type}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-gray-50 rounded-3xl space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Identity</span>
                <p className="font-black text-xl tracking-tight">
                  {(selectedJob.is_anonymous && !unlockedJobIds.includes(selectedJob.id)) ? `[${selectedJob.company_industry} Business]` : selectedJob.company_name}
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Team Scale</span>
                <p className="font-black text-xl tracking-tight">{selectedJob.company_size}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Context & Mission</h4>
                <p className="text-lg text-gray-600 leading-relaxed font-medium">{selectedJob.description}</p>
              </div>
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Core Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requirements.map((r: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-[#0077BE]/5 text-[#0077BE] rounded-xl text-xs font-black uppercase tracking-widest">{r}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Key Responsibilities</h4>
                  <ul className="space-y-3">
                    {selectedJob.responsibilities.map((r: string, i: number) => (
                      <li key={i} className="flex gap-4 items-start text-gray-600 font-medium">
                        <div className="w-2 h-2 mt-2 rounded-full bg-[#0077BE] shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {!unlockedJobIds.includes(selectedJob.id) && (
              <Button className="w-full h-24 text-2xl rounded-3xl shadow-2xl shadow-[#0077BE]/20" onClick={() => { setPaymentTarget({ type: 'seeker', items: [selectedJob] }); setShowPaymentModal(true); setSelectedJob(null); }}>
                Apply & Reveal Business ${INTERACTION_FEE.toFixed(2)}
              </Button>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={!!selectedCandidate} onClose={() => setSelectedCandidate(null)} title={unlockedCandidateIds.includes(selectedCandidate?.id) ? "Full Candidate Profile" : "Candidate Intel"}>
        {selectedCandidate && (
          <div className="space-y-10">
            {unlockedCandidateIds.includes(selectedCandidate.id) ? (
              <div className="space-y-8">
                {/* Header for Unlocked State */}
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                   <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-gray-100 shrink-0 border-4 border-[#0077BE]/10 shadow-xl">
                      <ImageWithFallback 
                        src={selectedCandidate.video_thumbnail_url} 
                        className="w-full h-full object-cover"
                      />
                   </div>
                   <div className="space-y-1 flex-1 text-center sm:text-left">
                      <h3 className="text-4xl font-black tracking-tighter leading-none">{selectedCandidate.name}</h3>
                      <p className="text-lg font-black text-[#0077BE] uppercase tracking-[0.2em]">{selectedCandidate.location}</p>
                   </div>
                </div>

                {/* Video Player */}
                <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden group shadow-2xl">
                   <ImageWithFallback 
                     src={selectedCandidate.video_thumbnail_url} 
                     className="w-full h-full object-cover opacity-80"
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border-2 border-white/50 group-hover:scale-110 transition-transform cursor-pointer">
                         <Play size={40} className="text-white fill-white ml-2" />
                      </div>
                   </div>
                </div>

                <div className="flex gap-4 p-1 bg-gray-50 rounded-2xl">
                  <button className="flex-1 py-4 bg-white rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest">Video Intro</button>
                  <button className="flex-1 py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 transition-colors">Transcript</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {/* Locked Video Preview */}
                <div className="relative aspect-video bg-gray-100 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-xl">
                   <ImageWithFallback 
                     src={selectedCandidate.video_thumbnail_url} 
                     className="w-full h-full object-cover blur-[5px] opacity-70"
                   />
                   <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-2xl mb-4 sm:mb-6">
                         <Lock size={32} className="sm:w-12 sm:h-12 text-white" />
                      </div>
                      <div className="text-center space-y-2 sm:space-y-3 px-4">
                        <p className="text-white text-2xl sm:text-4xl font-black tracking-tighter drop-shadow-lg">Pay to Reveal</p>
                        <p className="text-white/90 text-xs sm:text-sm font-black uppercase tracking-widest drop-shadow-md">Video Intro + Direct Contact</p>
                      </div>
                   </div>
                   <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#FF6B6B] text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl">
                        ${INTERACTION_FEE.toFixed(2)}
                      </div>
                   </div>
                </div>

                {/* Candidate Header Info */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-gray-100 shrink-0 border-4 border-white shadow-xl">
                    <ImageWithFallback 
                      src={selectedCandidate.video_thumbnail_url} 
                      className="w-full h-full object-cover blur-[4px] opacity-80"
                    />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter leading-none break-words">
                      {selectedCandidate.display_title || "Verified Talent"}
                    </h3>
                    <p className="text-xs font-black text-[#0077BE] uppercase tracking-[0.2em]">{selectedCandidate.location}</p>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedCandidate.years_experience} EXP</span>
                      <span className="px-3 py-1 bg-[#2ECC71]/10 text-[#2ECC71] rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedCandidate.availability}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6 sm:space-y-8">
              {/* Bio Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Professional Narrative</h4>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed font-medium">{selectedCandidate.bio}</p>
              </div>

              {/* Comprehensive Intel Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-4 sm:gap-y-6 border-y border-gray-100 py-6 sm:py-8">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Education Background</span>
                    <span className="text-[10px] sm:text-xs font-black text-gray-900 uppercase text-right">{selectedCandidate.education}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Employment Status</span>
                    <span className="text-[10px] sm:text-xs font-black text-gray-900 uppercase text-right">{selectedCandidate.current_employment_status || 'Open'}</span>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Availability</span>
                    <span className="text-[10px] sm:text-xs font-black text-[#2ECC71] uppercase text-right">{selectedCandidate.availability}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Experience</span>
                    <span className="text-[10px] sm:text-xs font-black text-gray-900 uppercase text-right">{selectedCandidate.years_experience} Years</span>
                  </div>
                </div>
              </div>

              {/* Technical & Soft Skills */}
              {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Technical & Soft Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((s: string, i: number) => (
                      <span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial & Contact Info - Privacy Layer */}
              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                 <div className="p-6 sm:p-8 bg-gray-50 rounded-[1.5rem] sm:rounded-[2rem] space-y-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expectation</span>
                    <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{selectedCandidate.preferred_pay_range}</p>
                 </div>
                 
                 {unlockedCandidateIds.includes(selectedCandidate.id) ? (
                    <div className="p-6 sm:p-8 bg-[#0077BE] rounded-[1.5rem] sm:rounded-[2rem] text-white space-y-2">
                       <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">Direct Phone</span>
                       <p className="text-lg sm:text-xl font-black tracking-tight">{selectedCandidate.phone}</p>
                    </div>
                 ) : (
                    <div className="p-6 sm:p-8 bg-[#FF6B6B]/5 rounded-[1.5rem] sm:rounded-[2rem] border border-[#FF6B6B]/10 flex items-center justify-between gap-3">
                       <div className="space-y-1 min-w-0">
                          <span className="text-[9px] sm:text-[10px] font-black text-[#FF6B6B] uppercase tracking-widest">Contact Locked</span>
                          <p className="text-xs sm:text-sm font-bold text-gray-400 italic">Unlock to reveal identity</p>
                       </div>
                       <Lock size={18} className="sm:w-5 sm:h-5 text-[#FF6B6B] opacity-40 shrink-0" />
                    </div>
                 )}
              </div>
              
              {unlockedCandidateIds.includes(selectedCandidate.id) && (
                 <div className="p-6 sm:p-8 bg-[#2ECC71]/5 rounded-[1.5rem] sm:rounded-[2rem] border border-[#2ECC71]/10 flex items-center gap-4 sm:gap-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#2ECC71]/20 flex items-center justify-center shrink-0">
                       <Mail className="text-[#2ECC71]" size={20} />
                    </div>
                    <div className="min-w-0">
                       <span className="text-[10px] font-black text-[#2ECC71] uppercase tracking-widest">Verified Email</span>
                       <p className="text-base sm:text-lg md:text-xl font-black text-gray-900 tracking-tight break-all">{selectedCandidate.email}</p>
                    </div>
                 </div>
              )}
            </div>

            {!unlockedCandidateIds.includes(selectedCandidate.id) && (
              <Button className="w-full h-16 sm:h-20 md:h-24 text-base sm:text-xl md:text-2xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-[#FF6B6B]/20 bg-[#FF6B6B] hover:bg-[#FF6B6B]/90" onClick={() => { setPaymentTarget({ type: 'employer', items: [selectedCandidate] }); setShowPaymentModal(true); setSelectedCandidate(null); }}>
                Unlock Full Video & Contact ${INTERACTION_FEE.toFixed(2)}
              </Button>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}