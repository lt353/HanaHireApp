import { INDUSTRIES } from "./industries";
import { SKILLS } from "./skills";
import type { LabeledStringGroup } from "./optionGroups";
import { flattenLabeledGroups } from "./optionGroups";

export { INDUSTRIES_BY_GROUP, type Industry } from "./industries";
export { SKILLS_BY_GROUP } from "./skills";
export type { LabeledStringGroup } from "./optionGroups";

export const INTERACTION_FEE = 2.0;

const JOB_PAY_RANGES_BY_GROUP: LabeledStringGroup[] = [
  {
    label: "Hourly",
    items: [
      "$15-18/hr",
      "$18-22/hr",
      "$20-25/hr",
      "$22-28/hr",
      "$25-30/hr",
      "$28-35/hr",
      "$30-35/hr",
      "$35-40/hr",
      "$40-45/hr",
      "$40+/hr",
    ],
  },
  {
    label: "Annual",
    items: ["$30-40k/year", "$40-50k/year", "$50-60k/year", "$60-75k/year", "$75k+/year"],
  },
  {
    label: "Other",
    items: ["Commission-based", "Tips + hourly"],
  },
];

export const TARGET_PAY_RANGES_BY_GROUP: LabeledStringGroup[] = [
  {
    label: "Hourly",
    items: [
      "$15-18/hr",
      "$18-22/hr",
      "$20-25/hr",
      "$22-28/hr",
      "$25-30/hr",
      "$28-35/hr",
      "$30-35/hr",
      "$35-40/hr",
      "$40-45/hr",
      "$45-50/hr",
      "$50+/hr",
    ],
  },
  {
    label: "Annual",
    items: ["$30-40k/year", "$40-50k/year", "$50-60k/year", "$60-75k/year", "$75k+/year"],
  },
  {
    label: "Other",
    items: ["Commission-based", "Tips + hourly", "Negotiable"],
  },
];

export const JOB_CATEGORIES = {
  industries: [...INDUSTRIES],

  jobTypes: [
    "Full-time",
    "Part-time",
    "Contract",
    "Seasonal",
    "Freelance",
    "Commission",
  ],

  // Standardized job categories (mirrors jobs.job_category check constraint)
  jobCategories: [
    "Food Service",
    "Retail & Sales",
    "Customer Service",
    "Hospitality Services",
    "Tourism & Recreation",
    "Trades & Construction",
    "Office & Admin",
    "Accounting & Finance",
    "Healthcare & Wellness",
    "Marketing & Creative",
    "Tech & IT",
    "Management & Leadership",
    "Maintenance & Facilities",
    "Transportation & Logistics",
    "Education",
    "Fitness & Recreation",
  ],

  // Updated to island format with diacritical marks
  locations: [
    // Oʻahu
    "Honolulu, Oʻahu",
    "Waikīkī, Oʻahu",
    "Kailua, Oʻahu",
    "Kapolei, Oʻahu",
    "Pearl City, Oʻahu",
    "ʻAiea, Oʻahu",
    "ʻEwa Beach, Oʻahu",
    "Waipahu, Oʻahu",
    "Haleʻiwa, Oʻahu",
    "Kāneʻohe, Oʻahu",
    // Maui
    "Kahului, Maui",
    "Wailuku, Maui",
    "Kīhei, Maui",
    "Wailea, Maui",
    "Lahaina, Maui",
    "Makawao, Maui",
    "Pukalani, Maui",
    // Kauaʻi
    "Līhuʻe, Kauaʻi",
    "Kapaʻa, Kauaʻi",
    "Poʻipū, Kauaʻi",
    "Kōloa, Kauaʻi",
    "Hanalei, Kauaʻi",
    "Princeville, Kauaʻi",
    "Kīlauea, Kauaʻi",
    "Hanapepe, Kauaʻi",
    "Lawai, Kauaʻi",
    "Kalaheo, Kauaʻi",
    // Hawaiʻi (Big Island)
    "Hilo, Hawaiʻi",
    "Kailua-Kona, Hawaiʻi",
    "Kona, Hawaiʻi",
    "Waimea (Big Island), Hawaiʻi",
    "Pāhoa, Hawaiʻi",
  ],

  payRanges: flattenLabeledGroups(JOB_PAY_RANGES_BY_GROUP),
};

export { JOB_PAY_RANGES_BY_GROUP };

// More complete onboarding-friendly location picker.
// Used for Employer onboarding (Island → Area) while keeping a single string stored in DB.
export const LOCATIONS_BY_ISLAND: Record<string, string[]> = {
  "Oʻahu": [
    "Honolulu",
    "Waikīkī",
    "Kakaʻako",
    "Kapolei",
    "ʻEwa Beach",
    "Waipahu",
    "Pearl City",
    "ʻAiea",
    "Mililani",
    "Wahiawā",
    "Kailua",
    "Kāneʻohe",
    "Haleʻiwa",
    "North Shore",
    "Ko Olina",
    "Hawaiʻi Kai",
    "Kalihi",
    "Moanalua",
  ],
  "Maui": [
    "Kahului",
    "Wailuku",
    "Kīhei",
    "Wailea",
    "Lahaina",
    "Kapalua",
    "Kāʻanapali",
    "Makawao",
    "Pukalani",
    "Paʻia",
    "Hāna",
    "Upcountry",
  ],
  "Kauaʻi": [
    "Līhuʻe",
    "Kapaʻa",
    "Poʻipū",
    "Kōloa",
    "Hanalei",
    "Princeville",
    "Waimea (Kauaʻi)",
    "Kekaha",
    "Kīlauea",
    "Hanapepe",
    "Lawai",
    "Kalaheo",
  ],
  "Hawaiʻi (Big Island)": [
    "Hilo",
    "Kailua-Kona",
    "Kona",
    "Waimea (Big Island)",
    "Kealakekua",
    "Captain Cook",
    "Pāhoa",
    "Ocean View",
    "Volcano",
  ],
  "Lānaʻi": ["Lānaʻi City"],
  "Molokaʻi": ["Kaunakakai", "Maunaloa"],
};

