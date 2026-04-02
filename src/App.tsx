import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  CreditCard,
  ArrowRight,
  Video,
  Mic,
  FileText,
  Camera,
  Eye,
  Briefcase,
  User,
  Lock,
  MapPin,
  DollarSign,
  Play,
  Mail,
  Zap,
  Shield,
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  X,
  FolderOpen,
  MessageSquare,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";
import { mergeJobsWithEmployers } from "./utils/jobHelpers";
import { projectId, publicAnonKey } from './utils/supabase/info';
import { supabase } from './utils/supabase/client';
import { formatPhoneInput } from './utils/formatters';
import { removeStorageFilesFromUrls } from './utils/deleteCandidate';


// Components
import { Header } from './components/layout/Header';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { MarketplaceFilterModal } from "./components/filters/MarketplaceFilterModal";
import { Home } from './components/screens/Home';
import { About } from './components/screens/About';
import { Settings } from './components/screens/Settings';
import { JobsList } from './components/screens/JobsList';
import { CandidatesList } from './components/screens/CandidatesList';
import { Cart } from './components/screens/Cart';
import { SeekerDashboard } from './components/screens/SeekerDashboard';
import { EmployerDashboard } from './components/screens/EmployerDashboard';
import { SeekerOnboarding } from './components/screens/SeekerOnboarding';
import { EmployerOnboarding } from './components/screens/EmployerOnboarding';
import { JobPostingFlow } from './components/screens/JobPostingFlow';
import { ProfileTitleCustomization } from './components/screens/ProfileTitleCustomization';
import { ProfileEditor } from './components/screens/ProfileEditor';
import { VideoIntroModal } from "./components/screens/VideoIntroModal";
import { VideoUploadProgressProvider } from "./contexts/VideoUploadProgressContext";
import { VideoUploadTopBar } from "./components/layout/VideoUploadTopBar";
import { ApplicationQuestionsModal } from "./components/screens/ApplicationQuestionsModal";
import type { ApplicationSubmissionPayload } from "./components/screens/ApplicationQuestionsModal";
import { SeekerConsentModal } from "./components/modals/SeekerConsentModal";
import { EmployerConsentModal } from "./components/modals/EmployerConsentModal";
import { LegalCompliance } from "./components/screens/LegalCompliance";
import { Messages } from "./components/screens/Messages";
import type { ConversationRow, MessageRow } from "./components/screens/Messages";
import { ImageWithFallback } from './components/figma/ImageWithFallback';

// Data
import {
  JOB_CATEGORIES,
  INTERACTION_FEE,
  DEMO_PROFILES,
  LOCATIONS_BY_ISLAND,
  INDUSTRIES_BY_GROUP,
} from "./data/mockData";
import { createLocationMatcher } from "./utils/marketplaceLocationFilter";
import { candidateMeetsTalentPoolRequirements } from "./utils/candidateTalentPool";
import {
  HAWAII_LOCATION_MANUAL_TOKEN,
  isIncompleteManualHawaiiLocation,
  parseHawaiiLocationString,
} from "./utils/hawaiiLocation";

export type ViewType = "landing" | "jobs" | "candidates" | "employer" | "seeker" | "job-posting" | "cart" | "about" | "legal" | "settings" | "profile-title-customization" | "profile-editor" | "seeker-onboarding" | "employer-onboarding" | "employer-profile-edit" | "messages";
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-9b95b3f5`;

const STORAGE_KEY_ANON_SAVED_JOB_IDS = "hanahire_anon_saved_job_ids";
const STORAGE_KEY_PENDING_UNLOCK_JOB_IDS = "hanahire_pending_unlock_job_ids";

/** Truncate string to max length for DB columns to avoid 22001 "value too long" error. Use after widening columns in Supabase if you want no truncation. */
const truncStr = (s: string | null | undefined, maxLen: number): string | null =>
  s == null || s === '' ? null : String(s).slice(0, maxLen);

// Demo account emails for demo flow (go through onboarding but don't create new records)
const DEMO_ACCOUNTS = {
  employer: 'demo@koabeachbistro.com',
  candidate: 'luca.kahananui@email.com'
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("landing");
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [employers, setEmployers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'seeker' | 'employer'>('seeker');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [signupStep, setSignupStep] = useState<'role-select' | 'form'>('role-select');
  const [signupRole, setSignupRole] = useState<'seeker' | 'employer' | null>(null);
  const [signupFormData, setSignupFormData] = useState<Record<string, string>>({});
  const [employerImportWebsite, setEmployerImportWebsite] = useState("");
  const [isEmployerImporting, setIsEmployerImporting] = useState(false);
  
  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showVideoUpdateModal, setShowVideoUpdateModal] = useState(false);
  const [candidateVideoPlayerUrl, setCandidateVideoPlayerUrl] = useState<string | null>(null);
  const [showSeekerConsentModal, setShowSeekerConsentModal] = useState(false);
  const [showEmployerConsentModal, setShowEmployerConsentModal] = useState(false);
  const [pendingEmployerAction, setPendingEmployerAction] = useState<"post-job" | "browse-candidates" | "employer-onboarding" | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  // App State
  const [seekerQueue, setSeekerQueue] = useState<any[]>([]);
  const [employerQueue, setEmployerQueue] = useState<any[]>([]);
  const [unlockedJobIds, setUnlockedJobIds] = useState<any[]>([]);
  const [unlockedCandidateIds, setUnlockedCandidateIds] = useState<any[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]); // full application records (seeker's own)
  const [employerApplications, setEmployerApplications] = useState<any[]>([]); // applications for employer's jobs
  const [paymentTarget, setPaymentTarget] = useState<any>(null);
  const [paymentItems, setPaymentItems] = useState<any[]>([]);
  const [expandedPaymentItemId, setExpandedPaymentItemId] = useState<any>(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [pendingApplyItems, setPendingApplyItems] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [profileViewsCount, setProfileViewsCount] = useState(0);
  const [applicationStatusDraft, setApplicationStatusDraft] = useState("pending");
  const [employerNotesDraft, setEmployerNotesDraft] = useState("");
  const [contactMethodDraft, setContactMethodDraft] = useState("");
  const [contactNotesDraft, setContactNotesDraft] = useState("");
  const [isSavingApplicationReview, setIsSavingApplicationReview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messagesForSelected, setMessagesForSelected] = useState<MessageRow[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesPreselectEmployerId, setMessagesPreselectEmployerId] = useState<number | null>(null);
  const [messagesPreselectCandidateId, setMessagesPreselectCandidateId] = useState<number | null>(null);
  const [selectedConversationCandidateId, setSelectedConversationCandidateId] = useState<number | null>(null);
  const [messageJobPickerCandidateId, setMessageJobPickerCandidateId] = useState<number | null>(null);
  const [messageJobPickerSelectedJobId, setMessageJobPickerSelectedJobId] = useState<number | null>(null);
  const [messageJobPickerTemplateKey, setMessageJobPickerTemplateKey] = useState<string | null>(null);
  const [pendingInitialMessage, setPendingInitialMessage] = useState<string | null>(null);
  const [chooseThreadCandidateId, setChooseThreadCandidateId] = useState<number | null>(null);
  const [chooseThreadOptions, setChooseThreadOptions] = useState<ConversationRow[]>([]);
  const [jobsFromConversations, setJobsFromConversations] = useState<any[]>([]);
  const [candidateJobLinks, setCandidateJobLinks] = useState<Record<string, number[]>>({});
  const [organizeCandidateId, setOrganizeCandidateId] = useState<number | null>(null);
  const [organizeSelectedJobIds, setOrganizeSelectedJobIds] = useState<number[]>([]);
  const loggedCandidateViewsRef = useRef<Set<string>>(new Set());
  const loggedApplicationViewsRef = useRef<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    industries: [] as string[],
    locations: [] as string[],
    payRanges: [] as string[],
    experience: [] as string[],
    education: [] as string[],
    skills: [] as string[],
    jobCategories: [] as string[],
  });
  const [islandFilters, setIslandFilters] = useState<string[]>([]);
  const [userVisibility, setUserVisibility] = useState("broader");
  const [mediaType, setMediaType] = useState<"video" | "voice">("video");
  // Anonymous flow: job IDs paid for but user not yet signed up — show signup modal and process after onboarding
  const [pendingUnlockJobIds, setPendingUnlockJobIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PENDING_UNLOCK_JOB_IDS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    // Load data in background, don't block UI
    fetchInitialData();
  }, []);

  // Fetch applications for the employer's jobs whenever the employer logs in or jobs load
  useEffect(() => {
    if (userRole !== 'employer' || !userProfile?.employerId || jobs.length === 0) return;
    const myJobIds = jobs
      .filter((j: any) => j.employer_id === userProfile.employerId)
      .map((j: any) => j.id);
    if (myJobIds.length === 0) return;
    supabase
      .from('applications')
      .select('id, candidate_id, job_id, status, video_url, video_thumbnail_url, question_answers, applied_at, updated_at, reviewed_at, employer_notes, contact_method, contact_notes')
      .in('job_id', myJobIds)
      .then(({ data }) => { if (data) setEmployerApplications(data); });
  }, [userRole, userProfile?.employerId, jobs]);


  // Always keep a ref to the latest fetchConversations so the polling interval
  // never calls a stale closure. Initialized with a no-op; the update effect
  // below wires in the real function after every render.
  const fetchConversationsRef = useRef<() => void>(() => {});
  useEffect(() => { fetchConversationsRef.current = fetchConversations; });

  // Fetch conversations whenever login state or profile changes so the unread
  // badge is accurate on all tabs.
  useEffect(() => {
    if (!isLoggedIn || !userProfile?.email) return;
    fetchConversationsRef.current();
  }, [isLoggedIn, userProfile?.email, userRole, userProfile?.employerId, userProfile?.candidateId, userProfile?.id, applications?.length, unlockedCandidateIds?.length]);

  // Re-fetch when navigating to messages, seeker dashboard, or employer dashboard.
  useEffect(() => {
    if (!isLoggedIn || !userProfile?.email) return;
    if (currentView !== 'messages' && currentView !== 'seeker' && currentView !== 'employer') return;
    fetchConversationsRef.current();
  }, [currentView]);

  // Sync unlocks with DB when opening seeker or employer dashboard so list matches DB (no stale extra IDs).
  useEffect(() => {
    if (!isLoggedIn || !userProfile?.email) return;
    if (currentView !== 'seeker' && currentView !== 'employer') return;
    fetchUnlocks(userProfile.email);
  }, [currentView, isLoggedIn, userProfile?.email]);

  // Lightweight unread-count query — runs independently of fetchConversations so
  // the nav badge is always accurate even if conversations state is stale.
  // Real-time: any INSERT or UPDATE on messages triggers a fresh conversations fetch.
  useEffect(() => {
    if (!isLoggedIn || !userProfile?.email) return;
    const channel = supabase
      .channel('unread-count-watch')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchConversationsRef.current();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, () => {
        fetchConversationsRef.current();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isLoggedIn, userProfile?.email]);

  // Refresh when the user returns to the browser tab.
  useEffect(() => {
    if (!isLoggedIn || !userProfile?.email) return;
    const onVisible = () => {
      if (!document.hidden) {
        fetchConversationsRef.current();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [isLoggedIn, userProfile?.email]);

  // Poll every 15 s as a final fallback.
  useEffect(() => {
    if (!isLoggedIn || !userProfile?.email) return;
    const interval = setInterval(() => {
      fetchConversationsRef.current();
    }, 15_000);
    return () => clearInterval(interval);
  }, [isLoggedIn, userProfile?.email]);

  useEffect(() => {
    if (userRole !== 'employer' || !isLoggedIn || userProfile?.employerId == null) {
      setCandidateJobLinks({});
      return;
    }
    const employerId = Number(userProfile.employerId);
    if (!employerId) return;
    supabase
      .from('candidate_job_links')
      .select('candidate_id, job_id')
      .eq('employer_id', employerId)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching candidate-job links:", error);
          setCandidateJobLinks({});
          return;
        }
        const map: Record<string, number[]> = {};
        (data || []).forEach((row: any) => {
          const cid = String(row.candidate_id);
          const jid = Number(row.job_id);
          if (!map[cid]) map[cid] = [];
          if (!map[cid].includes(jid)) map[cid].push(jid);
        });
        // Merge in application-derived tags so applicants are always considered tagged.
        (employerApplications || []).forEach((a: any) => {
          const cid = String(a.candidate_id);
          const jid = Number(a.job_id);
          if (!cid || !jid) return;
          if (!map[cid]) map[cid] = [];
          if (!map[cid].includes(jid)) map[cid].push(jid);
        });
        setCandidateJobLinks(map);
      });
  }, [userRole, isLoggedIn, userProfile?.employerId, employerApplications]);

  // Auto-tag candidates to jobs they already applied for (so they show as tagged by default).
  useEffect(() => {
    if (userRole !== 'employer' || !isLoggedIn || userProfile?.employerId == null) return;
    const employerId = Number(userProfile.employerId);
    if (!employerId || !Array.isArray(employerApplications) || employerApplications.length === 0) return;

    const rows = employerApplications
      .map((a: any) => ({ candidate_id: Number(a.candidate_id), job_id: Number(a.job_id) }))
      .filter((x: any) => x.candidate_id && x.job_id);

    if (rows.length === 0) return;
    const uniqueKey = new Set<string>();
    const uniqueRows = rows.filter((r: any) => {
      const k = `${r.candidate_id}:${r.job_id}`;
      if (uniqueKey.has(k)) return false;
      uniqueKey.add(k);
      return true;
    });

    supabase
      .from('candidate_job_links')
      .upsert(
        uniqueRows.map((r: any) => ({ employer_id: employerId, candidate_id: r.candidate_id, job_id: r.job_id })),
        { onConflict: 'employer_id,candidate_id,job_id', ignoreDuplicates: true }
      )
      .then(({ error }) => {
        if (error) console.error("Error upserting application-derived tags:", error);
      });
  }, [userRole, isLoggedIn, userProfile?.employerId, employerApplications]);

  useEffect(() => {
    if (messageJobPickerCandidateId == null || userRole !== 'employer') return;
    // If this candidate is tagged to exactly one job, default to that.
    const linked = candidateJobLinks[String(messageJobPickerCandidateId)] || [];
    if (linked.length === 1) {
      setMessageJobPickerSelectedJobId(linked[0]);
    }
  }, [messageJobPickerCandidateId, userRole, candidateJobLinks]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessagesForSelected([]);
      return;
    }
    fetchMessagesForConversation(selectedConversationId);
  }, [selectedConversationId]);

  useEffect(() => {
    const cid = Number(userProfile?.candidateId ?? userProfile?.id);
    if (currentView !== 'seeker' || !isLoggedIn || !cid) {
      setJobsFromConversations([]);
      return;
    }
    supabase
      .from('conversations')
      .select('id, job_id, employer_id')
      .eq('candidate_id', cid)
      .then(({ data }) => {
        // Deduplicate by job_id (for job-linked convs) and employer_id (across all convs).
        const seenJobIds = new Set<string>();
        const seenEmployerIds = new Set<number>();
        const results: any[] = [];
        for (const conv of (data || [])) {
          const empId = Number(conv.employer_id);
          if (conv.job_id) {
            const jobKey = String(conv.job_id);
            if (seenJobIds.has(jobKey)) continue;
            seenJobIds.add(jobKey);
            seenEmployerIds.add(empId);
            const job = jobs.find((j: any) => Number(j.id) === Number(conv.job_id));
            if (job) results.push({ ...job, _conversationId: conv.id });
          } else {
            // No job tagged — show the employer conversation directly.
            if (seenEmployerIds.has(empId)) continue;
            seenEmployerIds.add(empId);
            const employer = employers.find((e: any) => Number(e.id) === empId);
            results.push({
              id: null,
              _conversationId: conv.id,
              _employerId: conv.employer_id,
              title: employer?.business_name || 'Employer',
              company_name: employer?.business_name || null,
              location: employer?.location || null,
              pay_range: null,
            });
          }
        }
        setJobsFromConversations(results);
      });
  }, [currentView, isLoggedIn, userProfile?.candidateId, userProfile?.id, jobs, employers]);

  // Don't block landing page on initial load
  useEffect(() => {
    // If we're on landing page and data hasn't loaded yet, set loading to false immediately
    if (currentView === "landing") {
      setIsLoading(false);
    }
  }, [currentView]);

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
        const [
          { data: supabaseEmployers },
          { data: supabaseJobs, error: supabaseJobsError },
        ] = await Promise.all([
          supabase.from('employers').select('*'),
          supabase.from('jobs').select('*').eq('status', 'active'),
        ]);

        setCandidates(newData.candidates || []);

        if (supabaseJobsError) console.error("Failed to fetch jobs from Supabase:", supabaseJobsError);
        const employers = supabaseEmployers && supabaseEmployers.length > 0 ? supabaseEmployers : (newData.employers || []);
        const allJobs = supabaseJobs && supabaseJobs.length > 0 ? supabaseJobs : (newData.jobs || []);
        setEmployers(employers);
        setJobs(mergeJobsWithEmployers(allJobs, employers));
        console.log(`Successfully seeded and loaded ${allJobs.length} jobs and ${(newData.candidates || []).length || 0} candidates`);
        toast.success('Marketplace initialized!');
      } else {
        const [
          { data: supabaseEmployers },
          { data: supabaseJobs, error: supabaseJobsError },
        ] = await Promise.all([
          supabase.from('employers').select('*'),
          supabase.from('jobs').select('*').eq('status', 'active'),
        ]);

        setCandidates(data.candidates || []);

        if (supabaseJobsError) console.error("Failed to fetch jobs from Supabase:", supabaseJobsError);
        const employers = supabaseEmployers && supabaseEmployers.length > 0 ? supabaseEmployers : (data.employers || []);
        const allJobs = supabaseJobs && supabaseJobs.length > 0 ? supabaseJobs : (data.jobs || []);
        setEmployers(employers);
        setJobs(mergeJobsWithEmployers(allJobs, employers));
        console.log(`Loaded ${allJobs.length} jobs and ${(data.candidates || []).length || 0} candidates (talent pool = is_profile_complete via /data)`);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Failed to load marketplace data");
      setJobs([]);
      setCandidates([]);
      setEmployers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnlocks = async (email: string) => {
    if (!email) return;

    try {
      // Fetch unlocks from database
      const { data: unlocks, error } = await supabase
        .from('unlocks')
        .select('target_type, target_id')
        .eq('user_email', email)
        .eq('payment_status', 'completed');

      if (error) {
        console.error("Error fetching unlocks:", error);
        return;
      }

      // Always set from DB so we don't leave stale IDs (e.g. 6 in state when DB has 5)
      const list = unlocks ?? [];
      const jobUnlocks = [...new Set(
        list.filter(u => u.target_type === 'job').map(u => Number(u.target_id)).filter(n => !Number.isNaN(n))
      )];
      const candidateUnlocks = [...new Set(
        list.filter(u => u.target_type === 'candidate').map(u => Number(u.target_id)).filter(n => !Number.isNaN(n))
      )];

      setUnlockedJobIds(jobUnlocks);
      setUnlockedCandidateIds(candidateUnlocks);

      if (list.length > 0) {
        console.log(`Loaded ${jobUnlocks.length} job unlocks and ${candidateUnlocks.length} candidate unlocks`);
      }
    } catch (err) {
      console.error("Unexpected error fetching unlocks:", err);
    }
  };

  const fetchSavedItems = async (email: string, role: 'seeker' | 'employer') => {
    if (!email) return;

    try {
      // Fetch saved items from database
      const itemType = role === 'seeker' ? 'job' : 'candidate';
      const { data: savedItems, error } = await supabase
        .from('saved_items')
        .select('item_id')
        .eq('user_email', email)
        .eq('item_type', itemType);

      if (error) {
        console.error("Error fetching saved items:", error);
        return;
      }

      if (savedItems && savedItems.length > 0) {
        const itemIds = savedItems.map(s => s.item_id);

        // Fetch full item data
        if (role === 'seeker') {
          const { data: savedJobs, error: jobsError } = await supabase
            .from('jobs')
            .select('*')
            .in('id', itemIds);

          if (!jobsError && savedJobs) {
            // Merge saved jobs with employer data
            const mergedSavedJobs = mergeJobsWithEmployers(savedJobs, employers);
            setSeekerQueue(mergedSavedJobs);
            console.log(`Loaded ${mergedSavedJobs.length} saved jobs`);
          }
        } else {
          const { data: savedCandidates, error: candidatesError } = await supabase
            .from('candidates')
            .select('*')
            .in('id', itemIds);

          if (!candidatesError && savedCandidates) {
            setEmployerQueue(savedCandidates);
            console.log(`Loaded ${savedCandidates.length} saved candidates`);
          }
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching saved items:", err);
    }
  };

  const fetchApplications = async (candidateId: number) => {
    if (!candidateId) return;

    try {
      // NOTE: applications table requires columns: job_id, status, applied_at, updated_at, reviewed_at
      // If reviewed_at is missing from your schema, run:
      //   ALTER TABLE applications ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
      //   ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
      const { data: appData, error } = await supabase
        .from('applications')
        .select('id, job_id, status, video_url, video_thumbnail_url, question_answers, applied_at, updated_at, reviewed_at, contact_method')
        .eq('candidate_id', candidateId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        return;
      }

      setApplications(appData || []);
      setAppliedJobIds((appData || []).map(a => a.job_id));
      console.log(`Loaded ${(appData || []).length} job applications`);
    } catch (err) {
      console.error("Unexpected error fetching applications:", err);
    }
  };

  const fetchConversations = async () => {
    const email = userProfile?.email;
    if (!email) return;
    const role = userRole;
    const employerId = userProfile?.employerId;
    const candidateId = userProfile?.candidateId ?? userProfile?.id;
    if (role === 'seeker' && !candidateId) return;
    if (role === 'employer' && employerId == null) return;

    setIsLoadingConversations(true);
    try {
      const col = role === 'seeker' ? 'candidate_id' : 'employer_id';
      const id = role === 'seeker' ? candidateId : employerId;
      const { data: rows, error } = await supabase
        .from('conversations')
        .select('id, employer_id, candidate_id, job_id, created_at')
        .eq(col, id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        setConversations([]);
        setIsLoadingConversations(false);
        return;
      }

      const convList = rows || [];
      const convIds = convList.map((c: any) => c.id);
      let lastMessages: { conversation_id: string; body: string; subject: string | null; sent_at: string }[] = [];
      let unreadCounts: { conversation_id: string; count: number }[] = [];
      if (convIds.length > 0) {
        const { data: msgRows } = await supabase
          .from('messages')
          .select('id, conversation_id, to_email, subject, body, sent_at, is_read')
          .in('conversation_id', convIds)
          .order('sent_at', { ascending: false });
        const byConv = new Map<string, { body: string; subject: string | null; sent_at: string }>();
        const unreadByConv = new Map<string, number>();
        const myEmail = email.toLowerCase();
        (msgRows || []).forEach((m: any) => {
          if (!byConv.has(m.conversation_id)) byConv.set(m.conversation_id, { body: m.body, subject: m.subject ?? null, sent_at: m.sent_at });
          if (m.to_email?.toLowerCase() === myEmail && !m.is_read) {
            unreadByConv.set(m.conversation_id, (unreadByConv.get(m.conversation_id) || 0) + 1);
          }
        });
        console.log('[badge debug] role:', role, 'email:', email, 'convs:', convList.length, 'msgs:', (msgRows||[]).length, 'unread by conv:', Object.fromEntries(unreadByConv), 'sample msg is_read values:', (msgRows||[]).slice(0,3).map((m:any) => ({ to: m.to_email, is_read: m.is_read })));
        lastMessages = Array.from(byConv.entries()).map(([k, v]) => ({ conversation_id: k, ...v }));
        unreadCounts = Array.from(unreadByConv.entries()).map(([conversation_id, count]) => ({ conversation_id, count }));
      }

      const appliedEmployerIds = new Set(
        (applications || []).map((a: any) => jobs.find((j: any) => j.id === a.job_id)?.employer_id).filter(Boolean)
      );
      const businessInitials = (name: string) => {
        const words = (name || '').trim().split(/\s+/).filter(Boolean);
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        if (words[0]?.length >= 2) return words[0].slice(0, 2).toUpperCase();
        return words[0]?.[0]?.toUpperCase() ?? '';
      };
      const personInitials = (name: string) => {
        const parts = (name || '').trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        if (parts[0]?.length >= 2) return parts[0].slice(0, 2).toUpperCase();
        return parts[0]?.[0]?.toUpperCase() ?? '';
      };

      const list: ConversationRow[] = convList.map((c: any) => {
        const isSeeker = role === 'seeker';
        const otherEmployer = employers.find((e: any) => e.id === c.employer_id);
        const otherCandidate = candidates.find((x: any) => x.id === c.candidate_id);
        const otherPartyName = isSeeker ? (otherEmployer?.business_name || otherEmployer?.email || 'Employer') : (otherCandidate?.name || otherCandidate?.email || 'Candidate');
        const otherPartySubtitle = isSeeker ? otherEmployer?.industry : otherCandidate?.display_title;
        const otherPartyAvatarUrl = isSeeker
          ? (otherEmployer?.company_logo_url ?? null)
          : (otherCandidate?.video_thumbnail_url ?? otherCandidate?.video_url ?? null);
        const otherPartyInitials = isSeeker
          ? businessInitials(otherEmployer?.business_name || otherPartyName)
          : personInitials(otherCandidate?.name || otherPartyName);
        const last = lastMessages.find((l: any) => l.conversation_id === c.id);
        const unread = unreadCounts.find((u: any) => u.conversation_id === c.id)?.count ?? 0;
        const canRead = isSeeker
          ? (c.job_id != null
              ? (applications || []).some((a: any) => Number(a.job_id) === Number(c.job_id))
              : appliedEmployerIds.has(Number(c.employer_id)))
          : unlockedCandidateIds.some((id: any) => Number(id) === Number(c.candidate_id));
        const job = c.job_id ? jobs.find((j: any) => j.id === c.job_id) : null;
        return {
          id: c.id,
          employer_id: c.employer_id,
          candidate_id: c.candidate_id,
          job_id: c.job_id ?? undefined,
          jobTitle: job?.title ?? null,
          otherPartyName,
          otherPartySubtitle: otherPartySubtitle || undefined,
          otherPartyAvatarUrl: otherPartyAvatarUrl || null,
          otherPartyInitials: otherPartyInitials || undefined,
          lastMessagePreview: last ? (last.body?.slice(0, 60) + (last.body?.length > 60 ? '…' : '')) : null,
          lastMessageSubject: last?.subject ?? null,
          lastMessageAt: last?.sent_at ?? null,
          unreadCount: unread,
          canRead,
        };
      });
      setConversations(list);

      if (messagesPreselectEmployerId != null || messagesPreselectCandidateId != null) {
        const preselect = role === 'seeker'
          ? list.find((c) => c.employer_id === messagesPreselectEmployerId)
          : list.find((c) => c.candidate_id === messagesPreselectCandidateId);
        if (preselect) setSelectedConversationId(preselect.id);
        setMessagesPreselectEmployerId(null);
        setMessagesPreselectCandidateId(null);
      }
    } catch (err) {
      console.error("Unexpected error fetching conversations:", err);
      setConversations([]);
    }
    setIsLoadingConversations(false);
  };

  const getOrCreateConversation = async (employerId: number, candidateId: number, jobId?: number | null): Promise<string | null> => {
    try {
      const { data: existing } = await supabase
        .from('conversations')
        .select('id, job_id')
        .eq('employer_id', employerId)
        .eq('candidate_id', candidateId)
        .maybeSingle();
      if (existing?.id) {
        if (jobId != null && existing.job_id == null) {
          await supabase.from('conversations').update({ job_id: jobId }).eq('id', existing.id);
        }
        return existing.id;
      }
      const { data: inserted, error } = await supabase
        .from('conversations')
        .insert([{ employer_id: employerId, candidate_id: candidateId, job_id: jobId ?? null }])
        .select('id')
        .single();
      if (error) {
        console.error("Error creating conversation:", error);
        return null;
      }
      return inserted?.id ?? null;
    } catch (err) {
      console.error("Unexpected error getOrCreateConversation:", err);
      return null;
    }
  };

  const fetchMessagesForConversation = async (conversationId: string) => {
    setMessagesForSelected([]);
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, from_email, to_email, body, sent_at, is_read, read_at')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true });
      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }
      setMessagesForSelected(data || []);
    } catch (err) {
      console.error("Unexpected error fetching messages:", err);
    }
    setIsLoadingMessages(false);
  };

  const markConversationMessagesRead = useCallback(async (conversationId: string) => {
    const email = userProfile?.email;
    if (!email) return;
    const recipientId = userRole === 'seeker'
      ? (userProfile?.candidateId ?? userProfile?.id)
      : userProfile?.employerId;
    const recipientType = userRole === 'seeker' ? 'seeker' : 'employer';
    try {
      // Update messages first (primary source of read state)
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('to_email', email);

      // Update notifications separately so a 400 here doesn't block or spam
      if (recipientId != null && typeof conversationId === 'string' && conversationId.length > 0) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .eq('recipient_id', recipientId)
          .eq('recipient_type', recipientType);
        if (error) {
          // Log once; often RLS or missing row — don't retry or spam console
          if (import.meta.env.DEV) console.warn('Notifications mark read:', error.message);
        }
      }

      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error("Error marking messages read:", err);
    }
  }, [userProfile?.email, userProfile?.candidateId, userProfile?.id, userProfile?.employerId, userRole]);

  const sendMessage = async (conversationId: string, body: string) => {
    const email = userProfile?.email;
    if (!email?.trim() || !body.trim()) return;
    try {
      const conv = conversations.find((c) => c.id === conversationId);
      if (!conv) return;
      const toEmail = userRole === 'seeker'
        ? (employers.find((e: any) => e.id === conv.employer_id)?.email)
        : (candidates.find((c: any) => c.id === conv.candidate_id)?.email);
      if (!toEmail) return;
      const isFirstMessage = messagesForSelected.length === 0;
      const subject = isFirstMessage
        ? (conv.job_id
            ? `Re: ${jobs.find((j: any) => j.id === conv.job_id)?.title ?? 'Job Opportunity'}`
            : userRole === 'employer'
              ? `Opportunity at ${userProfile?.businessName ?? 'our company'}`
              : `Message from ${userProfile?.name ?? 'a candidate'}`)
        : null;
      const { error } = await supabase.from('messages').insert([{
        conversation_id: conversationId,
        from_email: email,
        to_email: toEmail,
        body: body.trim(),
        subject,
      }]);
      if (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message.");
        return;
      }

      // Notify the recipient of the new message.
      try {
        const recipientId = userRole === 'seeker' ? conv.employer_id : conv.candidate_id;
        const recipientType = userRole === 'seeker' ? 'employer' : 'seeker';
        await supabase.from('notifications').insert([{
          recipient_id: recipientId,
          recipient_type: recipientType,
          type: 'new_message',
          conversation_id: conversationId,
          is_read: false,
          created_at: new Date().toISOString(),
        }]);
      } catch (notifErr) {
        console.error("Error inserting notification:", notifErr);
      }

      // If employer is the sender and this conversation is tied to a job,
      // mark the corresponding application as contacted via messaging.
      if (userRole === 'employer' && conv.job_id && conv.candidate_id) {
        try {
          const jobId = Number(conv.job_id);
          const candidateId = Number(conv.candidate_id);
          if (jobId && candidateId) {
            const { data: appRow, error: appErr } = await supabase
              .from('applications')
              .select('id, contact_method')
              .eq('candidate_id', candidateId)
              .eq('job_id', jobId)
              .order('applied_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            if (!appErr && appRow && appRow.id && !appRow.contact_method) {
              const applicationId = appRow.id;
              const updatedAt = new Date().toISOString();
              const payload: any = { contact_method: 'messaging', updated_at: updatedAt };
              const { error: updErr } = await supabase
                .from('applications')
                .update(payload)
                .eq('id', applicationId);
              if (!updErr) {
                setEmployerApplications((prev) =>
                  prev.map((a: any) =>
                    Number(a.id) === Number(applicationId) ? { ...a, ...payload } : a
                  )
                );
              }
            }
          }
        } catch (markErr) {
          console.error("Error marking application contacted via messaging:", markErr);
        }
      }

      await fetchMessagesForConversation(conversationId);
      await fetchConversations();
    } catch (err) {
      console.error("Unexpected error sending message:", err);
      toast.error("Failed to send message.");
    }
  };

  const updateMessage = async (conversationId: string, messageId: number, newBody: string) => {
    const email = userProfile?.email;
    if (!email?.trim() || !newBody.trim()) return;
    try {
      const { error } = await supabase
        .from('messages')
        .update({ body: newBody.trim() })
        .eq('id', messageId)
        .eq('from_email', email);
      if (error) {
        console.error("Error updating message:", error);
        toast.error("Failed to update message.");
        return;
      }
      await fetchMessagesForConversation(conversationId);
      await fetchConversations();
      toast.success("Message updated.");
    } catch (err) {
      console.error("Unexpected error updating message:", err);
      toast.error("Failed to update message.");
    }
  };

  const deleteMessage = async (conversationId: string, messageId: number) => {
    const email = userProfile?.email;
    if (!email?.trim()) return;
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('from_email', email);
      if (error) {
        console.error("Error deleting message:", error);
        toast.error("Failed to delete message.");
        return;
      }
      await fetchMessagesForConversation(conversationId);
      await fetchConversations();
      toast.success("Message deleted.");
    } catch (err) {
      console.error("Unexpected error deleting message:", err);
      toast.error("Failed to delete message.");
    }
  };

  const fetchSeekerProfileViews = async (candidateId: number) => {
    if (!candidateId) return;
    try {
      const [{ data: viewRows }, { data: candidateRow }] = await Promise.all([
        supabase
          .from('views')
          .select('viewer_email')
          .eq('target_type', 'candidate_profile')
          .eq('target_id', candidateId),
        supabase
          .from('candidates')
          .select('profile_views')
          .eq('id', candidateId)
          .maybeSingle(),
      ]);

      const uniqueEmployerViews = new Set(
        (viewRows || [])
          .map((row: any) => row.viewer_email)
          .filter(Boolean)
      ).size;

      setProfileViewsCount(uniqueEmployerViews || candidateRow?.profile_views || 0);
    } catch (err) {
      console.error("Unexpected error fetching seeker profile views:", err);
    }
  };

  useEffect(() => {
    if (userRole !== 'seeker') return;
    const candidateId = userProfile?.candidateId ?? userProfile?.id;
    if (!candidateId) return;
    fetchSeekerProfileViews(Number(candidateId));
  }, [userRole, userProfile?.candidateId, userProfile?.id]);

  useEffect(() => {
    if (userRole !== 'employer' || !selectedCandidate || !userProfile?.email) return;

    const candidateViewKey = `${userProfile.email}-${selectedCandidate.id}`;
    const applicationId = selectedCandidate.application?.id;
    const applicationViewKey = applicationId ? `${userProfile.email}-${applicationId}` : null;

    setApplicationStatusDraft(selectedCandidate.application?.status || "pending");
    setEmployerNotesDraft(selectedCandidate.application?.employer_notes || "");
    const savedContactMethod = selectedCandidate.application?.contact_method || "";
    const hasMessaged = conversations.some(
      (c: any) => Number(c.employer_id) === Number(userProfile?.employerId) && Number(c.candidate_id) === Number(selectedCandidate.id)
    );
    setContactMethodDraft(savedContactMethod || (hasMessaged ? "messaged" : ""));
    setContactNotesDraft(selectedCandidate.application?.contact_notes || "");

    const markViewed = async () => {
      try {
        if (!loggedCandidateViewsRef.current.has(candidateViewKey)) {
          loggedCandidateViewsRef.current.add(candidateViewKey);
          await supabase.from('views').insert([{
            viewer_email: userProfile.email,
            target_type: 'candidate_profile',
            target_id: selectedCandidate.id,
          }]);
        }

        if (applicationId && applicationViewKey && !loggedApplicationViewsRef.current.has(applicationViewKey)) {
          loggedApplicationViewsRef.current.add(applicationViewKey);
          await supabase.from('views').insert([{
            viewer_email: userProfile.email,
            target_type: 'application',
            target_id: applicationId,
          }]);

          if (!selectedCandidate.application?.reviewed_at) {
            const reviewedAt = new Date().toISOString();
            const { error } = await supabase
              .from('applications')
              .update({ reviewed_at: reviewedAt, updated_at: reviewedAt })
              .eq('id', applicationId);
            if (!error) {
              setEmployerApplications(prev =>
                prev.map((application: any) =>
                  application.id === applicationId
                    ? { ...application, reviewed_at: reviewedAt, updated_at: reviewedAt }
                    : application
                )
              );
              setSelectedCandidate((prev: any) =>
                prev && prev.application?.id === applicationId
                  ? { ...prev, application: { ...prev.application, reviewed_at: reviewedAt, updated_at: reviewedAt } }
                  : prev
              );
            }
          }
        }
      } catch (err) {
        console.error("Error recording candidate/application view:", err);
      }
    };

    markViewed();
  }, [selectedCandidate?.id, selectedCandidate?.application?.id, userRole, userProfile?.email, userProfile?.employerId, conversations]);

  const handleNavigate = (view: ViewType, options?: { selectConversation?: string }) => {
    // Employer consent gate — intercept navigation to protected employer views
    if ((view === 'candidates' || view === 'employer-onboarding') && userRole === 'employer' && !userProfile?.eeoc_consent_accepted) {
      setPendingEmployerAction(view === 'candidates' ? "browse-candidates" : "employer-onboarding");
      setShowEmployerConsentModal(true);
      return;
    }
    if (view === 'messages' && !options?.selectConversation) {
      setSelectedConversationId(null);
    } else if (options?.selectConversation) {
      setSelectedConversationId(options.selectConversation);
    }
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const selectRole = (selectedRole: 'seeker' | 'employer') => {
    if (selectedRole === 'employer') {
      handleNavigate(isLoggedIn ? "employer" : "candidates");
    } else {
      handleNavigate(isLoggedIn ? "seeker" : "jobs");
    }
    setUserRole(selectedRole);
  };

  const toggleRole = () => {
    const newRole = userRole === 'seeker' ? 'employer' : 'seeker';
    selectRole(newRole);
    toast.success(`Switched to ${newRole === 'seeker' ? 'Job Seeker' : 'Employer'} view`);
  };

  // Hydrate seeker queue from localStorage when anonymous and jobs are available
  useEffect(() => {
    if (isLoggedIn || userProfile?.email || !jobs?.length) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ANON_SAVED_JOB_IDS);
      if (!raw) return;
      const ids: number[] = JSON.parse(raw);
      if (!ids.length) return;
      const merged = mergeJobsWithEmployers(jobs.filter((j: any) => ids.includes(j.id)), employers);
      setSeekerQueue(merged);
    } catch {
      // ignore
    }
  }, [jobs, employers, isLoggedIn, userProfile?.email]);

  // Sync pendingUnlockJobIds to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pendingUnlockJobIds.length) {
      localStorage.setItem(STORAGE_KEY_PENDING_UNLOCK_JOB_IDS, JSON.stringify(pendingUnlockJobIds));
    } else {
      localStorage.removeItem(STORAGE_KEY_PENDING_UNLOCK_JOB_IDS);
    }
  }, [pendingUnlockJobIds]);

  // Sync local editable items list whenever a new payment is initiated
  useEffect(() => {
    if (paymentTarget?.items) {
      setPaymentItems([...paymentTarget.items]);
      setExpandedPaymentItemId(null);
    }
  }, [paymentTarget]);

  const processPayment = async () => {
    if (!paymentTarget) return;

    try {
      if (paymentItems.length === 0) return;
      // Process payment locally without API
      const itemIds = paymentItems.map((i: any) => i.id);

      if (paymentTarget.type === 'seeker') {
        // Anonymous: require signup first; process unlocks after onboarding. Skip role-select (they already applied as seeker).
        if (!userProfile?.email) {
          setPendingUnlockJobIds(itemIds);
          setShowPaymentModal(false);
          setPaymentTarget(null);
          setAuthMode('signup');
          setSignupStep('form');
          setSignupRole('seeker');
          setShowAuthModal(true);
          toast.success("Payment successful! Create your profile to access the job(s).");
          return;
        }

        await finalizeApplications(paymentItems);
      } else {
        // Save unlocks to database
        if (userProfile?.email) {
          const unlockRecords = itemIds.map(candidateId => ({
            user_email: userProfile.email,
            user_role: 'employer',
            target_type: 'candidate',
            target_id: candidateId,
            amount_paid: INTERACTION_FEE,
            payment_method: 'card',
            payment_status: 'completed'
          }));

          const { error: unlockError } = await supabase
            .from('unlocks')
            .insert(unlockRecords);

          if (unlockError) {
            console.error("Error saving unlock:", unlockError);
          }

          // Remove from saved_items after unlocking
          const { error: deleteError } = await supabase
            .from('saved_items')
            .delete()
            .eq('user_email', userProfile.email)
            .eq('item_type', 'candidate')
            .in('item_id', itemIds);

          if (deleteError) {
            console.error("Error removing from saved items:", deleteError);
          }
        }

        setUnlockedCandidateIds([...unlockedCandidateIds, ...itemIds]);
        setEmployerQueue(employerQueue.filter(q => !itemIds.includes(q.id)));
        setShowPaymentModal(false);
        toast.success("Unlocked!", { description: "Full profiles and contact info are now visible." });
        handleNavigate("employer");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Unlock failed. Please try again.");
    }
  };

  const finalizeApplications = async (items: any[]) => {
    try {
      const itemIds = items.map((i: any) => i.id);

      const unlockRecords = itemIds.map((jobId: number) => ({
        user_email: userProfile.email,
        user_role: 'seeker',
        target_type: 'job',
        target_id: jobId,
        amount_paid: INTERACTION_FEE,
        payment_method: 'card',
        payment_status: 'completed'
      }));
      const { error: unlockError } = await supabase.from('unlocks').insert(unlockRecords);
      if (unlockError) console.error("Error saving unlock:", unlockError);

      const { error: deleteError } = await supabase
        .from('saved_items')
        .delete()
        .eq('user_email', userProfile.email)
        .eq('item_type', 'job')
        .in('item_id', itemIds);
      if (deleteError) console.error("Error removing from saved items:", deleteError);

      setUnlockedJobIds(prev => [...prev, ...itemIds]);
      setSeekerQueue(seekerQueue.filter((q: any) => !itemIds.includes(q.id)));
      setShowPaymentModal(false);
      setShowQuestionsModal(false);
      setPendingApplyItems([]);
      toast.success("Job unlocked!", { description: "Business details are now visible. Apply from your unlocked jobs when you're ready." });
      handleNavigate("seeker");
    } catch (err) {
      console.error("Application error:", err);
      toast.error("Application failed. Please try again.");
    }
  };

  const submitApplicationAnswers = async (job: any, submission: ApplicationSubmissionPayload) => {
    setShowQuestionsModal(false);
    setPendingApplyItems([]);
    const candidateId = Number(userProfile?.candidateId ?? userProfile?.id);
    if (!candidateId) return;
    const normalizedAnswers = Array.isArray(submission.question_answers)
      ? submission.question_answers
      : [];
    try {
      const now = new Date().toISOString();
      const { data: savedApplication, error } = await supabase
        .from('applications')
        .upsert(
          [{
            candidate_id: candidateId,
            job_id: job.id,
            status: 'pending',
            updated_at: now,
            question_answers: normalizedAnswers,
            video_url: submission.mode === 'video' ? (submission.video_url || null) : null,
            video_thumbnail_url: submission.mode === 'video' ? (submission.video_thumbnail_url || null) : null,
          }],
          { onConflict: 'candidate_id,job_id' }
        )
        .select('id, job_id, status, video_url, video_thumbnail_url, question_answers, applied_at, updated_at, reviewed_at')
        .single();
      if (error) throw error;

      // Update local applications state
      setApplications(prev => {
        const existing = prev.find(a => a.job_id === job.id);
        if (existing) {
          return prev.map(a => a.job_id === job.id ? {
            ...a,
            ...(savedApplication || {}),
          } : a);
        }
        return [...prev, (savedApplication || {
          job_id: job.id,
          status: 'pending',
          applied_at: now,
          updated_at: now,
          reviewed_at: null,
          question_answers: normalizedAnswers,
          video_url: submission.mode === 'video' ? (submission.video_url || null) : null,
          video_thumbnail_url: submission.mode === 'video' ? (submission.video_thumbnail_url || null) : null,
        })];
      });
      setAppliedJobIds(prev => Array.from(new Set([...prev, job.id])));
      toast.success("Application submitted!", { description: "Your application has been sent to the employer." });
    } catch (err) {
      console.error("Application submission error:", err);
      toast.error("Failed to submit your application. Please try again.");
    }
  };

  const saveEmployerApplicationReview = async () => {
    if (userRole !== 'employer' || !selectedCandidate?.application?.id) return;
    setIsSavingApplicationReview(true);
    try {
      const applicationId = selectedCandidate.application.id;
      const updatedAt = new Date().toISOString();
      const reviewedAt = selectedCandidate.application.reviewed_at || updatedAt;
      const payload = {
        status: applicationStatusDraft,
        employer_notes: employerNotesDraft.trim() || null,
        contact_method: contactMethodDraft.trim() || null,
        contact_notes: contactNotesDraft.trim() || null,
        reviewed_at: reviewedAt,
        updated_at: updatedAt,
      };

      const { error } = await supabase
        .from('applications')
        .update(payload)
        .eq('id', applicationId);

      if (error) throw error;

      setEmployerApplications(prev =>
        prev.map((application: any) =>
          application.id === applicationId ? { ...application, ...payload } : application
        )
      );
      setSelectedCandidate((prev: any) =>
        prev && prev.application?.id === applicationId
          ? { ...prev, status: payload.status, application: { ...prev.application, ...payload } }
          : prev
      );

      toast.success("Application updated");
    } catch (err) {
      console.error("Error updating application:", err);
      toast.error("Failed to update application");
    } finally {
      setIsSavingApplicationReview(false);
    }
  };

  const markEmployerContacted = async (applicationId: number, method: 'phone' | 'email') => {
    if (userRole !== 'employer' || !applicationId) return;
    try {
      // De-duplicate: contact_method records the *first* outreach channel only.
      const existing = employerApplications.find((a: any) => Number(a.id) === Number(applicationId));
      if (existing?.contact_method) {
        toast("Already marked as contacted via " + existing.contact_method);
        return;
      }
      const updatedAt = new Date().toISOString();
      const payload: any = { contact_method: method, updated_at: updatedAt };
      const { error } = await supabase.from('applications').update(payload).eq('id', applicationId);
      if (error) throw error;
      setEmployerApplications((prev) =>
        prev.map((a: any) => (Number(a.id) === Number(applicationId) ? { ...a, ...payload } : a))
      );
      toast.success("Marked as contacted");
    } catch (err) {
      console.error("Error marking contacted:", err);
      toast.error("Failed to mark contacted");
    }
  };

  const toggleSelectedJobFilledStatus = async () => {
    if (userRole !== 'employer' || !selectedJob?.id) return;
    const nextStatus = selectedJob.status === 'filled' ? 'active' : 'filled';
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', selectedJob.id);
      if (error) throw error;

      setJobs(prev => prev.map((job: any) => job.id === selectedJob.id ? { ...job, status: nextStatus } : job));
      setSelectedJob((prev: any) => prev ? { ...prev, status: nextStatus } : prev);
      toast.success(nextStatus === 'filled' ? "Job marked filled" : "Job reopened");
    } catch (err) {
      console.error("Error updating job status:", err);
      toast.error("Failed to update job status");
    }
  };

  const locationMatchesFilters = useMemo(
    () =>
      createLocationMatcher({
        selectedLocations: filters.locations,
        islandFilters,
      }),
    [filters.locations, islandFilters]
  );

  const totalUnreadMessages = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);

  const filteredJobs = jobs.filter(j =>
    j.status !== 'filled' &&
    (filters.industries.length === 0 || filters.industries.includes(j.company_industry)) &&
    locationMatchesFilters(j.location) &&
    (filters.payRanges.length === 0 || filters.payRanges.includes(j.pay_range)) &&
    (filters.jobCategories.length === 0 || (j.job_category && filters.jobCategories.includes(j.job_category))) &&
    (searchQuery === "" || 
      (j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) || 
      (j.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    )
  );

  const filteredCandidates = useMemo(
    () => candidates.filter((c: any) => c.is_profile_complete === true),
    [candidates],
  );

  const clearFilters = () => {
    setFilters({
      industries: [],
      locations: [],
      payRanges: [],
      experience: [],
      education: [],
      skills: [],
      jobCategories: [],
    });
    setIslandFilters([]);
  };

  const setMultiSelectFilter = (
    category: keyof typeof filters,
    values: string[]
  ) => {
    setFilters((prev) => ({ ...prev, [category]: values }));
  };

  const renderScreen = () => {
    // Show landing page immediately, don't block on data loading
    if (currentView === "landing") {
      return <Home onSelectRole={selectRole} onNavigate={handleNavigate} />;
    }
    
    // Don't block onboarding flows on initial data loading (otherwise it can look like a white screen)
    // Only block views that truly depend on marketplace data being present.
    const nonBlockingViews: ViewType[] = ["seeker-onboarding", "employer-onboarding"];
    if (isLoading && !nonBlockingViews.includes(currentView)) {
      return (
        <div className="h-screen flex items-center justify-center font-black text-gray-400 uppercase tracking-[0.5em]">
          Loading Market...
        </div>
      );
    }

    switch (currentView) {
      case "about":
        return <About onSelectRole={selectRole} onNavigate={handleNavigate} />;
      case "legal":
        return <LegalCompliance onNavigate={handleNavigate} />;
      case "settings":
        return <Settings onRefreshData={fetchInitialData} />;
      case "jobs":
  return (
    <JobsList
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filteredJobs={filteredJobs}
      unlockedJobIds={unlockedJobIds}
      appliedJobIds={appliedJobIds}
      seekerQueue={seekerQueue}
      onAddToQueue={async (j) => {
        if (seekerQueue.find(q => q.id === j.id)) return;

        if (userProfile?.email) {
          const { error } = await supabase
            .from('saved_items')
            .insert([{
              user_email: userProfile.email,
              user_role: 'seeker',
              item_type: 'job',
              item_id: j.id
            }]);
          if (error && error.code !== '23505') {
            console.error("Error saving item:", error);
          }
        }

        const nextQueue = [...seekerQueue, j];
        setSeekerQueue(nextQueue);
        if (!userProfile?.email && typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY_ANON_SAVED_JOB_IDS, JSON.stringify(nextQueue.map((q: any) => q.id)));
          } catch {
            // ignore
          }
        }
        toast.success("Added to Queue");
      }}
      onRemoveFromQueue={async (id) => {
        if (userProfile?.email) {
          const { error } = await supabase
            .from('saved_items')
            .delete()
            .eq('user_email', userProfile.email)
            .eq('item_type', 'job')
            .eq('item_id', id);
          if (error) {
            console.error("Error removing saved item:", error);
          }
        }

        const nextQueue = seekerQueue.filter(q => q.id !== id);
        setSeekerQueue(nextQueue);
        if (!userProfile?.email && typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY_ANON_SAVED_JOB_IDS, JSON.stringify(nextQueue.map((q: any) => q.id)));
          } catch {
            // ignore
          }
        }
        toast.success("Removed from saved");
      }}
      onShowPayment={(t) => { setPaymentTarget(t); setShowPaymentModal(true); }}
      onShowFilters={() => setShowFilterModal(true)}
      onSelectJob={(job) => setSelectedJob(job)}
      interactionFee={INTERACTION_FEE}
      viewerLocation={userProfile?.location}
      employers={employers}
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
      onAddToQueue={async (c) => {
        if (employerQueue.find(q => q.id === c.id)) return;

        // Save to database
        if (userProfile?.email) {
          const { error } = await supabase
            .from('saved_items')
            .insert([{
              user_email: userProfile.email,
              user_role: 'employer',
              item_type: 'candidate',
              item_id: c.id
            }]);

          if (error && error.code !== '23505') { // Ignore unique constraint violations
            console.error("Error saving item:", error);
          }
        }

        setEmployerQueue([...employerQueue, c]);
        toast.success("Added to Queue");
      }}
      onRemoveFromQueue={async (id) => {
        // Remove from database
        if (userProfile?.email) {
          const { error } = await supabase
            .from('saved_items')
            .delete()
            .eq('user_email', userProfile.email)
            .eq('item_type', 'candidate')
            .eq('item_id', id);

          if (error) {
            console.error("Error removing saved item:", error);
          }
        }

        setEmployerQueue(employerQueue.filter(q => q.id !== id));
        toast.success("Removed from saved");
      }}
      onShowPayment={(t) => { setPaymentTarget(t); setShowPaymentModal(true); }}
      onShowFilters={() => setShowFilterModal(true)}
      onSelectCandidate={(c) => { setSelectedCandidate(c); setCandidateVideoPlayerUrl(null); }}
      interactionFee={INTERACTION_FEE}
      viewerLocation={userProfile?.location}
      viewerIndustry={userProfile?.industry}
      onOpenMessageWithCandidate={userRole === 'employer' && userProfile?.employerId != null ? (candidateId) => {
        const cid = typeof candidateId === 'number' ? candidateId : Number(candidateId);
        if (!cid) return;
        setMessageJobPickerCandidateId(cid);
        setMessageJobPickerSelectedJobId(null);
      } : undefined}
    />
  );
      case "cart":
        return (
          <Cart 
            role={userRole}
            queue={userRole === 'seeker' ? seekerQueue : employerQueue}
            onRemoveFromQueue={async (id) => {
              // Remove from database
              if (userProfile?.email) {
                const itemType = userRole === 'seeker' ? 'job' : 'candidate';
                const { error } = await supabase
                  .from('saved_items')
                  .delete()
                  .eq('user_email', userProfile.email)
                  .eq('item_type', itemType)
                  .eq('item_id', id);

                if (error) {
                  console.error("Error removing saved item:", error);
                }
              }

              if (userRole === 'seeker') setSeekerQueue(seekerQueue.filter(q => q.id !== id));
              else setEmployerQueue(employerQueue.filter(q => q.id !== id));
              toast.success("Removed from saved");
            }}
            onNavigate={handleNavigate}
            onShowPayment={(t) => { setPaymentTarget(t); setShowPaymentModal(true); }}
            interactionFee={INTERACTION_FEE}
            isPaymentModalOpen={showPaymentModal}
          />
        );
      case "seeker":
        return (
          <SeekerDashboard
            isLoggedIn={isLoggedIn}
            userProfile={userProfile}
            onNavigate={handleNavigate}
            onShowMedia={() => setShowVideoUpdateModal(true)}
            onShowVisibility={() => setShowVisibilityModal(true)}
            onShowAuth={handleShowAuth}
            onLogout={handleLogout}
            unlockedJobs={jobs.filter(j => unlockedJobIds.includes(j.id))}
            onSelectJob={setSelectedJob}
            onAnswerQuestions={(job) => { setPendingApplyItems([job]); setShowQuestionsModal(true); }}
            applications={applications}
            profileViewsCount={profileViewsCount}
            applicationCount={applications.length}
            onOpenMessageWithEmployer={(employerId: number) => {
              const eid = typeof employerId === 'number' ? employerId : Number(employerId);
              const candidateId = userProfile?.candidateId ?? userProfile?.id;
              if (!eid || !candidateId) return;
              getOrCreateConversation(eid, candidateId).then((id) => {
                setMessagesPreselectEmployerId(null);
                handleNavigate("messages", id ? { selectConversation: id } : undefined);
              });
            }}
            jobsFromConversations={jobsFromConversations}
            conversationsByJobId={conversations.reduce((acc, c) => {
              if (c.job_id != null) acc[c.job_id] = c;
              // Also key by conversation id so orphan (no job_id) cards can find their conv.
              acc[c.id] = c;
              return acc;
            }, {} as Record<string | number, any>)}
            onSelectConversation={(convId) => {
              handleNavigate("messages", { selectConversation: convId });
            }}
          />
        );
      case "employer":
        return (
          <EmployerDashboard
            isLoggedIn={isLoggedIn}
            userProfile={userProfile}
            jobs={jobs}
            candidates={candidates}
            unlockedCandidateIds={unlockedCandidateIds}
            applications={employerApplications}
            onNavigate={handleNavigate}
            onShowPostJob={() => {
              if (!userProfile?.eeoc_consent_accepted) {
                setPendingEmployerAction("post-job");
                setShowEmployerConsentModal(true);
              } else {
                handleNavigate("job-posting");
              }
            }}
            onSelectJob={setSelectedJob}
            onSelectCandidate={(c) => { setSelectedCandidate(c); setCandidateVideoPlayerUrl(null); }}
            onShowPayment={(t) => { setPaymentTarget(t); setShowPaymentModal(true); }}
            onShowAuth={handleShowAuth}
            onLogout={handleLogout}
            interactionFee={INTERACTION_FEE}
            onOpenMessageWithCandidate={(candidateId) => {
              const candidateIdNum = typeof candidateId === 'number' ? candidateId : Number(candidateId);
              const employerId = userProfile?.employerId;
              if (!candidateIdNum || !employerId) return;

              (async () => {
                try {
                  const { data: convs, error } = await supabase
                    .from('conversations')
                    .select('id, employer_id, candidate_id, job_id, created_at')
                    .eq('employer_id', employerId)
                    .eq('candidate_id', candidateIdNum)
                    .order('created_at', { ascending: false });

                  if (error) {
                    console.error("Error checking existing conversations:", error);
                    setMessageJobPickerCandidateId(candidateIdNum);
                    setMessageJobPickerSelectedJobId(null);
                    return;
                  }

                  if (!convs || convs.length === 0) {
                    // No prior conversations — use full job picker + quick templates.
                    setMessageJobPickerCandidateId(candidateIdNum);
                    setMessageJobPickerSelectedJobId(null);
                    return;
                  }

                  const convIds = convs.map((c: any) => c.id);
                  const { data: msgRows, error: msgError } = await supabase
                    .from('messages')
                    .select('conversation_id, subject, body, sent_at')
                    .in('conversation_id', convIds)
                    .order('sent_at', { ascending: false });

                  if (msgError) {
                    console.error("Error fetching last messages for chooser:", msgError);
                  }

                  const firstByConv = new Map<string, { subject: string | null; body: string; sent_at: string }>();
                  (msgRows || []).forEach((m: any) => {
                    if (!firstByConv.has(m.conversation_id)) {
                      firstByConv.set(m.conversation_id, {
                        subject: m.subject ?? null,
                        body: m.body,
                        sent_at: m.sent_at,
                      });
                    }
                  });

                  const taggedIdsForCandidate = candidateJobLinks[String(candidateIdNum)] || [];

                  // Existing conversations found — let employer pick which to continue.
                  const opts: ConversationRow[] = convs.map((c: any) => {
                    // Prefer explicit job_id from conversation; if missing, fall back
                    // to a single tagged job for this candidate (if exactly one).
                    let effectiveJobId: number | null = c.job_id ?? null;
                    if (effectiveJobId == null && taggedIdsForCandidate.length === 1) {
                      effectiveJobId = taggedIdsForCandidate[0];
                    }
                    const job = effectiveJobId != null ? jobs.find((j: any) => Number(j.id) === Number(effectiveJobId)) : null;
                    const last = firstByConv.get(c.id);
                    return {
                      id: c.id,
                      employer_id: c.employer_id,
                      candidate_id: c.candidate_id,
                      job_id: effectiveJobId ?? c.job_id ?? undefined,
                      jobTitle: job?.title ?? null,
                      otherPartyName: '',
                      otherPartySubtitle: undefined,
                      lastMessagePreview: last ? (last.body?.slice(0, 60) + (last.body?.length > 60 ? '…' : '')) : null,
                      lastMessageSubject: last?.subject ?? null,
                      lastMessageAt: last?.sent_at ?? null,
                      unreadCount: 0,
                      canRead: true,
                    };
                  });

                  setChooseThreadCandidateId(candidateIdNum);
                  setChooseThreadOptions(opts);
                } catch (e) {
                  console.error("Unexpected error opening message with candidate:", e);
                  setMessageJobPickerCandidateId(candidateIdNum);
                  setMessageJobPickerSelectedJobId(null);
                }
              })();
            }}
            onOrganizeCandidateJobs={(candidateId) => {
              const cid = Number(candidateId);
              if (!cid) return;
              const linked = candidateJobLinks[String(cid)] || [];
              setOrganizeCandidateId(cid);
              setOrganizeSelectedJobIds(linked.slice());
            }}
            candidateJobLinks={candidateJobLinks}
            onMarkContacted={markEmployerContacted}
            conversations={conversations}
          />
        );
      case "messages":
        return (
          <Messages
            userRole={userRole}
            userProfile={userProfile}
            isLoggedIn={isLoggedIn}
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            messages={messagesForSelected}
            canReadSelected={(() => {
              const c = selectedConversationId ? conversations.find((x) => x.id === selectedConversationId) : null;
              const fromList = c?.canRead ?? false;
              const employerJustOpenedUnlockedCandidate =
                userRole === 'employer' &&
                selectedConversationCandidateId != null &&
                unlockedCandidateIds.some((id: any) => Number(id) === Number(selectedConversationCandidateId));
              return fromList || employerJustOpenedUnlockedCandidate || false;
            })()}
            isLoadingConversations={isLoadingConversations}
            isLoadingMessages={isLoadingMessages}
            onSelectConversation={(id) => { setSelectedConversationCandidateId(null); setSelectedConversationId(id); }}
            onBackFromThread={() => { setSelectedConversationId(null); setSelectedConversationCandidateId(null); }}
            onSendMessage={async (body) => {
              if (selectedConversationId) await sendMessage(selectedConversationId, body);
            }}
            onEditMessage={selectedConversationId ? (messageId, newBody) => updateMessage(selectedConversationId, messageId, newBody) : undefined}
            onDeleteMessage={selectedConversationId ? (messageId) => deleteMessage(selectedConversationId, messageId) : undefined}
            onMarkAsRead={markConversationMessagesRead}
            onShowAuth={handleShowAuth}
            onNavigate={handleNavigate}
            initialDraft={pendingInitialMessage}
            onInitialDraftUsed={() => setPendingInitialMessage(null)}
          />
        );
      case "job-posting":
        return (
          <JobPostingFlow
            userProfile={userProfile}
            existingJob={editingJob}
            onBack={() => {
              setEditingJob(null);
              handleNavigate("employer");
            }}
            onComplete={(updatedJob) => {
              // Merge the new/updated job with employer data
              const mergedJob = mergeJobsWithEmployers([updatedJob], employers)[0];

              if (editingJob?.id) {
                // Update existing job in the list
                setJobs(jobs.map(j => j.id === updatedJob.id ? mergedJob : j));
              } else {
                // Add new job to the list
                setJobs([mergedJob, ...jobs]);
              }
              setEditingJob(null);
              handleNavigate("employer");
            }}
          />
        );
      case "seeker-onboarding":
        return (
          <>
            <SeekerConsentModal
              isOpen={!userProfile?.profile_consent_accepted && showSeekerConsentModal}
              onAgree={async () => {
                const ts = new Date().toISOString();
                const candidateId = userProfile?.candidateId ?? userProfile?.id;
                if (candidateId) {
                  await supabase
                    .from('candidates')
                    .update({ profile_consent_accepted: true, profile_consent_timestamp: ts })
                    .eq('id', candidateId);
                }
                setUserProfile((prev: any) => ({ ...prev, profile_consent_accepted: true, profile_consent_timestamp: ts }));
                setShowSeekerConsentModal(false);
              }}
              onCancel={() => { setShowSeekerConsentModal(false); handleNavigate("landing"); }}
            />
            <SeekerOnboarding
              userProfile={userProfile}
            onComplete={async (profileData) => {
              const seekerEmail = profileData.email;
              const candidateId = profileData.candidateId ?? profileData.id;

              const migrateAnonSavedAndPendingUnlocks = async () => {
                if (typeof window === "undefined" || !seekerEmail) return;
                try {
                  const anonRaw = localStorage.getItem(STORAGE_KEY_ANON_SAVED_JOB_IDS);
                  const anonIds: number[] = anonRaw ? JSON.parse(anonRaw) : [];
                  if (anonIds.length) {
                    for (const itemId of anonIds) {
                      await supabase.from('saved_items').insert([{
                        user_email: seekerEmail,
                        user_role: 'seeker',
                        item_type: 'job',
                        item_id: itemId
                      }]);
                    }
                    await fetchSavedItems(seekerEmail, 'seeker');
                    localStorage.removeItem(STORAGE_KEY_ANON_SAVED_JOB_IDS);
                  }
                  // Do not migrate pending unlock job IDs to unlocks — unlocking is something the user does after signup (pay to unlock).
                  // Clear any stale pending list so new seekers don't see jobs in "Your Unlocked Jobs" they didn't unlock.
                  localStorage.removeItem(STORAGE_KEY_PENDING_UNLOCK_JOB_IDS);
                  setPendingUnlockJobIds([]);
                } catch (e) {
                  console.error("Migration of saved jobs or pending unlocks failed:", e);
                }
              };

              // Check if this is a demo account
              if (profileData.isDemoAccount) {
                const { data: existingCandidate } = await supabase
                  .from('candidates')
                  .select('*')
                  .eq('id', profileData.candidateId)
                  .single();

                if (existingCandidate) {
                  await migrateAnonSavedAndPendingUnlocks();
                  await Promise.all([
                    fetchApplications(existingCandidate.id),
                    fetchUnlocks(existingCandidate.email),
                    fetchSavedItems(existingCandidate.email, 'seeker')
                  ]);
                  setUserProfile({
                    role: 'seeker',
                    email: existingCandidate.email,
                    name: existingCandidate.name,
                    phone: existingCandidate.phone,
                    location: existingCandidate.location,
                    videoThumbnailUrl: existingCandidate.video_thumbnail_url,
                    videoUrl: existingCandidate.video_url,
                    bio: existingCandidate.bio,
                    skills: existingCandidate.skills || [],
                    experience: existingCandidate.years_experience,
                    education: existingCandidate.education,
                    availability: existingCandidate.availability,
                    targetPay: existingCandidate.preferred_pay_range || existingCandidate.target_pay,
                    industries: existingCandidate.industries_interested || [],
                    workStyles: existingCandidate.work_style?.split(', ') || [],
                    jobTypesSeeking: existingCandidate.job_types_seeking || [],
                    preferredJobCategories: existingCandidate.preferred_job_categories || [],
                    displayTitle: existingCandidate.display_title,
                    candidateId: existingCandidate.id,
                    id: existingCandidate.id
                  });
                  handleNavigate("seeker");
                  toast.success("Demo complete! Welcome to your dashboard.");
                }
                return;
              }

              // Regular account: migrate anon saved + pending unlocks, then update candidates table
              await migrateAnonSavedAndPendingUnlocks();

              // Regular account: update candidates table with onboarding data (use candidateId or id so we never skip the update)
              const idToUpdate = candidateId != null ? Number(candidateId) : null;
              if (idToUpdate != null && !Number.isNaN(idToUpdate)) {
                try {
                  const workStyleStr = Array.isArray(profileData.workStyles) ? profileData.workStyles?.join(', ') : (profileData.workStyles ?? null);
                  const poolOk = candidateMeetsTalentPoolRequirements({
                    video_url: profileData.video_url,
                    bio: profileData.bio,
                    skills: profileData.skills,
                    location: profileData.location,
                    industries: profileData.industries,
                    availability: profileData.availability,
                    targetPay: profileData.targetPay,
                    preferredJobCategories: profileData.preferredJobCategories,
                    jobTypesSeeking: profileData.jobTypesSeeking,
                    experience: profileData.experience,
                  });
                  const payload: Record<string, unknown> = {
                    bio: truncStr(profileData.bio, 10000),
                    location: truncStr(profileData.location, 255),
                    skills: Array.isArray(profileData.skills) ? profileData.skills : [],
                    years_experience: profileData.experience ? parseInt(profileData.experience, 10) : null,
                    education: truncStr(profileData.education, 500),
                    availability: truncStr(profileData.availability, 255),
                    preferred_pay_range: truncStr(profileData.targetPay, 255),
                    industries_interested: Array.isArray(profileData.industries) ? profileData.industries : [],
                    work_style: workStyleStr == null ? null : String(workStyleStr).slice(0, 5000),
                    job_types_seeking: Array.isArray(profileData.jobTypesSeeking) ? profileData.jobTypesSeeking : [],
                    preferred_job_categories: Array.isArray(profileData.preferredJobCategories) ? profileData.preferredJobCategories : [],
                    display_title: truncStr(profileData.displayTitle, 255),
                    video_url: truncStr(profileData.video_url, 500),
                    video_thumbnail_url: truncStr(profileData.video_thumbnail_url, 500),
                    visibility_preference: truncStr(profileData.visibility_preference ?? 'broad', 50),
                    is_profile_complete: poolOk,
                    updated_at: new Date().toISOString(),
                  };
                  const { error: updateError } = await supabase
                    .from('candidates')
                    .update(payload)
                    .eq('id', idToUpdate);

                  if (updateError) {
                    console.error("Error updating candidate profile:", updateError);
                    toast.error("Profile saved locally, but failed to sync to database. Please try saving again from Settings.");
                  } else {
                    toast.success("Profile saved! Welcome to your dashboard.");
                  }
                } catch (err) {
                  console.error("Unexpected error updating candidate:", err);
                  toast.error("Profile could not be saved to the database. Please try again from Settings.");
                }
              } else {
                toast.success("Profile saved! Welcome to your dashboard.");
              }
              setUserProfile(profileData);
              handleNavigate("seeker");
            }}
          />
          </>
        );
      case "employer-onboarding":
        return (
          <EmployerOnboarding
            isEditing={false}
            userProfile={userProfile}
            onComplete={async (profileData) => {
              // Check if this is a demo account
              if (profileData.isDemoAccount) {
                // Demo account: fetch existing profile instead of updating
                const { data: existingEmployer } = await supabase
                  .from('employers')
                  .select('*')
                  .eq('id', profileData.employerId)
                  .single();

                if (existingEmployer) {
                  await Promise.all([
                    fetchUnlocks(existingEmployer.email),
                    fetchSavedItems(existingEmployer.email, 'employer')
                  ]);
                  setUserProfile({
                    role: 'employer',
                    email: existingEmployer.email,
                    businessName: existingEmployer.business_name,
                    phone: existingEmployer.phone,
                    location: existingEmployer.location,
                    industry: existingEmployer.industry,
                    companySize: existingEmployer.company_size,
                    bio: existingEmployer.company_description,
                    companyLogoUrl: existingEmployer.company_logo_url,
                    businessVerified: existingEmployer.business_verified,
                    employerId: existingEmployer.id,
                    id: existingEmployer.id
                  });
                  handleNavigate("employer");
                  toast.success("Demo complete! Welcome to your dashboard.");
                }
                return;
              }

              // Regular account: update employers table with onboarding data
              if (profileData.employerId) {
                try {
                  const { error: updateError } = await supabase
                    .from('employers')
                    .update({
                      company_size: profileData.companySize || null,
                      company_description: profileData.bio || null,
                      location: profileData.location || null,
                      phone: profileData.phone || null,
                      industry: profileData.industry || null,
                      company_logo_url: profileData.companyLogoUrl || null,
                      website: profileData.website || null,
                      business_license_number: profileData.businessLicense || null,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', profileData.employerId);

                  if (updateError) {
                    console.error("Error updating employer profile:", updateError);
                    toast.error("Profile saved locally, but failed to sync to database.");
                  }
                } catch (err) {
                  console.error("Unexpected error updating employer:", err);
                }
              }
              setUserProfile(profileData);
              handleNavigate("employer");
              toast.success("Business profile saved! Welcome to your dashboard.");
            }}
          />
        );
      case "employer-profile-edit":
        return (
          <EmployerOnboarding
            isEditing={true}
            userProfile={userProfile}
            onComplete={async (profileData) => {
              if (profileData.employerId) {
                try {
                  const { error: updateError } = await supabase
                    .from('employers')
                    .update({
                      company_size: profileData.companySize || null,
                      company_description: profileData.bio || null,
                      location: profileData.location || null,
                      phone: profileData.phone || null,
                      industry: profileData.industry || null,
                      company_logo_url: profileData.companyLogoUrl || null,
                      website: profileData.website || null,
                      business_license_number: profileData.businessLicense || null,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', profileData.employerId);

                  if (updateError) {
                    console.error("Error updating employer profile:", updateError);
                    toast.error("Profile saved locally, but failed to sync to database.");
                  }
                } catch (err) {
                  console.error("Unexpected error updating employer:", err);
                }
              }
              setUserProfile(profileData);
              handleNavigate("employer");
              toast.success("Business profile updated.");
            }}
          />
        );
      case "profile-title-customization":
        return (
          <ProfileTitleCustomization
            onBack={() => handleNavigate("seeker")}
            onSave={(title) => {
              setUserProfile((prev: any) => prev ? { ...prev, displayTitle: title } : prev);
              toast.success("Profile Title Updated!");
              handleNavigate("seeker");
            }}
            initialData={userProfile ? {
              location: userProfile.location || "Honolulu, HI",
              yearsExperience: userProfile.experience || "3-5 Years",
              suggestedTitle: userProfile.skills?.slice(0, 2).join(" & ") || "Customer Service & Team Leadership",
              skills: userProfile.skills || [],
            } : undefined}
          />
        );
      case "profile-editor":
        return (
          <ProfileEditor
            onBack={() => handleNavigate("seeker")}
            onSave={async (profileData) => {
              const candidateId = profileData.candidateId ?? profileData.id;
              const idToUpdate = candidateId != null ? Number(candidateId) : null;
              if (idToUpdate == null || Number.isNaN(idToUpdate)) {
                toast.error("Cannot save: profile ID missing. Try logging out and back in.");
                return;
              }
              try {
                const expNum = profileData.experience ? parseInt(profileData.experience, 10) : null;
                const workStyleStr = Array.isArray(profileData.workStyles) ? profileData.workStyles.join(', ') : (profileData.workStyles ?? null);
                const poolOk = candidateMeetsTalentPoolRequirements({
                  video_url: profileData.videoUrl ?? profileData.video_url,
                  bio: profileData.bio,
                  skills: profileData.skills,
                  location: profileData.location,
                  industries: profileData.industries,
                  availability: profileData.availability,
                  targetPay: profileData.targetPay,
                  preferredJobCategories: profileData.preferredJobCategories,
                  jobTypesSeeking: profileData.jobTypesSeeking,
                  experience: profileData.experience,
                  years_experience: expNum != null && !Number.isNaN(expNum) ? expNum : null,
                });
                const payload: Record<string, unknown> = {
                  name: truncStr(profileData.name, 255),
                  email: truncStr(profileData.email, 255),
                  phone: truncStr(profileData.phone, 50),
                  location: truncStr(profileData.location, 255),
                  display_title: truncStr(profileData.displayTitle ?? profileData.customTitle, 255),
                  bio: truncStr(profileData.bio, 10000),
                  skills: Array.isArray(profileData.skills) ? profileData.skills : [],
                  years_experience: expNum != null && !Number.isNaN(expNum) ? expNum : null,
                  education: truncStr(profileData.education, 500),
                  availability: truncStr(profileData.availability, 255),
                  preferred_pay_range: truncStr(profileData.targetPay, 255),
                  industries_interested: Array.isArray(profileData.industries) ? profileData.industries : [],
                  work_style: workStyleStr == null ? null : String(workStyleStr).slice(0, 5000),
                  job_types_seeking: Array.isArray(profileData.jobTypesSeeking) ? profileData.jobTypesSeeking : [],
                  preferred_job_categories: Array.isArray(profileData.preferredJobCategories) ? profileData.preferredJobCategories : [],
                  visibility_preference: truncStr(profileData.visibility_preference ?? 'broad', 50),
                  is_profile_complete: poolOk,
                  updated_at: new Date().toISOString(),
                };
                const { data, error } = await supabase
                  .from('candidates')
                  .update(payload)
                  .eq('id', idToUpdate)
                  .select('id')
                  .single();

                if (error) {
                  console.error("Error updating candidate:", error);
                  if (error.code === 'PGRST116') {
                    toast.error("Profile could not be updated. Row not found or permission denied (check RLS policies on candidates table).");
                  } else {
                    toast.error(`Failed to save profile: ${error.message}`);
                  }
                  return;
                }
                if (!data) {
                  toast.error("Profile could not be updated (no rows updated). Check Supabase RLS allows UPDATE on candidates.");
                  return;
                }
                toast.success("Profile updated successfully!");
                setUserProfile(profileData);
                handleNavigate("seeker");
              } catch (err) {
                console.error("Unexpected error:", err);
                toast.error("Failed to save profile changes");
              }
            }}
            userProfile={userProfile}
          />
        );
      default:
        return <Home onSelectRole={selectRole} onNavigate={handleNavigate} />;
    }
  };

  const handleShowAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setSignupStep('role-select');
    setSignupRole(null);
    setSignupFormData({});
    setLoginEmail("");
    setLoginPassword("");
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setCurrentView("landing");
  };

  return (
    <VideoUploadProgressProvider>
    <div className="min-h-screen bg-[#FAF9F7] font-sans text-gray-900 selection:bg-[#148F8B]/10">

      <VideoUploadTopBar />

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
        isPaymentModalOpen={showPaymentModal}
        isDemoAccount={userProfile?.isDemoAccount === true}
        totalUnreadMessages={totalUnreadMessages}
      />

      <main>
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </main>

      {/* --- Modals --- */}
      
      <Modal isOpen={showAuthModal} onClose={() => {
        setShowAuthModal(false);
        setLoginEmail("");
        setLoginPassword("");
      }} title={authMode === 'login' ? "Access My Hub" : (signupStep === 'role-select' ? "Get Started" : (signupRole === 'employer' ? "Employer Sign Up" : "Job Seeker Sign Up"))}>
         <div className="space-y-8 pb-32 sm:pb-8">
            {authMode === 'login' ? (
              <>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const email = formData.get('email') as string;

                  // Detect user role by checking which table has this email
                  let detectedRole: 'seeker' | 'employer' = 'seeker';
                  let fullProfile: any = null;

                  // First check candidates table (explicit select + maybeSingle avoids 406 when no row)
                  const { data: candidate } = await supabase
                    .from('candidates')
                    .select('id, name, email, phone, location, video_url, video_thumbnail_url, bio, skills, years_experience, education, availability, preferred_pay_range, industries_interested, work_style, job_types_seeking, preferred_job_categories, display_title, visibility_preference')
                    .eq('email', email)
                    .maybeSingle();

                  if (candidate) {
                    detectedRole = 'seeker';
                    try {
                      const anonRaw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_ANON_SAVED_JOB_IDS) : null;
                      const anonIds: number[] = anonRaw ? JSON.parse(anonRaw) : [];
                      if (anonIds.length) {
                        for (const itemId of anonIds) {
                          await supabase.from('saved_items').insert([{ user_email: email, user_role: 'seeker', item_type: 'job', item_id: itemId }]);
                        }
                        localStorage.removeItem(STORAGE_KEY_ANON_SAVED_JOB_IDS);
                      }
                    } catch {
                      // ignore
                    }
                    await Promise.all([
                      fetchApplications(candidate.id),
                      fetchUnlocks(email),
                      fetchSavedItems(email, 'seeker')
                    ]);
                    fullProfile = {
                      role: 'seeker',
                      email: candidate.email,
                      name: candidate.name,
                      phone: candidate.phone,
                      location: candidate.location,
                      bio: candidate.bio,
                      skills: candidate.skills || [],
                      experience: candidate.years_experience,
                      education: candidate.education,
                      availability: candidate.availability,
                      targetPay: candidate.preferred_pay_range,
                      industries: candidate.industries_interested || [],
                      preferredJobCategories: candidate.preferred_job_categories || [],
                      jobTypesSeeking: candidate.job_types_seeking || [],
                      workStyles: candidate.work_style?.split(', ') || [],
                      visibility_preference: candidate.visibility_preference,
                      videoThumbnailUrl: candidate.video_thumbnail_url,
                      videoUrl: candidate.video_url,
                      candidateId: candidate.id,
                      id: candidate.id
                    };
                  } else {
                    // If not a candidate, check employers table (maybeSingle avoids 406 when no row)
                    const { data: employer } = await supabase
                      .from('employers')
                      .select('*')
                      .eq('email', email)
                      .maybeSingle();

                    if (employer) {
                      detectedRole = 'employer';
                      await Promise.all([
                        fetchUnlocks(email),
                        fetchSavedItems(email, 'employer')
                      ]);
                      fullProfile = {
                        role: 'employer',
                        email: employer.email,
                        businessName: employer.business_name,
                        phone: employer.phone,
                        location: employer.location,
                        industry: employer.industry,
                        companySize: employer.company_size,
                        bio: employer.company_description,
                        companyLogoUrl: employer.company_logo_url,
                        businessVerified: employer.business_verified,
                        website: employer.website,
                        businessLicense: employer.business_license_number,
                        employerId: employer.id,
                        id: employer.id
                      };
                    }
                  }

                  if (!fullProfile) {
                    toast.error("No account found with that email. Please sign up first.");
                    return;
                  }

                  setUserRole(detectedRole);
                  setUserProfile(fullProfile);
                  setIsLoggedIn(true);
                  setShowAuthModal(false);
                  if (detectedRole === 'employer') handleNavigate("employer");
                  else handleNavigate("seeker");
                  toast.success("Welcome back!");
                }} className="space-y-8">
                   <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Email</label>
                         <input
                           required
                           name="email"
                           type="email"
                           placeholder="name@region.com"
                           value={loginEmail}
                           onChange={(e) => setLoginEmail(e.target.value)}
                           className="w-full p-6 rounded-3xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#148F8B]/10 outline-none font-black text-xl tracking-tight transition-all"
                         />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Password</label>
                         <input
                           required
                           type="password"
                           placeholder="••••••••"
                           value={loginPassword}
                           onChange={(e) => setLoginPassword(e.target.value)}
                           className="w-full p-6 rounded-3xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#148F8B]/10 outline-none font-black text-xl tracking-tighter transition-all"
                         />
                      </div>
                   </div>
                   <Button
                     type="submit"
                     variant="primary"
                     className="w-full h-20 rounded-[1.5rem] text-xl shadow-lg shadow-[#148F8B]/20 hover:scale-105 active:scale-95 transition-all duration-200"
                   >
                     Log In to Hub
                   </Button>
                </form>

                {/* Demo Login Shortcuts */}
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] text-center">Demo Shortcuts</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail(DEMO_ACCOUNTS.candidate);
                        setLoginPassword('demo123');
                        toast.success("Demo credentials filled! Click 'Log In to Hub'");
                      }}
                      className="p-4 rounded-2xl border-2 border-[#148F8B]/20 bg-[#148F8B]/5 hover:border-[#148F8B] hover:border-4 hover:scale-105 active:scale-95 transition-all duration-200 text-center space-y-2 group"
                    >
                      <User size={24} className="mx-auto text-[#148F8B] group-hover:scale-110 transition-transform" />
                      <span className="block text-xs font-black uppercase tracking-widest text-[#148F8B]">Job Seeker</span>
                      <span className="block text-[10px] text-gray-600 font-medium">Demo Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail(DEMO_ACCOUNTS.employer);
                        setLoginPassword('demo123');
                        toast.success("Demo credentials filled! Click 'Log In to Hub'");
                      }}
                      className="p-4 rounded-2xl border-2 border-[#A63F8E]/20 bg-[#A63F8E]/5 hover:border-[#A63F8E] hover:border-4 hover:scale-105 active:scale-95 transition-all duration-200 text-center space-y-2 group"
                    >
                      <Building2 size={24} className="mx-auto text-[#A63F8E] group-hover:scale-110 transition-transform" />
                      <span className="block text-xs font-black uppercase tracking-widest text-[#A63F8E]">Employer</span>
                      <span className="block text-[10px] text-gray-600 font-medium">Demo Account</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2">
                   <p className="text-sm text-gray-600 font-black uppercase tracking-widest">First time here? <button onClick={() => { setAuthMode('signup'); setSignupStep('role-select'); setSignupRole(null); }} className="text-[#148F8B] hover:underline hover:scale-105 active:scale-95 transition-all duration-200">Create Account</button></p>
                </div>
              </>
            ) : signupStep === 'role-select' ? (
              /* Signup Step 1: Role Selection */
              <div className="space-y-8">
                {pendingUnlockJobIds.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#148F8B]/10 border border-[#148F8B]/20">
                    <p className="text-center text-[#148F8B] font-bold text-base">
                      Create your account to access {pendingUnlockJobIds.length === 1 ? "this job" : "these jobs"} and apply.
                    </p>
                  </div>
                )}
                <p className="text-center text-gray-700 font-medium text-lg">What brings you to HanaHire?</p>

                <div className="space-y-4">
                  <button
                    onClick={() => { setSignupRole('seeker'); setSignupStep('form'); }}
                    className="w-full p-6 rounded-[2rem] border-2 border-[#148F8B]/20 hover:border-[#148F8B] bg-white hover:bg-[#148F8B]/5 hover:scale-105 active:scale-95 transition-all duration-200 text-left space-y-3 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#148F8B]/10 flex items-center justify-center shrink-0">
                        <User size={28} className="text-[#148F8B]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black tracking-tight group-hover:text-[#148F8B] transition-colors">I'm Looking for a Job</h3>
                        <p className="text-sm text-gray-600 font-medium mt-1">Browse and apply to opportunities</p>
                      </div>
                    </div>
                    <div className="pl-[4.5rem] space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-700"><CheckCircle size={14} className="text-[#148F8B] shrink-0" /> Save your intro video and profile for future applications</div>
                      <div className="flex items-center gap-2 text-xs text-gray-700"><CheckCircle size={14} className="text-[#148F8B] shrink-0" /> Track profile views, applications, and unlocked jobs</div>
                      <div className="flex items-center gap-2 text-xs text-gray-700"><CheckCircle size={14} className="text-[#148F8B] shrink-0" /> Come back anytime without re-entering your info</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setSignupRole('employer'); setSignupStep('form'); }}
                    className="w-full p-6 rounded-[2rem] border-2 border-[#A63F8E]/20 hover:border-[#1a7a3e] hover:border-4 bg-white hover:bg-[#A63F8E]/5 hover:scale-105 active:scale-95 transition-all duration-200 text-left space-y-3 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#A63F8E]/10 flex items-center justify-center shrink-0">
                        <Building2 size={28} className="text-[#A63F8E]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black tracking-tight group-hover:text-[#A63F8E] transition-colors">I'm Looking to Hire</h3>
                        <p className="text-sm text-gray-600 font-medium mt-1">Post jobs and find talent</p>
                      </div>
                    </div>
                    <div className="pl-[4.5rem] space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-700"><CheckCircle size={14} className="text-[#A63F8E] shrink-0" /> Post jobs and browse candidate video profiles</div>
                      <div className="flex items-center gap-2 text-xs text-gray-700"><CheckCircle size={14} className="text-[#A63F8E] shrink-0" /> Track candidates unlocked, profile views, and applicants</div>
                      <div className="flex items-center gap-2 text-xs text-gray-700"><CheckCircle size={14} className="text-[#A63F8E] shrink-0" /> Verify your business for trusted hiring</div>
                    </div>
                  </button>
                </div>

                <div className="p-4 bg-[#F3EAF5]/30 rounded-2xl">
                  <p className="text-xs text-gray-700 text-center font-medium">
                    <span className="font-black text-gray-700">No account needed to browse.</span> Sign up to save your info, track activity, and come back easily.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-6 pt-4 border-t border-gray-50">
                   <p className="text-sm text-gray-600 font-black uppercase tracking-widest">Already a member? <button onClick={() => setAuthMode('login')} className="text-[#148F8B] hover:underline hover:scale-105 active:scale-95 transition-all duration-200">Sign In</button></p>
                </div>
              </div>
            ) : (
              /* Signup Step 2: Registration Form */
              <div className="space-y-8">
                {pendingUnlockJobIds.length === 0 && (
                  <button
                    onClick={() => { setSignupStep('role-select'); setSignupRole(null); setSignupFormData({}); }}
                    className="text-xs font-black text-gray-600 uppercase tracking-widest hover:text-[#148F8B] transition-colors hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    &larr; Back to role selection
                  </button>
                )}
                {pendingUnlockJobIds.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#148F8B]/10 border border-[#148F8B]/20">
                    <p className="text-center text-[#148F8B] font-bold text-base">
                      Payment successful! Create your profile to access {pendingUnlockJobIds.length === 1 ? "this job" : "these jobs"}.
                    </p>
                  </div>
                )}

                {/* Demo Auto-Fill Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (signupRole === 'seeker') {
                      const d = DEMO_PROFILES.seeker;
                      setSignupFormData({ name: d.name, email: d.email, password: d.password, phone: d.phone, location: d.location });
                    } else {
                      const d = DEMO_PROFILES.employer;
                      setSignupFormData({ businessName: d.businessName, email: d.email, password: d.password, phone: d.phone, industry: d.industry, businessLicense: d.businessLicense });
                    }
                    toast.success("Demo data filled! Click the button below to create your account.");
                  }}
                  className={`w-full p-4 rounded-2xl border-2 ${signupRole === 'employer' ? 'border-[#A63F8E]/20 bg-[#A63F8E]/5 hover:bg-[#A63F8E]/10' : 'border-[#148F8B]/20 bg-[#148F8B]/5 hover:bg-[#148F8B]/10'} hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 group`}
                >
                  <Zap size={18} className={`${signupRole === 'employer' ? 'text-[#A63F8E]' : 'text-[#148F8B]'} group-hover:scale-110 transition-transform`} />
                  <span className={`text-xs font-black uppercase tracking-widest ${signupRole === 'employer' ? 'text-[#A63F8E]' : 'text-[#148F8B]'}`}>
                    Auto-fill Demo Data
                  </span>
                </button>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSignupLoading(true);

                  try {
                    // If employer, insert into employers table first
                    if (signupRole === 'employer') {
                      const isDemoAccount = signupFormData.email === DEMO_ACCOUNTS.employer;

                      if (isDemoAccount) {
                        // Demo account: skip DB insert, go straight to onboarding
                        const profile: any = {
                          role: signupRole,
                          ...signupFormData,
                          isDemoAccount: true, // Flag for onboarding handler
                          employerId: 72 // Demo employer ID
                        };
                        setUserProfile(profile);
                        setUserRole(signupRole!);
                        setIsLoggedIn(true);
                        setShowAuthModal(false);
                        setSignupFormData({});
                        setIsSignupLoading(false);
                        if (!profile.eeoc_consent_accepted) setShowEmployerConsentModal(true);
                        handleNavigate("employer-onboarding");
                        toast.success("Demo account detected! Let's go through the onboarding.");
                        return;
                      }

                      // Check if email already exists — if so, just log them in
                      const { data: existingEmployer } = await supabase
                        .from('employers')
                        .select('*')
                        .eq('email', signupFormData.email)
                        .single();

                      if (existingEmployer) {
                        await Promise.all([fetchUnlocks(signupFormData.email), fetchSavedItems(signupFormData.email, 'employer')]);
                        // Treat this like an onboarding entry point so they can review/edit info.
                        // Also preserve any values already in signupFormData (e.g., AI Import results).
                        setUserProfile({
                          role: 'employer',
                          email: existingEmployer.email,
                          businessName: signupFormData.businessName || existingEmployer.business_name,
                          phone: signupFormData.phone || existingEmployer.phone,
                          location: signupFormData.location || existingEmployer.location,
                          industry: signupFormData.industry || existingEmployer.industry,
                          companySize: signupFormData.companySize || existingEmployer.company_size,
                          bio: signupFormData.bio || existingEmployer.company_description,
                          companyLogoUrl: signupFormData.companyLogoUrl || existingEmployer.company_logo_url,
                          businessVerified: existingEmployer.business_verified,
                          website: signupFormData.website || existingEmployer.website,
                          employerId: existingEmployer.id,
                          id: existingEmployer.id
                        });
                        setUserRole('employer');
                        setIsLoggedIn(true);
                        setShowAuthModal(false);
                        setSignupFormData({});
                        setIsSignupLoading(false);
                        if (!existingEmployer.eeoc_consent_accepted) setShowEmployerConsentModal(true);
                        handleNavigate("employer-onboarding");
                        toast.success("Welcome back! Review your profile details.");
                        return;
                      }

                      const { data: employerData, error: employerError } = await supabase
                        .from('employers')
                        .insert([{
                          email: signupFormData.email,
                          phone: signupFormData.phone || null,
                          business_name: signupFormData.businessName,
                          industry: signupFormData.industry || null,
                        }])
                        .select()
                        .single();

                      if (employerError) {
                        console.error("Error creating employer:", employerError);
                        toast.error(`Failed to create employer account: ${employerError.message}`);
                        setIsSignupLoading(false);
                        return;
                      }

                      // Store employer with database ID
                      const profile: any = {
                        role: signupRole,
                        ...signupFormData,
                        employerId: employerData.id
                      };
                      setUserProfile(profile);
                      setUserRole(signupRole!);
                      setIsLoggedIn(true);
                      setShowAuthModal(false);
                      setSignupFormData({});
                      setIsSignupLoading(false);
                      setShowEmployerConsentModal(true);
                      handleNavigate("employer-onboarding");
                      toast.success("Account created! Let's set up your profile.");
                    }
                    else {
                      // Seeker signup - insert into candidates table
                      const isDemoAccount = signupFormData.email === DEMO_ACCOUNTS.candidate;

                      if (isDemoAccount) {
                        // Demo account: fetch full candidate profile from Supabase (same as demo login)
                        try {
                          const demoEmail = DEMO_ACCOUNTS.candidate;
                          const { data: candidate, error } = await supabase
                            .from('candidates')
                            .select('*')
                            .eq('email', demoEmail)
                            .single();

                          if (error || !candidate) {
                            console.error("Demo seeker not found during signup flow:", error);
                            toast.error("Demo seeker not found in database; using local demo data.");
                            const profile: any = {
                              role: signupRole,
                              ...signupFormData,
                              isDemoAccount: true,
                            };
                            setUserProfile(profile);
                          } else {
                            const mappedProfile = {
                              role: 'seeker',
                              email: candidate.email,
                              name: candidate.name,
                              phone: candidate.phone,
                              location: candidate.location,
                              videoThumbnailUrl: candidate.video_thumbnail_url,
                              videoUrl: candidate.video_url,
                              bio: candidate.bio,
                              skills: candidate.skills || [],
                              experience: candidate.years_experience,
                              education: candidate.education,
                              availability: candidate.availability,
                              targetPay: candidate.preferred_pay_range || candidate.target_pay,
                              industries: candidate.industries_interested || [],
                              workStyles: candidate.work_style?.split(', ') || [],
                              jobTypesSeeking: candidate.job_types_seeking || [],
                              displayTitle: candidate.display_title,
                              candidateId: candidate.id,
                              id: candidate.id,
                              isDemoAccount: true,
                            };
                            setUserProfile(mappedProfile);
                          }
                        } catch (err) {
                          console.error("Unexpected error fetching demo seeker during signup:", err);
                          const profileFallback: any = {
                            role: signupRole,
                            ...signupFormData,
                            isDemoAccount: true,
                          };
                          setUserProfile(profileFallback);
                        }

                        setUserRole(signupRole!);
                        setIsLoggedIn(true);
                        setShowAuthModal(false);
                        setSignupFormData({});
                        setIsSignupLoading(false);
                        handleNavigate("seeker-onboarding"); setShowSeekerConsentModal(true);
                        toast.success("Demo account detected! Let's go through the onboarding.");
                        return;
                      }

                      // Check if email already exists — if so, just log them in (maybeSingle avoids 406 when no row)
                      const { data: existingCandidate } = await supabase
                        .from('candidates')
                        .select('id, name, email, phone, location, video_url, video_thumbnail_url, bio, skills, years_experience, education, availability, preferred_pay_range, industries_interested, work_style, job_types_seeking, preferred_job_categories, display_title, visibility_preference')
                        .eq('email', signupFormData.email)
                        .maybeSingle();

                      if (existingCandidate) {
                        await Promise.all([fetchApplications(existingCandidate.id), fetchUnlocks(signupFormData.email), fetchSavedItems(signupFormData.email, 'seeker')]);
                        setUserProfile({
                          role: 'seeker',
                          email: existingCandidate.email,
                          name: existingCandidate.name,
                          phone: existingCandidate.phone,
                          location: existingCandidate.location,
                          videoThumbnailUrl: existingCandidate.video_thumbnail_url,
                          videoUrl: existingCandidate.video_url,
                          bio: existingCandidate.bio,
                          skills: existingCandidate.skills || [],
                          experience: existingCandidate.years_experience,
                          education: existingCandidate.education,
                          availability: existingCandidate.availability,
                          targetPay: existingCandidate.preferred_pay_range,
                          industries: existingCandidate.industries_interested || [],
                          preferredJobCategories: existingCandidate.preferred_job_categories || [],
                          jobTypesSeeking: existingCandidate.job_types_seeking || [],
                          workStyles: existingCandidate.work_style?.split(', ') || [],
                          visibility_preference: existingCandidate.visibility_preference,
                          displayTitle: existingCandidate.display_title,
                          candidateId: existingCandidate.id,
                          id: existingCandidate.id
                        });
                        setUserRole('seeker');
                        setIsLoggedIn(true);
                        setShowAuthModal(false);
                        setSignupFormData({});
                        setIsSignupLoading(false);
                        handleNavigate("seeker");
                        toast.success("Welcome back! Logged in to your existing account.");
                        return;
                      }

                      if (isIncompleteManualHawaiiLocation(signupFormData.location || "")) {
                        toast.error("Please enter your town or city (manual entry).");
                        setIsSignupLoading(false);
                        return;
                      }

                      const { data: candidateData, error: candidateError } = await supabase
                        .from('candidates')
                        .insert([{
                          name: signupFormData.name,
                          email: signupFormData.email,
                          phone: signupFormData.phone || null,
                          location: signupFormData.location || null,
                          is_profile_complete: false,
                        }])
                        .select('id')
                        .single();

                      if (candidateError) {
                        console.error("Error creating candidate:", candidateError);
                        toast.error(`Failed to create account: ${candidateError.message}`);
                        setIsSignupLoading(false);
                        return;
                      }

                      // Store candidate with database ID
                      const profile: any = {
                        role: signupRole,
                        ...signupFormData,
                        candidateId: candidateData.id
                      };
                      setUserProfile(profile);
                      setUserRole(signupRole!);
                      setIsLoggedIn(true);
                      setShowAuthModal(false);
                      setSignupFormData({});
                      setIsSignupLoading(false);
                      handleNavigate("seeker-onboarding"); setShowSeekerConsentModal(true);
                      toast.success("Account created! Let's set up your profile.");
                    }
                  } catch (err: any) {
                    console.error("Unexpected error:", err);
                    toast.error(`An unexpected error occurred: ${err?.message || 'Please try again'}`);
                    setIsSignupLoading(false);
                  }
                }} className="space-y-6">
                   {signupRole === 'seeker' ? (
                     /* Seeker Signup Form */
                     <div className="space-y-5">
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Full Name</label>
                         <input required type="text" value={signupFormData.name || ''} onChange={(e) => setSignupFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Your full name" className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-lg tracking-tight" />
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Email</label>
                         <input required type="email" value={signupFormData.email || ''} onChange={(e) => setSignupFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="name@email.com" className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-lg tracking-tight" />
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Password</label>
                         <input required type="password" value={signupFormData.password || ''} onChange={(e) => setSignupFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="Create a password" className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-lg tracking-tighter" />
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Phone</label>
                         <input type="tel" value={signupFormData.phone || ''} onChange={(e) => setSignupFormData(prev => ({ ...prev, phone: formatPhoneInput(e.target.value) }))} placeholder="(808) 555-1234" className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-base" />
                       </div>
                       {(() => {
                         const { island: suIsland, area: suArea, otherTown: suOther } = parseHawaiiLocationString(
                           signupFormData.location || "",
                         );
                         const suAreas = suIsland ? LOCATIONS_BY_ISLAND[suIsland] || [] : [];
                         return (
                           <div className="space-y-3">
                             <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">
                               Location
                             </label>
                             <p className="text-xs text-gray-500 font-medium ml-2">
                               Select your island, then your town or city — or use manual entry if needed.
                             </p>
                             <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                               <select
                                 required
                                 value={suIsland}
                                 onChange={(e) => {
                                   const nextIsland = e.target.value;
                                   setSignupFormData((prev) => ({
                                     ...prev,
                                     location: nextIsland ? nextIsland : "",
                                   }));
                                 }}
                                 className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base"
                               >
                                 <option value="">Island...</option>
                                 {Object.keys(LOCATIONS_BY_ISLAND).map((isl) => (
                                   <option key={isl} value={isl}>
                                     {isl}
                                   </option>
                                 ))}
                               </select>
                               <select
                                 value={suArea}
                                 onChange={(e) => {
                                   const nextArea = e.target.value;
                                   setSignupFormData((prev) => {
                                     const { island: isl, otherTown: ot } = parseHawaiiLocationString(
                                       prev.location || "",
                                     );
                                     if (!isl) return prev;
                                     let nextLoc: string;
                                     if (nextArea === HAWAII_LOCATION_MANUAL_TOKEN) {
                                       nextLoc = ot.trim()
                                         ? `${ot.trim()}, ${isl}`
                                         : `${HAWAII_LOCATION_MANUAL_TOKEN}, ${isl}`;
                                     } else if (!nextArea) {
                                       nextLoc = isl;
                                     } else {
                                       nextLoc = `${nextArea}, ${isl}`;
                                     }
                                     return { ...prev, location: nextLoc };
                                   });
                                 }}
                                 disabled={!suIsland}
                                 className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base disabled:opacity-60 disabled:cursor-not-allowed"
                               >
                                 <option value="">Town or city...</option>
                                 <option value={HAWAII_LOCATION_MANUAL_TOKEN}>Manual entry (type your town)</option>
                                 {suAreas.map((a) => (
                                   <option key={a} value={a}>
                                     {a}
                                   </option>
                                 ))}
                               </select>
                             </div>
                             {suArea === HAWAII_LOCATION_MANUAL_TOKEN ? (
                               <input
                                 type="text"
                                 value={suOther}
                                 onChange={(e) => {
                                   const v = e.target.value;
                                   setSignupFormData((prev) => {
                                     const { island: isl } = parseHawaiiLocationString(prev.location || "");
                                     if (!isl) return prev;
                                     return {
                                       ...prev,
                                       location: v.trim()
                                         ? `${v.trim()}, ${isl}`
                                         : `${HAWAII_LOCATION_MANUAL_TOKEN}, ${isl}`,
                                     };
                                   });
                                 }}
                                 placeholder="Town or city"
                                 className="w-full p-5 rounded-2xl bg-white border border-gray-100 focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-base"
                               />
                             ) : null}
                           </div>
                         );
                       })()}
                     </div>
                   ) : (
                     /* Employer Signup Form */
                     <div className="space-y-5">
                      {/* AI Import (optional) */}
                      <div className="p-5 rounded-[2rem] border-2 border-[#A63F8E]/15 bg-[#A63F8E]/5 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[10px] font-black text-[#A63F8E] uppercase tracking-[0.3em]">
                            AI Import (optional)
                          </p>
                          <button
                            type="button"
                            disabled={isEmployerImporting || !employerImportWebsite.trim()}
                            onClick={async () => {
                              const raw = employerImportWebsite.trim();
                              if (!raw) return;
                              setIsEmployerImporting(true);
                              try {
                                const res = await fetch(`${API_BASE}/employer-ai-import`, {
                                  method: "POST",
                                  headers: {
                                    "content-type": "application/json",
                                    apikey: publicAnonKey,
                                    Authorization: `Bearer ${publicAnonKey}`,
                                  },
                                  body: JSON.stringify({ websiteUrl: raw }),
                                });
                                const json = await res.json().catch(() => ({}));
                                if (!res.ok) {
                                  toast.error(json?.error || "Import failed. Try again.");
                                  return;
                                }

                                setSignupFormData((prev) => ({
                                  ...prev,
                                  businessName: json.businessName || prev.businessName || "",
                                  phone: json.phone || prev.phone || "",
                                  industry: json.industry || prev.industry || "",
                                  location: json.location || prev.location || "",
                                  website: json.websiteUrl || prev.website || raw,
                                  bio: json.bio || prev.bio || "",
                                  companySize: json.companySize || prev.companySize || "",
                                  companyLogoUrl: json.companyLogoUrl || prev.companyLogoUrl || "",
                                }));
                                toast.success("Imported! Review and edit anything you want.");
                              } catch (e: any) {
                                toast.error(e?.message || "Import failed. Try again.");
                              } finally {
                                setIsEmployerImporting(false);
                              }
                            }}
                            className={`shrink-0 inline-flex items-center justify-center px-4 h-10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                              isEmployerImporting || !employerImportWebsite.trim()
                                ? "bg-white/60 text-gray-400 cursor-not-allowed"
                                : "bg-[#A63F8E] text-white hover:scale-105 active:scale-95"
                            }`}
                          >
                            {isEmployerImporting ? "Importing..." : "Import from Website"}
                          </button>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">
                            Business Website
                          </label>
                          <input
                            type="url"
                            value={employerImportWebsite}
                            onChange={(e) => setEmployerImportWebsite(e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="w-full p-4 rounded-2xl bg-white/80 border border-white/60 focus:ring-4 ring-[#A63F8E]/10 outline-none font-bold text-base tracking-tight"
                          />
                          <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                            We'll use web search results to prefill your business profile (you can edit everything before saving).
                          </p>
                        </div>
                      </div>

                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Business Name</label>
                         <input required type="text" value={signupFormData.businessName || ''} onChange={(e) => setSignupFormData(prev => ({ ...prev, businessName: e.target.value }))} placeholder="Your business name" className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#A63F8E]/10 outline-none font-bold text-lg tracking-tight" />
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Business Email</label>
                         <input required type="email" value={signupFormData.email || ''} onChange={(e) => setSignupFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="hiring@business.com" className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#A63F8E]/10 outline-none font-bold text-lg tracking-tight" />
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Password</label>
                         <input required type="password" value={signupFormData.password || ''} onChange={(e) => setSignupFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="Create a password" className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#A63F8E]/10 outline-none font-bold text-lg tracking-tighter" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-3">
                           <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Phone</label>
                           <input type="tel" value={signupFormData.phone || ''} onChange={(e) => setSignupFormData(prev => ({ ...prev, phone: formatPhoneInput(e.target.value) }))} placeholder="(808) 555-9876" className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 focus:ring-4 ring-[#A63F8E]/10 outline-none font-bold text-base" />
                         </div>
                         <div className="space-y-3">
                           <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Industry</label>
                           <select value={signupFormData.industry || ''} onChange={(e) => setSignupFormData(prev => ({ ...prev, industry: e.target.value }))} className="w-full p-5 rounded-2xl bg-[#F3EAF5]/30 border border-gray-100 font-bold text-base">
                             <option value="">Select...</option>
                             {INDUSTRIES_BY_GROUP.map((group) => (
                               <optgroup key={group.label} label={group.label}>
                                 {group.items.map((i) => (
                                   <option key={i} value={i}>
                                     {i}
                                   </option>
                                 ))}
                               </optgroup>
                             ))}
                           </select>
                         </div>
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Business License # <span className="text-gray-300">(optional)</span></label>
<input type="text" value={signupFormData.businessLicense || ''} onChange={(e) => setSignupFormData(prev => ({ ...prev, businessLicense: e.target.value }))} placeholder="HI-BIZ-XXXX-XXXXX" className="w-full p-5 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-4 ring-[#2ECC71]/10 outline-none font-bold text-base tracking-widest" />
<div className="p-4 bg-[#2ECC71]/5 rounded-2xl border border-[#2ECC71]/10 flex items-start gap-3">
  <Shield size={20} className="text-[#2ECC71] shrink-0 mt-0.5" />
  <p className="text-xs text-gray-600 font-medium">
    Skip for now or verify your business license to unlock a <span className="font-black text-[#2ECC71]">Verified Business Badge</span> — displayed on your job posts for a small fee. Builds trust with job seekers.
  </p>
</div>
</div>
                     </div>
                   )}

                   <Button
                     type="submit"
                     disabled={isSignupLoading}
                     className={`w-full h-16 rounded-[1.5rem] text-lg font-black text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ${signupRole === 'employer' ? 'bg-[#A63F8E] hover:bg-[#A63F8E]/90 shadow-[#A63F8E]/20' : 'bg-[#148F8B] hover:bg-[#148F8B]/90 shadow-[#148F8B]/20'}`}
                   >
                     {isSignupLoading ? 'Creating Account...' : (signupRole === 'employer' ? 'Create Employer Account' : 'Create My Account')}
                   </Button>
                </form>

                <div className="flex flex-col items-center gap-6 pt-4 border-t border-gray-50">
                   <p className="text-sm text-gray-600 font-black uppercase tracking-widest">Already a member? <button onClick={() => setAuthMode('login')} className="text-[#148F8B] hover:underline hover:scale-105 active:scale-95 transition-all duration-200">Sign In</button></p>
                </div>
              </div>
            )}
         </div>
      </Modal>

      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title={paymentTarget?.type === 'seeker' ? "Secure Application Checkout" : "Secure Unlock Checkout"}>
  <div className="space-y-8">

    {/* What you get after purchase */}
    <div className={`p-4 rounded-2xl border ${paymentTarget?.type === 'seeker' ? 'bg-[#148F8B]/5 border-[#148F8B]/10' : 'bg-[#A63F8E]/5 border-[#A63F8E]/10'}`}>
      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: paymentTarget?.type === 'seeker' ? '#148F8B' : '#A63F8E' }}>
        {paymentTarget?.type === 'seeker' ? 'What unlocks after payment' : 'What unlocks after payment'}
      </p>
      {paymentTarget?.type === 'seeker' ? (
        <ul className="space-y-1">
          <li className="flex items-center gap-2 text-xs text-gray-600 font-medium"><CheckCircle size={12} className="text-[#148F8B] shrink-0" /> Business name and branding revealed</li>
          <li className="flex items-center gap-2 text-xs text-gray-600 font-medium"><CheckCircle size={12} className="text-[#148F8B] shrink-0" /> Direct contact details for the hiring team</li>
          <li className="flex items-center gap-2 text-xs text-gray-600 font-medium"><CheckCircle size={12} className="text-[#148F8B] shrink-0" /> Apply later with a personalized video or written answers</li>
        </ul>
      ) : (
        <ul className="space-y-1">
          <li className="flex items-center gap-2 text-xs text-gray-600 font-medium"><CheckCircle size={12} className="text-[#A63F8E] shrink-0" /> Full video intro becomes playable</li>
          <li className="flex items-center gap-2 text-xs text-gray-600 font-medium"><CheckCircle size={12} className="text-[#A63F8E] shrink-0" /> Candidate's real name revealed</li>
          <li className="flex items-center gap-2 text-xs text-gray-600 font-medium"><CheckCircle size={12} className="text-[#A63F8E] shrink-0" /> Direct phone number and verified email</li>
        </ul>
      )}
    </div>

    {/* Unlock Summary */}
    <div className="bg-[#F3EAF5]/30 rounded-[2rem] border border-gray-100 overflow-hidden">
      <div className="p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
            {paymentTarget?.type === 'seeker' ? 'Application Summary' : 'Unlock Summary'}
          </span>
          <span className="text-[10px] font-black text-[#A63F8E] uppercase tracking-widest">
            {paymentItems.length} {paymentItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {paymentItems.map((item: any) => (
          <div key={item.id} className="border-t border-gray-100 pt-3">
            {/* Item header row */}
            <div className="flex items-center gap-3">
              {/* Thumbnail or icon */}
              {paymentTarget?.type === 'employer' && (item.thumbnail || item.video_thumbnail_url) ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200 shrink-0 relative">
                  <img src={item.thumbnail || item.video_thumbnail_url} className="w-full h-full object-cover blur-[7px] scale-110" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <Lock size={9} className="text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#148F8B]/10 flex items-center justify-center shrink-0">
                  <Briefcase size={14} className="text-[#148F8B]" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {item.title || item.display_title || 'Profile'}
                </p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest truncate">
                  {item.location} {item.pay_range ? `· ${item.pay_range}` : item.preferred_pay_range ? `· ${item.preferred_pay_range}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-black text-gray-900">${INTERACTION_FEE.toFixed(2)}</span>
                {/* Expand/collapse details */}
                <button
                  type="button"
                  onClick={() => setExpandedPaymentItemId(expandedPaymentItemId === item.id ? null : item.id)}
                  className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors hover:scale-105 active:scale-95 transition-all duration-200"
                  title="Toggle details"
                >
                  {expandedPaymentItemId === item.id
                    ? <ChevronUp size={14} />
                    : <ChevronDown size={14} />}
                </button>
                {/* Remove from list */}
                <button
                  type="button"
                  onClick={() => {
                    const next = paymentItems.filter((pi: any) => pi.id !== item.id);
                    setPaymentItems(next);
                    if (expandedPaymentItemId === item.id) setExpandedPaymentItemId(null);
                  }}
                  className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-[#A63F8E] hover:border-[#A63F8E]/30 transition-colors hover:scale-105 active:scale-95 transition-all duration-200"
                  title="Remove from checkout"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Expanded details */}
            {expandedPaymentItemId === item.id && (
              <div className="mt-3 ml-13 pl-1 space-y-2 border-l-2 border-gray-100">
                {paymentTarget?.type === 'employer' ? (
                  <div className="ml-2 space-y-2">
                    {item.bio && <p className="text-xs text-gray-700 leading-relaxed">{item.bio}</p>}
                    <div className="flex flex-wrap gap-1.5">
                      {item.years_experience && <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600">{item.years_experience} yrs exp</span>}
                      {item.availability && <span className="px-2 py-1 bg-[#A63F8E]/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#A63F8E]">{item.availability}</span>}
                      {item.work_style && <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600">{item.work_style}</span>}
                      {item.education && <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600">{item.education}</span>}
                      {item.current_employment_status && <span className="px-2 py-1 bg-[#148F8B]/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#148F8B]">{item.current_employment_status}</span>}
                    </div>
                    {Array.isArray(item.skills) && item.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.skills.map((s: string, si: number) => (
                          <span key={si} className="px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500">{s}</span>
                        ))}
                      </div>
                    )}
                    {Array.isArray(item.industries_interested) && item.industries_interested.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.industries_interested.map((ind: string, ii: number) => (
                          <span key={ii} className="px-2 py-1 bg-[#148F8B]/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#148F8B]">{ind}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="ml-2 space-y-2">
                    {item.description && <p className="text-xs text-gray-700 leading-relaxed">{item.description}</p>}
                    <div className="flex flex-wrap gap-1.5">
                      {item.job_type && <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600">{item.job_type}</span>}
                      {item.company_industry && <span className="px-2 py-1 bg-[#148F8B]/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#148F8B]">{item.company_industry}</span>}
                      {item.company_size && <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600">{item.company_size}</span>}
                      {item.start_date && <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600">Start: {item.start_date}</span>}
                    </div>
                    {Array.isArray(item.requirements) && item.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.requirements.map((r: string, ri: number) => (
                          <span key={ri} className="px-2 py-1 bg-[#148F8B]/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#148F8B]">{r}</span>
                        ))}
                      </div>
                    )}
                    {Array.isArray(item.benefits) && item.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.benefits.map((b: string, bi: number) => (
                          <span key={bi} className="px-2 py-1 bg-[#A63F8E]/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#A63F8E]">{b}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-900 px-5 sm:px-6 py-4 flex items-center justify-between">
        <span className="text-white/60 font-black uppercase tracking-[0.3em] text-sm">Total</span>
        <span className="text-white text-sm font-black">${(paymentItems.length * INTERACTION_FEE).toFixed(2)}</span>
      </div>
    </div>

    {paymentItems.length === 0 && (
      <p className="text-center text-gray-400 font-black text-sm uppercase tracking-widest py-4">No items in checkout</p>
    )}

    {/* Payment Form */}
    {paymentItems.length > 0 && (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Payment Details</span>
          <div className="flex items-center gap-1.5 text-xs font-black text-gray-500 uppercase tracking-widest">
            <Lock size={10} className="text-[#148F8B]" /> SSL Encrypted
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Name on Card</label>
          <input type="text" placeholder="Full name as shown on card" className="w-full p-4 sm:p-5 rounded-2xl bg-white border-2 border-gray-100 focus:border-[#148F8B] focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-base transition-colors" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Card Number</label>
          <div className="relative">
            <CreditCard size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#148F8B]/40" />
            <input type="text" placeholder="1234  5678  1234  5678" className="w-full p-4 sm:p-5 pl-14 rounded-2xl bg-white border-2 border-gray-100 focus:border-[#148F8B] focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-base tracking-widest transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Expiry</label>
            <input type="text" placeholder="MM / YY" className="w-full p-4 sm:p-5 rounded-2xl bg-white border-2 border-gray-100 focus:border-[#148F8B] focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-base text-center tracking-widest transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Security Code</label>
            <div className="relative">
              <input type="text" placeholder="CVC" className="w-full p-4 sm:p-5 rounded-2xl bg-white border-2 border-gray-100 focus:border-[#148F8B] focus:ring-4 ring-[#148F8B]/10 outline-none font-bold text-base text-center tracking-widest transition-colors" />
              <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#148F8B]/30" />
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Pay Button */}
    {paymentItems.length > 0 && (
      <Button
        className="w-full h-16 sm:h-20 text-lg sm:text-xl rounded-[1.5rem] shadow-2xl shadow-[#148F8B]/30 tracking-tight group bg-[#148F8B] hover:bg-[#148F8B]/90 text-white hover:scale-105 active:scale-95 transition-all duration-200"
        onClick={processPayment}
      >
        <Lock size={18} className="mr-2" />
        {paymentTarget?.type === 'seeker' ? `Apply & Reveal` : `Unlock ${paymentItems.length > 1 ? `${paymentItems.length} Profiles` : 'Profile'}`}
        <ArrowRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
      </Button>
    )}

    {/* Trust Indicators */}
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 pb-20 md:pb-2">
      <div className="flex items-center gap-1.5 text-xs font-black text-gray-500 uppercase tracking-widest">
        <Shield size={12} className="text-[#148F8B]" /> Secure Payment
      </div>
      <div className="flex items-center gap-1.5 text-xs font-black text-gray-500 uppercase tracking-widest">
        <Lock size={12} className="text-[#148F8B]" /> 256-bit Encryption
      </div>
      <div className="flex items-center gap-1.5 text-xs font-black text-gray-500 uppercase tracking-widest">
        <CheckCircle size={12} className="text-[#148F8B]" /> Money-back Guarantee
      </div>
    </div>
  </div>
</Modal>

      <ApplicationQuestionsModal
        isOpen={showQuestionsModal}
        questions={pendingApplyItems[0]?.application_questions || []}
        jobTitle={pendingApplyItems[0]?.title || ""}
        candidateId={String(userProfile?.candidateId ?? userProfile?.id ?? "")}
        existingApplication={applications.find((application) => application.job_id === pendingApplyItems[0]?.id) || null}
        onSubmit={(submission) => {
          const job = pendingApplyItems[0];
          if (!job) return;
          submitApplicationAnswers(job, submission);
        }}
        onSkip={() => {
          setShowQuestionsModal(false);
          setPendingApplyItems([]);
        }}
      />

      <Modal isOpen={showPostJobModal} onClose={() => setShowPostJobModal(false)} title="Post Job">
         <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            // NOTE: This quick post feature is legacy/unused. Use JobPostingFlow component instead.
            // Creating a temporary job for local state only (not saved to database)
            const newJob = {
              id: Date.now(),
              title: formData.get("title") as string,
              location: "Honolulu, HI",
              pay_range: formData.get("pay") as string,
              posted_at: new Date().toISOString(),
              description: formData.get("description") as string,
              is_anonymous: true,
              status: 'active',
              applicant_count: 0,
              job_type: 'Full-time',
              requirements: [],
              responsibilities: [],
              benefits: [],
              employer_id: userProfile?.employerId || 0,  // Link to current employer
              // Company info comes from employer (for display in merged state)
              company_name: userProfile?.businessName || "Your Business",
              company_industry: formData.get("type") as string,
              company_size: userProfile?.companySize || "Small Business",
              contact_email: userProfile?.email || "",
              contact_phone: userProfile?.phone || ""
            };
            setJobs([newJob, ...jobs]);
            setShowPostJobModal(false);
            toast.success("Job Live!");
         }} className="space-y-8">
            <div className="space-y-3"><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Job Title</label><input required name="title" type="text" placeholder="e.g. Server" className="w-full p-6 rounded-3xl bg-[#F3EAF5]/30 border border-gray-100 font-black text-xl" /></div>
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-3"><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Type</label><select name="type" className="w-full p-6 rounded-3xl bg-[#F3EAF5]/30 border border-gray-100 font-bold">
                  {INDUSTRIES_BY_GROUP.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.items.map((ind) => (
                        <option key={ind}>{ind}</option>
                      ))}
                    </optgroup>
                  ))}
               </select></div>
               <div className="space-y-3"><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Pay Range</label><select name="pay" className="w-full p-6 rounded-3xl bg-[#F3EAF5]/30 border border-gray-100 font-bold">
                  {JOB_CATEGORIES.payRanges.map(pay => <option key={pay}>{pay}</option>)}
               </select></div>
            </div>
            
            <div className="space-y-4">
               <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Job Intro Format</label>
               <div className="flex gap-4">
                  <button type="button" onClick={() => setMediaType("video")} className={`flex-1 p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${mediaType === 'video' ? 'border-[#148F8B] bg-[#148F8B]/5 text-[#148F8B]' : 'border-gray-200 text-gray-700'} hover:scale-105 active:scale-95 duration-200`}>
                     <Video size={24} />
                     <span className="font-black text-[10px]">VIDEO INTRO</span>
                  </button>
                  <button type="button" onClick={() => setMediaType("voice")} className={`flex-1 p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${mediaType === 'voice' ? 'border-[#148F8B] bg-[#148F8B]/5 text-[#148F8B]' : 'border-gray-200 text-gray-700'} hover:scale-105 active:scale-95 duration-200`}>
                     <Mic size={24} />
                     <span className="font-black text-[10px]">VOICE ONLY</span>
                  </button>
               </div>
               <button type="button" onClick={() => toast.info(`Starting ${mediaType} recorder...`)} className="w-full py-10 border-4 border-dashed border-gray-100 rounded-3xl flex flex-col items-center gap-2 text-gray-600 hover:text-[#148F8B] hover:border-[#148F8B] hover:scale-105 active:scale-95 transition-all duration-200">
                  {mediaType === 'video' ? <Camera size={32} /> : <Mic size={32} />}
                  <span className="font-black text-[10px] uppercase">Record Job Intro</span>
               </button>
            </div>

            <div className="space-y-3"><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Overview</label><textarea required name="description" rows={4} className="w-full p-6 rounded-3xl bg-[#F3EAF5]/30 border border-gray-100 font-medium text-lg" /></div>
            <Button type="submit" className="w-full h-24 text-3xl rounded-[2rem] shadow-2xl shadow-[#148F8B]/20 hover:scale-105 active:scale-95 transition-all duration-200">Go Live ($0 Post Fee)</Button>
         </form>
      </Modal>

      <Modal isOpen={showVisibilityModal} onClose={() => setShowVisibilityModal(false)} title="Visibility Preferences">
         <div className="space-y-12">
            <div className="space-y-6">
               <button onClick={() => { setUserVisibility("broader"); toast.success("Visibility Updated"); setShowVisibilityModal(false); }} className={`w-full p-10 rounded-[4rem] border-4 text-left hover:scale-105 active:scale-95 transition-all duration-200 flex gap-10 items-center ${userVisibility === "broader" ? "border-[#148F8B] bg-[#148F8B]/5 shadow-xl" : "border-gray-50"}`}>
                  <div className={`w-12 h-12 rounded-full border-4 shrink-0 flex items-center justify-center ${userVisibility === "broader" ? "border-[#148F8B]" : "border-gray-200"}`}>{userVisibility === "broader" && <div className="w-6 h-6 rounded-full bg-[#148F8B]" />}</div>
                  <div className="space-y-2"><span className="font-black text-3xl text-gray-900 block tracking-tighter leading-none uppercase">Public Discovery</span><p className="text-lg text-gray-500 font-medium leading-tight">Businesses can find you in the pool.</p></div>
               </button>
               <button onClick={() => { setUserVisibility("limited"); toast.success("Visibility Updated"); setShowVisibilityModal(false); }} className={`w-full p-10 rounded-[4rem] border-4 text-left hover:scale-105 active:scale-95 transition-all duration-200 flex gap-10 items-center ${userVisibility === "limited" ? "border-[#148F8B] bg-[#148F8B]/5 shadow-xl" : "border-gray-50"}`}>
                   <div className={`w-12 h-12 rounded-full border-4 shrink-0 flex items-center justify-center ${userVisibility === "limited" ? "border-[#148F8B]" : "border-gray-200"}`}>{userVisibility === "limited" && <div className="w-6 h-6 rounded-full bg-[#148F8B]" />}</div>
                  <div className="space-y-2"><span className="font-black text-3xl text-gray-900 block tracking-tighter leading-none uppercase">Direct Only</span><p className="text-lg text-gray-500 font-medium leading-tight">Only jobs you apply to see your profile.</p></div>
               </button>
            </div>
         </div>
      </Modal>

      <Modal
        isOpen={messageJobPickerCandidateId != null && userRole === 'employer'}
        onClose={() => { setMessageJobPickerCandidateId(null); setMessageJobPickerSelectedJobId(null); setMessageJobPickerTemplateKey(null); }}
        title="Message about a job"
      >
        <div className="space-y-6 pb-4">
          <p className="text-sm text-gray-600 font-medium">
            Select the job you’re messaging this candidate about. They’ll see it on their dashboard and can unlock and apply to respond.
          </p>
          {(() => {
            const myJobs = (jobs || []).filter((j: any) => Number(j.employer_id) === Number(userProfile?.employerId));
            const linkedJobIds = messageJobPickerCandidateId != null ? (candidateJobLinks[String(messageJobPickerCandidateId)] || []) : [];
            const linkedJobs = myJobs.filter((j: any) => linkedJobIds.includes(Number(j.id)));
            const otherJobs = myJobs.filter((j: any) => !linkedJobIds.includes(Number(j.id)));
            return (
              <>
                {linkedJobs.length > 0 && (
                  <div className="p-3 rounded-xl border border-[#148F8B]/15 bg-[#148F8B]/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#148F8B]">Tagged jobs for this candidate</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {linkedJobs.map((j: any) => (
                        <span key={j.id} className="px-3 py-1 rounded-full bg-white border border-[#148F8B]/20 text-[10px] font-black uppercase tracking-widest text-gray-700">
                          {j.title}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-600 font-medium">
                      {linkedJobs.length === 1 ? "We’ll default to this job unless you change it." : "Pick which job this message is about."}
                    </p>
                  </div>
                )}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setMessageJobPickerSelectedJobId(null)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      messageJobPickerSelectedJobId == null
                        ? 'border-[#148F8B] bg-[#148F8B]/5'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <span className="font-black text-gray-900 block">No specific job posting</span>
                    <span className="text-xs text-gray-500 font-medium">
                      Reach out about general or future opportunities (no job listing required).
                    </span>
                  </button>
                  {linkedJobs.map((job: any) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => setMessageJobPickerSelectedJobId(Number(job.id))}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        messageJobPickerSelectedJobId === job.id
                          ? 'border-[#148F8B] bg-[#148F8B]/5'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <span className="font-black text-gray-900 block">{job.title}</span>
                      <span className="text-xs text-gray-500 font-medium">{job.location} · {job.pay_range}</span>
                    </button>
                  ))}
                  {otherJobs.map((job: any) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => setMessageJobPickerSelectedJobId(Number(job.id))}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        messageJobPickerSelectedJobId === job.id
                          ? 'border-[#148F8B] bg-[#148F8B]/5'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <span className="font-black text-gray-900 block">{job.title}</span>
                      <span className="text-xs text-gray-500 font-medium">{job.location} · {job.pay_range}</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-2 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Quick conversation starters</p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setMessageJobPickerTemplateKey('short')}
                      className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-medium ${
                        messageJobPickerTemplateKey === 'short'
                          ? 'border-[#148F8B] bg-[#148F8B]/5 text-[#148F8B]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      Aloha [First Name], I found your profile in HanaHire talent pool and think you’re a great fit for our company.
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageJobPickerTemplateKey('context')}
                      className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-medium ${
                        messageJobPickerTemplateKey === 'context'
                          ? 'border-[#148F8B] bg-[#148F8B]/5 text-[#148F8B]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      Aloha [First Name], I’m from [Company]. Your background and intro video really stood out for a job opening we are hiring for.
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageJobPickerTemplateKey('casual')}
                      className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-medium ${
                        messageJobPickerTemplateKey === 'casual'
                          ? 'border-[#148F8B] bg-[#148F8B]/5 text-[#148F8B]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      Hey [First Name], we saw your HanaHire profile and would love to connect about a job opening with our company.
                    </button>
                  </div>
                </div>
                <Button
                  className="w-full h-14 rounded-2xl bg-[#148F8B] hover:bg-[#148F8B]/90 text-white font-black uppercase tracking-widest"
                  onClick={async () => {
                    const eid = Number(userProfile?.employerId);
                    const cid = messageJobPickerCandidateId;
                    const jobId = messageJobPickerSelectedJobId;
                    if (!eid || !cid) return;
                    // Build quick template text if selected
                    let initialBody: string | null = null;
                    const job = jobs.find((j: any) => Number(j.id) === Number(jobId));
                    const candidate = candidates.find((c: any) => Number(c.id) === Number(cid));
                    const firstName = (candidate?.name || '').split(' ')[0] || 'there';
                    const companyName = (userProfile as any)?.businessName || job?.company_name || 'our company';
                    const yourName = (userProfile as any)?.contact_name || (userProfile as any)?.name || companyName;
                    if (messageJobPickerTemplateKey === 'short') {
                      if (jobId != null && job) {
                        initialBody = `Aloha ${firstName}, I found your profile in the HanaHire talent pool and I think you’d be a strong fit for our “${job.title}” at ${companyName}. Would you be open to a quick chat about it?`;
                      } else {
                        initialBody = `Aloha ${firstName}, I found your profile in the HanaHire talent pool and I think you could be a great fit for opportunities with us at ${companyName}. Would you be open to a quick chat about what you’re looking for?`;
                      }
                    } else if (messageJobPickerTemplateKey === 'context') {
                      if (jobId != null && job) {
                        initialBody = `Aloha ${firstName}, I’m ${yourName} from ${companyName}. We’re hiring for a “${job.title}” role and your HanaHire profile really stood out—especially your experience in ${job.job_category || 'this area'}. If you’re interested, I’d love to share more about the position and hear what you’re looking for.`;
                      } else {
                        initialBody = `Aloha ${firstName}, I’m ${yourName} from ${companyName}. We’re always looking for strong talent and your HanaHire profile really stood out. I’d love to learn what you’re looking for and share how we might work together.`;
                      }
                    } else if (messageJobPickerTemplateKey === 'casual') {
                      if (jobId != null && job) {
                        initialBody = `Hey ${firstName}, I saw your HanaHire profile and think you could be a great fit for our “${job.title}” role at ${companyName}. No pressure—would you be open to hearing a bit about it?`;
                      } else {
                        initialBody = `Hey ${firstName}, I saw your HanaHire profile and think you could be a great fit for our team at ${companyName}. No pressure—would you be open to hearing a bit about potential opportunities?`;
                      }
                    }
                    setPendingInitialMessage(initialBody);
                    setSelectedConversationCandidateId(cid);
                    const id = await getOrCreateConversation(eid, cid, jobId);
                    setMessageJobPickerCandidateId(null);
                    setMessageJobPickerSelectedJobId(null);
                    setMessageJobPickerTemplateKey(null);
                    handleNavigate("messages", id ? { selectConversation: id } : undefined);
                  }}
                >
                  Start conversation
                </Button>
              </>
            );
          })()}
        </div>
      </Modal>

      <Modal
        isOpen={chooseThreadCandidateId != null && userRole === 'employer'}
        onClose={() => { setChooseThreadCandidateId(null); setChooseThreadOptions([]); }}
        title="Message candidate"
      >
        <div className="space-y-6 pb-4">
          <p className="text-sm text-gray-600 font-medium">
            You already have conversation history with this candidate. Continue an existing thread or start a new one.
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {chooseThreadOptions.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => {
                  setSelectedConversationCandidateId(conv.candidate_id);
                  setChooseThreadCandidateId(null);
                  setChooseThreadOptions([]);
                  handleNavigate("messages", { selectConversation: conv.id });
                }}
                className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-[#148F8B]/40 hover:bg-[#148F8B]/5 transition-all"
              >
                <span className="font-black text-gray-900 block">
                  {conv.lastMessageSubject || conv.jobTitle || 'Conversation'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {conv.jobTitle ? `Job: ${conv.jobTitle}` : 'General opportunity'}
                </span>
              </button>
            ))}
          </div>
          <div className="pt-2 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Start something new</p>
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl border-gray-200 text-xs font-black uppercase tracking-widest"
              onClick={() => {
                const cid = chooseThreadCandidateId;
                setChooseThreadCandidateId(null);
                setChooseThreadOptions([]);
                if (!cid) return;
                setMessageJobPickerCandidateId(cid);
                setMessageJobPickerSelectedJobId(null);
              }}
            >
              New conversation about a job
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={organizeCandidateId != null && userRole === 'employer'}
        onClose={() => { setOrganizeCandidateId(null); setOrganizeSelectedJobIds([]); }}
        title="Organize candidate to jobs"
      >
        <div className="space-y-6 pb-4">
          <p className="text-sm text-gray-600 font-medium">
            Tag this candidate to one or more of your jobs. Next time you hit Message, we’ll default to the tagged job(s).
          </p>
          {(() => {
            const myJobs = (jobs || []).filter((j: any) => Number(j.employer_id) === Number(userProfile?.employerId));
            if (myJobs.length === 0) {
              return <p className="text-gray-500 font-medium py-4">You have no active jobs to tag.</p>;
            }
            return (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {myJobs.map((job: any) => {
                  const selected = organizeSelectedJobIds.includes(Number(job.id));
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => {
                        const jid = Number(job.id);
                        setOrganizeSelectedJobIds((prev) =>
                          prev.includes(jid) ? prev.filter((x) => x !== jid) : [...prev, jid]
                        );
                      }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selected ? 'border-[#A63F8E] bg-[#A63F8E]/5' : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <span className="font-black text-gray-900 block">{job.title}</span>
                      <span className="text-xs text-gray-500 font-medium">{job.location} · {job.pay_range}</span>
                      {selected && (
                        <span className="mt-2 inline-flex px-2.5 py-1 rounded-full bg-[#A63F8E] text-white text-[9px] font-black uppercase tracking-widest">
                          Tagged
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })()}
          <Button
            className="w-full h-14 rounded-2xl bg-[#A63F8E] hover:bg-[#A63F8E]/90 text-white font-black uppercase tracking-widest"
            onClick={async () => {
              const employerId = Number(userProfile?.employerId);
              const candidateId = organizeCandidateId;
              if (!employerId || !candidateId) return;

              try {
                // Remove existing links for this candidate
                const { error: delErr } = await supabase
                  .from('candidate_job_links')
                  .delete()
                  .eq('employer_id', employerId)
                  .eq('candidate_id', candidateId);
                if (delErr) {
                  console.error("Error clearing candidate-job links:", delErr);
                  toast.error("Failed to save tags");
                  return;
                }

                // Insert new links
                if (organizeSelectedJobIds.length > 0) {
                  const { error: insErr } = await supabase.from('candidate_job_links').insert(
                    organizeSelectedJobIds.map((jobId) => ({
                      employer_id: employerId,
                      candidate_id: candidateId,
                      job_id: jobId,
                    }))
                  );
                  if (insErr) {
                    console.error("Error saving candidate-job links:", insErr);
                    toast.error("Failed to save tags");
                    return;
                  }
                }

                setCandidateJobLinks((prev) => ({ ...prev, [String(candidateId)]: organizeSelectedJobIds.slice() }));
                setOrganizeCandidateId(null);
                setOrganizeSelectedJobIds([]);
                toast.success("Candidate organized to jobs");
              } catch (e) {
                console.error("Unexpected error saving candidate-job links:", e);
                toast.error("Failed to save candidate job tags");
              }
            }}
          >
            Save tags
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showMediaModal} onClose={() => setShowMediaModal(false)} title="Update Intro">
         <div className="space-y-10">
            <p className="text-center text-gray-500 font-medium">Choose how you want to show your personality.</p>
            <div className="grid grid-cols-2 gap-6">
               <button onClick={() => { setMediaType("video"); toast.info("Starting Video Recorder..."); }} className="p-10 border-2 border-gray-100 rounded-[3rem] flex flex-col items-center gap-4 hover:border-[#148F8B] hover:bg-[#148F8B]/5 hover:scale-105 active:scale-95 transition-all duration-200">
                  <Video size={48} className="text-[#148F8B]" />
                  <span className="font-black text-xs uppercase tracking-widest">VIDEO INTRO</span>
               </button>
               <button onClick={() => { setMediaType("voice"); toast.info("Starting Voice Recorder..."); }} className="p-10 border-2 border-gray-100 rounded-[3rem] flex flex-col items-center gap-4 hover:border-[#148F8B] hover:bg-[#148F8B]/5 hover:scale-105 active:scale-95 transition-all duration-200">
                  <Mic size={48} className="text-[#148F8B]" />
                  <span className="font-black text-xs uppercase tracking-widest">VOICE ONLY</span>
               </button>
            </div>
            <div className="p-8 bg-[#F3EAF5]/30 rounded-3xl space-y-4">
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> Transcript Mode</p>
               <p className="text-sm text-gray-500">Your recording automatically generates a transcript for employers.</p>
            </div>
         </div>
      </Modal>
      <VideoIntroModal
        isOpen={showVideoUpdateModal}
        onClose={() => setShowVideoUpdateModal(false)}
        candidateId={userProfile?.candidateId ?? userProfile?.id}
        onComplete={async (videoUrl, videoThumbnailUrl, _durationSeconds) => {
          // Immediately update local state so thumbnail refreshes in the dashboard
          setUserProfile((prev: any) =>
            prev ? { ...prev, videoUrl, videoThumbnailUrl } : prev
          );
          toast.success("Video uploaded! Saving to your profile...");

          // Delete old video & thumbnail from storage so we don't leave orphans
          const oldVideoUrl = userProfile?.video_url ?? userProfile?.videoUrl;
          const oldThumbUrl = userProfile?.video_thumbnail_url ?? userProfile?.videoThumbnailUrl;
          if (oldVideoUrl || oldThumbUrl) {
            await removeStorageFilesFromUrls(oldVideoUrl, oldThumbUrl);
          }

          // Persist to Supabase candidates table
          const candidateId = userProfile?.candidateId ?? userProfile?.id;
          if (candidateId) {
            const poolOk = candidateMeetsTalentPoolRequirements({
              video_url: videoUrl,
              bio: userProfile?.bio,
              skills: userProfile?.skills,
              location: userProfile?.location,
              industries: userProfile?.industries,
              availability: userProfile?.availability,
              targetPay: userProfile?.targetPay,
              preferredJobCategories: userProfile?.preferredJobCategories,
              jobTypesSeeking: userProfile?.jobTypesSeeking,
              experience: userProfile?.experience,
            });
            const { error } = await supabase
              .from("candidates")
              .update({
                video_url: videoUrl,
                video_thumbnail_url: videoThumbnailUrl,
                is_profile_complete: poolOk,
                updated_at: new Date().toISOString(),
              })
              .eq("id", candidateId);

            if (error) {
              console.error("Error saving updated video to database:", error);
              toast.error("Video uploaded but failed to save to your profile. Please try again.");
            } else {
              toast.success("Intro video updated successfully!");
            }
          }
        }}
        onThumbnailReady={async (thumbUrl) => {
          // Thumbnail finishes generating after modal closes — update state and DB
          setUserProfile((prev: any) =>
            prev ? { ...prev, videoThumbnailUrl: thumbUrl } : prev
          );
          const candidateId = userProfile?.candidateId ?? userProfile?.id;
          if (candidateId) {
            await supabase
              .from("candidates")
              .update({ video_thumbnail_url: thumbUrl })
              .eq("id", candidateId);
          }
        }}
        onUploadStart={() => {
          toast.info("Uploading your new video in the background...");
        }}
        onUploadError={(message) => {
          toast.error(`Video upload failed: ${message}`);
        }}
      />

      <MarketplaceFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        userRole={userRole}
        filters={filters}
        setMultiSelectFilter={setMultiSelectFilter}
        islandFilters={islandFilters}
        setIslandFilters={setIslandFilters}
        clearFilters={clearFilters}
        resultCount={userRole === "seeker" ? filteredJobs.length : filteredCandidates.length}
      />

     {/* Mobile Nav */}
{currentView !== "landing" && !showPaymentModal && !showVideoUpdateModal && (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 md:hidden flex flex-row items-center justify-center gap-10 z-50 shadow-2xl">
     <button onClick={() => handleNavigate("landing")} className="flex flex-col items-center justify-center gap-1 text-gray-300 hover:scale-105 active:scale-95 transition-all duration-200">
       <Eye size={20} />
       <span className="text-[10px] font-black uppercase tracking-widest">EXPLORE</span>
     </button>
     <button onClick={() => handleNavigate(userRole === 'seeker' ? "jobs" : "candidates")} className={`flex flex-col items-center justify-center gap-1 ${(currentView === "jobs" || currentView === "candidates") ? 'text-[#148F8B]' : 'text-gray-600'} hover:scale-105 active:scale-95 transition-all duration-200`}>
       <Briefcase size={20} />
       <span className="text-[10px] font-black uppercase tracking-widest">{userRole === 'seeker' ? 'JOBS' : 'TALENT'}</span>
     </button>
     <button onClick={() => handleNavigate("cart")} className={`flex flex-col items-center justify-center gap-1 px-2 ${currentView === "cart" ? 'text-[#148F8B]' : 'text-gray-600'} hover:scale-105 active:scale-95 transition-all duration-200`}>
       <span style={{ position: 'relative', display: 'inline-flex' }}>
         <FolderOpen size={20} />
         {(userRole === 'seeker' ? seekerQueue.length : employerQueue.length) > 0 && (
           <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#148F8B', color: '#ffffff', fontSize: '9px', fontWeight: 900, borderRadius: '999px', minWidth: '1rem', height: '1rem', padding: '0 3px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
             {userRole === 'seeker' ? seekerQueue.length : employerQueue.length}
           </span>
         )}
       </span>
       <span className="text-[10px] font-black uppercase tracking-widest">APPLY</span>
     </button>
     <button onClick={() => isLoggedIn ? handleNavigate(userRole === 'seeker' ? "seeker" : "employer") : handleShowAuth("login")} className={`flex flex-col items-center justify-center gap-1 ${(currentView === "seeker" || currentView === "employer") ? 'text-[#148F8B]' : 'text-gray-600'} hover:scale-105 active:scale-95 transition-all duration-200`}>
       <User size={20} />
       <span className="text-[10px] font-black uppercase tracking-widest">HUB</span>
     </button>
     {isLoggedIn && (
       <button onClick={() => handleNavigate("messages")} className={`flex flex-col items-center justify-center gap-1 px-2 ${currentView === "messages" ? 'text-[#148F8B]' : 'text-gray-600'} hover:scale-105 active:scale-95 transition-all duration-200`}>
         <span style={{ position: 'relative', display: 'inline-flex' }}>
           <Mail size={20} />
           {totalUnreadMessages > 0 && (
             <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#ffffff', fontSize: '9px', fontWeight: 900, borderRadius: '999px', minWidth: '1rem', height: '1rem', padding: '0 3px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
               {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
             </span>
           )}
         </span>
         <span className="text-[10px] font-black uppercase tracking-widest">CHAT</span>
       </button>
     )}
  </div>
)}

      {/* --- Consent Modals --- */}
      <EmployerConsentModal
        isOpen={showEmployerConsentModal}
        onAgree={async (employeeCountRange) => {
          const ts = new Date().toISOString();
          const employerId = userProfile?.employerId ?? userProfile?.id;
          if (employerId) {
            await supabase
              .from('employers')
              .update({ eeoc_consent_accepted: true, eeoc_consent_timestamp: ts, employee_count_range: employeeCountRange })
              .eq('id', employerId);
          }
          setUserProfile((prev: any) => ({ ...prev, eeoc_consent_accepted: true, eeoc_consent_timestamp: ts, employee_count_range: employeeCountRange }));
          setShowEmployerConsentModal(false);
          if (pendingEmployerAction === "post-job") handleNavigate("job-posting");
          else if (pendingEmployerAction === "browse-candidates") handleNavigate("candidates");
          else if (pendingEmployerAction === "employer-onboarding") handleNavigate("employer-onboarding");
          setPendingEmployerAction(null);
        }}
        onCancel={() => { setShowEmployerConsentModal(false); setPendingEmployerAction(null); }}
      />

      {/* --- Detail Modals --- */}
      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title="Job Details">
        {selectedJob && (
          <div className="space-y-8 pb-4">
            {/* Logo (above title) + title + core tags */}
            <div className="space-y-5">
              {(() => {
                const logoRaw = selectedJob.company_logo_url;
                const logoUrl =
                  typeof logoRaw === "string" && logoRaw.trim()
                    ? logoRaw.trim()
                    : "";
                if (!logoUrl) return null;
                const showLogo = true;
                if (!showLogo) return null;
                return (
                  <div className="flex justify-center sm:justify-start">
                    <div
                      className="rounded-[2rem] border-2 border-gray-100 bg-white shadow-sm flex items-center justify-center p-4 sm:p-5 w-[11rem] h-[11rem] sm:w-[13.5rem] sm:h-[13.5rem] md:w-[15rem] md:h-[15rem]"
                    >
                      <img
                        src={logoUrl}
                        alt=""
                        className="max-w-full max-h-full w-full h-full object-contain"
                      />
                    </div>
                  </div>
                );
              })()}
              <div className="space-y-3">
                <h3 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none">
                  {selectedJob.title}
                </h3>
                <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1.5 text-[#148F8B]"><MapPin size={13} />{selectedJob.location}</span>
                  <span className="flex items-center gap-1.5 text-[#A63F8E]"><DollarSign size={13} />{selectedJob.pay_range}</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-lg text-gray-600">{selectedJob.job_type}</span>
                  {selectedJob.company_industry && <span className="px-3 py-1 bg-[#148F8B]/5 text-[#148F8B] rounded-lg">{selectedJob.company_industry}</span>}
                  {selectedJob.company_size && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg">{selectedJob.company_size}</span>}
                  {selectedJob.start_date && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg">Start: {selectedJob.start_date}</span>}
                </div>
              </div>
            </div>

            {/* Employer action buttons - at top for easy access */}
            {userRole === 'employer' && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <Button variant="outline" className="h-16 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-200" onClick={() => {
                  setEditingJob(selectedJob);
                  setSelectedJob(null);
                  handleNavigate('job-posting');
                }}>
                  Edit Job
                </Button>
                <Button className="h-16 rounded-2xl bg-[#A63F8E] hover:bg-[#A63F8E]/90 text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-200" onClick={() => { setSelectedJob(null); handleNavigate('employer'); }}>
                  View Applicants
                </Button>
                <Button
                  variant="outline"
                  className={`h-16 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-200 ${selectedJob.status === 'filled' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-gray-200 text-gray-700 bg-white'}`}
                  onClick={toggleSelectedJobFilledStatus}
                >
                  {selectedJob.status === 'filled' ? 'Reopen Job' : 'Mark Filled'}
                </Button>
              </div>
            )}

            {/* Business identity (locked until applied) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-5 bg-[#F3EAF5]/30 rounded-2xl space-y-1">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Business</span>
                <p className="font-black text-base tracking-tight">
                  {selectedJob.company_name}
                </p>
              </div>
              {selectedJob.applicant_count !== undefined && (
                <div className="p-5 bg-[#F3EAF5]/30 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Applicants</span>
                  <p className="font-black text-base tracking-tight">{selectedJob.applicant_count}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedJob.description && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Overview</h4>
                <p className="text-base text-gray-600 leading-relaxed font-medium">{selectedJob.description}</p>
              </div>
            )}

            {selectedJob.company_description && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">About the Business</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">{selectedJob.company_description}</p>
              </div>
            )}

            {/* Requirements */}
            {Array.isArray(selectedJob.requirements) && selectedJob.requirements.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Requirements</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.requirements.map((r: string, i: number) => (
                    <span key={i} className="px-4 py-2 bg-[#148F8B]/5 text-[#148F8B] rounded-xl text-xs font-black uppercase tracking-widest">{r}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {Array.isArray(selectedJob.responsibilities) && selectedJob.responsibilities.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Key Responsibilities</h4>
                <ul className="space-y-2">
                  {selectedJob.responsibilities.map((r: string, i: number) => (
                    <li key={i} className="flex gap-3 items-start text-sm text-gray-600 font-medium">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-[#148F8B] shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {Array.isArray(selectedJob.benefits) && selectedJob.benefits.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Benefits</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.benefits.map((b: string, i: number) => (
                    <span key={i} className="px-4 py-2 bg-[#A63F8E]/5 text-[#A63F8E] rounded-xl text-xs font-black uppercase tracking-widest">{b}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedJob.website && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Business Website</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  <a
                    href={selectedJob.website.startsWith('http') ? selectedJob.website : `https://${selectedJob.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#148F8B] font-semibold hover:underline break-all"
                  >
                    {selectedJob.website.replace(/^https?:\/\//i, '')}
                  </a>
                </p>
              </div>
            )}

            {(selectedJob.contact_email || selectedJob.contact_phone) && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Information</h4>
                <div className="space-y-1">
                  {selectedJob.contact_email && (
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                      Email:{" "}
                      <a
                        href={`mailto:${selectedJob.contact_email}`}
                        className="text-[#148F8B] font-semibold hover:underline"
                      >
                        {selectedJob.contact_email}
                      </a>
                    </p>
                  )}
                  {selectedJob.contact_phone && (
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                      Phone: <span className="text-[#148F8B] font-semibold">{selectedJob.contact_phone}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Application Questions */}
            {Array.isArray(selectedJob.application_questions) && selectedJob.application_questions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Application Questions</h4>
                <ul className="space-y-2">
                  {selectedJob.application_questions.map((q: string, i: number) => (
                    <li key={i} className="flex gap-3 items-start text-sm text-gray-700 font-medium">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[#780262]/10 text-[#780262] text-[10px] font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA - Seeker actions */}
            {userRole !== 'employer' && (
              <Button
                className="w-full h-20 text-xl rounded-3xl bg-[#148F8B] hover:bg-[#136068] text-white shadow-2xl shadow-[#148F8B]/25 hover:scale-105 active:scale-95 transition-all duration-200"
                disabled={applications.some((a: any) => a.job_id === selectedJob.id)}
                onClick={() => { setPendingApplyItems([selectedJob]); setShowQuestionsModal(true); setSelectedJob(null); }}
              >
                {applications.some((a: any) => a.job_id === selectedJob.id) ? "Applied ✓" : "Apply Now"}
              </Button>
            )}
            <a
              href={`mailto:support@hanahire.com?subject=Report%20Discrimination%20or%20Abuse&body=Job%20ID%3A%20${selectedJob.id}%0AJob%20Title%3A%20${encodeURIComponent(selectedJob.title || '')}%0A%0APlease%20describe%20what%20happened%3A`}
              className="inline-flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-[10px] font-black text-red-500 hover:bg-red-100 hover:text-red-600 uppercase tracking-widest transition-colors"
            >
              Report Discrimination or Abuse
            </a>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!selectedCandidate} onClose={() => { setSelectedCandidate(null); setCandidateVideoPlayerUrl(null); }} title={unlockedCandidateIds.includes(selectedCandidate?.id) ? "Full Candidate Profile" : "Candidate Intel"}>
        {selectedCandidate && (
          <div className="space-y-10">
            {unlockedCandidateIds.includes(selectedCandidate.id) ? (
              <div className="space-y-8">
                {/* Header for Unlocked State */}
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                   <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-gray-100 shrink-0 border-4 border-[#148F8B]/10 shadow-xl">
                      <ImageWithFallback 
                        src={selectedCandidate.video_thumbnail_url} 
                        className="w-full h-full object-cover"
                      />
                   </div>
                   <div className="space-y-1 flex-1 text-center sm:text-left">
                      <h3 className="text-4xl font-black tracking-tighter leading-none">{selectedCandidate.name}</h3>
                      <p className="text-lg font-black text-[#148F8B] uppercase tracking-[0.2em]">{selectedCandidate.location}</p>
                      {userRole === 'employer' && (
                        (() => {
                          const taggedJobIds = candidateJobLinks[String(selectedCandidate.id)] || [];
                          const myJobs = (jobs || []).filter((j: any) => Number(j.employer_id) === Number(userProfile?.employerId));
                          const taggedTitles = taggedJobIds
                            .map((jid) => myJobs.find((j: any) => Number(j.id) === Number(jid))?.title)
                            .filter(Boolean) as string[];
                          if (!taggedTitles.length) return null;
                          return (
                            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                              {taggedTitles.slice(0, 3).map((t) => (
                                <span
                                  key={t}
                                  className="px-3 py-1 rounded-full bg-[#A63F8E]/10 text-[#A63F8E] text-[9px] font-black uppercase tracking-widest"
                                >
                                  {t}
                                </span>
                              ))}
                              {taggedTitles.length > 3 && (
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[9px] font-black uppercase tracking-widest">
                                  +{taggedTitles.length - 3} more
                                </span>
                              )}
                            </div>
                          );
                        })()
                      )}
                   </div>
                </div>

                {/* Video Player */}
                <div
                  className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden group shadow-2xl cursor-pointer"
                  onClick={() => selectedCandidate.video_url && setCandidateVideoPlayerUrl(selectedCandidate.video_url)}
                >
                   <ImageWithFallback
                     src={selectedCandidate.video_thumbnail_url}
                     className="w-full h-full object-cover opacity-80"
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border-2 border-white/50 group-hover:scale-110 transition-transform">
                         <Play size={40} className="text-white fill-white ml-2" />
                      </div>
                   </div>
                   {selectedCandidate.video_url == null && (
                     <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-3 py-2 text-center pointer-events-none">
                       <p className="text-[9px] font-black uppercase tracking-widest text-white leading-tight">Visual Demo Only</p>
                       <p className="text-[8px] font-black uppercase tracking-widest text-white/70 leading-tight mt-0.5">No Real Video</p>
                     </div>
                   )}
                </div>

                <div className="flex gap-4 p-1 bg-[#F3EAF5]/30 rounded-2xl">
                  <button className="flex-1 py-4 bg-white rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-200">Video Intro</button>
                  <button className="flex-1 py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 transition-colors hover:scale-105 active:scale-95 transition-all duration-200">Transcript</button>
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
   {selectedCandidate.video_url == null && (
   <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-3 py-2 text-center pointer-events-none">
     <p className="text-[9px] font-black uppercase tracking-widest text-white leading-tight">Visual Demo Only</p>
     <p className="text-[8px] font-black uppercase tracking-widest text-white/70 leading-tight mt-0.5">No Real Video</p>
   </div>
   )}
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
                    <p className="text-xs font-black text-[#148F8B] uppercase tracking-[0.2em]">{selectedCandidate.location}</p>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedCandidate.years_experience} YRS EXP</span>
                      <span className="px-3 py-1 bg-[#A63F8E]/10 text-[#A63F8E] rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedCandidate.availability}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6 sm:space-y-8">
              {userRole === 'employer' && selectedCandidate.application && (
                <div className="space-y-6 border-b border-gray-100 pb-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Application Review</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-[#148F8B]/10 text-[#148F8B] text-[10px] font-black uppercase tracking-widest">
                        {selectedCandidate.application.appliedToJob?.title || selectedCandidate.appliedToJob?.title || 'Applied Job'}
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                        {selectedCandidate.application.reviewed_at ? 'Reviewed' : 'Not reviewed yet'}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Application Status</span>
                      <select
                        value={applicationStatusDraft}
                        onChange={(e) => setApplicationStatusDraft(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Method</span>
                      <select
                        value={contactMethodDraft}
                        onChange={(e) => setContactMethodDraft(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700"
                      >
                        <option value="">Not contacted yet</option>
                        <option value="messaged">Messaged (App)</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="text">Text</option>
                        <option value="in_person">In Person</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Employer Notes</span>
                      <textarea
                        value={employerNotesDraft}
                        onChange={(e) => setEmployerNotesDraft(e.target.value)}
                        rows={4}
                        placeholder="Private notes about this candidate..."
                        className="w-full min-h-[100px] p-4 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-700 resize-y"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Notes</span>
                      <textarea
                        value={contactNotesDraft}
                        onChange={(e) => setContactNotesDraft(e.target.value)}
                        rows={4}
                        placeholder="How or when you contacted them..."
                        className="w-full min-h-[100px] p-4 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-700 resize-y"
                      />
                    </label>
                  </div>

                  <Button
                    className="w-full h-14 rounded-2xl bg-[#148F8B] hover:bg-[#136068] text-white text-sm font-black uppercase tracking-widest"
                    onClick={saveEmployerApplicationReview}
                    disabled={isSavingApplicationReview}
                  >
                    {isSavingApplicationReview ? "Saving..." : "Save Application Review"}
                  </Button>

                  <div className="grid md:grid-cols-2 gap-4">
                    {unlockedCandidateIds.some((id: any) => Number(id) === Number(selectedCandidate.id)) ? (
                      <>
                        {selectedCandidate.video_url && (
                          <button
                            type="button"
                            onClick={() => setCandidateVideoPlayerUrl(selectedCandidate.video_url)}
                            className="p-4 rounded-2xl border border-[#148F8B]/20 bg-[#148F8B]/5 text-left hover:bg-[#148F8B]/10 transition-colors"
                          >
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#148F8B]">Intro Video</p>
                            <p className="mt-2 text-sm font-semibold text-gray-700">Play candidate intro video</p>
                          </button>
                        )}
                        {selectedCandidate.application.video_url && (
                          <button
                            type="button"
                            onClick={() => setCandidateVideoPlayerUrl(selectedCandidate.application.video_url)}
                            className="p-4 rounded-2xl border border-[#A63F8E]/20 bg-[#A63F8E]/5 text-left hover:bg-[#A63F8E]/10 transition-colors"
                          >
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#A63F8E]">Personalized Video</p>
                            <p className="mt-2 text-sm font-semibold text-gray-700">Play job-specific application video</p>
                          </button>
                        )}
                      </>
                    ) : (
                      (selectedCandidate.video_url || selectedCandidate.application?.video_url) && (
                        <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 text-center col-span-full">
                          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Unlock to view intro and application videos</p>
                        </div>
                      )
                    )}
                  </div>

                  {Array.isArray(selectedCandidate.application.question_answers) && selectedCandidate.application.question_answers.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Question Answers</h4>
                      {unlockedCandidateIds.some((id: any) => Number(id) === Number(selectedCandidate.id)) ? (
                        <div className="space-y-3">
                          {selectedCandidate.application.question_answers.map((answer: any, idx: number) => (
                            <div key={`${answer.question}-${idx}`} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#148F8B]">{answer.question}</p>
                              <p className="text-sm text-gray-700 font-medium">
                                {answer.answer_text || (selectedCandidate.application.video_url ? "Answered in personalized video." : "No answer provided")}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                          <p className="text-sm font-medium text-amber-800">
                            This candidate answered the application questions. Unlock their profile to view their answers.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Bio Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Professional Narrative</h4>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed font-medium">{selectedCandidate.bio}</p>
              </div>

              {/* Comprehensive Intel Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-4 sm:gap-y-6 border-y border-gray-100 py-6 sm:py-8">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest">Education Background</span>
                    <span className="text-[10px] sm:text-xs font-black text-gray-900 uppercase text-right">{selectedCandidate.education}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest">Employment Status</span>
                    <span className="text-[10px] sm:text-xs font-black text-gray-900 uppercase text-right">{selectedCandidate.current_employment_status || 'Open'}</span>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest">Availability</span>
                    <span className="text-[10px] sm:text-xs font-black text-[#A63F8E] uppercase text-right">{selectedCandidate.availability}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest">Experience</span>
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

              {/* Work Style */}
              {selectedCandidate.work_style && (
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Work Style</h4>
                  <div className="flex flex-wrap gap-2">
                    {(typeof selectedCandidate.work_style === 'string'
                      ? selectedCandidate.work_style.split(/,\s*/).filter(Boolean)
                      : [selectedCandidate.work_style]
                    ).map((s: string, i: number) => (
                      <span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Industries Interested */}
              {Array.isArray(selectedCandidate.industries_interested) && selectedCandidate.industries_interested.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Industries Interested</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.industries_interested.map((ind: string, i: number) => (
                      <span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#148F8B]/5 text-[#148F8B] rounded-xl text-[10px] font-black uppercase tracking-widest">{ind}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Open To (Job Types Seeking) */}
              {Array.isArray(selectedCandidate.job_types_seeking) && selectedCandidate.job_types_seeking.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Open To</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.job_types_seeking.map((jt: string, i: number) => (
                      <span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{jt}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial & Contact Info - Privacy Layer */}
              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                 <div className="p-6 sm:p-8 bg-[#F3EAF5]/30 rounded-[1.5rem] sm:rounded-[2rem] space-y-2">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Expectation</span>
                    <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{selectedCandidate.preferred_pay_range}</p>
                 </div>
                 
                 {unlockedCandidateIds.includes(selectedCandidate.id) ? (
                    <div className="p-6 sm:p-8 bg-[#148F8B] rounded-[1.5rem] sm:rounded-[2rem] text-white space-y-2">
                       <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">Direct Phone</span>
                       <p className="text-lg sm:text-xl font-black tracking-tight">{selectedCandidate.phone}</p>
                    </div>
                 ) : (
                    <div className="p-6 sm:p-8 bg-[#A63F8E]/5 rounded-[1.5rem] sm:rounded-[2rem] border border-[#A63F8E]/10 flex items-center justify-between gap-3">
                       <div className="space-y-1 min-w-0">
                          <span className="text-[9px] sm:text-[10px] font-black text-[#A63F8E] uppercase tracking-widest">Contact Locked</span>
                          <p className="text-xs sm:text-sm font-bold text-gray-400 italic">Unlock to reveal identity</p>
                       </div>
                       <Lock size={18} className="sm:w-5 sm:h-5 text-[#A63F8E] opacity-40 shrink-0" />
                    </div>
                 )}
              </div>
              
              {unlockedCandidateIds.includes(selectedCandidate.id) && (
                 <div className="p-6 sm:p-8 bg-[#A63F8E]/5 rounded-[1.5rem] sm:rounded-[2rem] border border-[#A63F8E]/10 flex items-center gap-4 sm:gap-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#A63F8E]/20 flex items-center justify-center shrink-0">
                       <Mail className="text-[#A63F8E]" size={20} />
                    </div>
                    <div className="min-w-0">
                       <span className="text-[10px] font-black text-[#A63F8E] uppercase tracking-widest">Verified Email</span>
                       <p className="text-base sm:text-lg md:text-xl font-black text-gray-900 tracking-tight break-all">{selectedCandidate.email}</p>
                    </div>
                 </div>
              )}

            </div>

            {unlockedCandidateIds.some((id: any) => Number(id) === Number(selectedCandidate.id)) && userRole === 'employer' && userProfile?.employerId && (
              <Button
                className="w-full h-14 rounded-2xl bg-[#148F8B] hover:bg-[#148F8B]/90 text-white font-black uppercase tracking-widest shadow-lg shadow-[#148F8B]/20"
                onClick={() => {
                  const cid = Number(selectedCandidate.id);
                  if (!cid) return;
                  setMessageJobPickerCandidateId(cid);
                  setMessageJobPickerSelectedJobId(null);
                  setSelectedCandidate(null);
                }}
              >
                <MessageSquare size={20} className="inline-block mr-2" /> Message Candidate
              </Button>
            )}
            {!unlockedCandidateIds.some((id: any) => Number(id) === Number(selectedCandidate.id)) && (
              <Button className="w-full h-20 text-xl rounded-3xl bg-[#A63F8E] hover:bg-[#5C014A] text-white font-black uppercase tracking-widest shadow-2xl shadow-[#A63F8E]/25 hover:scale-105 active:scale-95 transition-all duration-200" onClick={() => { setPaymentTarget({ type: 'employer', items: [selectedCandidate] }); setShowPaymentModal(true); setSelectedCandidate(null); }}>
  Unlock Full Video & Contact
</Button>
            )}
            <a
              href={`mailto:support@hanahire.com?subject=Report%20Discrimination%20or%20Abuse&body=Candidate%20ID%3A%20${selectedCandidate.id}%0A%0APlease%20describe%20what%20happened%3A`}
              className="inline-flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-[10px] font-black text-red-500 hover:bg-red-100 hover:text-red-600 uppercase tracking-widest transition-colors"
            >
              Report Discrimination or Abuse
            </a>
          </div>
        )}
      </Modal>

      {/* Candidate video player overlay */}
      {candidateVideoPlayerUrl && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 1000001 }}
          onClick={() => setCandidateVideoPlayerUrl(null)}
        >
          <div
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              controls
              autoPlay
              playsInline
              className="w-full rounded-[2rem] bg-black shadow-2xl"
              style={{ maxHeight: "80vh" }}
            >
              <source
                src={candidateVideoPlayerUrl}
                type={candidateVideoPlayerUrl.includes('.webm') ? 'video/webm' : 'video/mp4'}
              />
            </video>
          </div>
        </div>
      )}

    </div>
    </VideoUploadProgressProvider>
  );
}