export const CANDIDATE_CATEGORIES = {
  industries: [...INDUSTRIES],

  skills: SKILLS,

  experience: ["0-1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"],

  education: [
    "Some High School",
    "High School Diploma/GED",
    "Some College",
    "Associate Degree",
    "Vocational/Trade School",
    "Bachelor's Degree",
    "Master's Degree",
    "Certification/License",
  ],

  targetPayRanges: flattenLabeledGroups(TARGET_PAY_RANGES_BY_GROUP),

  availability: [
    "Immediate",
    "2 weeks notice",
    "1 month notice",
    "Flexible",
    "Weekends only",
    "Seasonal (summer)",
    "Seasonal (winter)",
    "School year only",
  ],

  workStyles: [
    "Team Player",
    "Self-Starter",
    "Fast Learner",
    "Reliable",
    "Detail-Oriented",
    "Fast-Paced",
    "Calm Under Pressure",
    "Outgoing",
    "Friendly",
    "Professional",
    "Creative",
    "Hands-On",
    "Problem-Solver",
    "Multi-Tasker",
    "Organized",
    "Energetic",
    "Aloha Spirit",
    "Cultural Ambassador",
    "Flexible",
    "Hardworking",
  ],

  jobTypesSeeking: [
    "Full-time",
    "Part-time",
    "Contract",
    "Seasonal",
    "Freelance",
    "Commission",
  ],

  locations: JOB_CATEGORIES.locations,
};

// Demo profiles matching the real demo accounts in the database
export const DEMO_PROFILES = {
  /** Candidate id 128 — Kyle Malone */
  seeker: {
    email: "kyle.malone@gmail.com",
    password: "demo123",
    name: "Kyle Malone",
    phone: "(808) 635-2222",
    location: "Poʻipū, Kauaʻi",
    skills: [
      "Customer Service",
      "Leadership",
      "Cash Handling",
      "Administrative",
      "Microsoft Office",
      "Landscaping",
      "Construction",
      "Plumbing",
      "Management",
      "Hospitality",
      "Office Management",
      "Hard Labor",
    ],
    experience: "10+ years",
    education: "Associate Degree",
    availability: "Immediate",
    bio: `I'm the kind of person who doesn't mind jumping between different types of work. One day I'm handling guest complaints and making sure the front desk runs smooth, the next I'm out back fixing irrigation or moving furniture. I've been doing this long enough that not much phases me anymore.

What drives me? Honestly, I like being useful. I don't want to sit around - I want to solve problems, whether that's calming down an upset guest or figuring out why the landscaping equipment won't start. I'm pretty easygoing with people but I take the work seriously. I show up on time, I finish what I start, and I don't need someone watching over my shoulder to stay busy.

I'm not looking to specialize in just one thing. I like variety. If you need someone who can talk professionally with clients and also get their hands dirty with the hard work, that's me.`,
    targetPay: "$30-35/hr",
    /** Second band for onboarding multi-select */
    targetPays: ["$30-35/hr", "$28-35/hr"],
    industries: [
      "Tour Company",
      "Plumbing",
      "Hotel/Resort",
      "Construction",
      "Property Management",
    ],
    jobTypesSeeking: ["Full-time"],
    preferredJobCategories: [
      "Customer Service",
      "Tourism & Recreation",
      "Office & Admin",
      "Maintenance & Facilities",
      "Hospitality Services",
      "Trades & Construction",
    ],
    workStyles: [
      "Team Player",
      "Outgoing",
      "Hands-On",
      "Problem-Solver",
      "Energetic",
    ],
    displayTitle: "Hospitality + Hands on Labor",
  },
  /** Employer id 134 — DaKine Handyman */
  employer: {
    email: "dakinehandyman@gmail.com",
    password: "demo123",
    businessName: "DaKine Handyman",
    phone: "(808) 634-5409",
    location: "Kalaheo, Kauaʻi",
    industry: "Home Repair",
    companySize: "Small Business (10-25)",
    businessLicense: "HI-FB-000005",
    website: "https://dakinehandyman.com/",
    companyLogoUrl:
      "https://img1.wsimg.com/isteam/ip/4fa5556d-c038-44fb-8023-1e791bac44b4/logo/9eb9c56f-78d6-4fc0-921b-c43a4e166cce.jpg/:/rs=w:103,h:103,cg:true,m/cr=w:103,h:103/qt=q:100/ll",
    bio: `DaKine Handyman is a family-owned home repair and improvement company proudly serving Kauaʻi. We've built a strong reputation across the island for quality workmanship, reliability, and treating every client's home with care and respect. Our small, tight-knit crew takes pride in doing the job right — and we're looking for someone who shares that same standard. Join a team where your skills are valued and your work makes a real difference in the community.`,
  },
};

export const TEAM_MEMBERS = [
  { name: "Tea", role: "Co-Founder" },
  { name: "Lindsay", role: "Co-Founder" },
  { name: "Brisa", role: "Co-Founder" },
  { name: "DJ", role: "Co-Founder" },
  { name: "Ethan", role: "Co-Founder" },
];
